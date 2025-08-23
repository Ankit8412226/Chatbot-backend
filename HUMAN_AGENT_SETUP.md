# Human Agent Handoff Setup Guide

Your chatbot now supports seamless human agent handoff! This feature allows customers to be transferred from the AI chatbot to human support agents when needed.

## 🚀 Features

- **Automatic Escalation**: AI detects when human assistance is needed
- **Manual Request**: Customers can explicitly request human agents
- **Smart Routing**: Routes customers to agents with relevant expertise
- **Real-time Notifications**: Agents receive instant transfer requests
- **Queue Management**: Handles overflow when all agents are busy
- **Performance Tracking**: Monitors agent performance and satisfaction

## 📋 Setup Instructions

### 1. Install Dependencies

Make sure you have all required dependencies:

```bash
npm install bcrypt
```

### 2. Set Up Human Agents

Run the agent setup script to create sample human agents:

```bash
node scripts/setupAgents.js
```

This will create 4 sample agents with different expertise areas:
- **Sarah Johnson** - Web & Mobile Development Expert
- **Mike Chen** - Cybersecurity & Data Analytics Expert
- **Emily Rodriguez** - Digital Marketing & UI/UX Expert
- **David Kim** - General Consulting & Strategy Expert

### 3. Access Agent Dashboard

Visit the agent dashboard at:
```
http://localhost:5000/agent-dashboard
```

## 🔄 How It Works

### Automatic Escalation Triggers

The AI will automatically escalate to human agents when:

1. **Customer explicitly requests human help** (keywords: "human", "agent", "representative", etc.)
2. **Complex issues detected** (keywords: "complex", "difficult", "technical issue", etc.)
3. **Long conversations** (after 15+ messages)
4. **High urgency** (keywords: "urgent", "critical", "emergency", etc.)

### Manual Escalation

Customers can request human assistance by:

1. **Saying "I want to speak with a human"**
2. **Using the explicit API endpoint**: `POST /api/support/request-human`
3. **Asking for a "real person" or "customer service"**

### Agent Assignment Logic

The system intelligently assigns customers to agents based on:

- **Service expertise** (matches agent skills to customer needs)
- **Current workload** (agents with fewer active chats)
- **Performance rating** (higher-rated agents get priority)
- **Language preferences** (if specified)

## 📡 API Endpoints

### For Customers

#### Check Human Agent Availability
```http
GET /api/support/human-availability
```

Response:
```json
{
  "humanSupportAvailable": true,
  "onlineAgents": 3,
  "availableAgents": 2,
  "estimatedWaitTime": "2 minutes",
  "message": "2 human agents available to help"
}
```

#### Request Human Agent
```http
POST /api/support/request-human
Content-Type: application/json

{
  "sessionId": "your-session-id",
  "reason": "Need technical assistance",
  "priority": "high"
}
```

### For Agents

#### Send Response to Customer
```http
POST /api/support/agent/response
Content-Type: application/json

{
  "sessionId": "customer-session-id",
  "message": "Hello! I'm here to help you with your technical issue.",
  "agentId": "agent-id"
}
```

## 🎯 Agent Dashboard Features

The agent dashboard provides:

- **Real-time chat notifications**
- **Customer conversation history**
- **Service type and priority indicators**
- **Performance statistics**
- **Status management (online/busy/offline)**
- **Transfer request notifications**

## 🔧 Configuration

### Agent Skills

Agents can be configured with expertise in these service areas:

- `web_development` - Websites, web apps, e-commerce
- `mobile_development` - iOS, Android, cross-platform apps
- `digital_marketing` - SEO, SEM, social media, content marketing
- `cloud_solutions` - AWS, Azure, DevOps, infrastructure
- `data_analytics` - BI, data visualization, reporting
- `cybersecurity` - Security audits, compliance, monitoring
- `ui_ux_design` - Design, prototyping, user research
- `consulting` - Strategy, digital transformation, planning

### Escalation Settings

You can customize escalation triggers in `middleware/transferMiddleware.js`:

```javascript
// Keywords that trigger human escalation
const humanRequestKeywords = [
  'human', 'person', 'agent', 'representative', 'speak to someone',
  'talk to human', 'real person', 'customer service', 'supervisor'
];

// Complexity keywords
const complexityKeywords = [
  'complex', 'difficult', 'challenging', 'advanced', 'technical issue',
  'not working', 'problem with', 'error', 'broken', 'failed'
];
```

## 📊 Monitoring & Analytics

### Agent Performance Metrics

- **Total chats handled**
- **Average response time**
- **Customer satisfaction ratings**
- **Transfer success rates**
- **Service type distribution**

### System Analytics

- **Escalation rates by trigger type**
- **Wait times for human agents**
- **Queue length during peak hours**
- **Customer satisfaction with handoff process**

## 🚨 Troubleshooting

### Common Issues

1. **No agents available**
   - Check if agents are online and available
   - Verify agent `isAvailable` status
   - Check `maxConcurrentChats` limits

2. **Transfer failures**
   - Ensure MongoDB connection is stable
   - Check agent permissions and roles
   - Verify session IDs are valid

3. **Dashboard not loading**
   - Ensure static files are served correctly
   - Check file permissions for `public/` directory
   - Verify route is properly configured

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## 🔐 Security Considerations

- **Agent authentication** required for sensitive operations
- **Session validation** ensures proper access control
- **Rate limiting** prevents abuse of transfer requests
- **Input sanitization** protects against injection attacks

## 📈 Best Practices

1. **Train agents** on the specific services they support
2. **Monitor escalation patterns** to optimize AI responses
3. **Set appropriate workload limits** for agent productivity
4. **Regular performance reviews** to maintain quality
5. **Backup agents** for critical service areas

## 🎉 Success Metrics

Track these KPIs to measure handoff success:

- **Transfer acceptance rate** (target: >95%)
- **Average wait time** (target: <3 minutes)
- **Customer satisfaction** (target: >4.5/5)
- **Resolution rate** (target: >90%)
- **Agent utilization** (target: 70-85%)

---

Your chatbot is now ready for human agent handoff! 🚀

For additional support or customization, refer to the code comments in the relevant files or contact your development team.
