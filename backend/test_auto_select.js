const fetch = require('node-fetch');

const testAutoSelect = async () => {
    const projectData = {
        projectName: 'Test Project',
        description: 'Test Description',
        priority: 'Medium',
        minExperience: 0,
        memberCount: 3,
        startDate: '2026-02-22',
        endDate: '2026-03-22',
        requiredSkills: [{ skill: 'React', level: 1 }]
    };

    try {
        const response = await fetch('http://localhost:5000/api/teams/auto-select', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + 'TOKEN_HERE' // I don't have a token easily, but I can check the logs
            },
            body: JSON.stringify(projectData)
        });
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
    } catch (err) {
        console.error('Error:', err);
    }
};

// I'll skip running this with a real token and instead look for logs or check the code for potential crashes.
console.log('Test script created. I will manually verify the controller logic.');
