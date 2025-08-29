const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateCompany, authenticateApiKey, checkApiPermissions, rateLimitApiKey, trackUsage } = require('../middleware/companyAuth');
const rateLimit = require('express-rate-limit');

// Rate limiting for public endpoints
const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Public routes (no authentication required)
router.post('/register', publicRateLimit, companyController.registerCompany);
router.post('/login', publicRateLimit, companyController.companyLogin);
router.get('/plans', publicRateLimit, companyController.getSubscriptionPlans);

// Stripe webhook (no authentication, verified by signature)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), companyController.handleStripeWebhook);

// Protected routes (require company authentication)
router.use('/dashboard', authenticateCompany);
router.get('/dashboard', companyController.getCompanyDashboard);
router.put('/settings', companyController.updateCompanySettings);

// Subscription management
router.post('/subscription/checkout', authenticateCompany, companyController.createCheckoutSession);

// API Key management
router.post('/api-keys', authenticateCompany, companyController.generateApiKey);
router.get('/api-keys', authenticateCompany, companyController.listApiKeys);
router.delete('/api-keys/:keyId', authenticateCompany, companyController.revokeApiKey);

// API routes (require API key authentication)
router.use('/api', authenticateApiKey, rateLimitApiKey(1000, 15 * 60 * 1000));

// Chat API endpoints
router.post('/api/chat/start', checkApiPermissions(['write']), trackUsage('api'), async (req, res) => {
  try {
    const { name, email, phoneNumber, serviceType } = req.body;
    const { companyId } = req.company;

    if (!name || !email || !phoneNumber) {
      return res.status(400).json({
        error: 'Name, email, and phone number are required'
      });
    }

    const SupportTicket = require('../models/supportTicketSchema');
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const ticket = new SupportTicket({
      companyId,
      name,
      email,
      phoneNumber,
      sessionId,
      serviceType: serviceType || 'general_support'
    });

    await ticket.save();

    res.status(201).json({
      sessionId,
      message: 'Chat session created successfully'
    });

  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({
      error: 'Failed to create chat session',
      message: error.message
    });
  }
});

router.post('/api/chat/message', checkApiPermissions(['write']), trackUsage('api'), async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const { companyId } = req.company;

    if (!sessionId || !message) {
      return res.status(400).json({
        error: 'Session ID and message are required'
      });
    }

    const SupportTicket = require('../models/supportTicketSchema');
    const ticket = await SupportTicket.findOne({ sessionId, companyId });

    if (!ticket) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    await ticket.addMessage('user', message);

    // Here you would typically process the message with AI
    // For now, we'll just acknowledge receipt
    const aiResponse = "Thank you for your message. Our team will get back to you soon.";

    await ticket.addMessage('assistant', aiResponse);

    res.status(200).json({
      message: 'Message sent successfully',
      response: aiResponse
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error.message
    });
  }
});

router.get('/api/chat/sessions', checkApiPermissions(['read']), trackUsage('api'), async (req, res) => {
  try {
    const { companyId } = req.company;
    const { status, limit = 50, offset = 0 } = req.query;

    const SupportTicket = require('../models/supportTicketSchema');
    const query = { companyId };

    if (status) {
      query.status = status;
    }

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-conversationHistory');

    const total = await SupportTicket.countDocuments(query);

    res.status(200).json({
      sessions: tickets,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      error: 'Failed to get sessions',
      message: error.message
    });
  }
});

router.get('/api/chat/sessions/:sessionId', checkApiPermissions(['read']), trackUsage('api'), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { companyId } = req.company;

    const SupportTicket = require('../models/supportTicketSchema');
    const ticket = await SupportTicket.findOne({ sessionId, companyId });

    if (!ticket) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.status(200).json({
      session: ticket
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      error: 'Failed to get session',
      message: error.message
    });
  }
});

// Analytics API endpoints
router.get('/api/analytics/overview', checkApiPermissions(['read']), trackUsage('api'), async (req, res) => {
  try {
    const { companyId } = req.company;
    const { days = 30 } = req.query;

    const SupportTicket = require('../models/supportTicketSchema');
    const Agent = require('../models/agentSchema');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get ticket statistics
    const totalTickets = await SupportTicket.countDocuments({ companyId });
    const recentTickets = await SupportTicket.countDocuments({
      companyId,
      createdAt: { $gte: startDate }
    });

    const ticketsByStatus = await SupportTicket.aggregate([
      { $match: { companyId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const ticketsByService = await SupportTicket.aggregate([
      { $match: { companyId } },
      { $group: { _id: '$serviceType', count: { $sum: 1 } } }
    ]);

    // Get agent statistics
    const totalAgents = await Agent.countDocuments({ companyId });
    const onlineAgents = await Agent.countDocuments({
      companyId,
      status: 'online',
      isAvailable: true
    });

    res.status(200).json({
      period: `${days} days`,
      tickets: {
        total: totalTickets,
        recent: recentTickets,
        byStatus: ticketsByStatus,
        byService: ticketsByService
      },
      agents: {
        total: totalAgents,
        online: onlineAgents
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Failed to get analytics',
      message: error.message
    });
  }
});

module.exports = router;
