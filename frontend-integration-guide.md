# Frontend Integration Guide

## 🔧 **API Configuration for Local Development**

### Update your React component's API_BASE_URL:

```javascript
// Change this line in your WhatsAppFloat component:
const API_BASE_URL = 'http://localhost:5000/api/v1/support';
```

### Complete Updated API Configuration:

```javascript
// API configuration - Update this URL to match your backend
const API_BASE_URL = 'http://localhost:5000/api/v1/support';

// Configure axios defaults
useEffect(() => {
  axios.defaults.timeout = 30000;
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  // Add CORS headers for local development
  axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

  // Add request interceptor for error handling
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error);
      setConnectionError(true);
      setTimeout(() => setConnectionError(false), 5000);
      return Promise.reject(error);
    }
  );
}, []);
```

## 🚀 **Testing Your Integration**

### 1. **Start Your Backend Server**
```bash
cd /Users/ankitkumar/ai-agent-writer
npm start
```

### 2. **Test Backend Endpoints**
```bash
# Test basic connectivity
curl http://localhost:5000/api/test

# Test human agent availability
curl http://localhost:5000/api/v1/support/human-availability

# Start a support session
curl -X POST http://localhost:5000/api/v1/support/start-session \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phoneNumber": "+1234567890"
  }'
```

### 3. **Access Agent Dashboard**
Open your browser and go to:
**http://localhost:5000/agent-dashboard**

## 📱 **Frontend Testing Steps**

### 1. **Update API URL in your React component**
Replace the API_BASE_URL in your WhatsAppFloat component:

```javascript
// OLD (Vercel deployment)
const API_BASE_URL = 'https://ai-agent-frontend-wheat.vercel.app/api/v1';

// NEW (Local development)
const API_BASE_URL = 'http://localhost:5000/api/v1/support';
```

### 2. **Test the Complete Flow**

1. **Start a chat session** through your React frontend
2. **Send a message** requesting human assistance
3. **Check the agent dashboard** at http://localhost:5000/agent-dashboard
4. **Verify the transfer** appears in the agent dashboard

## 🔍 **Troubleshooting**

### CORS Issues
If you get CORS errors, your backend already has CORS enabled, but you might need to add specific origins:

```javascript
// In your backend index.js, update CORS configuration:
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true
}));
```

### API Endpoint Mismatch
Make sure your frontend is calling the correct endpoints:

```javascript
// Correct endpoints for your backend:
const endpoints = {
  startSession: `${API_BASE_URL}/start-session`,
  continueChat: `${API_BASE_URL}/continue-chat`,
  getSession: `${API_BASE_URL}/session/${sessionId}`,
  endSession: `${API_BASE_URL}/session/${sessionId}/end`,
  humanAvailability: `${API_BASE_URL}/human-availability`,
  requestHuman: `${API_BASE_URL}/request-human`
};
```

## 🎯 **Complete Integration Test**

### 1. **Backend Status Check**
```bash
curl http://localhost:5000/api/test
# Should return: {"success":true,"message":"🚀 Backend is running fine!"}
```

### 2. **Human Agent Availability**
```bash
curl http://localhost:5000/api/v1/support/human-availability
# Should return agent availability status
```

### 3. **Start Session Test**
```bash
curl -X POST http://localhost:5000/api/v1/support/start-session \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890"
  }'
```

### 4. **Test Human Agent Handoff**
```bash
# Use the sessionId from step 3
curl -X POST http://localhost:5000/api/v1/support/continue-chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "YOUR_SESSION_ID",
    "message": "I want to speak with a human agent"
  }'
```

## 📊 **Agent Dashboard Features**

Your agent dashboard at `http://localhost:5000/agent-dashboard` includes:

- ✅ **Real-time chat notifications**
- ✅ **Customer conversation history**
- ✅ **Service type and priority indicators**
- ✅ **Performance statistics**
- ✅ **Status management (online/busy/offline)**
- ✅ **Transfer request notifications**

## 🎉 **Success Indicators**

Your integration is working when:

1. ✅ Backend responds to API calls
2. ✅ Frontend can start chat sessions
3. ✅ Human agent handoff triggers successfully
4. ✅ Agent dashboard shows transfer requests
5. ✅ Real-time notifications work

---

**Your chatbot with human agent handoff is now fully functional! 🚀**
