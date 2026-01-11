const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
// Use unique user to avoid conflict if previous run failed to cleanup or if DB persisted
const TEST_USER = {
    username: 'test_apikey_' + Date.now(),
    email: `test_apikey_${Date.now()}@example.com`,
    password: 'password123'
};

async function runTests() {
    console.log('🚀 Starting User API Key Verification...');

    try {
        // 1. Register User
        console.log('\nTesting 1: Register User...');
        let res = await axios.post(`${API_URL}/auth/register`, TEST_USER);
        if (!res.data.data.user.apiKey) {
            throw new Error('❌ Registration failed: apiKey missing in response');
        }
        console.log('✅ Registered successfully. API Key received:', res.data.data.user.apiKey);
        const apiKey = res.data.data.user.apiKey;

        // 2. Login User
        console.log('\nTesting 2: Login User...');
        res = await axios.post(`${API_URL}/auth/login`, {
            username: TEST_USER.username,
            password: TEST_USER.password
        });
        if (!res.data.data.user.apiKey) {
            throw new Error('❌ Login failed: apiKey missing in response');
        }
        if (res.data.data.user.apiKey !== apiKey) {
            throw new Error('❌ Login failed: apiKey mismatch');
        }
        console.log('✅ Login successfully. API Key matches.');

        // 3. Access Protected Route with API Key
        console.log('\nTesting 3: Access Protected Route with x-api-key...');
        // We try to access a protected route (e.g., /auth/profile) using ONLY x-api-key
        // Note: /auth/profile relies on req.user.id which our middleware sets.
        try {
            res = await axios.get(`${API_URL}/auth/profile`, {
                headers: {
                    'x-api-key': apiKey
                }
            });
            if (!res.data.success) {
                throw new Error('❌ API Access failed with valid key');
            }
            console.log('✅ API Access successful with x-api-key.');
        } catch (err) {
            console.error('❌ API Access failed:', err.response ? err.response.data : err.message);
            throw err;
        }

        // 4. Access with Invalid Key
        console.log('\nTesting 4: Access with Invalid Key...');
        try {
            await axios.get(`${API_URL}/auth/profile`, {
                headers: {
                    'x-api-key': 'invalid_key_123'
                }
            });
            console.error('❌ Should have failed with invalid key but succeeded');
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log('✅ Access correctly rejected with invalid key.');
            } else {
                console.error('❌ Unexpected error for invalid key:', err.message);
            }
        }

        console.log('\n✨ All tests passed successfully!');

    } catch (error) {
        console.error('\n🛑 Verification Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

runTests();
