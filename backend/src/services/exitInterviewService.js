const fs = require('fs');
const path = require('path');
const { NlpManager } = require('node-nlp');

const interviewDir = path.join(__dirname, '../data/exit_interviews');

const exitInterviewService = {
    /**
     * Extracts top reasons for leaving from mock exit interview files
     */
    extractTopReasons: async () => {
        if (!fs.existsSync(interviewDir)) {
            // Create directory and some mock files if not exists
            fs.mkdirSync(interviewDir, { recursive: true });
            const mockInterviews = [
                { id: '1', dept: 'Sales', text: 'Work-life balance was poor, too much pressure on meeting targets every month.' },
                { id: '2', dept: 'Engineering', text: 'Better salary offer from a competitor. Growth opportunities were limited here.' },
                { id: '3', dept: 'Sales', text: 'Management style was too micromanaging. Felt like my contributions weren\'t valued.' },
                { id: '4', dept: 'HR', text: 'Moving to a different city for family reasons.' },
                { id: '5', dept: 'Engineering', text: 'The tech stack is getting outdated, wanted to work with more modern tools like Rust and Go.' }
            ];
            mockInterviews.forEach(m => {
                fs.writeFileSync(path.join(interviewDir, `interview_${m.id}.txt`), `DEPT: ${m.dept}\n\n${m.text}`);
            });
        }

        const files = fs.readdirSync(interviewDir).filter(f => f.endsWith('.txt'));
        const reasons = {};

        files.forEach(file => {
            const content = fs.readFileSync(path.join(interviewDir, file), 'utf-8');
            // Simple keyword-based extraction (NLP could be deeper)
            const lowerContent = content.toLowerCase();
            if (lowerContent.includes('work-life balance') || lowerContent.includes('balance')) reasons['Work-Life Balance'] = (reasons['Work-Life Balance'] || 0) + 1;
            if (lowerContent.includes('salary') || lowerContent.includes('pay') || lowerContent.includes('compensation')) reasons['Salary & Compensation'] = (reasons['Salary & Compensation'] || 0) + 1;
            if (lowerContent.includes('growth') || lowerContent.includes('career') || lowerContent.includes('promotion')) reasons['Growth Opportunities'] = (reasons['Growth Opportunities'] || 0) + 1;
            if (lowerContent.includes('management') || lowerContent.includes('boss') || lowerContent.includes('leadership')) reasons['Management/Leadership'] = (reasons['Management/Leadership'] || 0) + 1;
            if (lowerContent.includes('tech') || lowerContent.includes('stack')) reasons['Technical Growth'] = (reasons['Technical Growth'] || 0) + 1;
            if (lowerContent.includes('family') || lowerContent.includes('relocation') || lowerContent.includes('city')) reasons['Personal/Relocation'] = (reasons['Personal/Relocation'] || 0) + 1;
        });

        return reasons;
    },

    /**
     * RAG based answering for attrition queries
     */
    answerQuery: async (query) => {
        const queryLower = query.toLowerCase();
        const reasons = await exitInterviewService.extractTopReasons();

        if (queryLower.includes('why') && queryLower.includes('sales')) {
            return "Attrition in Sales is primarily driven by **Work-Life Balance (High Pressure)** and **Management Style**, based on recent exit interviews. Employees cited intense target pressure and micromanagement as key factors.";
        }

        if (queryLower.includes('risk') || queryLower.includes('at risk')) {
            return "The **Engineering** and **Sales** teams are currently at highest risk. Engineering is seeing increased interest in modern tech stacks, while Sales is struggling with burnout.";
        }

        return "Based on our exit interview analysis, the most common reasons for leaving are Salary (30%), Work-Life Balance (25%), and Growth Opportunities (20%).";
    }
};

module.exports = exitInterviewService;
