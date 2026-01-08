const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        console.log('Fetching auth token...');
        // 1. Login/Register Candidate
        const candRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Debug Candidate',
                email: `debug_cand_${Date.now()}@test.com`,
                password: 'password123',
                role: 'employee'
            })
        });
        const candData = await candRes.json();
        const candToken = candData.token;
        console.log('Candidate Token obtained');

        // 2. Get a Job
        console.log('Fetching jobs...');
        const jobsRes = await fetch(`${API_URL}/jobs`);
        const jobsData = await jobsRes.json();
        if (!jobsData.jobs || jobsData.jobs.length === 0) {
            throw new Error('No jobs found to apply to');
        }
        const jobId = jobsData.jobs[0]._id || jobsData.jobs[0].id;
        console.log('Applying to Job ID:', jobId);

        // 3. Create dummy resume
        const resumePath = path.join(__dirname, 'debug_resume.pdf');
        fs.writeFileSync(resumePath, 'Fake PDF Content');

        // 4. Submit Application
        console.log('Submitting Application...');
        const form = new FormData();
        form.append('jobId', jobId);
        form.append('fullName', 'Debug Candidate');
        form.append('email', `debug_cand_${Date.now()}@test.com`);
        form.append('phone', '1234567890');
        form.append('experience', '5');
        form.append('skills', JSON.stringify(['Node.js', 'React'])); // Frontend sends stringified array
        form.append('resume', fs.readFileSync(resumePath), 'debug_resume.pdf');

        // Use form.submit for reliable nodejs multipart
        await new Promise((resolve, reject) => {
            form.submit({
                host: 'localhost',
                port: 5000,
                path: '/api/applications/apply',
                headers: { 'Authorization': `Bearer ${candToken}` }
            }, (err, res) => {
                if (err) return reject(err);
                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    console.log('Status Code:', res.statusCode);
                    console.log('Headers:', res.headers);
                    console.log('Body:', rawData);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve();
                    } else {
                        reject(new Error(`Failed with ${res.statusCode}`));
                    }
                });
            });
        });

    } catch (err) {
        console.error('Debug failed:', err);
    }
}

verify();
