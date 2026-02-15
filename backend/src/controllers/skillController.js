const Skill = require('../models/Skill');

// Get all skills for current employee with gap analysis
exports.getMySkills = async (req, res) => {
    try {
        const skills = await Skill.find({ employee: req.user.id });

        // Add gap analysis on the fly if not already calculating
        const analysis = skills.map(skill => ({
            ...skill._doc,
            gap: Math.max(0, skill.requiredLevel - skill.currentLevel),
            status: skill.currentLevel >= skill.requiredLevel ? 'Expert' : (skill.currentLevel + 1 >= skill.requiredLevel ? 'Proficient' : 'Training Needed')
        }));

        res.json({ success: true, skills: analysis });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Seed initial skill data
exports.seedSkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const initialSkills = [
            { name: 'React.js', category: 'Technical', currentLevel: 4, requiredLevel: 5, employee: userId },
            { name: 'Node.js', category: 'Technical', currentLevel: 3, requiredLevel: 4, employee: userId },
            { name: 'Communication', category: 'Soft Skills', currentLevel: 5, requiredLevel: 4, employee: userId },
            { name: 'Leadership', category: 'Soft Skills', currentLevel: 2, requiredLevel: 4, employee: userId },
            { name: 'Data Privacy', category: 'Technical', currentLevel: 1, requiredLevel: 5, employee: userId }
        ];

        await Skill.deleteMany({ employee: userId });
        const skills = await Skill.insertMany(initialSkills);
        res.json({ success: true, skills });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// Get organization-wide skill gaps (HR only)
exports.getOrgSkillGaps = async (req, res) => {
    try {
        const skills = await Skill.find();

        const skillStats = {};

        skills.forEach(skill => {
            if (!skillStats[skill.name]) {
                skillStats[skill.name] = {
                    name: skill.name,
                    count: 0,
                    totalCurrent: 0,
                    totalRequired: 0
                };
            }
            skillStats[skill.name].count++;
            skillStats[skill.name].totalCurrent += skill.currentLevel;
            skillStats[skill.name].totalRequired += skill.requiredLevel;
        });

        const analysis = Object.values(skillStats).map(s => ({
            skill: s.name,
            available: Math.round((s.totalCurrent / (s.count * 5)) * 100), // percentage of max 5
            required: Math.round((s.totalRequired / (s.count * 5)) * 100),
            employeeCount: s.count
        })).sort((a, b) => (b.required - b.available) - (a.required - a.available)); // Sort by biggest gap

        res.json({ success: true, skillGaps: analysis });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
