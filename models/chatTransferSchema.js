const mongoose = require('mongoose');

const chatTransferSchema = new mongoose.Schema({
  // Transfer Details
  transferId: {
    type: String,
    required: true,
    unique: true
  },
  sessionId: {
    type: String,
    required: true
  },

  // Transfer Participants
  fromType: {
    type: String,
    enum: ['ai', 'agent'],
    required: true
  },
  fromAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  },
  toAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },

  // Transfer Context
  transferReason: {
    type: String,
    enum: [
      'customer_request',
      'ai_escalation',
      'complexity_escalation',
      'skill_mismatch',
      'technical_issue',
      'supervisor_request',
      'agent_unavailable',
      'workload_balance',
      'emergency'
    ],
    required: true
  },
  transferTrigger: {
    type: String,
    enum: ['automatic', 'manual', 'customer_initiated'],
    required: true
  },

  // Customer and Service Info
  customerName: String,
  serviceType: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Transfer Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'failed'],
    default: 'pending'
  },

  // Context and History
  transferContext: {
    summary: String,
    customerIssue: String,
    previousAttempts: String,
    urgencyLevel: String,
    specialInstructions: String,
    aiConfidence: Number,
    detectedComplexity: String
  },

  conversationSnapshot: [{
    role: String,
    message: String,
    timestamp: Date
  }],

  // Timing
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date,
  completedAt: Date,

  // Response and Resolution
  agentResponse: {
    accepted: Boolean,
    reason: String,
    estimatedHandleTime: Number,
    responseTime: Date
  },

  transferNotes: String,
  handoffMessage: String,

  // Quality and Follow-up
  transferSuccess: Boolean,
  customerSatisfaction: {
    rating: Number,
    feedback: String
  },
  agentFeedback: {
    transferQuality: Number,
    contextQuality: Number,
    comments: String
  },

  // Performance Metrics
  metrics: {
    transferTime: Number, // seconds from request to acceptance
    resolutionTime: Number, // seconds from transfer to resolution
    customerWaitTime: Number,
    contextAccuracy: Number
  }
}, {
  timestamps: true
});

// Indexes
chatTransferSchema.index({ sessionId: 1 });
chatTransferSchema.index({ toAgentId: 1, status: 1 });
chatTransferSchema.index({ transferReason: 1, createdAt: -1 });
chatTransferSchema.index({ status: 1, requestedAt: -1 });

// Methods
chatTransferSchema.methods.accept = function(handoffMessage = '') {
  this.status = 'accepted';
  this.respondedAt = new Date();
  this.agentResponse = {
    accepted: true,
    responseTime: new Date(),
    reason: 'Accepted transfer'
  };
  this.handoffMessage = handoffMessage;

  return this.save();
};

chatTransferSchema.methods.decline = function(reason = '') {
  this.status = 'declined';
  this.respondedAt = new Date();
  this.agentResponse = {
    accepted: false,
    reason,
    responseTime: new Date()
  };

  return this.save();
};

chatTransferSchema.methods.complete = function(success = true) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.transferSuccess = success;

  // Calculate metrics
  if (this.requestedAt && this.respondedAt) {
    this.metrics.transferTime = (this.respondedAt - this.requestedAt) / 1000;
  }

  if (this.respondedAt && this.completedAt) {
    this.metrics.resolutionTime = (this.completedAt - this.respondedAt) / 1000;
  }

  return this.save();
};

// Static methods
chatTransferSchema.statics.getPendingTransfers = function(agentId) {
  return this.find({
    toAgentId: agentId,
    status: 'pending'
  }).sort({ priority: -1, requestedAt: 1 });
};

chatTransferSchema.statics.getTransferStats = function(agentId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        toAgentId: agentId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalTransfers: { $sum: 1 },
        acceptedTransfers: {
          $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
        },
        completedTransfers: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        avgTransferTime: { $avg: '$metrics.transferTime' },
        avgResolutionTime: { $avg: '$metrics.resolutionTime' }
      }
    }
  ]);
};

module.exports = mongoose.model('ChatTransfer', chatTransferSchema);
