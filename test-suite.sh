#!/bin/bash

# AI Agent Writer SaaS Platform - Automated Test Suite
# Run this script to test all functionality

set -e  # Exit on any error

echo "🧪 Starting AI Agent Writer SaaS Platform Tests..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"

    echo -n "Testing: $test_name... "

    if eval "$test_command" 2>/dev/null | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED++))
    fi
}

# Function to run test with JSON response
run_json_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_field="$3"

    echo -n "Testing: $test_name... "

    if eval "$test_command" 2>/dev/null | grep -q "$expected_field"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAILED++))
    fi
}

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s https://ai-agent-frontend-qpx8.onrender.com/api/test > /dev/null; then
    echo -e "${RED}❌ Server is not running. Please check your hosted backend${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"

echo ""
echo "📋 Running API Tests..."
echo "======================"

# Test 1: Company Registration
run_json_test \
    "Company Registration" \
    "curl -s -X POST https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/register -H 'Content-Type: application/json' -d '{\"name\":\"Test Company\",\"email\":\"admin@testcompany.com\",\"adminName\":\"John Admin\",\"adminEmail\":\"john@testcompany.com\",\"adminPassword\":\"testpass123\",\"industry\":\"technology\"}'" \
    "Company registered successfully"

# Test 2: Company Login
run_json_test \
    "Company Login" \
    "curl -s -X POST https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/login -H 'Content-Type: application/json' -d '{\"email\":\"john@testcompany.com\",\"password\":\"testpass123\"}'" \
    "Login successful"

