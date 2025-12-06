/**
 * API Test Script
 * This script tests all API endpoints
 * 
 * Usage: node test-api.js
 * Make sure the server is running before executing this script
 */

const BASE_URL = 'http://localhost:5000';
let authToken = '';

// Helper function to make API requests
async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { error: error.message };
    }
}

// Test functions
async function testRegister() {
    console.log('\n📝 Testing User Registration...');
    const result = await makeRequest('/api/auth/register', 'POST', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
    });

    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.data.success && result.data.data.token) {
        authToken = result.data.data.token;
        console.log('✅ Registration successful! Token saved.');
    }
}

async function testLogin() {
    console.log('\n🔐 Testing User Login...');
    const result = await makeRequest('/api/auth/login', 'POST', {
        email: 'test@example.com',
        password: 'password123',
    });

    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.data.success && result.data.data.token) {
        authToken = result.data.data.token;
        console.log('✅ Login successful! Token saved.');
    }
}

async function testGetProfile() {
    console.log('\n👤 Testing Get User Profile (Protected Route)...');
    const result = await makeRequest('/api/users/profile', 'GET', null, authToken);

    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.data.success) {
        console.log('✅ Profile retrieved successfully!');
    }
}

async function testUpdateProfile() {
    console.log('\n✏️ Testing Update User Profile (Protected Route)...');
    const result = await makeRequest('/api/users/profile', 'PUT', {
        username: 'testuser_updated',
    }, authToken);

    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (result.data.success) {
        console.log('✅ Profile updated successfully!');
    }
}

async function testInvalidToken() {
    console.log('\n❌ Testing Invalid Token...');
    const result = await makeRequest('/api/users/profile', 'GET', null, 'invalid_token_here');

    console.log(`Status: ${result.status}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));

    if (!result.data.success) {
        console.log('✅ Invalid token correctly rejected!');
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting API Tests...');
    console.log('='.repeat(50));

    try {
        await testRegister();
        await testLogin();
        await testGetProfile();
        await testUpdateProfile();
        await testInvalidToken();

        console.log('\n' + '='.repeat(50));
        console.log('✅ All tests completed!');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ with native fetch support.');
    console.log('Please upgrade Node.js or use Postman for testing.');
    process.exit(1);
}

runTests();
