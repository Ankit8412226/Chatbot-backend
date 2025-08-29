# 🚀 Quick Setup Guide - Get Your Chatbot Working in 5 Minutes

## Step 1: Register Your Company (2 minutes)

1. **Go to registration page**: `http://yourdomain.com/register.html`
2. **Fill out the form**:
   - Company Name: Your business name
   - Company Email: Your business email
   - Admin Name: Your name
   - Admin Email: Your email
   - Password: Choose a secure password
   - Industry: Select your industry
3. **Click "Create Account"**
4. **You'll get**: 7-day free trial with 3 agents, 1,000 chats/month

## Step 2: Add Your Support Team (1 minute)

1. **Login to dashboard**: `http://yourdomain.com/dashboard`
2. **Add agents** using the "Add Agent" form:
   - Name: Agent's name
   - Email: Agent's email
   - Password: Agent's password
   - Department: Technical/Sales/Marketing/General
3. **Repeat for up to 3 agents** (trial limit)

## Step 3: Get Your API Key (30 seconds)

1. **In dashboard**, go to "Generate API Key" section
2. **Fill out**:
   - Key Name: "Production API Key"
   - Permissions: ✓ Read, ✓ Write
3. **Click "Generate Key"**
4. **Copy the API key** (starts with `sk_`)

## Step 4: Add Chat Widget to Your Website (1 minute)

### Option A: Simple Copy-Paste (Recommended)

Add this code to your website's `<head>` section:

```html
<script>
// Configure your chat widget
window.AI_CHAT_CONFIG = {
    apiKey: 'sk_your_api_key_here', // Replace with your actual API key
    domain: 'https://yourdomain.com', // Replace with your domain
    companyName: 'Your Company Support',
    position: 'bottom-right',
    theme: 'blue'
};
</script>
<script src="https://yourdomain.com/chat-widget.js"></script>
```

### Option B: Custom Integration

```html
<!-- Add this to your website -->
<div id="ai-chat-widget"></div>
<script>
const chatWidget = new AIAgentChatWidget({
    apiKey: 'sk_your_api_key_here',
    domain: 'https://yourdomain.com',
    companyName: 'Your Company Support',
    position: 'bottom-right',
    theme: 'blue'
});
</script>
```

## Step 5: Test Your Chatbot (30 seconds)

1. **Visit your website**
2. **Look for the chat button** (bottom-right corner)
3. **Click it** and start a conversation
4. **Your agents can respond** from the agent dashboard

## 🎉 That's It! Your Chatbot is Live!

### What Happens Next:

1. **Customers click chat** → Chat session created
2. **AI responds automatically** → Instant customer support
3. **Human agents notified** → Can take over if needed
4. **All conversations saved** → For review and analytics

### Your Agents Can:

- **Login at**: `http://yourdomain.com/agent-dashboard`
- **See active chats** and respond to customers
- **Track performance** and satisfaction ratings
- **Transfer chats** between team members

## 🔧 Customization Options

### Change Chat Widget Position:
```javascript
position: 'bottom-left'    // or 'top-right', 'top-left'
```

### Change Theme Colors:
```javascript
theme: 'blue'              // or 'green', 'purple', 'orange', 'red'
```

### Custom Company Name:
```javascript
companyName: 'Your Brand Support'
```

## 📊 Monitor Your Usage

**In your dashboard, you can see**:
- Number of active agents
- Monthly chat volume
- API call usage
- Trial days remaining

## 💳 Upgrade When Ready

When you hit trial limits:
1. **Click "Upgrade Plan"** in dashboard
2. **Choose your plan**:
   - Starter ($29/month): 5 agents, 5,000 chats
   - Professional ($99/month): 15 agents, 25,000 chats
   - Enterprise ($299/month): 50 agents, 100,000 chats
3. **Complete payment** via Stripe
4. **Limits increased automatically**

## 🆘 Need Help?

- **View integration example**: `http://yourdomain.com/integration-example`
- **Check documentation**: See `COMPANY_USAGE_GUIDE.md`
- **Test API endpoints**: Use the dashboard to generate test API keys

## 🚀 Advanced Features

Once you're set up, you can:
- **Customize chat widget** appearance
- **Set up webhooks** for notifications
- **Integrate with your CRM**
- **Add custom AI responses**
- **Set up automated workflows**

---

**Your AI-powered customer support is now live and ready to help your customers 24/7!** 🎯
