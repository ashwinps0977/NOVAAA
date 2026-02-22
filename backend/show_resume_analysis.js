const aiService = require('./src/services/aiService');
const path = require('path');
const fs = require('fs');

const run_demo = async () => {
    const resumeFileName = '1771658579170-308221299-Sijo Resume Jai Bharth College.pdf';
    const resumePath = path.join(__dirname, 'uploads', 'resumes', resumeFileName);

    console.log(`--- Analyzing Resume: ${resumeFileName} ---`);

    if (!fs.existsSync(resumePath)) {
        console.error('File not found at:', resumePath);
        return;
    }

    try {
        console.log('1. Extracting text...');
        const text = await aiService.extractText(resumePath);
        console.log('Text Snapshot (First 500 chars):');
        console.log(text.substring(0, 500));
        console.log('-----------------------------------');

        console.log('\n2. Performing Manual Analysis...');
        const jobDetails = {
            title: 'Full Stack Developer',
            department: 'IT',
            skills: ['React', 'Node.js', 'Typescript', 'SQL', 'Git'],
            experienceLevel: '2'
        };

        const result = await aiService.analyzeResume(text, jobDetails);
        console.log('Analysis Result:');
        console.log(JSON.stringify(result, null, 2));

    } catch (err) {
        console.error('Error during demo:', err);
    }
};

run_demo();
