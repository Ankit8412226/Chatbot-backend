const AgentService = require('../services/agentService');
const jwt = require('jsonwebtoken');

// Agent Authentication
const agentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const agent = await AgentService.authenticateAgent(email, password);

    // Generate JWT token
    const token = jwt.sign(
      {
        agentId: agent._id,
        email: agent.email,
        role: agent.role
      },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        department: agent.department,
        status: agent.status,
        skills: agent.skills
      }
    });

  } catch (error) {
    console.error('Agent login error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
};

const agentLogout = async (req, res) => {
  try {
    const { agentId } = req.agent; // From auth middleware

    await AgentService.updateAgentStatus(agentId, 'offline');

    res.status(200).json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Agent logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message
    });
  }
};

// Agent Status Management
const updateAgentStatus = async (req, res) => {
  try {
    const { agentId } = req.agent;
    const { status } = req.body;

    const validStatuses = ['online', 'offline', 'busy', 'away', 'break'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validStatuses
      });
    }

    const agent = await AgentService.updateAgentStatus(agentId, status);

    res.status(200).json({
      message: 'Status updated successfully',
      agent: {
        id: agent._id,
        name: agent.name,
        status: agent.status,
        isAvailable: agent.isAvailable,
        currentChatCount: agent.currentChatCount
      }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      error: 'Failed to update status',
      message: error.message
    });
  }
};

// Transfer Management
const requestTransfer = async (req, res) => {
  try {
    const { sessionId, reason, serviceType, priority, context, preferredAgentId } = req.body;

    if (!sessionId || !reason || !serviceType) {
      return res.status(400).json({
        error: 'Session ID, reason, and service type are required'
      });
    }

    const transferData = {
      reason,
      serviceType,
      priority: priority || 'medium',
      fromType: req.agent ? 'agent' : 'ai',
      fromAgentId: req.agent?.agentId,
      preferredAgentId,
      context
    };

    const result = await AgentService.requestTransfer(sessionId, transferData);

    res.status(200).json({
      message: 'Transfer request submitted successfully',
      transfer: result,
      estimatedWaitTime: `${Math.ceil(result.estimatedWaitTime / 60)} minutes`
    });

  } catch (error) {
    console.error('Transfer request error:', error);
    res.status(500).json({
      error: 'Transfer request failed',
      message: error.message
    });
  }
};

const acceptTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { agentId } = req.agent;
    const { handoffMessage } = req.body;

    const result = await AgentService.acceptTransfer(transferId, agentId, handoffMessage);

    res.status(200).json({
      message: 'Transfer accepted successfully',
      transfer: result.transfer,
      agent: result.agent
    });

  } catch (error) {
    console.error('Accept transfer error:', error);
    res.status(500).json({
      error: 'Failed to accept transfer',
      message: error.message
    });
  }
};

const declineTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { agentId } = req.agent;
    const { reason } = req.body;

    const result = await AgentService.declineTransfer(transferId, agentId, reason);

    res.status(200).json({
      message: 'Transfer declined',
      rerouted: result.rerouted,
      escalated: result.escalated,
      ...(result.newTransferId && { newTransferId: result.newTransferId })
    });

  } catch (error) {
    console.error('Decline transfer error:', error);
    res.status(500).json({
      error: 'Failed to decline transfer',
      message: error.message
    });
  }
};

const getPendingTransfers = async (req, res) => {
  try {
    const { agentId } = req.agent;

    const ChatTransfer = require('../models/chatTransferSchema');
    const transfers = await ChatTransfer.getPendingTransfers(agentId);

    res.status(200).json({
      pendingTransfers: transfers,
      count: transfers.length
    });

  } catch (error) {
    console.error('Get pending transfers error:', error);
    res.status(500).json({
      error: 'Failed to get pending transfers',
      message: error.message
    });
  }
};

// Agent Dashboard
const getAgentDashboard = async (req, res) => {
  try {
    const { agentId } = req.agent;

    const dashboard = await AgentService.getAgentDashboard(agentId);

    res.status(200).json(dashboard);

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get dashboard data',
      message: error.message
    });
  }
};

