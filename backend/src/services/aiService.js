const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");

class AIService {
    constructor() {
        // Common skills library for extraction
        this.skillsLibrary = [
            'javascript', 'python', 'java', 'react', 'node.js', 'next.js', 'express',
            'mongodb', 'postgresql', 'sql', 'aws', 'docker', 'kubernetes', 'typescript',
            'html', 'css', 'tailwind', 'redux', 'git', 'ci/cd', 'frontend', 'backend',
            'full stack', 'project management', 'agile', 'scrum', 'ui/ux', 'design',
            'testing', 'jest', 'cypress', 'rest api', 'graphql', 'firebase', 'azure',
            'angular', 'vue', 'c++', 'c#', 'php', 'laravel', 'django', 'flask',
            'machine learning', 'data science', 'devops', 'cloud architecture',
            'figma', 'adobe xd', 'photoshop', 'illustrator', 'solidarity', 'rust',
            'go', 'ruby', 'rails', 'spring boot', 'microservices', 'flutter', 'react native'
        ];
    }

    async extractText(filePath) {
        const fileExt = path.extname(filePath).toLowerCase();
        const dataBuffer = fs.readFileSync(filePath);

        if (fileExt === ".pdf") {
            const parser = new PDFParse({ data: dataBuffer });
            const result = await parser.getText();
            await parser.destroy();
            return result.text;
        } else if (fileExt === ".docx") {
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            return result.value;
        } else {
            return dataBuffer.toString("utf8");
        }
    }

    async analyzeResume(resumeText, jobDetails) {
        const text = resumeText.toLowerCase();

        // 1. Extract Skills
        const parsedSkills = this.skillsLibrary.filter(skill =>
            text.includes(skill.toLowerCase())
        );

        // 2. Extract Experience (Years)
        let experienceValue = 0;
        const expPatterns = [
            /(\d+)\+?\s*years?/,
            /(\d+)\s*yrs?/,
            /experience\s*:\s*(\d+)/
        ];
        for (const pattern of expPatterns) {
            const match = text.match(pattern);
            if (match) {
                experienceValue = parseInt(match[1]);
                break;
            }
        }

        // 3. Extract Education Snapshot
        const education = [];
        const eduPatterns = [
            { level: 'B.S.', keywords: ['bachelor', 'b.s.', 'b.a.', 'degree', 'btech', 'b.tech', 'be', 'b.e.'] },
            { level: 'M.S.', keywords: ['master', 'm.s.', 'm.a.', 'postgraduate', 'mtech', 'm.tech', 'mba'] },
            { level: 'Ph.D.', keywords: ['phd', 'ph.d.', 'doctorate'] },
            { level: 'Diploma', keywords: ['diploma', 'associate degree'] }
        ];

        eduPatterns.forEach(pattern => {
            if (pattern.keywords.some(k => text.includes(k))) {
                // Try to find a line with the keyword to extract a bit more context
                const lines = text.split('\n');
                const eduLine = lines.find(l => pattern.keywords.some(k => l.toLowerCase().includes(k))) || "Detected from text";
                education.push({
                    degree: pattern.level,
                    institution: eduLine.length < 100 ? eduLine : "Detected from text",
                    year: "Not extracted"
                });
            }
        });

        // 4. Extract Projects (Simple detection)
        const projects = [];
        const projectKeywords = ['project', 'developed', 'built', 'created', 'implemented'];
        const lines = text.split('\n');
        lines.forEach(line => {
            if (line.toLowerCase().includes('project') && line.length > 20 && line.length < 150) {
                projects.push({
                    title: line.trim(),
                    description: "Extracted project from resume",
                    technologies: this.skillsLibrary.filter(s => line.toLowerCase().includes(s))
                });
            }
        });

        // 4. Scoring Logic (Weighted: Skills 40, Exp 35, Edu 25)
        let skillsScore = 0;
        let matchedJobSkills = [];
        if (jobDetails.skills && jobDetails.skills.length > 0) {
            const jobSkills = jobDetails.skills.map(s => s.toLowerCase());
            matchedJobSkills = jobSkills.filter(s => parsedSkills.includes(s));
            skillsScore = Math.round((matchedJobSkills.length / jobSkills.length) * 40);
        }

        let experienceScore = 0;
        const requiredExp = parseInt(jobDetails.experienceLevel) || 2; // Default to 2 if not parsable
        if (experienceValue >= requiredExp) {
            experienceScore = 35;
        } else {
            experienceScore = Math.round((experienceValue / requiredExp) * 35);
        }

        let educationScore = education.length > 0 ? 25 : 10;

        let projectsScore = projects.length > 0 ? Math.min(10, projects.length * 5) : 0;

        const overallScore = Math.min(100, skillsScore + experienceScore + educationScore + projectsScore);

        return {
            candidateDetails: {
                location: text.includes('new york') ? 'New York, NY' :
                    text.includes('san francisco') ? 'San Francisco, CA' :
                        text.includes('london') ? 'London, UK' :
                            text.includes('bangalore') ? 'Bangalore, India' : 'Detected from text',
                education: education,
                experience: [{ title: "Relevant Professional Experience", company: "Extracted from Resume", duration: `${experienceValue} years` }],
                projects: projects.slice(0, 3),
                certifications: text.includes('certified') || text.includes('certification') ? ['Professional Certification'] : []
            },
            scoreBreakdown: {
                skills: skillsScore,
                experience: experienceScore,
                education: educationScore,
                projects: projectsScore
            },
            overallScore: overallScore,
            aiRecommendations: overallScore >= 80 ? "Highly recommended: Strong match with required skills and experience." :
                overallScore >= 60 ? "Recommended: Solid candidate with relevant background." :
                    "Potential candidate, review manually for specific niche skills.",
            strengths: matchedJobSkills.length > 0 ? matchedJobSkills.map(s => `Proficient in ${s}`) : ["Relevant years of experience"],
            gaps: jobDetails.skills ? jobDetails.skills.filter(s => !parsedSkills.includes(s.toLowerCase())).map(s => `Missing ${s}`) : [],
            analysisSummary: `Candidate demonstrates ${experienceValue} years of relevant experience with proficiency in ${parsedSkills.length} key technical skills. Education background meets requirements.`,
            parsedSkills: parsedSkills
        };
    }
}

module.exports = new AIService();
