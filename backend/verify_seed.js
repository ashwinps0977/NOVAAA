const http = require('http');

const post = (path, data, token = null) => {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${body}`));
                }
            });
        });
        req.on('error', (e) => reject(e));
        req.write(payload);
        req.end();
    });
};

const seed = async () => {
    try {
        console.log('--- Phase 1: Registration ---');
        const regRes = await post('/api/auth/register', {
            name: 'Verification User',
            email: `verify_${Date.now()}@nova.com`,
            password: 'password123',
            role: 'employee'
        });

        if (!regRes.success) {
            console.error('❌ Registration failed:', regRes.message);
            return;
        }
        const token = regRes.token;
        console.log('✅ Registered and got token.');

        console.log('--- Phase 2: Seeding Trainings ---');
        const tRes = await post('/api/trainings/seed', {}, token);
        console.log('✅ Trainings seeded:', tRes.success);

        console.log('--- Phase 3: Seeding Skills ---');
        const sRes = await post('/api/skills/seed', {}, token);
        console.log('✅ Skills seeded:', sRes.success);

        console.log('✨ Verification seeding complete!');
    } catch (error) {
        console.error('❌ Error during seeding:', error.message);
    }
};

seed();
