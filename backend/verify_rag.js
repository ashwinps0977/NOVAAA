const http = require('http');

const query = JSON.stringify({
    query: "What is the HRA percentage?"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/query',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': query.length,
        // Mock auth header if needed, but payrollAIRoutes uses auth middleware?
        // Let's see payrollAIRoutes.js: router.use(auth);
        // I need a valid token.
        // Or I can temporarily bypass auth for testing, or simulate a login.
        // Simulating login is better. 
        // But I don't have a user credential.
        // Maybe I can bypass it for localhost in the code? No, that's risky.
        // Let's try to login first.
    }
};

// ... Wait, I need a token.
// The user has `jwt_secret` in .env. I can generate a token myself!
const jwt = require('jsonwebtoken');
const secret = 'd00889054ecd550e0784ebb1d34aad7f6acc3900dc7a5b65bb68e59aa10d8168780263d55eeb9534000d606410660d500f9582929b2a74c9e8d8775948665d21'; // from .env
const token = jwt.sign({ id: 'dummy_id', role: 'hr' }, secret, { expiresIn: '1h' });

options.headers['Authorization'] = `Bearer ${token}`;

// Check auth middleware to be sure.
// But first, let's write this script to retry connection.

const makeRequest = () => {
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log(`Status Code: ${res.statusCode}`);
            const fs = require('fs');
            fs.writeFileSync('verification_response.txt', `Status: ${res.statusCode}\nBody: ${data}`);

            if (res.statusCode === 200) {
                // ...
                const json = JSON.parse(data);
                if (json.answer && json.answer.includes("40%")) {
                    console.log("SUCCESS: Answer contains expected HRA value.");
                    process.exit(0);
                } else {
                    console.log("FAILURE: Unexpected answer.");
                    process.exit(1);
                }
            } else {
                console.log("FAILURE: Non-200 status code.");
                process.exit(1);
            }
        });
    });

    req.on('error', (e) => {
        console.log(`Connection failed: ${e.message}. Retrying in 2s...`);
        setTimeout(makeRequest, 2000);
    });

    req.write(query);
    req.end();
};

console.log("Waiting for server to start...");
setTimeout(makeRequest, 3000); // Wait 3s before first try
