const mongoose = require('mongoose');
const moment = require('moment');

const companySchema = new mongoose.Schema({
  // Basic Company Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },

  // Company Details
  industry: {
    type: String,
    enum: ['technology', 'healthcare', 'finance', 'retail', 'education', 'manufacturing', 'services', 'other'],
    default: 'other'
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    default: '1-10'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  // Subscription & Billing
  subscription: {
    plan: {
      type: String,
      enum: ['trial', 'starter', 'professional', 'enterprise'],
      default: 'trial'
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'unpaid', 'trial'],
      default: 'trial'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    trialEndsAt: {
      type: Date,
      default: () => moment().add(7, 'days').toDate()
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },

  // Usage Limits & Features
  limits: {
    agents: {
      type: Number,
      default: 3
    },
    monthlyChats: {
      type: Number,
      default: 1000
    },
    apiCalls: {
      type: Number,
      default: 10000
    },
    storage: {
      type: Number, // in MB
      default: 1000
    }
  },

  // Current Usage
  usage: {
    agents: {
      type: Number,
      default: 0
    },
    monthlyChats: {
      type: Number,
      default: 0
    },
    apiCalls: {
      type: Number,
      default: 0
    },
    storage: {
      type: Number,
      default: 0
    }
  },

  // API Configuration
  apiKeys: [{
    key: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    permissions: [{
      type: String,
      enum: ['read', 'write', 'admin']
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    lastUsed: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Company Settings
  settings: {
    branding: {
      primaryColor: {
        type: String,
        default: '#007bff'
      },
      secondaryColor: {
        type: String,
        default: '#6c757d'
      },
      companyName: String,
      welcomeMessage: String
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      slack: {
        type: Boolean,
        default: false
      },
      webhook: {
        type: Boolean,
        default: false
      }
    },
    chat: {
      autoAssign: {
        type: Boolean,
        default: true
      },
      maxWaitTime: {
        type: Number,
        default: 300 // 5 minutes
      },
      enableRating: {
        type: Boolean,
        default: true
      }
    }
  },

  // Admin User
  adminUser: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },

  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date
}, {
  timestamps: true
});

// Indexes
companySchema.index({ slug: 1 }, { unique: true });
companySchema.index({ email: 1 }, { unique: true });
companySchema.index({ 'subscription.status': 1 });
companySchema.index({ status: 1 });

// Methods
companySchema.methods.isTrialActive = function() {
  return this.subscription.status === 'trial' &&
         moment().isBefore(this.subscription.trialEndsAt);
};

companySchema.methods.isSubscriptionActive = function() {
  return ['active', 'trial'].includes(this.subscription.status);
};

companySchema.methods.canAddAgent = function() {
  return this.usage.agents < this.limits.agents;
};

companySchema.methods.canUseFeature = function(feature) {
  if (!this.isSubscriptionActive()) return false;

  switch (feature) {
    case 'agents':
      return this.usage.agents < this.limits.agents;
    case 'chats':
      return this.usage.monthlyChats < this.limits.monthlyChats;
    case 'api':
      return this.usage.apiCalls < this.limits.apiCalls;
    default:
      return true;
  }
};

companySchema.methods.incrementUsage = function(feature, amount = 1) {
  if (this.usage[feature] !== undefined) {
    this.usage[feature] += amount;
  }
  return this.save();
};

companySchema.methods.generateApiKey = function(name, permissions = ['read']) {
  const key = `sk_${this._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  this.apiKeys.push({
    key,
    name,
    permissions,
    isActive: true,
    createdAt: new Date()
  });

  return this.save().then(() => key);
};

companySchema.methods.revokeApiKey = function(keyId) {
  this.apiKeys = this.apiKeys.filter(apiKey =>
    apiKey._id.toString() !== keyId.toString()
  );
  return this.save();
};

// Static methods
companySchema.statics.findByApiKey = function(apiKey) {
  return this.findOne({
    'apiKeys.key': apiKey,
    'apiKeys.isActive': true,
    status: 'active'
  });
};

companySchema.statics.getSubscriptionPlans = function() {
  return {
    trial: {
      name: 'Free Trial',
      price: 0,
      agents: 3,
      monthlyChats: 1000,
      apiCalls: 10000,
      storage: 1000,
      features: ['Basic Chat Support', 'Email Notifications', 'Basic Analytics']
    },
    starter: {
      name: 'Starter',
      price: 29,
      agents: 5,
      monthlyChats: 5000,
      apiCalls: 50000,
      storage: 5000,
      features: ['Advanced Chat Support', 'Slack Integration', 'Advanced Analytics', 'API Access']
    },
    professional: {
      name: 'Professional',
      price: 99,
      agents: 15,
      monthlyChats: 25000,
      apiCalls: 250000,
      storage: 25000,
      features: ['Priority Support', 'Custom Branding', 'Advanced Integrations', 'Team Management']
    },
    enterprise: {
      name: 'Enterprise',
      price: 299,
      agents: 50,
      monthlyChats: 100000,
      apiCalls: 1000000,
      storage: 100000,
      features: ['Dedicated Support', 'Custom Integrations', 'Advanced Security', 'SLA Guarantee']
    }
  };
};

module.exports = mongoose.model('Company', companySchema);
