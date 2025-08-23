const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  startSupportSession,
  continueSupportChat,
  getSupportSession,
  endSupportSession,
  getAllSupportTickets,
  getSupportAnalytics,
  getServiceCapabilities,
  getServiceRecommendations,
  healthCheck,
  DIGITAL_SERVICES,
  detectServiceType
} = require('../controllers/supportController');

// Import enhanced support controller for human agent handoff
const enhancedSupportController = require('../middleware/transferMiddleware');


// Rate limiting configurations
const supportRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many support requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const chatRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute per IP
  message: {
    error: 'Too many chat messages, please slow down.',
    retryAfter: '1 minute'
  }
});

const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Higher limit for admin operations
  message: {
    error: 'Admin rate limit exceeded',
    retryAfter: '15 minutes'
  }
});



// ============================================================================
// PUBLIC ROUTES - No authentication required
// ============================================================================


router.get('/health', healthCheck);

/**
 * @route   GET /api/support/services
 * @desc    Get all available digital services and capabilities
 * @access  Public
 */
router.get('/services', async (req, res) => {
  try {
    const { category, detailed } = req.query;

    let services = { ...DIGITAL_SERVICES };

    // Filter by category if specified
    if (category) {
      const categoryMap = {
        development: ['web_development', 'mobile_development'],
        marketing: ['digital_marketing'],
        infrastructure: ['cloud_solutions'],
        analytics: ['data_analytics'],
        security: ['cybersecurity'],
        design: ['ui_ux_design'],
        strategy: ['consulting']
      };

      if (categoryMap[category.toLowerCase()]) {
        const filteredServices = {};
        categoryMap[category.toLowerCase()].forEach(key => {
          if (services[key]) filteredServices[key] = services[key];
        });
        services = filteredServices;
      }
    }

    // Return detailed or summary view
    const response = {
      services: Object.keys(services).map(key => ({
        id: key,
        title: services[key].title,
        description: `Expert ${services[key].title.toLowerCase()} services`,
        services: services[key].services,
        ...(detailed === 'true' && {
          technologies: services[key].technologies,
          specialties: services[key].specialties
        })
      })),
      categories: [
        { id: 'development', name: 'Development', count: 2 },
        { id: 'marketing', name: 'Marketing', count: 1 },
        { id: 'infrastructure', name: 'Infrastructure', count: 1 },
        { id: 'analytics', name: 'Analytics', count: 1 },
        { id: 'security', name: 'Security', count: 1 },
        { id: 'design', name: 'Design', count: 1 },
        { id: 'strategy', name: 'Strategy', count: 1 }
      ],
      totalServices: Object.keys(DIGITAL_SERVICES).length
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

/**
 * @route   POST /api/support/detect-service
 * @desc    Detect required service from user message (utility endpoint)
 * @access  Public
 */
router.post('/detect-service', supportRateLimit, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const detectedServices = detectServiceType(message);
    const primaryService = detectedServices[0];

    const response = {
      detectedServices: detectedServices.slice(0, 3),
      primaryService: primaryService ? {
        service: primaryService.service,
        serviceInfo: DIGITAL_SERVICES[primaryService.service],
        confidence: primaryService.confidence
      } : null,
      suggestions: primaryService ?
        DIGITAL_SERVICES[primaryService.service].services.slice(0, 3) :
        ['General consultation', 'Needs assessment', 'Strategy session']
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error detecting service:', error);
    res.status(500).json({ error: 'Failed to detect service type' });
  }
});

// ============================================================================
// SUPPORT SESSION ROUTES - Basic validation required
// ============================================================================

/**
 * @route   POST /api/support/start-session
 * @desc    Start a new support session with the universal agent
 * @access  Public (with rate limiting)
 */
router.post('/start-session', supportRateLimit, startSupportSession);

/**
 * @route   POST /api/support/continue-chat
 * @desc    Continue conversation with the universal digital solutions agent
 * @access  Public (with chat rate limiting)
 */
router.post('/continue-chat', chatRateLimit, enhancedSupportController.continueSupportChat);

/**
 * @route   GET /api/support/session/:sessionId
 * @desc    Get support session details and conversation history
 * @access  Public (session owner or admin)
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    await getSupportSession(req, res);
  } catch (error) {
    console.error('Error in session route:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

/**
 * @route   PUT /api/support/session/:sessionId/end
 * @desc    End support session with feedback and resolution
 * @access  Public (session owner)
 */
router.put('/session/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    req.body.sessionId = sessionId;
    await endSupportSession(req, res);
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

/**
 * @route   GET /api/support/session/:sessionId/recommendations
 * @desc    Get AI-powered service recommendations for session
 * @access  Public (session owner)
 */
router.get('/session/:sessionId/recommendations', supportRateLimit, getServiceRecommendations);

/**
 * @route   PUT /api/support/session/:sessionId/feedback
 * @desc    Submit feedback for a support session
 * @access  Public
 */
router.put('/session/:sessionId/feedback', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rating, feedback, wouldRecommend, improvements } = req.body;

    const SupportTicket = require('../models/supportTicketSchema');
    const ticket = await SupportTicket.findOne({ sessionId });

    if (!ticket) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update feedback
    ticket.satisfactionRating = rating;
    ticket.feedback = feedback;
    ticket.additionalFeedback = {
      wouldRecommend,
      improvements,
      submittedAt: new Date()
    };

    await ticket.save();

    res.status(200).json({
      message: 'Thank you for your feedback!',
      sessionId,
      feedback: {
        rating,
        feedback,
        wouldRecommend,
        improvements
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// ============================================================================
// ADMIN ROUTES - Authentication and admin privileges required
// ============================================================================

/**
 * @route   GET /api/support/admin/tickets
 * @desc    Get all support tickets with advanced filtering
 * @access  Admin only
 */
router.get('/admin/tickets', getAllSupportTickets);

/**
 * @route   GET /api/support/admin/analytics
 * @desc    Get comprehensive support analytics and insights
 * @access  Admin only
 */
router.get('/admin/analytics',  getSupportAnalytics);

/**
 * @route   GET /api/support/admin/analytics/detailed
 * @desc    Get detailed analytics with service breakdowns
 * @access  Admin only
 */
router.get('/admin/analytics/detailed', async (req, res) => {
  try {
    const { startDate, endDate, serviceType } = req.query;
    const SupportTicket = require('../models/supportTicketSchema');

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchFilter = {};
    if (Object.keys(dateFilter).length > 0) matchFilter.createdAt = dateFilter;
    if (serviceType) matchFilter.serviceType = serviceType;

    // Comprehensive analytics pipeline
    const analytics = await SupportTicket.aggregate([
      { $match: matchFilter },
      {
        $facet: {
          // Service performance
          servicePerformance: [
            {
              $group: {
                _id: '$serviceType',
                count: { $sum: 1 },
                avgSatisfaction: { $avg: '$satisfactionRating' },
                avgConversationLength: { $avg: { $size: '$conversationHistory' } },
                avgResolutionTime: {
                  $avg: {
                    $divide: [
                      { $subtract: ['$updatedAt', '$createdAt'] },
                      1000 * 60 // Convert to minutes
                    ]
                  }
                }
              }
            },
            { $sort: { count: -1 } }
          ],

          // Daily trends
          dailyTrends: [
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                  service: '$serviceType'
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.date': -1 } },
            { $limit: 90 } // Last 90 days
          ],

          // Conversion funnel
          conversionFunnel: [
            {
              $group: {
                _id: '$currentStage',
                count: { $sum: 1 },
                services: { $addToSet: '$serviceType' }
              }
            }
          ],

          // Customer satisfaction by service
          satisfactionByService: [
            {
              $match: { satisfactionRating: { $exists: true, $ne: null } }
            },
            {
              $group: {
                _id: '$serviceType',
                avgSatisfaction: { $avg: '$satisfactionRating' },
                satisfactionCount: { $sum: 1 },
                ratings: { $push: '$satisfactionRating' }
              }
            }
          ],

          // Popular service combinations
          serviceCombinations: [
            {
              $match: { tags: { $exists: true, $ne: [] } }
            },
            {
              $unwind: '$tags'
            },
            {
              $match: { tags: { $regex: '^detected:' } }
            },
            {
              $group: {
                _id: '$sessionId',
                services: { $addToSet: { $substr: ['$tags', 9, -1] } }
              }
            },
            {
              $match: { services: { $size: { $gt: 1 } } }
            },
            {
              $group: {
                _id: '$services',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    const result = analytics[0];

    // Enhance service performance with service info
    result.servicePerformance = result.servicePerformance.map(item => ({
      ...item,
      serviceInfo: DIGITAL_SERVICES[item._id] || { title: 'Unknown Service' }
    }));

    res.status(200).json({
      analytics: result,
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Present'
      },
      serviceFilter: serviceType || 'All services',
      totalServices: Object.keys(DIGITAL_SERVICES).length
    });

  } catch (error) {
    console.error('Error fetching detailed analytics:', error);
    res.status(500).json({ error: 'Failed to fetch detailed analytics' });
  }
});

/**
 * @route   GET /api/support/admin/tickets/:ticketId
 * @desc    Get specific ticket with full details (admin view)
 * @access  Admin only
 */
router.get('/admin/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const SupportTicket = require('../models/supportTicketSchema');

    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const serviceInfo = DIGITAL_SERVICES[ticket.serviceType] || DIGITAL_SERVICES.consulting;

    // Calculate additional metrics
    const sessionDuration = Math.floor((ticket.updatedAt - ticket.createdAt) / 1000 / 60);
    const messageCount = ticket.conversationHistory.length;
    const avgResponseTime = messageCount > 0 ? sessionDuration / messageCount : 0;

    res.status(200).json({
      ticket: {
        ...ticket.toObject(),
        serviceInfo,
        metrics: {
          sessionDuration: `${sessionDuration} minutes`,
          messageCount,
          avgResponseTime: `${avgResponseTime.toFixed(1)} minutes`,
          satisfactionScore: ticket.satisfactionRating || 'Not rated'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
});

/**
 * @route   PUT /api/support/admin/tickets/:ticketId/assign
 * @desc    Assign ticket to team member
 * @access  Admin only
 */
router.put('/admin/tickets/:ticketId/assign',  async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { assignedTo, priority, notes } = req.body;

    const SupportTicket = require('../models/supportTicketSchema');
    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Update assignment
    ticket.assignedTo = assignedTo;
    ticket.priority = priority;
    if (notes) {
      ticket.internalNotes = ticket.internalNotes || [];
      ticket.internalNotes.push({
        note: notes,
        addedBy: req.user.id,
        addedAt: new Date()
      });
    }

    await ticket.save();

    res.status(200).json({
      message: 'Ticket assigned successfully',
      ticket: {
        id: ticket._id,
        assignedTo,
        priority,
        status: ticket.status
      }
    });

  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});



router.post('/admin/broadcast', async (req, res) => {
  try {
    const { message, targetService, urgencyLevel } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required for broadcast' });
    }

    const SupportTicket = require('../models/supportTicketSchema');

    // Build filter for target sessions
    const filter = { status: 'active' };
    if (targetService && targetService !== 'all') {
      filter.serviceType = targetService;
    }

    const activeSessions = await SupportTicket.find(filter).select('sessionId name email serviceType');

    // Add broadcast message to conversation history
    const broadcastMessage = {
      role: 'system',
      message: `🔔 System Announcement: ${message}`,
      timestamp: new Date(),
      isBroadcast: true,
      urgencyLevel: urgencyLevel || 'info'
    };

    const updatePromises = activeSessions.map(session =>
      SupportTicket.findOneAndUpdate(
        { sessionId: session.sessionId },
        { $push: { conversationHistory: broadcastMessage } }
      )
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      message: 'Broadcast sent successfully',
      targetedSessions: activeSessions.length,
      broadcast: {
        message,
        targetService: targetService || 'all',
        urgencyLevel: urgencyLevel || 'info',
        sentAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error sending broadcast:', error);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});



router.get('/stats/quick', async (req, res) => {
  try {
    const SupportTicket = require('../models/supportTicketSchema');

    const stats = await SupportTicket.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          activeSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          avgSatisfaction: { $avg: '$satisfactionRating' },
          totalServices: { $addToSet: '$serviceType' }
        }
      }
    ]);

    const result = stats[0] || {};

    res.status(200).json({
      totalSessions: result.totalSessions || 0,
      activeSessions: result.activeSessions || 0,
      avgSatisfaction: result.avgSatisfaction ? result.avgSatisfaction.toFixed(1) : 'N/A',
      servicesCovered: result.totalServices ? result.totalServices.length : 0,
      availableServices: Object.keys(DIGITAL_SERVICES).length,
      uptime: process.uptime()
    });

  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


router.post('/webhook/external', async (req, res) => {
  try {
    const { source, event, data } = req.body;

    // Basic webhook handling - extend based on your integrations
    console.log(`Received webhook from ${source}:`, event, data);

    // You can add specific handling for different webhook sources
    switch (source) {
      case 'crm':
        // Handle CRM updates
        break;
      case 'email':
        // Handle email service events
        break;
      case 'payment':
        // Handle payment confirmations
        break;
      default:
        console.log('Unknown webhook source:', source);
    }

    res.status(200).json({ received: true, timestamp: new Date() });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// ============================================================================
// HUMAN AGENT HANDOFF ROUTES
// ============================================================================

/**
 * @route   POST /api/support/agent/response
 * @desc    Handle human agent response to customer
 * @access  Agent only
 */
router.post('/agent/response', adminRateLimit, enhancedSupportController.handleAgentResponse);

/**
 * @route   GET /api/support/human-availability
 * @desc    Check human agent availability and estimated wait times
 * @access  Public
 */
router.get('/human-availability', supportRateLimit, enhancedSupportController.getHumanSupportAvailability);

/**
 * @route   POST /api/support/request-human
 * @desc    Explicitly request human agent assistance
 * @access  Public
 */
router.post('/request-human', supportRateLimit, async (req, res) => {
  try {
    const { sessionId, reason, priority } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const SupportTicket = require('../models/supportTicketSchema');
    const ticket = await SupportTicket.findActiveSession(sessionId);

    if (!ticket) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Force escalation to human agent
    const Agent = require('../models/agentSchema');
    const availableAgents = await Agent.findAvailableAgents(ticket.serviceType);

    if (availableAgents.length > 0) {
      const AgentService = require('../services/agentService');
      const transfer = await AgentService.requestTransfer(sessionId, {
        reason: 'customer_request',
        serviceType: ticket.serviceType,
        priority: priority || 'medium',
        fromType: 'ai',
        context: {
          summary: 'Customer explicitly requested human assistance',
          customerIssue: reason || 'Customer wants to speak with human agent',
          urgencyLevel: priority || 'medium',
          aiConfidence: 0.1,
          complexity: 'customer_preference'
        }
      });

      const escalationMessage = `I understand you'd like to speak with a human agent! I've connected you with ${transfer.assignedAgent.name} from our ${transfer.assignedAgent.department} team. They'll be with you in about ${Math.ceil(transfer.estimatedWaitTime / 60)} minutes.

In the meantime, feel free to share any additional details about what you need help with! 👋`;

      await ticket.addMessage('assistant', escalationMessage, {
        isEscalation: true,
        transferId: transfer.transferId,
        assignedAgentId: transfer.assignedAgent.id
      });

      return res.status(200).json({
        sessionId,
        message: escalationMessage,
        escalated: true,
        transferId: transfer.transferId,
        assignedAgent: transfer.assignedAgent,
        estimatedWaitTime: `${Math.ceil(transfer.estimatedWaitTime / 60)} minutes`,
        stage: 'pending_human_agent',
        status: 'transferring'
      });

    } else {
      const queueMessage = `I'd love to connect you with one of our human agents, but they're all currently helping other customers.

However, I'm equipped with advanced capabilities and can provide expert-level assistance! What specific challenge are you facing? I'll make sure to give you the detailed help you need, and I'll flag this as high priority for when an agent becomes available. 🌟`;

      await ticket.addMessage('assistant', queueMessage, {
        priority: 'high',
        escalationRequested: true,
        queuePosition: 'next_available'
      });

      return res.status(200).json({
        sessionId,
        message: queueMessage,
        escalated: false,
        queued: true,
        priority: 'high',
        stage: 'ai_priority_assistance',
        humanAgentsAvailable: false
      });
    }

  } catch (error) {
    console.error('Human request error:', error);
    res.status(500).json({
      error: 'Failed to request human agent',
      message: error.message
    });
  }
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// Global error handler for support routes
router.use((error, req, res, next) => {
  console.error('Support Route Error:', error);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    error: 'Support service error',
    message: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    route: req.originalUrl
  });
});



module.exports = router;
