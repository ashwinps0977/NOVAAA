const Employee = require('../models/Employee');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Skill = require('../models/Skill');
const User = require('../models/User');
const Task = require('../models/Task');

exports.createProjectWithAutoTeam = async (req, res) => {
    try {
        const { projectName, description, priority, requiredSkills, minExperience, startDate, endDate, memberCount } = req.body;

        // 1. Create Project (Planning Status)
        const project = new Project({
            projectName,
            title: projectName,
            description,
            priority,
            requiredSkills,
            minExperience,
            startDate,
            endDate,
            deadline: endDate,
            assignedBy: req.user.id,
            status: 'Active',
            progressPercentage: 0
        });

        // 2. Filter Eligible Employees (Engineering or IT department, not on active projects)
        const eligibleEmployees = await Employee.find({
            department: { $in: ['Engineering', 'IT', 'engineering', 'it'] },
            status: 'active',
            activeProjects: { $size: 0 } // Only those not currently doing a project
        });

        const rankedEmployees = [];

        for (const emp of eligibleEmployees) {
            const user = await User.findOne({ email: emp.email });
            if (!user) continue;

            const skills = await Skill.find({ employee: user._id });

            // Skill Match Calculation
            let matchPoints = 0;
            let skilledInRequired = true;

            requiredSkills.forEach(reqSkill => {
                const empSkill = skills.find(s => s.name.toLowerCase() === reqSkill.skill.toLowerCase());
                if (empSkill) {
                    // Score based on level match
                    matchPoints += (empSkill.currentLevel / 5) * 100;
                } else {
                    skilledInRequired = false;
                }
            });

            // If project has required skills, only consider those with at least one match
            // or if it's a general project, consider all.
            const skillMatchScore = requiredSkills.length > 0 ? (matchPoints / requiredSkills.length) : (emp.performanceScore || 70);

            // Experience Score (Normalized)
            const experienceScore = Math.min(100, (emp.totalExperience || 0));

            // Performance Score (On-time delivery focus)
            const performanceScore = emp.performanceScore || 0;
            const onTimeScore = emp.onTimeDeliveryRate || 80;

            // Final Ranking Score
            const finalScore = (0.6 * skillMatchScore) + (0.2 * performanceScore) + (0.2 * (emp.taskCompletionRate || 70));

            rankedEmployees.push({
                employee: emp,
                score: finalScore,
                skillScore: skillMatchScore,
                experienceScore: experienceScore,
                onTimeScore: onTimeScore,
                performanceScore: performanceScore,
                isLeadEligible: emp.position.toLowerCase().includes('manager') ||
                    emp.position.toLowerCase().includes('lead') ||
                    emp.position.toLowerCase().includes('senior')
            });
        }

        // Sort by score descending
        rankedEmployees.sort((a, b) => b.score - a.score);

        if (rankedEmployees.length === 0) {
            // Fallback: If no one in Engineering is free, look for anyone in Engineering (even with projects)
            const backups = await Employee.find({
                department: { $in: ['Engineering', 'IT', 'engineering', 'it'] },
                status: 'active'
            });

            if (backups.length === 0) {
                return res.status(400).json({ success: false, message: 'No employees found in Engineering or IT department.' });
            }

            // Note: In a real scenario, we'd rank backups too, but for prompt compliance, we prioritize free ones.
            return res.status(400).json({ success: false, message: 'All skilled Engineering employees are currently assigned to projects.' });
        }

        // 3. Auto-select Team Lead
        let leadCandidate = rankedEmployees.find(e => e.isLeadEligible) || rankedEmployees[0];
        const teamLead = leadCandidate.employee;

        // 4. Auto-select Members
        const remainingCandidates = rankedEmployees.filter(e => e.employee._id.toString() !== teamLead._id.toString());
        const limit = parseInt(memberCount) || 3;
        const selectedWrappers = remainingCandidates.slice(0, limit);
        const selectedMembers = selectedWrappers.map(e => e.employee);

        const allTeamWrappers = [leadCandidate, ...selectedWrappers];

        // 5. Calculate Team Health
        // Health = (Avg Skills + Avg Experience + Performance) / 3
        const avgSkills = allTeamWrappers.reduce((acc, curr) => acc + curr.skillScore, 0) / allTeamWrappers.length;
        const avgExp = allTeamWrappers.reduce((acc, curr) => acc + (curr.employee.yearsInCompany || 1), 0) / allTeamWrappers.length;
        // Experience factor: 10 years = 100%, 1 year = 10%
        const normalizedExp = Math.min(100, avgExp * 10);
        const avgPerf = allTeamWrappers.reduce((acc, curr) => acc + (curr.employee.onTimeDeliveryRate || 85), 0) / allTeamWrappers.length;

        const teamHealth = Math.round((avgSkills + normalizedExp + avgPerf) / 3);

        // 6. Create Team
        const team = new Team({
            teamName: `${projectName} Team`,
            teamLead: teamLead._id,
            members: selectedMembers.map(m => m._id),
            projectId: project._id,
            teamStatus: 'Active',
            teamHealth,
            averagePerformanceScore: allTeamWrappers.reduce((acc, curr) => acc + curr.performanceScore, 0) / allTeamWrappers.length,
            averageSkillScore: avgSkills
        });

        // 7. Update Project
        project.teamId = team._id;
        await team.save();
        await project.save();

        // 8. Update Employees
        for (const wrapper of allTeamWrappers) {
            const member = wrapper.employee;
            member.teamId = team._id;
            member.activeProjects.push(project._id);

            // Update workload
            const workload = 30; // 30% per project
            member.currentCapacity = Math.min(100, (member.currentCapacity || 0) + workload);

            await member.save();
        }

        res.status(201).json({
            success: true,
            message: 'Team intelligently selected and project created successfully',
            project,
            team: {
                id: team._id,
                name: team.teamName,
                lead: teamLead.name,
                membersCount: selectedMembers.length,
                teamHealth
            }
        });

    } catch (error) {
        console.error('AI team selection error:', error);
        res.status(500).json({ success: false, message: 'Operation failed', error: error.message });
    }
};

