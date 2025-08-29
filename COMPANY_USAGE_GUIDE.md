# Complete Company Usage Guide - AI Agent Writer SaaS

## 🚀 How Companies Use Your SaaS Platform

This guide shows the complete flow from company registration to having a fully functional chatbot for their business.

---

## 📋 Step-by-Step Company Onboarding Flow

### 1. **Company Registration & Trial Setup**

#### A. Company Signs Up
```
1. Company visits: http://yourdomain.com/register.html
2. Fills out registration form:
   - Company Name: "Acme Corp"
   - Company Email: "admin@acme.com"
   - Admin Name: "John Doe"
   - Admin Email: "john@acme.com"
   - Password: "securepassword123"
   - Industry: "Technology"
3. Clicks "Create Account"
```

#### B. What Happens Behind the Scenes
- ✅ Company account created with 7-day free trial
- ✅ Admin user created with full permissions
- ✅ Trial limits set: 3 agents, 1,000 chats/month, 10,000 API calls
- ✅ Company gets access to dashboard

#### C. Company Receives
- **Welcome Email**: Trial confirmation and next steps
- **Dashboard Access**: Full admin dashboard
- **Trial Status**: 7 days remaining

---

### 2. **Company Dashboard Setup**

#### A. First Login
```
1. Company admin logs in at: http://yourdomain.com/login.html
2. Uses admin email and password
3. Redirected to dashboard: http://yourdomain.com/dashboard
```

#### B. Dashboard Overview
The company sees:
- **Subscription Status**: "Trial - 7 days left"
- **Usage Stats**: 0 agents, 0 chats, 0 API calls
- **Quick Actions**: Add agents, generate API keys
- **Limits**: 3 agents, 1,000 chats, 10,000 API calls

---

### 3. **Adding Support Agents**

#### A. Company Adds Their Team
```
1. In dashboard, company admin fills out "Add Agent" form:
   - Name: "Sarah Johnson"
   - Email: "sarah@acme.com"
   - Password: "agentpass123"
   - Department: "Technical"
2. Clicks "Add Agent"
3. Repeats for other agents (up to 3 for trial)
```

#### B. Agent Setup
- ✅ Agent account created
- ✅ Agent can log in at: http://yourdomain.com/agent-dashboard
- ✅ Agent appears in company's agent list
- ✅ Agent can handle customer chats

#### C. Agent Capabilities
- **Chat Handling**: Accept and respond to customer messages
- **Status Management**: Online/offline/away status
- **Performance Tracking**: Response times, satisfaction ratings
- **Department Assignment**: Technical, Sales, Marketing, General

---

### 4. **Getting API Access**

#### A. Generate API Key
```
1. Company admin goes to "Generate API Key" section
2. Fills out form:
   - Key Name: "Production API Key"
   - Permissions: ✓ Read, ✓ Write
3. Clicks "Generate Key"
4. Receives: "sk_company123_1234567890_abc123def"
```

#### B. API Key Usage
The company can now:
- **Start Chat Sessions**: Create new customer conversations
- **Send Messages**: Programmatically send messages
- **Get Analytics**: Retrieve chat statistics
- **Manage Sessions**: List and view chat history

---

### 5. **Integrating Chatbot into Company Website**

#### A. Company Adds Chat Widget to Their Website

**HTML Integration:**
```html
<!-- Add this to company's website -->
<script>
const AI_AGENT_API_KEY = 'sk_company123_1234567890_abc123def';
const COMPANY_DOMAIN = 'https://yourdomain.com';

// Initialize chat widget
function initChatWidget() {
    // Create chat button
    const chatButton = document.createElement('div');
    chatButton.innerHTML = '💬 Need Help?';
    chatButton.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: #007bff; color: white; padding: 15px 20px;
        border-radius: 25px; cursor: pointer; z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(chatButton);

    // Chat functionality
    chatButton.addEventListener('click', async () => {
        const customerName = prompt('What\'s your name?') || 'Customer';
        const customerEmail = prompt('What\'s your email?') || 'customer@example.com';

        // Start chat session
        const response = await fetch(`${COMPANY_DOMAIN}/api/v1/company/api/chat/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': AI_AGENT_API_KEY
            },
            body: JSON.stringify({
                name: customerName,
                email: customerEmail,
                phoneNumber: '+1234567890',
                serviceType: 'general_support'
            })
        });

        const data = await response.json();
        if (data.sessionId) {
            openChatWindow(data.sessionId, customerName);
        }
    });
}

