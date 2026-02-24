async function checkHealth() {
    try {
        const res = await fetch('http://localhost:5000/api/health');
        console.log('Health Check Status:', res.status);
        const data = await res.json();
        console.log('Health Data:', data);
    } catch (err) {
        console.log('Health Check Failed:', err.message);
    }

    try {
        const res = await fetch('http://localhost:5000/api/skills/unique-names');
        console.log('Unique Skills Status:', res.status);
        const data = await res.json();
        console.log('Unique Skills Data (Success?):', data.success);
        if (data.skills) console.log('Skills Count:', data.skills.length);
    } catch (err) {
        console.log('Unique Skills Fetch Failed:', err.message);
    }
}

checkHealth();