exports.getTeamOverview = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('teamLead', 'name position performanceScore currentCapacity email')
            .populate('members', 'name position performanceScore currentCapacity email')
            .populate({
                path: 'projectId',
                populate: {
                    path: 'updates.user',
                    select: 'name email'
                }
            });

        // Enhance teams with skill data and tasks
        const enhancedTeams = await Promise.all(teams.map(async (team) => {
            const teamObj = team.toObject();

            // 1. Get Skills for each member (including lead)
            const allMemberEmails = [
                team.teamLead?.email,
                ...(team.members || []).map(m => m?.email)
            ].filter(Boolean);

            const users = await User.find({ email: { $in: allMemberEmails } });
            const userIds = users.map(u => u._id);
            const skills = await Skill.find({ employee: { $in: userIds } });

            // Attach skills to members in teamObj
            const attachSkills = (member) => {
                if (!member) return null;
                const user = users.find(u => u.email === member.email);
                if (user) {
                    member.skills = skills.filter(s => s.employee.toString() === user._id.toString());
                } else {
                    member.skills = [];
                }
                return member;
            };

            if (teamObj.teamLead) attachSkills(teamObj.teamLead);
            if (teamObj.members) teamObj.members = teamObj.members.map(attachSkills);

            // 2. Get Tasks for the project
            if (team.projectId) {
                const tasks = await Task.find({
                    $or: [
                        { project: team.projectId.projectName },
                        { project: team.projectId.title }
                    ]
                });
                teamObj.tasks = tasks;
            } else {
                teamObj.tasks = [];
            }

            // 3. Risk Analysis
            const now = new Date();
            const overdueTasks = (teamObj.tasks || []).filter(t =>
                t.status !== 'Completed' && t.deadline && new Date(t.deadline) < now
            );

            const bottlenecks = [];
            if (overdueTasks.length > 0) {
                const delayedMemberIds = [...new Set(overdueTasks.map(t => t.assignedTo?.toString()))].filter(Boolean);
                for (const mid of delayedMemberIds) {
                    const member = [teamObj.teamLead, ...(teamObj.members || [])].find(m => m?._id?.toString() === mid);
                    if (member) {
                        bottlenecks.push({
                            name: member.name,
                            overdueCount: overdueTasks.filter(t => t.assignedTo?.toString() === mid).length
                        });
                    }
                }
            }

            let riskLevel = 'Low';
            if (overdueTasks.length > 2) riskLevel = 'High';
            else if (overdueTasks.length > 0) riskLevel = 'Medium';

            if (team.projectId?.deadline && riskLevel !== 'High') {
                const daysLeft = Math.ceil((new Date(team.projectId.deadline) - now) / (1000 * 60 * 60 * 24));
                if (daysLeft < 3 && team.teamProgress < 90) riskLevel = 'High';
            }

            teamObj.riskAnalysis = {
                overdueTasks: overdueTasks.length,
                bottlenecks,
                level: riskLevel
            };

            // 4. Skill Gap Analysis
            const allAvailableSkills = [];
            if (teamObj.teamLead?.skills) allAvailableSkills.push(...teamObj.teamLead.skills);
            if (teamObj.members) {
                teamObj.members.forEach(m => {
                    if (m?.skills) allAvailableSkills.push(...m.skills);
                });
            }

            teamObj.skillGapAnalysis = {
                requiredSkills: team.projectId?.requiredSkills || [],
                availableSkills: allAvailableSkills
            };

            return teamObj;
        }));

        res.json({ success: true, teams: enhancedTeams });
    } catch (error) {
        console.error('Get team overview error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch teams' });
    }
};