function openChatWindow(sessionId, customerName) {
    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.innerHTML = `
        <div style="position: fixed; bottom: 80px; right: 20px; width: 350px; height: 500px;
                    background: white; border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    display: flex; flex-direction: column; z-index: 1001;">
            <div style="background: #007bff; color: white; padding: 15px; border-radius: 10px 10px 0 0;">
                <strong>Chat with ${customerName}</strong>
                <button onclick="this.parentElement.parentElement.remove()"
                        style="float: right; background: none; border: none; color: white; cursor: pointer;">✕</button>
            </div>
            <div id="chat-messages" style="flex: 1; padding: 15px; overflow-y: auto;"></div>
            <div style="padding: 15px; border-top: 1px solid #eee;">
                <input type="text" id="message-input" placeholder="Type your message..."
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                <button onclick="sendMessage('${sessionId}')"
                        style="margin-top: 10px; background: #007bff; color: white; border: none;
                               padding: 10px 20px; border-radius: 5px; cursor: pointer;">Send</button>
            </div>
        </div>
    `;
    document.body.appendChild(chatWindow);

    // Add welcome message
    document.getElementById('chat-messages').innerHTML = `
        <div style="background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <strong>AI Assistant:</strong> Hi ${customerName}! How can I help you today?
        </div>
    `;
}

