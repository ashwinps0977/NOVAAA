const http = require('http');
const jwt = require('jsonwebtoken');

const secret = 'd00889054ecd550e0784ebb1d34aad7f6acc3900dc7a5b65bb68e59aa10d8168780263d55eeb9534000d606410660d500f9582929b2a74c9e8d8775948665d21';
const token = jwt.sign({ id: 'dummy_id', role: 'hr' }, secret, { expiresIn: '1h' });

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai/models',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
};

const makeRequest = () => {
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log(`Status Code: ${res.statusCode}`);
            const fs = require('fs');
            fs.writeFileSync('models_response.txt', `Status: ${res.statusCode}\nBody: ${data}`);
            if (res.statusCode === 200) {
                console.log("SUCCESS: Models retrieved.");
            } else {
                console.log("FAILURE: Non-200 status code.");
            }
        });
    });

    req.on('error', (e) => {
        console.log(`Connection failed: ${e.message}. Retrying in 2s...`);
        setTimeout(makeRequest, 2000);
    });

    req.end();
};

console.log("Waiting for server to start...");
setTimeout(makeRequest, 3000);
