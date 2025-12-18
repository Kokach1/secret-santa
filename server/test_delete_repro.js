
const axios = require('axios');
const API_URL = 'http://localhost:5000';

async function testDelete() {
    try {
        // 1. Login as Admin
        console.log("Login as Admin...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'kokachi', // Assuming this is the admin username from seed
            password: 'kokachi@admin'
        });
        const token = loginRes.data.token;
        console.log("✅ Admin Logged In");

        // 2. Create Dummy Student (Register)
        console.log("Creating dummy student...");
        const rand = Math.floor(Math.random() * 10000);
        await axios.post(`${API_URL}/auth/register`, {
            email: `todelete${rand}@test.com`,
            password: 'password123'
        });
        console.log("✅ Dummy Student Created");

        // 3. Get Student ID (from Admin List)
        const listRes = await axios.get(`${API_URL}/admin/students`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const student = listRes.data.students.find(s => s.email === `todelete${rand}@test.com`);

        if (!student) {
            console.error("❌ Could not find created student in admin list");
            return;
        }
        console.log(`Target Student ID: ${student._id}`);

        // 4. Try Delete
        console.log("Attempting DELETE...");
        const deleteRes = await axios.delete(`${API_URL}/admin/student/${student._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("✅ DELETE Result:", deleteRes.data);

    } catch (error) {
        if (error.response) {
            console.error("❌ ERROR STATUS:", error.response.status);
            console.error("❌ ERROR DATA:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("❌ ERROR MESSAGE:", error.message);
            console.error("❌ ERROR CODE:", error.code);
        }
    }
}

testDelete();