const getAgentPerformance = async (req, res) => {
  try {
    const { agentId } = req.agent;
    const { days } = req.query;

    const stats = await AgentService.getAgentPerformanceStats(
      agentId,
      parseInt(days) || 7
    );

    res.status(200).json(stats);

  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({
      error: 'Failed to get performance stats',
      message: error.message
    });
  }
};

// Chat Management
const sendAgentMessage = async (req, res) => {
  try {
    const { sessionId, message, messageType } = req.body;
    const { agentId } = req.agent;

    if (!sessionId || !message) {
      return res.status(400).json({
        error: 'Session ID and message are required'
      });
    }

    const SupportTicket = require('../models/supportTicketSchema');
    const Agent = require('../models/agentSchema');

    const ticket = await SupportTicket.findOne({ sessionId });
    const agent = await Agent.findById(agentId);

    if (!ticket) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    if (ticket.assignedAgentId.toString() !== agentId) {
      return res.status(403).json({
        error: 'Not assigned to this session'
      });
    }

    // Add agent message to conversation
    await ticket.addMessage('agent', message.trim(), {
      agentId,
      agentName: agent.name,
      messageType: messageType || 'text'
    });

    ticket.updatedAt = new Date();
    await ticket.save();

    res.status(200).json({
      message: 'Message sent successfully',
      sessionId,
      timestamp: new Date(),
      agent: {
        id: agentId,
        name: agent.name
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: error.message
    });
  }
};

const endAgentSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const { agentId } = req.agent;

    const SupportTicket = require('../models/supportTicketSchema');
    const Agent = require('../models/agentSchema');

    const ticket = await SupportTicket.findOne({ sessionId });
    const agent = await Agent.findById(agentId);

    if (!ticket || ticket.assignedAgentId.toString() !== agentId) {
      return res.status(403).json({
        error: 'Not authorized for this session'
      });
    }

    // End the session
    ticket.status = 'resolved';
    ticket.currentStage = 'completed';

    const endMessage = `Thanks for chatting with me today! I hope I was able to help you with your ${ticket.serviceType.replace('_', ' ')} needs. If you have any other questions, don't hesitate to reach out! 😊`;

    await ticket.addMessage('agent', endMessage, {
      agentId,
      agentName: agent.name,
      isClosingMessage: true
    });

    await ticket.save();

    // Remove session from agent
    await agent.removeChat(sessionId);

    // Update performance metrics
    const sessionDuration = Math.floor((new Date() - ticket.createdAt) / 1000);
    await agent.updatePerformanceMetrics(sessionDuration);

    res.status(200).json({
      message: 'Session ended successfully',
      sessionId,
      sessionDuration: `${Math.floor(sessionDuration / 60)} minutes`,
      messagesExchanged: ticket.conversationHistory.length
    });

  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      error: 'Failed to end session',
      message: error.message
    });
  }
};

// Admin Functions
const createAgent = async (req, res) => {
  try {
    const agentData = req.body;

    // Basic validation
    const required = ['name', 'email', 'password', 'department'];
    const missing = required.filter(field => !agentData[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing
      });
    }

    const agent = await AgentService.createAgent(agentData);

    res.status(201).json({
      message: 'Agent created successfully',
      agent
    });

  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({
      error: 'Failed to create agent',
      message: error.message
    });
  }
};

const getAllAgents = async (req, res) => {
  try {
    const { status, department, isAvailable } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (department) filters.department = department;
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';

    const agents = await AgentService.getAllAgents(filters);

    res.status(200).json({
      agents,
      count: agents.length,
      filters
    });

  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      error: 'Failed to get agents',
      message: error.message
    });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const stats = await AgentService.getSystemStats();

    res.status(200).json({
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      error: 'Failed to get system stats',
      message: error.message
    });
  }
};

module.exports = {
  // Authentication
  agentLogin,
  agentLogout,

  // Status Management
  updateAgentStatus,

  // Transfer Management
  requestTransfer,
  acceptTransfer,
  declineTransfer,
  getPendingTransfers,

  // Dashboard
  getAgentDashboard,
  getAgentPerformance,

  // Chat Management
  sendAgentMessage,
  endAgentSession,

  // Admin Functions
  createAgent,
  getAllAgents,
  getSystemStats
};
