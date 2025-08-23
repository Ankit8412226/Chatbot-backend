const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const agentSkillSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
    enum: ['web_development', 'mobile_development', 'digital_marketing', 'cloud_solutions',
           'data_analytics', 'cybersecurity', 'ui_ux_design', 'consulting']
  },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  }
});

const agentSchema = new mongoose.Schema({
  // Basic Information
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },

  // Role and Permissions
  role: {
    type: String,
    enum: ['agent', 'senior_agent', 'supervisor', 'admin'],
    default: 'agent'
  },
  department: {
    type: String,
    enum: ['technical', 'sales', 'marketing', 'general'],
    default: 'general'
  },

  // Skills and Expertise
  skills: [agentSkillSchema],
  languages: [{
    type: String,
    default: ['English']
  }],

  // Status and Availability
  status: {
    type: String,
    enum: ['online', 'offline', 'busy', 'away', 'break'],
    default: 'offline'
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  maxConcurrentChats: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  },
  currentChatCount: {
    type: Number,
    default: 0
  },

  // Performance Metrics
  totalChatsHandled: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number, // in seconds
    default: 0
  },
  averageSatisfactionRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },

  // Working Hours
  workingHours: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    schedule: {
      monday: { start: String, end: String, active: { type: Boolean, default: true } },
      tuesday: { start: String, end: String, active: { type: Boolean, default: true } },
      wednesday: { start: String, end: String, active: { type: Boolean, default: true } },
      thursday: { start: String, end: String, active: { type: Boolean, default: true } },
      friday: { start: String, end: String, active: { type: Boolean, default: true } },
      saturday: { start: String, end: String, active: { type: Boolean, default: false } },
      sunday: { start: String, end: String, active: { type: Boolean, default: false } }
    }
  },

  // Session Management
  currentSessions: [{
    sessionId: String,
    customerName: String,
    serviceType: String,
    startTime: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    }
  }],

  // Agent Preferences
  preferences: {
    notificationSound: { type: Boolean, default: true },
    autoAcceptChats: { type: Boolean, default: false },
    preferredServices: [String]
  },

  // Activity Tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  loginHistory: [{
    loginTime: Date,
    logoutTime: Date,
    ipAddress: String,
    userAgent: String
  }],

  // Profile
  profileImage: String,
  bio: String,
  location: String,
  phoneExtension: String
}, {
  timestamps: true
});

// Password hashing middleware
agentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Methods
agentSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

agentSchema.methods.updateStatus = function(status) {
  this.status = status;
  this.isAvailable = ['online'].includes(status);
  this.lastActivity = new Date();
  return this.save();
};

agentSchema.methods.canTakeNewChat = function() {
  return this.isAvailable &&
         this.status === 'online' &&
         this.currentChatCount < this.maxConcurrentChats;
};

agentSchema.methods.assignChat = function(sessionData) {
  if (!this.canTakeNewChat()) {
    throw new Error('Agent cannot take new chats');
  }

  this.currentSessions.push(sessionData);
  this.currentChatCount += 1;

  return this.save();
};

agentSchema.methods.removeChat = function(sessionId) {
  this.currentSessions = this.currentSessions.filter(
    session => session.sessionId !== sessionId
  );
  this.currentChatCount = Math.max(0, this.currentChatCount - 1);

  return this.save();
};

agentSchema.methods.updatePerformanceMetrics = function(responseTime, satisfactionRating) {
  this.totalChatsHandled += 1;

  // Update average response time
  this.averageResponseTime = (
    (this.averageResponseTime * (this.totalChatsHandled - 1)) + responseTime
  ) / this.totalChatsHandled;

  // Update satisfaction rating if provided
  if (satisfactionRating) {
    this.totalRatings += 1;
    this.averageSatisfactionRating = (
      (this.averageSatisfactionRating * (this.totalRatings - 1)) + satisfactionRating
    ) / this.totalRatings;
  }

  return this.save();
};

// Static methods
agentSchema.statics.findAvailableAgents = function(serviceType, excludeAgentId) {
  const query = {
    isAvailable: true,
    status: 'online',
    $expr: { $lt: ['$currentChatCount', '$maxConcurrentChats'] }
  };

  if (excludeAgentId) {
    query._id = { $ne: excludeAgentId };
  }

  // Prioritize agents with relevant skills
  const pipeline = [
    { $match: query },
    {
      $addFields: {
        skillMatch: {
          $cond: {
            if: { $in: [serviceType, '$skills.service'] },
            then: 1,
            else: 0
          }
        },
        workload: { $divide: ['$currentChatCount', '$maxConcurrentChats'] }
      }
    },
    { $sort: { skillMatch: -1, workload: 1, averageSatisfactionRating: -1 } }
  ];

  return this.aggregate(pipeline);
};

agentSchema.statics.getOnlineCount = function() {
  return this.countDocuments({
    status: 'online',
    isAvailable: true
  });
};

agentSchema.statics.getPerformanceStats = function(agentId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // This would typically join with a separate chat/ticket analytics collection
  return {
    period: `${days} days`,
    startDate
  };
};

// Indexes for performance
agentSchema.index({ status: 1, isAvailable: 1 });
agentSchema.index({ 'skills.service': 1 });
agentSchema.index({ employeeId: 1 }, { unique: true });
agentSchema.index({ email: 1 }, { unique: true });
agentSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Agent', agentSchema);
