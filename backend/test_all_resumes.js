const mongoose = require('mongoose');
const aiService = require('./src/services/aiService');
const Job = require('./src/models/job');
const path = require('path');
const fs = require('fs');

async function testAllResumes() {
    try {
        console.log('🔗 Connecting to database...');
        await mongoose.connect('mongodb://localhost:27017/NOVAHR1');

        console.log('🔍 Fetching an active job for testing...');
        const job = await Job.findOne({ status: 'active' });
        if (!job) {
            console.error('❌ No active jobs found in the database. Please create a job first.');
            process.exit(1);
        }

        console.log(`📌 Using Job: "${job.title}" (${job.department})`);
        console.log(`📌 Required Skills: ${job.skills.join(', ')}`);

        const resumesDir = path.join(__dirname, 'uploads', 'resumes');
        if (!fs.existsSync(resumesDir)) {
            console.error('❌ Resumes directory not found at:', resumesDir);
            process.exit(1);
        }

        const files = fs.readdirSync(resumesDir);
        console.log(`📂 Found ${files.length} files in uploads/resumes`);

        const results = [];

        for (const file of files) {
            const filePath = path.join(resumesDir, file);

            // Skip directories if any
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log(`\n📄 Processing: ${file}...`);

            try {
                const text = await aiService.extractText(filePath);
                if (!text || text.trim().length === 0) {
                    throw new Error('No text extracted from file');
                }

                const analysis = await aiService.analyzeResume(text, {
                    title: job.title,
                    department: job.department,
                    skills: job.skills,
                    requirements: job.requirements,
                    experienceLevel: job.experienceLevel === 'senior' ? '5' : (job.experienceLevel === 'mid' ? '3' : '1')
                });

                console.log(`   ✅ Score: ${analysis.overallScore}`);
                console.log(`   📝 Summary: ${analysis.analysisSummary}`);

                results.push({
                    filename: file,
                    score: analysis.overallScore,
                    summary: analysis.analysisSummary,
                    skillsFound: analysis.parsedSkills,
                    recommendation: analysis.aiRecommendations,
                    status: 'success'
                });
            } catch (err) {
                console.error(`   ❌ Failed to process ${file}:`, err.message);
                results.push({
                    filename: file,
                    status: 'error',
                    error: err.message
                });
            }
        }

        // Save results to file
        const outputPath = path.join(__dirname, 'batch_test_results.json');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

        console.log('\n✨ Batch testing complete!');
        console.log(`📊 Summary: ${results.filter(r => r.status === 'success').length} success, ${results.filter(r => r.status === 'error').length} failed.`);
        console.log(`📁 Results saved to: ${outputPath}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Critical Error:', error);
        process.exit(1);
    }
}

testAllResumes();
