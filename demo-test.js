#!/usr/bin/env node

/**
 * AI Agent Writer SaaS Platform - Demo Test Script
 * This script demonstrates the complete flow from registration to chat
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'https://ai-agent-frontend-qpx8.onrender.com';
const timestamp = Date.now();
const TEST_COMPANY = {
    name: `Demo Company ${timestamp}`,
    email: `admin@democompany${timestamp}.com`,
    adminName: 'Demo Admin',
    adminEmail: `demo${timestamp}@democompany.com`,
    adminPassword: 'demopass123',
    industry: 'technology'
};

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// Test results
let passed = 0;
let failed = 0;

// Helper function to make HTTP requests
function makeRequest(method, endpoint, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ status: res.statusCode, data: response });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Test function
function runTest(testName, testFunction) {
    return new Promise(async (resolve) => {
        process.stdout.write(`Testing: ${testName}... `);

        try {
            const result = await testFunction();
            if (result.success) {
                console.log(`${colors.green}✅ PASS${colors.reset}`);
                passed++;
            } else {
                console.log(`${colors.red}❌ FAIL${colors.reset}`);
                console.log(`  Error: ${result.error}`);
                failed++;
            }
        } catch (error) {
            console.log(`${colors.red}❌ FAIL${colors.reset}`);
            console.log(`  Error: ${error.message}`);
            failed++;
        }

        resolve();
    });
}

// Test 1: Company Registration
async function testCompanyRegistration() {
    const response = await makeRequest('POST', '/api/v1/company/register', TEST_COMPANY);

    if ((response.status === 200 || response.status === 201) && response.data.message === 'Company registered successfully') {
        return { success: true, data: response.data };
    } else {
        return { success: false, error: `Expected 200/201, got ${response.status}` };
    }
}

// Test 2: Company Login
async function testCompanyLogin() {
    const response = await makeRequest('POST', '/api/v1/company/login', {
        email: TEST_COMPANY.adminEmail,
        password: TEST_COMPANY.adminPassword
    });

    if (response.status === 200 && response.data.message === 'Login successful') {
        return { success: true, data: response.data };
    } else {
        return { success: false, error: `Expected 200, got ${response.status}` };
    }
}

// Test 3: Add Agent
async function testAddAgent(token) {
    const response = await makeRequest('POST', '/api/v1/agents', {
        name: 'Demo Agent',
        email: 'agent@democompany.com',
        password: 'agentpass123',
        department: 'technical'
    }, { 'Authorization': `Bearer ${token}` });

    if (response.status === 200 && response.data.message === 'Agent created successfully') {
        return { success: true, data: response.data };
    } else {
        return { success: false, error: `Expected 200, got ${response.status}` };
    }
}

// Test 4: Generate API Key
async function testGenerateApiKey(token) {
    const response = await makeRequest('POST', '/api/v1/company/api-keys', {
        name: 'Demo API Key',
        permissions: ['read', 'write']
    }, { 'Authorization': `Bearer ${token}` });

    if (response.status === 200 && response.data.message === 'API key generated successfully') {
        return { success: true, data: response.data };
    } else {
        return { success: false, error: `Expected 200, got ${response.status}` };
    }
}

// Test 5: Start Chat Session
async function testStartChatSession(apiKey) {
    const response = await makeRequest('POST', '/api/v1/company/api/chat/start', {
        name: 'Demo Customer',
        email: 'customer@example.com',
        phoneNumber: '+1234567890',
        serviceType: 'general_support'
    }, { 'X-API-Key': apiKey });

    if (response.status === 200 && response.data.sessionId) {
        return { success: true, data: response.data };
    } else {
        return { success: false, error: `Expected 200, got ${response.status}` };
    }
}

// Test 6: Send Message
async function testSendMessage(apiKey, sessionId) {
    const response = await makeRequest('POST', '/api/v1/company/api/chat/message', {
        sessionId: sessionId,
        message: 'Hello, I need help with my order'
    }, { 'X-API-Key': apiKey });

    if (response.status === 200 && response.data.message === 'Message sent successfully') {
        return { success: true, data: response.data };
    } else {
        return { success: false, error: `Expected 200, got ${response.status}` };
    }
}

// Test 7: Get Analytics
async function testGetAnalytics(apiKey) {
    const response = await makeRequest('GET', '/api/v1/company/api/analytics/overview?days=30', null, { 'X-API-Key': apiKey });

    if (response.status === 200 && response.data.tickets) {
        return { success: true, data: response.data };
    } else {
        return { success: false, error: `Expected 200, got ${response.status}` };
    }
}

// Test 8: Frontend Pages
async function testFrontendPages() {
    const pages = [
        { name: 'Registration Page', path: '/register.html' },
        { name: 'Login Page', path: '/login.html' },
        { name: 'Dashboard Page', path: '/dashboard' },
        { name: 'Integration Example', path: '/integration-example' }
    ];

    let allPassed = true;

    for (const page of pages) {
        try {
            const response = await makeRequest('GET', page.path);
            if (response.status !== 200) {
                allPassed = false;
                console.log(`    ${page.name}: ${colors.red}FAIL${colors.reset} (${response.status})`);
            } else {
                console.log(`    ${page.name}: ${colors.green}PASS${colors.reset}`);
            }
        } catch (error) {
            allPassed = false;
            console.log(`    ${page.name}: ${colors.red}FAIL${colors.reset} (${error.message})`);
        }
    }

    return { success: allPassed };
}

// Main test runner
async function runAllTests() {
    console.log(`${colors.bold}${colors.blue}🧪 AI Agent Writer SaaS Platform - Demo Test${colors.reset}`);
    console.log('=' .repeat(60));
    console.log('');

    let token, apiKey, sessionId;

    // Test 1: Company Registration
    await runTest('Company Registration', testCompanyRegistration);

    // Test 2: Company Login
    const loginResult = await runTest('Company Login', testCompanyLogin);
    if (loginResult && loginResult.success) {
        token = loginResult.data.token;
    }

    // Test 3: Add Agent
    if (token) {
        await runTest('Add Agent', () => testAddAgent(token));
    }

    // Test 4: Generate API Key
    if (token) {
        const apiKeyResult = await runTest('Generate API Key', () => testGenerateApiKey(token));
        if (apiKeyResult && apiKeyResult.success) {
            apiKey = apiKeyResult.data.apiKey;
        }
    }

    // Test 5: Start Chat Session
    if (apiKey) {
        const chatResult = await runTest('Start Chat Session', () => testStartChatSession(apiKey));
        if (chatResult && chatResult.success) {
            sessionId = chatResult.data.sessionId;
        }
    }

    // Test 6: Send Message
    if (apiKey && sessionId) {
        await runTest('Send Message', () => testSendMessage(apiKey, sessionId));
    }

    // Test 7: Get Analytics
    if (apiKey) {
        await runTest('Get Analytics', () => testGetAnalytics(apiKey));
    }

    // Test 8: Frontend Pages
    console.log(`Testing: Frontend Pages... `);
    const frontendResult = await testFrontendPages();
    if (frontendResult.success) {
        console.log(`${colors.green}✅ PASS${colors.reset}`);
        passed++;
    } else {
        console.log(`${colors.red}❌ FAIL${colors.reset}`);
        failed++;
    }

    // Results
    console.log('');
    console.log('📊 Test Results Summary');
    console.log('=' .repeat(30));
    console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
    console.log(`Total: ${passed + failed}`);

    if (failed === 0) {
        console.log('');
        console.log(`${colors.green}${colors.bold}🎉 All tests passed! Your SaaS platform is working correctly.${colors.reset}`);
        console.log('');
        console.log('🚀 Quick Links:');
        console.log(`- Company Registration: ${BASE_URL}/register.html`);
        console.log(`- Company Login: ${BASE_URL}/login.html`);
        console.log(`- Company Dashboard: ${BASE_URL}/dashboard`);
        console.log(`- Integration Example: ${BASE_URL}/integration-example`);
        console.log(`- Agent Dashboard: ${BASE_URL}/agent-dashboard`);
    } else {
        console.log('');
        console.log(`${colors.yellow}⚠️  Some tests failed. Please check the errors above.${colors.reset}`);
    }

    console.log('');
    console.log('📚 Documentation:');
    console.log('- Complete Testing Guide: COMPLETE_TESTING_GUIDE.md');
    console.log('- Company Usage Guide: COMPANY_USAGE_GUIDE.md');
    console.log('- Quick Setup Guide: QUICK_SETUP_GUIDE.md');
}

// Run the tests
runAllTests().catch(console.error);
