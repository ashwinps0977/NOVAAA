const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const seedData = async () => {
    try {
        // We need a token. Using the test-login to get one if possible, 
        // but since we want real DB seeding, we need a real user.
        // For verification, I'll use the test-register to get a token and see if it works with the seed endpoints
        // Actually, the seed endpoints use the 'auth' middleware which checks JWT_SECRET in .env

        console.log('🚀 Starting data seeding...');

        // 1. Register/Login to get token
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'employee@nova.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Seed Trainings
        console.log('📚 Seeding trainings...');
        const tRes = await axios.post(`${BASE_URL}/trainings/seed`, {}, config);
        console.log('✅ Trainings seeded:', tRes.data.success);

        // 3. Seed Skills
        console.log('🎯 Seeding skills...');
        const sRes = await axios.post(`${BASE_URL}/skills/seed`, {}, config);
        console.log('✅ Skills seeded:', sRes.data.success);

        console.log('✨ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error.response?.data || error.message);
    }
};

seedData();