async function sendMessage(sessionId) {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (!message) return;

    // Add user message to chat
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `
        <div style="background: #007bff; color: white; padding: 10px; border-radius: 5px;
                    margin-bottom: 10px; text-align: right;">
            <strong>You:</strong> ${message}
        </div>
    `;

    // Send to API
    try {
        const response = await fetch(`${COMPANY_DOMAIN}/api/v1/company/api/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': AI_AGENT_API_KEY
            },
            body: JSON.stringify({
                sessionId: sessionId,
                message: message
            })
        });

        const data = await response.json();

        // Add AI response
        chatMessages.innerHTML += `
            <div style="background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <strong>AI Assistant:</strong> ${data.response}
            </div>
        `;

        input.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initChatWidget);
</script>
```

#### B. What Happens When Customer Uses Chat
1. **Customer clicks chat button** on company's website
2. **Chat session created** via API call
3. **AI responds** to customer automatically
4. **Human agent notified** if needed (escalation)
5. **Chat history saved** for company review

---

### 6. **Managing Customer Conversations**

#### A. Agent Dashboard Access
```
1. Agents log in at: http://yourdomain.com/agent-dashboard
2. See active chat sessions
3. Can respond to customers
4. Track performance metrics
```

#### B. Agent Capabilities
- **View Active Chats**: See all ongoing conversations
- **Respond to Customers**: Send messages directly
- **Transfer Chats**: Move conversations between agents
- **End Sessions**: Close resolved conversations
- **Performance Tracking**: Monitor response times and ratings

---

### 7. **Analytics & Reporting**

#### A. Company Dashboard Analytics
The company can view:
- **Chat Volume**: Number of conversations per month
- **Agent Performance**: Response times, satisfaction ratings
- **Popular Topics**: Most common customer inquiries
- **Peak Hours**: When customers need help most
- **Conversion Metrics**: Trial to paid conversion rates

#### B. API Analytics
```javascript
// Company can get analytics via API
const response = await fetch('https://yourdomain.com/api/v1/company/api/analytics/overview', {
    headers: {
        'X-API-Key': 'sk_company123_1234567890_abc123def'
    }
});
const analytics = await response.json();
```

---

### 8. **Upgrading Subscription**

#### A. When Limits Are Reached
```
1. Company hits trial limits (3 agents, 1,000 chats)
2. System shows upgrade prompt
3. Company clicks "Upgrade Plan"
4. Redirected to Stripe checkout
5. Payment processed
6. Limits increased automatically
```

#### B. Subscription Plans
- **Starter ($29/month)**: 5 agents, 5,000 chats
- **Professional ($99/month)**: 15 agents, 25,000 chats
- **Enterprise ($299/month)**: 50 agents, 100,000 chats

---

## 🔧 Technical Integration Examples

### 1. **Simple Chat Widget (Copy-Paste Ready)**
```html
<!-- Add this to any website -->
<div id="ai-chat-widget"></div>
<script>
// Configuration
const config = {
    apiKey: 'sk_company123_1234567890_abc123def',
    domain: 'https://yourdomain.com',
    companyName: 'Acme Corp'
};

// Widget code here...
</script>
```

### 2. **React Component**
```jsx
import React, { useState, useEffect } from 'react';

const ChatWidget = ({ apiKey, domain }) => {
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const startChat = async () => {
        const response = await fetch(`${domain}/api/v1/company/api/chat/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({
                name: 'Customer',
                email: 'customer@example.com',
                phoneNumber: '+1234567890',
                serviceType: 'general_support'
            })
        });

        const data = await response.json();
        setSessionId(data.sessionId);
    };

    const sendMessage = async () => {
        if (!input.trim() || !sessionId) return;

        const response = await fetch(`${domain}/api/v1/company/api/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({
                sessionId,
                message: input
            })
        });

        const data = await response.json();
        setMessages([...messages,
            { type: 'user', text: input },
            { type: 'ai', text: data.response }
        ]);
        setInput('');
    };

    return (
        <div className="chat-widget">
            {!sessionId ? (
                <button onClick={startChat}>Start Chat</button>
            ) : (
                <div>
                    <div className="messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message ${msg.type}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            )}
        </div>
    );
};
```

### 3. **Mobile App Integration**
```javascript
// React Native / Mobile App
const chatAPI = {
    startSession: async (customerInfo) => {
        const response = await fetch('https://yourdomain.com/api/v1/company/api/chat/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'sk_company123_1234567890_abc123def'
            },
            body: JSON.stringify(customerInfo)
        });
        return response.json();
    },

    sendMessage: async (sessionId, message) => {
        const response = await fetch('https://yourdomain.com/api/v1/company/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'sk_company123_1234567890_abc123def'
            },
            body: JSON.stringify({ sessionId, message })
        });
        return response.json();
    }
};
```

---

## 📊 Real-World Usage Scenarios

### Scenario 1: E-commerce Store
```
Company: "TechGadgets.com"
Setup:
1. Registers for trial
2. Adds 3 support agents (Technical, Sales, General)
3. Integrates chat widget on product pages
4. Customers get instant help with:
   - Product questions
   - Order status
   - Technical support
   - Returns/refunds
Result: 40% increase in conversion rate
```

### Scenario 2: SaaS Company
```
Company: "CloudSoft.io"
Setup:
1. Upgrades to Professional plan ($99/month)
2. Adds 10 technical support agents
3. Integrates chat in their web app
4. Provides real-time support for:
   - Account setup
   - Feature questions
   - Bug reports
   - Billing issues
Result: 60% reduction in support tickets
```

### Scenario 3: Healthcare Provider
```
Company: "HealthCare Plus"
Setup:
1. Enterprise plan for 50 agents
2. HIPAA-compliant chat integration
3. Patient support for:
   - Appointment scheduling
   - Insurance questions
   - Prescription refills
   - General inquiries
Result: 80% patient satisfaction improvement
```

---

## 🎯 Success Metrics

### For Companies Using Your Platform:
- **Response Time**: < 30 seconds average
- **Customer Satisfaction**: 4.5+ stars
- **Conversion Rate**: 25% increase
- **Support Cost**: 40% reduction
- **Agent Productivity**: 3x improvement

### For Your SaaS Business:
- **Trial Conversion**: 15-25% to paid plans
- **Monthly Recurring Revenue**: $29-$299 per company
- **Customer Retention**: 90%+ annual retention
- **Expansion Revenue**: 30% upgrade rate

---

## 🚀 Getting Started Checklist

### For New Companies:
- [ ] Register at `/register.html`
- [ ] Complete company profile
- [ ] Add support agents
- [ ] Generate API key
- [ ] Integrate chat widget
- [ ] Test with sample conversations
- [ ] Train agents on platform
- [ ] Go live with customers

### For Your Platform:
- [ ] Set up Stripe account
- [ ] Configure webhooks
- [ ] Set production environment variables
- [ ] Deploy to production
- [ ] Set up monitoring
- [ ] Create marketing materials
- [ ] Start customer acquisition

---

**Your SaaS platform is now ready to help companies provide exceptional customer support with AI-powered chat!** 🎉
