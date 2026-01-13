// using native fetch (Node 18+)

const API_URL = 'http://127.0.0.1:5000/api';
const EMAIL = `test_attendance_${Date.now()}@example.com`;
const PASSWORD = 'password123';

async function verifyAttendanceFlow() {
    console.log('🚀 Starting Attendance Flow Verification');

    try {
        // 1. Register
        console.log(`\n1. Registering user: ${EMAIL}`);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Attendance User',
                email: EMAIL,
                password: PASSWORD,
                role: 'employee'
            })
        });
        const regData = await regRes.json();
        if (!regData.success) throw new Error(`Registration failed: ${regData.message}`);
        console.log('✅ Registration successful');

        // 2. Login (Should trigger Check-In)
        console.log('\n2. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) throw new Error(`Login failed: ${loginData.message}`);
        const token = loginData.token;
        console.log('✅ Login successful. Token received.');

        // 3. Check Attendance Status (Should be 'present', checkIn set, checkOut null)
        console.log('\n3. Verifying Check-In status...');
        const attRes = await fetch(`${API_URL}/attendance/my-attendance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const attData = await attRes.json();
        const today = attData.today;

        if (!today) throw new Error('No attendance record found for today');
        if (today.status !== 'present') throw new Error(`Status mismatch. Expected: present, Got: ${today.status}`);
        if (!today.checkIn) throw new Error('CheckIn time not set');
        if (today.checkOut) throw new Error('CheckOut time should be null initially');
        console.log('✅ Check-In verified:', today.checkIn);

        // 4. Logout (Should trigger Check-Out)
        console.log('\n4. Logging out...');
        const logoutRes = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const logoutData = await logoutRes.json();
        if (!logoutData.success) throw new Error(`Logout failed: ${logoutData.message}`);
        console.log('✅ Logout successful');

        // 5. Login again to verify Check-Out was recorded
        console.log('\n5. Logging in again to verify Check-Out...');
        const login2Res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });
        const login2Data = await login2Res.json();
        const token2 = login2Data.token;

        const att2Res = await fetch(`${API_URL}/attendance/my-attendance`, {
            headers: { 'Authorization': `Bearer ${token2}` }
        });
        const att2Data = await att2Res.json();
        const today2 = att2Data.today;

        if (!today2.checkOut) throw new Error('CheckOut time was NOT set after logout!');
        console.log('✅ Check-Out verified:', today2.checkOut);
        console.log('✅ Working hours calculated:', today2.workingHours);

        console.log('\n🎉 ALL TESTS PASSED!');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        process.exit(1);
    }
}

verifyAttendanceFlow();
