# AI Agent Writer - SaaS Platform

A comprehensive multi-tenant SaaS platform for AI-powered customer support with agent management, subscription billing, and API access.

## 🚀 Features

### Multi-Tenant Architecture
- **Company Registration & Management**: Each company gets their own isolated environment
- **7-Day Free Trial**: Automatic trial period for new companies
- **Subscription Plans**: Multiple tiers with different limits and features
- **Usage Tracking**: Monitor API calls, chat sessions, and agent usage

### Subscription Plans
- **Free Trial**: 3 agents, 1,000 chats/month, 10,000 API calls
- **Starter ($29/month)**: 5 agents, 5,000 chats/month, 50,000 API calls
- **Professional ($99/month)**: 15 agents, 25,000 chats/month, 250,000 API calls
- **Enterprise ($299/month)**: 50 agents, 100,000 chats/month, 1,000,000 API calls

### Agent Management
- **Add/Remove Agents**: Company admins can manage their support team
- **Department Assignment**: Organize agents by department (Technical, Sales, Marketing, General)
- **Status Tracking**: Monitor agent availability and performance
- **Skill Management**: Assign specific skills to agents

### API Access
- **API Key Generation**: Secure API keys with customizable permissions
- **Rate Limiting**: Built-in rate limiting per company
- **Usage Tracking**: Monitor API usage against subscription limits
- **RESTful Endpoints**: Complete API for chat management and analytics

### Billing & Payments
- **Stripe Integration**: Secure payment processing
- **Automatic Billing**: Monthly subscription billing
- **Webhook Handling**: Real-time subscription status updates
- **Trial Management**: Automatic trial expiration handling

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT tokens, bcrypt password hashing
- **Payments**: Stripe API
- **Frontend**: HTML, Tailwind CSS, Alpine.js
- **Real-time**: WebSocket support
- **Security**: Rate limiting, CORS, input validation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Stripe account (for payments)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-agent-writer
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
Create a `.env` file in the root directory:
```env
MONGO_URI=mongodb://localhost:27017/ai-agent-writer
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=http://localhost:5000
PORT=5000
```

4. **Start the server**
```bash
npm run dev
```

5. **Access the application**
- Company Registration: http://localhost:5000/register.html
- Company Login: http://localhost:5000/login.html
- Company Dashboard: http://localhost:5000/dashboard
- Agent Dashboard: http://localhost:5000/agent-dashboard

## 🔧 API Endpoints

### Company Management
```
POST /api/v1/company/register - Register new company
POST /api/v1/company/login - Company login
GET /api/v1/company/dashboard - Get company dashboard
PUT /api/v1/company/settings - Update company settings
GET /api/v1/company/plans - Get subscription plans
```

### API Key Management
```
POST /api/v1/company/api-keys - Generate new API key
GET /api/v1/company/api-keys - List API keys
DELETE /api/v1/company/api-keys/:keyId - Revoke API key
```

### Agent Management
```
POST /api/v1/agents - Create new agent
GET /api/v1/agents - List agents
PUT /api/v1/agents/:id/status - Update agent status
```

### Chat API (requires API key)
```
POST /api/v1/company/api/chat/start - Start new chat session
POST /api/v1/company/api/chat/message - Send message
GET /api/v1/company/api/chat/sessions - List chat sessions
GET /api/v1/company/api/chat/sessions/:sessionId - Get session details
```

### Analytics API
```
GET /api/v1/company/api/analytics/overview - Get analytics overview
```

## 💳 Billing Setup

1. **Stripe Configuration**
   - Create a Stripe account
   - Get your API keys from the Stripe dashboard
   - Set up webhook endpoints for subscription events

2. **Webhook Configuration**
   - Endpoint: `https://yourdomain.com/api/v1/company/webhook/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **API Key Authentication**: For programmatic access
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Sanitizes all inputs
- **CORS Protection**: Configurable cross-origin requests
- **Password Hashing**: bcrypt with salt rounds

## 📊 Usage Examples

### Creating a Company Account
```javascript
const response = await fetch('/api/v1/company/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Acme Corp',
    email: 'admin@acme.com',
    adminName: 'John Doe',
    adminEmail: 'john@acme.com',
    adminPassword: 'securepassword',
    industry: 'technology'
  })
});
```

### Using API Key
```javascript
const response = await fetch('/api/v1/company/api/chat/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sk_your_api_key_here'
  },
  body: JSON.stringify({
    name: 'Customer Name',
    email: 'customer@example.com',
    phoneNumber: '+1234567890',
    serviceType: 'technical_support'
  })
});
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=mongodb://your-production-mongo-uri
JWT_SECRET=your-production-jwt-secret
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
FRONTEND_URL=https://yourdomain.com
PORT=5000
```

### Vercel Deployment
The project includes a `vercel.json` configuration for easy deployment to Vercel.

## 📈 Monitoring & Analytics

- **Usage Tracking**: Monitor API calls, chat sessions, and agent activity
- **Subscription Analytics**: Track trial conversions and churn
- **Performance Metrics**: Agent response times and satisfaction ratings
- **System Health**: Monitor server performance and database connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app for agents
- [ ] Advanced AI features
- [ ] Integration marketplace
- [ ] White-label solutions
