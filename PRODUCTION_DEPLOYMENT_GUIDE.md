# 🚀 Production Deployment Guide - AI Agent Writer SaaS

## 🔧 Fixing MongoDB Atlas Connection Issue

### Current Problem
Your MongoDB Atlas cluster is rejecting connections because your IP isn't whitelisted.

### Solution 1: Whitelist Your IP in MongoDB Atlas

1. **Go to MongoDB Atlas Dashboard**: https://cloud.mongodb.com
2. **Select your cluster**: `cluster0-shard-00-00.m609d.mongodb.net`
3. **Navigate to**: Security → Network Access
4. **Click**: "Add IP Address"
5. **Choose one of these options**:
   - **For Development**: Add your current IP address
   - **For Production**: Use "Allow Access from Anywhere" (0.0.0.0/0)
   - **For Vercel**: Add Vercel's IP ranges

### Solution 2: Update Environment Variables

Create a `.env` file with your production MongoDB URI:

```bash
# Production MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster0-shard-00-00.m609d.mongodb.net:27017,cluster0-shard-00-01.m609d.mongodb.net:27017,cluster0-shard-00-02.m609d.mongodb.net:27017/ai-agent-writer?ssl=true&replicaSet=atlas-p59j55-shard-0&authSource=admin&retryWrites=true&w=majority

# JWT Secret (generate a strong one)
JWT_SECRET=your-super-secret-jwt-key-for-production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application Configuration
FRONTEND_URL=https://ai-agent-frontend-wheat.vercel.app
PORT=5000
NODE_ENV=production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🚀 Deploy to Production

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy your backend**:
```bash
vercel --prod
```

4. **Set environment variables in Vercel**:
```bash
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add STRIPE_SECRET_KEY
# ... add all other environment variables
```

### Option 2: Deploy to Railway

1. **Go to**: https://railway.app
2. **Connect your GitHub repository**
3. **Set environment variables** in Railway dashboard
4. **Deploy automatically**

### Option 3: Deploy to Heroku

1. **Install Heroku CLI**:
```bash
npm install -g heroku
```

2. **Create Heroku app**:
```bash
heroku create your-saas-app-name
```

3. **Set environment variables**:
```bash
heroku config:set MONGO_URI="your-mongodb-atlas-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
# ... set all other variables
```

4. **Deploy**:
```bash
git add .
git commit -m "Deploy to production"
git push heroku main
```

---

## 🔧 Environment Setup Checklist

### 1. MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create a cluster
- [ ] Create database user
- [ ] Get connection string
- [ ] Whitelist IP addresses
- [ ] Test connection

### 2. Stripe Setup
- [ ] Create Stripe account
- [ ] Get API keys (live mode)
- [ ] Set up webhooks
- [ ] Configure products/plans

### 3. Email Setup
- [ ] Set up SMTP (Gmail, SendGrid, etc.)
- [ ] Test email sending

### 4. Domain & SSL
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Update CORS settings

---

## 🧪 Production Testing

### 1. Test Database Connection
```bash
# Test MongoDB connection
curl -X POST https://your-backend-url.com/api/v1/company/register \
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

### 2. Test Frontend Integration
- [ ] Registration page works
- [ ] Login works
- [ ] Dashboard loads
- [ ] API calls succeed
- [ ] Chat widget functions

### 3. Test Payment Flow
- [ ] Stripe checkout works
- [ ] Webhooks receive events
- [ ] Subscription updates work

---

## 🔒 Security Checklist

### 1. Environment Variables
- [ ] All secrets are in environment variables
- [ ] No hardcoded credentials
- [ ] JWT secret is strong and unique
- [ ] MongoDB connection string is secure

### 2. CORS Configuration
- [ ] Only allow your frontend domain
- [ ] Configure proper headers
- [ ] Test cross-origin requests

### 3. Rate Limiting
- [ ] API rate limits are active
- [ ] IP-based rate limiting works
- [ ] Monitor for abuse

### 4. Input Validation
- [ ] All inputs are validated
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] File upload security

---

## 📊 Monitoring & Analytics

### 1. Error Tracking
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Log all errors
- [ ] Set up alerts

### 2. Performance Monitoring
- [ ] Monitor response times
- [ ] Track database performance
- [ ] Monitor memory usage

### 3. Business Metrics
- [ ] Track user registrations
- [ ] Monitor subscription conversions
- [ ] Track chat usage
- [ ] Monitor revenue

---

## 🚨 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Error**: `MongooseServerSelectionError: Could not connect to any servers`

**Solutions**:
1. Check IP whitelist in MongoDB Atlas
2. Verify connection string format
3. Check network connectivity
4. Verify database user credentials

### Issue 2: CORS Errors
**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solutions**:
1. Update CORS configuration in backend
2. Add frontend domain to allowed origins
3. Check preflight requests

### Issue 3: JWT Token Issues
**Error**: `JsonWebTokenError: invalid token`

**Solutions**:
1. Verify JWT_SECRET is set correctly
2. Check token expiration
3. Verify token format

### Issue 4: Stripe Webhook Failures
**Error**: `No signatures found matching the expected signature`

**Solutions**:
1. Verify webhook secret
2. Check webhook endpoint URL
3. Test webhook locally first

---

## 🎯 Quick Fix for Current Issue

### Immediate Steps:

1. **Whitelist Your IP in MongoDB Atlas**:
   - Go to: https://cloud.mongodb.com
   - Network Access → Add IP Address
   - Add: `0.0.0.0/0` (allow all IPs for testing)

2. **Update Your Environment Variables**:
```bash
# Create .env file with your MongoDB Atlas URI
MONGO_URI=mongodb+srv://username:password@cluster0-shard-00-00.m609d.mongodb.net:27017,cluster0-shard-00-01.m609d.mongodb.net:27017,cluster0-shard-00-02.m609d.mongodb.net:27017/ai-agent-writer?ssl=true&replicaSet=atlas-p59j55-shard-0&authSource=admin&retryWrites=true&w=majority
```

3. **Test Connection**:
```bash
# Test if MongoDB connection works
curl -X POST http://localhost:5000/api/v1/company/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","adminName":"Test","adminEmail":"admin@test.com","adminPassword":"pass123","industry":"tech"}'
```

---

## 🎉 Success Checklist

Once deployed, verify:
- [ ] MongoDB connection works
- [ ] Company registration works
- [ ] Login works
- [ ] Dashboard loads
- [ ] API keys can be generated
- [ ] Chat functionality works
- [ ] Stripe payments work
- [ ] Emails are sent
- [ ] Frontend connects to backend

**Your SaaS platform will be live and ready to accept customers!** 🚀