# Get token for subsequent tests
TOKEN=$(curl -s -X POST https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/login \
    -H "Content-Type: application/json" \
    -d '{"email":"john@testcompany.com","password":"testpass123"}' | \
    grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get authentication token${NC}"
    exit 1
fi

# Test 3: Dashboard Access
run_json_test \
    "Dashboard Access" \
    "curl -s -X GET https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/dashboard -H 'Authorization: Bearer $TOKEN'" \
    "company"

# Test 4: Add Agent
run_json_test \
    "Add Agent" \
    "curl -s -X POST https://ai-agent-frontend-qpx8.onrender.com/api/v1/agents -H 'Content-Type: application/json' -H 'Authorization: Bearer $TOKEN' -d '{\"name\":\"Sarah Agent\",\"email\":\"sarah@testcompany.com\",\"password\":\"agentpass123\",\"department\":\"technical\"}'" \
    "Agent created successfully"

# Test 5: List Agents
run_json_test \
    "List Agents" \
    "curl -s -X GET https://ai-agent-frontend-qpx8.onrender.com/api/v1/agents -H 'Authorization: Bearer $TOKEN'" \
    "agents"

# Test 6: Generate API Key
API_KEY_RESPONSE=$(curl -s -X POST https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/api-keys \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"name":"Test API Key","permissions":["read","write"]}')

run_json_test \
    "Generate API Key" \
    "echo '$API_KEY_RESPONSE'" \
    "API key generated successfully"

# Extract API key
API_KEY=$(echo "$API_KEY_RESPONSE" | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)

if [ -z "$API_KEY" ]; then
    echo -e "${RED}❌ Failed to get API key${NC}"
    exit 1
fi

# Test 7: List API Keys
run_json_test \
    "List API Keys" \
    "curl -s -X GET https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/api-keys -H 'Authorization: Bearer $TOKEN'" \
    "apiKeys"

# Test 8: Start Chat Session
CHAT_SESSION_RESPONSE=$(curl -s -X POST https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/api/chat/start \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $API_KEY" \
    -d '{"name":"Test Customer","email":"customer@example.com","phoneNumber":"+1234567890","serviceType":"general_support"}')

run_json_test \
    "Start Chat Session" \
    "echo '$CHAT_SESSION_RESPONSE'" \
    "Chat session created successfully"

# Extract session ID
SESSION_ID=$(echo "$CHAT_SESSION_RESPONSE" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
    echo -e "${RED}❌ Failed to get session ID${NC}"
    exit 1
fi

# Test 9: Send Message
run_json_test \
    "Send Message" \
    "curl -s -X POST https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/api/chat/message -H 'Content-Type: application/json' -H 'X-API-Key: $API_KEY' -d '{\"sessionId\":\"$SESSION_ID\",\"message\":\"Hello, I need help\"}'" \
    "Message sent successfully"

# Test 10: Get Chat Sessions
run_json_test \
    "Get Chat Sessions" \
    "curl -s -X GET 'https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/api/chat/sessions?limit=10&offset=0' -H 'X-API-Key: $API_KEY'" \
    "sessions"

# Test 11: Get Analytics
run_json_test \
    "Get Analytics" \
    "curl -s -X GET 'https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/api/analytics/overview?days=30' -H 'X-API-Key: $API_KEY'" \
    "tickets"

# Test 12: Get Subscription Plans
run_json_test \
    "Get Subscription Plans" \
    "curl -s -X GET https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/plans" \
    "plans"

echo ""
echo "🔒 Running Security Tests..."
echo "============================"

# Test 13: Invalid API Key
run_test \
    "Invalid API Key Rejection" \
    "curl -s -X GET https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/api/chat/sessions -H 'X-API-Key: invalid_key' | grep -q '401\|Unauthorized\|Invalid API key'" \
    ""

# Test 14: Invalid Token
run_test \
    "Invalid Token Rejection" \
    "curl -s -X GET https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/dashboard -H 'Authorization: Bearer invalid_token' | grep -q '401\|Unauthorized\|Invalid token'" \
    ""

# Test 15: Missing Required Fields
run_test \
    "Missing Required Fields Validation" \
    "curl -s -X POST https://ai-agent-frontend-qpx8.onrender.com/api/v1/company/register -H 'Content-Type: application/json' -d '{\"name\":\"Test\"}' | grep -q '400\|Missing required fields'" \
    ""

echo ""
echo "🌐 Running Frontend Tests..."
echo "============================"

# Test 16: Registration Page
run_test \
    "Registration Page Loads" \
    "curl -s https://ai-agent-frontend-qpx8.onrender.com/register.html | grep -q 'Create Company Account'" \
    ""

# Test 17: Login Page
run_test \
    "Login Page Loads" \
    "curl -s https://ai-agent-frontend-qpx8.onrender.com/login.html | grep -q 'Sign in to your company account'" \
    ""

# Test 18: Dashboard Page
run_test \
    "Dashboard Page Loads" \
    "curl -s https://ai-agent-frontend-qpx8.onrender.com/dashboard | grep -q 'AI Agent Writer - Dashboard'" \
    ""

# Test 19: Integration Example Page
run_test \
    "Integration Example Page Loads" \
    "curl -s https://ai-agent-frontend-qpx8.onrender.com/integration-example | grep -q 'Acme Corp'" \
    ""

# Test 20: Chat Widget Script
run_test \
    "Chat Widget Script Loads" \
    "curl -s https://ai-agent-frontend-qpx8.onrender.com/chat-widget.js | grep -q 'AIAgentChatWidget'" \
    ""

echo ""
echo "📊 Test Results Summary"
echo "======================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your SaaS platform is working correctly.${NC}"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Set up Stripe for payments"
    echo "2. Configure production environment"
    echo "3. Deploy to production"
    echo "4. Start customer acquisition"
else
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed. Please check the errors above.${NC}"
fi

echo ""
echo "🔗 Quick Links:"
echo "- Company Registration: http://localhost:5000/register.html"
echo "- Company Login: http://localhost:5000/login.html"
echo "- Company Dashboard: http://localhost:5000/dashboard"
echo "- Integration Example: http://localhost:5000/integration-example"
echo "- Agent Dashboard: http://localhost:5000/agent-dashboard"

echo ""
echo "📚 Documentation:"
echo "- Complete Testing Guide: COMPLETE_TESTING_GUIDE.md"
echo "- Company Usage Guide: COMPANY_USAGE_GUIDE.md"
echo "- Quick Setup Guide: QUICK_SETUP_GUIDE.md"
