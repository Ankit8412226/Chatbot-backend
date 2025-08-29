# 🧪 Complete Testing Guide - AI Agent Writer SaaS Platform

## 🎯 Testing Overview

This guide will help you test every aspect of your SaaS platform, from company registration to chat functionality and billing.

---

## 📋 Pre-Testing Setup

### 1. **Environment Setup**
```bash
# Make sure your server is running
npm run dev

# Check MongoDB connection
# Should see: "✅ MongoDB connected"

# Verify server is accessible
curl http://localhost:5000/api/test
# Should return: {"success":true,"message":"🚀 Backend is running fine!"}
```

### 2. **Fix MongoDB Warnings** (Optional)
The warnings you see are harmless but can be fixed by removing duplicate indexes in the Company schema.

---

## 🧪 Phase 1: Company Registration & Authentication

### Test 1: Company Registration
```bash
# Test registration endpoint
curl -X POST http://localhost:5000/api/v1/company/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "email": "admin@testcompany.com",
    "adminName": "John Admin",
    "adminEmail": "john@testcompany.com",
    "adminPassword": "testpass123",
    "industry": "technology"
  }'
```

**Expected Response:**
```json
{
  "message": "Company registered successfully",
  "company": {
    "id": "...",
    "name": "Test Company",
    "slug": "test-company",
    "email": "admin@testcompany.com",
    "subscription": {
      "plan": "trial",
      "status": "trial",
      "trialEndsAt": "..."
    },
    "limits": {
      "agents": 3,
      "monthlyChats": 1000,
      "apiCalls": 10000
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test 2: Company Login
```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/v1/company/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@testcompany.com",
    "password": "testpass123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "company": {
    "id": "...",
    "name": "Test Company",
    "subscription": {...},
    "limits": {...},
    "usage": {
      "agents": 0,
      "monthlyChats": 0,
      "apiCalls": 0
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test 3: Dashboard Access
```bash
# Test dashboard endpoint (use token from login)
curl -X GET http://localhost:5000/api/v1/company/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "company": {...},
  "stats": {
    "agentsCount": 0,
    "recentTickets": 0,
    "monthlyChats": 0,
    "apiCalls": 0
  },
  "plans": {
    "trial": {...},
    "starter": {...},
    "professional": {...},
    "enterprise": {...}
  }
}
```

---

## 🧪 Phase 2: Agent Management

### Test 4: Add Agent
```bash
# Test agent creation
curl -X POST http://localhost:5000/api/v1/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Sarah Agent",
    "email": "sarah@testcompany.com",
    "password": "agentpass123",
    "department": "technical"
  }'
```

**Expected Response:**
```json
{
  "message": "Agent created successfully",
  "agent": {
    "id": "...",
    "name": "Sarah Agent",
    "email": "sarah@testcompany.com",
    "department": "technical",
    "status": "offline",
    "companyId": "..."
  }
}
```

### Test 5: List Agents
```bash
# Test getting agents list
curl -X GET http://localhost:5000/api/v1/agents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "agents": [
    {
      "id": "...",
      "name": "Sarah Agent",
      "email": "sarah@testcompany.com",
      "department": "technical",
      "status": "offline"
    }
  ],
  "count": 1,
  "filters": {}
}
```

### Test 6: Agent Login
```bash
# Test agent authentication
curl -X POST http://localhost:5000/api/v1/agents/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah@testcompany.com",
    "password": "agentpass123"
  }'
```

---

## 🧪 Phase 3: API Key Management

### Test 7: Generate API Key
```bash
# Test API key generation
curl -X POST http://localhost:5000/api/v1/company/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test API Key",
    "permissions": ["read", "write"]
  }'
```

**Expected Response:**
```json
{
  "message": "API key generated successfully",
  "apiKey": "sk_company123_1234567890_abc123def",
  "name": "Test API Key",
  "permissions": ["read", "write"]
}
```

### Test 8: List API Keys
```bash
# Test listing API keys
curl -X GET http://localhost:5000/api/v1/company/api-keys \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "apiKeys": [
    {
      "id": "...",
      "name": "Test API Key",
      "permissions": ["read", "write"],
      "isActive": true,
      "createdAt": "..."
    }
  ]
}
```

---

## 🧪 Phase 4: Chat Functionality

### Test 9: Start Chat Session
```bash
# Test starting a chat session
curl -X POST http://localhost:5000/api/v1/company/api/chat/start \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{
    "name": "Test Customer",
    "email": "customer@example.com",
    "phoneNumber": "+1234567890",
    "serviceType": "general_support"
  }'
```

**Expected Response:**
```json
{
  "sessionId": "session_1234567890_abc123def",
  "message": "Chat session created successfully"
}
```

### Test 10: Send Message
```bash
# Test sending a message
curl -X POST http://localhost:5000/api/v1/company/api/chat/message \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{
    "sessionId": "session_1234567890_abc123def",
    "message": "Hello, I need help with my order"
  }'
```

**Expected Response:**
```json
{
  "message": "Message sent successfully",
  "response": "Thank you for your message. Our team will get back to you soon."
}
```

### Test 11: Get Chat Sessions
```bash
# Test listing chat sessions
curl -X GET "http://localhost:5000/api/v1/company/api/chat/sessions?limit=10&offset=0" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

**Expected Response:**
```json
{
  "sessions": [
    {
      "id": "...",
      "sessionId": "session_1234567890_abc123def",
      "name": "Test Customer",
      "email": "customer@example.com",
      "status": "active",
      "createdAt": "..."
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### Test 12: Get Session Details
```bash
# Test getting specific session details
curl -X GET "http://localhost:5000/api/v1/company/api/chat/sessions/session_1234567890_abc123def" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

---

## 🧪 Phase 5: Analytics & Usage

### Test 13: Get Analytics
```bash
# Test analytics endpoint
curl -X GET "http://localhost:5000/api/v1/company/api/analytics/overview?days=30" \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

**Expected Response:**
```json
{
  "period": "30 days",
  "tickets": {
    "total": 1,
    "recent": 1,
    "byStatus": [...],
    "byService": [...]
  },
  "agents": {
    "total": 1,
    "online": 0
  }
}
```

---

## 🧪 Phase 6: Frontend Testing

### Test 14: Company Registration Page
1. **Open**: `http://localhost:5000/register.html`
2. **Fill out form** with test data
3. **Submit** and verify redirect to dashboard
4. **Check** trial status and limits

### Test 15: Company Login Page
1. **Open**: `http://localhost:5000/login.html`
2. **Login** with test company credentials
3. **Verify** dashboard loads with correct data

### Test 16: Company Dashboard
1. **Access**: `http://localhost:5000/dashboard`
2. **Test** adding agents
3. **Test** generating API keys
4. **Verify** usage statistics update

### Test 17: Agent Dashboard
1. **Access**: `http://localhost:5000/agent-dashboard`
2. **Login** with agent credentials
3. **Test** status updates
4. **Verify** chat management features

### Test 18: Integration Example
1. **Open**: `http://localhost:5000/integration-example`
2. **Look for** chat button (bottom-right)
3. **Click** to start chat
4. **Test** sending messages
5. **Verify** responses work

---

## 🧪 Phase 7: Error Handling & Edge Cases

### Test 19: Invalid API Key
```bash
curl -X GET http://localhost:5000/api/v1/company/api/chat/sessions \
  -H "X-API-Key: invalid_key"
```
**Expected**: 401 Unauthorized

### Test 20: Rate Limiting
```bash
# Make many rapid requests
for i in {1..150}; do
  curl -X GET http://localhost:5000/api/v1/company/api/chat/sessions \
    -H "X-API-Key: YOUR_API_KEY_HERE"
done
```
**Expected**: 429 Rate limit exceeded after 100 requests

### Test 21: Usage Limits
```bash
# Try to add more agents than allowed (trial: 3 agents)
# Add 4th agent should fail
curl -X POST http://localhost:5000/api/v1/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Agent 4",
    "email": "agent4@testcompany.com",
    "password": "pass123",
    "department": "general"
  }'
```
**Expected**: 403 Agent limit reached

### Test 22: Invalid Session ID
```bash
curl -X POST http://localhost:5000/api/v1/company/api/chat/message \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{
    "sessionId": "invalid_session",
    "message": "Hello"
  }'
```
**Expected**: 404 Session not found

---

## 🧪 Phase 8: Subscription & Billing (Mock)

### Test 23: Subscription Plans
```bash
curl -X GET http://localhost:5000/api/v1/company/plans
```
**Expected**: List of all subscription plans

### Test 24: Checkout Session (Mock)
```bash
curl -X POST http://localhost:5000/api/v1/company/subscription/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "plan": "starter"
  }'
```
**Expected**: Stripe checkout session URL (requires Stripe setup)

---

## 🧪 Phase 9: WebSocket Testing (Optional)

### Test 25: Real-time Chat
1. **Open** integration example page
2. **Start** chat session
3. **Send** messages rapidly
4. **Verify** real-time updates work
5. **Test** multiple browser tabs

---

## 🧪 Phase 10: Performance Testing

### Test 26: Load Testing
```bash
# Install Apache Bench (if not installed)
# macOS: brew install httpd
# Ubuntu: sudo apt-get install apache2-utils

# Test API performance
ab -n 100 -c 10 http://localhost:5000/api/test

# Test chat endpoint performance
ab -n 50 -c 5 -p chat_data.json -T application/json \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  http://localhost:5000/api/v1/company/api/chat/message
```

---

## 🧪 Phase 11: Security Testing

### Test 27: SQL Injection
```bash
# Test with malicious input
curl -X POST http://localhost:5000/api/v1/company/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test\"; DROP TABLE companies; --",
    "email": "test@example.com",
    "adminName": "Admin",
    "adminEmail": "admin@example.com",
    "adminPassword": "pass123",
    "industry": "technology"
  }'
```
**Expected**: Proper validation/escaping

### Test 28: XSS Prevention
```bash
# Test with script tags
curl -X POST http://localhost:5000/api/v1/company/api/chat/message \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{
    "sessionId": "valid_session",
    "message": "<script>alert(\"xss\")</script>"
  }'
```
**Expected**: Script tags should be escaped

---

## 📊 Test Results Checklist

### ✅ Core Functionality
- [ ] Company registration works
- [ ] Company login works
- [ ] Agent creation works
- [ ] Agent login works
- [ ] API key generation works
- [ ] Chat session creation works
- [ ] Message sending works
- [ ] Analytics work

### ✅ Frontend
- [ ] Registration page loads
- [ ] Login page loads
- [ ] Dashboard loads
- [ ] Agent dashboard loads
- [ ] Integration example works
- [ ] Chat widget appears
- [ ] Chat functionality works

### ✅ Security
- [ ] Invalid credentials rejected
- [ ] Invalid API keys rejected
- [ ] Rate limiting works
- [ ] Usage limits enforced
- [ ] Input validation works
- [ ] XSS prevention works

### ✅ Error Handling
- [ ] 400 errors for invalid input
- [ ] 401 errors for unauthorized access
- [ ] 403 errors for forbidden actions
- [ ] 404 errors for not found
- [ ] 429 errors for rate limiting
- [ ] 500 errors handled gracefully

### ✅ Performance
- [ ] API responses under 200ms
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Concurrent requests handled

---

## 🚨 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
```bash
# Check if MongoDB is running
brew services list | grep mongodb
# Start MongoDB if needed
brew services start mongodb-community
```

### Issue 2: Port 5000 Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 PID
```

### Issue 3: CORS Errors
```bash
# Check CORS configuration in index.js
# Should have: app.use(cors());
```

### Issue 4: JWT Token Expired
```bash
# Re-login to get new token
curl -X POST http://localhost:5000/api/v1/company/login \
  -H "Content-Type: application/json" \
  -d '{"email": "...", "password": "..."}'
```

---

## 🎯 Automated Testing Script

Create a test script to run all tests automatically:

```bash
#!/bin/bash
# test-suite.sh

echo "🧪 Starting AI Agent Writer SaaS Platform Tests..."

# Test 1: Company Registration
echo "Test 1: Company Registration"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/company/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "email": "admin@testcompany.com",
    "adminName": "John Admin",
    "adminEmail": "john@testcompany.com",
    "adminPassword": "testpass123",
    "industry": "technology"
  }')

echo $REGISTER_RESPONSE | grep -q "Company registered successfully" && echo "✅ PASS" || echo "❌ FAIL"

# Continue with other tests...
```

---

## 🎉 Testing Complete!

Once all tests pass, your SaaS platform is ready for production deployment!

**Next Steps:**
1. Set up Stripe for real payments
2. Configure production environment
3. Deploy to production server
4. Start customer acquisition

---

**Your AI Agent Writer SaaS platform is now fully tested and ready to help companies provide exceptional customer support!** 🚀
