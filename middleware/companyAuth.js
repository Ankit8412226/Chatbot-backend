const jwt = require('jsonwebtoken');
const Company = require('../models/companySchema');

// Company Authentication Middleware
const authenticateCompany = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    const company = await Company.findById(decoded.companyId);
    if (!company || company.status !== 'active') {
      return res.status(401).json({
        error: 'Company not found or inactive'
      });
    }

    // Check subscription status
    if (!company.isSubscriptionActive()) {
      return res.status(403).json({
        error: 'Subscription is not active',
        subscription: company.subscription
      });
    }

    req.company = {
      companyId: company._id,
      email: decoded.email,
      role: decoded.role
    };

    next();

  } catch (error) {
    console.error('Company authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired'
      });
    }

    res.status(500).json({
      error: 'Authentication failed'
    });
  }
};

// API Key Authentication Middleware
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers.authorization?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required'
      });
    }

    const company = await Company.findByApiKey(apiKey);
    if (!company) {
      return res.status(401).json({
        error: 'Invalid API key'
      });
    }

    // Check subscription status
    if (!company.isSubscriptionActive()) {
      return res.status(403).json({
        error: 'Subscription is not active'
      });
    }

    // Update API key last used
    const apiKeyDoc = company.apiKeys.find(key => key.key === apiKey);
    if (apiKeyDoc) {
      apiKeyDoc.lastUsed = new Date();
      await company.save();
    }

    req.company = {
      companyId: company._id,
      apiKey: apiKey,
      permissions: apiKeyDoc?.permissions || ['read']
    };

    next();

  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed'
    });
  }
};

// Check API Permissions Middleware
const checkApiPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const { permissions } = req.company;

    if (!permissions) {
      return res.status(403).json({
        error: 'No permissions found'
      });
    }

    const hasPermission = requiredPermissions.every(permission =>
      permissions.includes(permission) || permissions.includes('admin')
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: requiredPermissions,
        current: permissions
      });
    }

    next();
  };
};

// Rate Limiting for API Keys
const rateLimitApiKey = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const { companyId } = req.company;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(companyId)) {
      requests.set(companyId, []);
    }

    const companyRequests = requests.get(companyId);

    // Remove old requests outside the window
    const validRequests = companyRequests.filter(timestamp => timestamp > windowStart);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        limit: maxRequests,
        window: `${windowMs / 1000 / 60} minutes`
      });
    }

    validRequests.push(now);
    requests.set(companyId, validRequests);

    next();
  };
};

// Usage Tracking Middleware
const trackUsage = (feature) => {
  return async (req, res, next) => {
    const originalSend = res.json;

    res.json = function(data) {
      // Track usage after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const { companyId } = req.company;

        Company.findById(companyId).then(company => {
          if (company) {
            company.incrementUsage(feature);
          }
        }).catch(err => {
          console.error('Usage tracking error:', err);
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  authenticateCompany,
  authenticateApiKey,
  checkApiPermissions,
  rateLimitApiKey,
  trackUsage
};
