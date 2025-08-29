const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema({
  // Company Association
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false, // Made optional for demo purposes
    default: '68b1fb97189b4f1582379f48' // Default demo company
  },

  // User Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },

  // Support Session Details
  sessionId: {
    type: String,
    required: true,
    unique: true
  },

  // Service Type
  serviceType: {
    type: String,
    enum: [
      'web_development',
      'mobile_development',
      'digital_marketing',
      'cloud_solutions',
      'data_analytics',
      'cybersecurity',
      'ui_ux_design',
      'consulting',
      'general_support',
      'general_inquiry'
    ],
    default: 'general_support'
  },

  // Current Stage of Support
  currentStage: {
    type: String,
    enum: [
      'collecting_details',
      'identifying_needs',
      'providing_solutions',
      'pending_human_agent',
      'human_agent',
      'completed'
    ],
    default: 'collecting_details'
  },

  // Conversation History
  conversationHistory: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'agent', 'system'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // User Needs Assessment
  projectDetails: {
    projectType: String, // e.g., "e-commerce website", "mobile app", "portfolio site"
    budget: String, // e.g., "under $5k", "$5k-$10k", "above $10k"
    timeline: String, // e.g., "1-2 weeks", "1-3 months", "flexible"
    currentChallenges: [String], // Array of challenges they're facing
    techStack: [String], // Technologies they're interested in or currently using
    businessGoals: String // What they want to achieve
  },

  // Support Status
  status: {
    type: String,
    enum: ['active', 'waiting_for_response', 'resolved', 'escalated'],
    default: 'active'
  },

  // Priority Level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Tags for categorization
  tags: [String],

  // Resolution and Follow-up
  resolution: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,

  // Satisfaction Rating
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,

}, {
  timestamps: true
});

// Index for efficient queries
supportTicketSchema.index({ companyId: 1, sessionId: 1 });
supportTicketSchema.index({ companyId: 1, email: 1 });
supportTicketSchema.index({ companyId: 1, status: 1 });
supportTicketSchema.index({ companyId: 1, createdAt: -1 });

// Method to add message to conversation history
supportTicketSchema.methods.addMessage = function(role, message) {
  this.conversationHistory.push({
    role,
    message,
    timestamp: new Date()
  });
  return this.save();
};


supportTicketSchema.methods.updateProjectDetails = function(details) {
  this.projectDetails = { ...this.projectDetails, ...details };
  return this.save();
};


supportTicketSchema.statics.findActiveSession = function(sessionId) {
  return this.findOne({ sessionId, status: { $in: ['active', 'waiting_for_response'] } });
};

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
