async function testLogin() {
    console.log('--- ATTEMPTING LOGIN ---');
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'sijo@gmail.com', password: 'sijo123' })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testLogin();
