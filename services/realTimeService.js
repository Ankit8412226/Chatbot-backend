const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class RealTimeService {
  constructor() {
    this.wss = null;
    this.connections = new Map(); // Map of userId -> WebSocket connection
    this.agentConnections = new Map(); // Map of agentId -> WebSocket connection
    this.customerConnections = new Map(); // Map of sessionId -> WebSocket connection
  }

  initialize(server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection');

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to support system',
        timestamp: new Date().toISOString()
      }));
    });

    console.log('WebSocket server initialized');
  }

  async handleMessage(ws, data) {
    const { type, payload, token } = data;

    switch (type) {
      case 'authenticate':
        await this.authenticateConnection(ws, payload, token);
        break;

      case 'agent_message':
        await this.handleAgentMessage(ws, payload);
        break;

      case 'customer_message':
        await this.handleCustomerMessage(ws, payload);
        break;

      case 'transfer_notification':
        await this.handleTransferNotification(ws, payload);
        break;

      case 'status_update':
        await this.handleStatusUpdate(ws, payload);
        break;

      case 'typing_indicator':
        await this.handleTypingIndicator(ws, payload);
        break;

      case 'heartbeat':
        ws.send(JSON.stringify({
          type: 'heartbeat_response',
          timestamp: new Date().toISOString()
        }));
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: `Unknown message type: ${type}`
        }));
    }
  }

  async authenticateConnection(ws, payload, token) {
    try {
      const { userType, sessionId } = payload; // 'agent' or 'customer'

      if (userType === 'agent' && token) {
        // Authenticate agent
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
        const Agent = require('../models/agentSchema');
        const agent = await Agent.findById(decoded.agentId);

        if (agent) {
          ws.agentId = agent._id.toString();
          ws.userType = 'agent';
          ws.agentName = agent.name;

          this.agentConnections.set(agent._id.toString(), ws);

          ws.send(JSON.stringify({
            type: 'authenticated',
            userType: 'agent',
            agentId: agent._id,
            agentName: agent.name,
            message: 'Agent authenticated successfully'
          }));

          // Notify about pending transfers
          await this.sendPendingTransfers(agent._id.toString());

          console.log(`Agent ${agent.name} connected via WebSocket`);
        } else {
          throw new Error('Agent not found');
        }

      } else if (userType === 'customer' && sessionId) {
        // Authenticate customer
        const SupportTicket = require('../models/supportTicketSchema');
        const ticket = await SupportTicket.findOne({ sessionId });

        if (ticket) {
          ws.sessionId = sessionId;
          ws.userType = 'customer';
          ws.customerName = ticket.name;

          this.customerConnections.set(sessionId, ws);

          ws.send(JSON.stringify({
            type: 'authenticated',
            userType: 'customer',
            sessionId,
            customerName: ticket.name,
            message: 'Customer authenticated successfully'
          }));

          console.log(`Customer ${ticket.name} connected via WebSocket`);
        } else {
          throw new Error('Session not found');
        }

      } else {
        throw new Error('Invalid authentication data');
      }

    } catch (error) {
      console.error('Authentication error:', error);
      ws.send(JSON.stringify({
        type: 'auth_error',
        message: 'Authentication failed',
        error: error.message
      }));
      ws.close();
    }
  }

  async handleAgentMessage(ws, payload) {
    if (ws.userType !== 'agent') {
      return ws.send(JSON.stringify({
        type: 'error',
        message: 'Unauthorized'
      }));
    }

    const { sessionId, message, messageType } = payload;

    // Send message to customer if connected
    const customerWs = this.customerConnections.get(sessionId);
    if (customerWs && customerWs.readyState === WebSocket.OPEN) {
      customerWs.send(JSON.stringify({
        type: 'agent_message',
        sessionId,
        message,
        messageType: messageType || 'text',
        agentName: ws.agentName,
        timestamp: new Date().toISOString()
      }));
    }

    // Save to database
    const SupportTicket = require('../models/supportTicketSchema');
    const ticket = await SupportTicket.findOne({ sessionId });
    if (ticket) {
      await ticket.addMessage('agent', message, {
        agentId: ws.agentId,
        agentName: ws.agentName,
        messageType: messageType || 'text'
      });
    }

    // Confirm to agent
    ws.send(JSON.stringify({
      type: 'message_sent',
      sessionId,
      timestamp: new Date().toISOString()
    }));
  }

  async handleCustomerMessage(ws, payload) {
    if (ws.userType !== 'customer') {
      return ws.send(JSON.stringify({
        type: 'error',
        message: 'Unauthorized'
      }));
    }

    const { message } = payload;
    const sessionId = ws.sessionId;

    // Find assigned agent and send message
    const SupportTicket = require('../models/supportTicketSchema');
    const ticket = await SupportTicket.findOne({ sessionId });

    if (ticket && ticket.assignedAgentId) {
      const agentWs = this.agentConnections.get(ticket.assignedAgentId.toString());
      if (agentWs && agentWs.readyState === WebSocket.OPEN) {
        agentWs.send(JSON.stringify({
          type: 'customer_message',
          sessionId,
          message,
          customerName: ws.customerName,
          timestamp: new Date().toISOString()
        }));
      }

      // Save to database
      await ticket.addMessage('user', message);
    }

    // Confirm to customer
    ws.send(JSON.stringify({
      type: 'message_sent',
      timestamp: new Date().toISOString()
    }));
  }

  async handleTransferNotification(ws, payload) {
    const { transferId, toAgentId, sessionId, transferData } = payload;

    // Notify target agent
    const agentWs = this.agentConnections.get(toAgentId);
    if (agentWs && agentWs.readyState === WebSocket.OPEN) {
      agentWs.send(JSON.stringify({
        type: 'transfer_request',
        transferId,
        sessionId,
        customerName: transferData.customerName,
        serviceType: transferData.serviceType,
        priority: transferData.priority,
        context: transferData.context,
        timestamp: new Date().toISOString()
      }));
    }

    // Notify customer about transfer
    const customerWs = this.customerConnections.get(sessionId);
    if (customerWs && customerWs.readyState === WebSocket.OPEN) {
      customerWs.send(JSON.stringify({
        type: 'transfer_initiated',
        message: `You're being connected to a human agent who specializes in ${transferData.serviceType.replace('_', ' ')}. Please hold on for just a moment! 👋`,
        estimatedWaitTime: transferData.estimatedWaitTime,
        timestamp: new Date().toISOString()
      }));
    }
  }

  async handleStatusUpdate(ws, payload) {
    if (ws.userType !== 'agent') {
      return ws.send(JSON.stringify({
        type: 'error',
        message: 'Unauthorized'
      }));
    }

    const { status } = payload;

    // Update agent status in database
    const Agent = require('../models/agentSchema');
    const agent = await Agent.findById(ws.agentId);
    if (agent) {
      await agent.updateStatus(status);

      // Broadcast status to admin/supervisor connections
      this.broadcastToAdmins({
        type: 'agent_status_update',
        agentId: ws.agentId,
        agentName: ws.agentName,
        status,
        timestamp: new Date().toISOString()
      });
    }
  }

  async handleTypingIndicator(ws, payload) {
    const { sessionId, isTyping } = payload;

    if (ws.userType === 'agent') {
      // Agent is typing - notify customer
      const customerWs = this.customerConnections.get(sessionId);
      if (customerWs && customerWs.readyState === WebSocket.OPEN) {
        customerWs.send(JSON.stringify({
          type: 'agent_typing',
          isTyping,
          agentName: ws.agentName,
          timestamp: new Date().toISOString()
        }));
      }
    } else if (ws.userType === 'customer') {
      // Customer is typing - notify assigned agent
      const SupportTicket = require('../models/supportTicketSchema');
      const ticket = await SupportTicket.findOne({ sessionId: ws.sessionId });

      if (ticket && ticket.assignedAgentId) {
        const agentWs = this.agentConnections.get(ticket.assignedAgentId.toString());
        if (agentWs && agentWs.readyState === WebSocket.OPEN) {
          agentWs.send(JSON.stringify({
            type: 'customer_typing',
            sessionId: ws.sessionId,
            isTyping,
            customerName: ws.customerName,
            timestamp: new Date().toISOString()
          }));
        }
      }
    }
  }

  handleDisconnection(ws) {
    if (ws.agentId) {
      this.agentConnections.delete(ws.agentId);
      console.log(`Agent ${ws.agentName} disconnected`);
    }

    if (ws.sessionId) {
      this.customerConnections.delete(ws.sessionId);
      console.log(`Customer ${ws.customerName} disconnected`);
    }
  }

  // Utility methods
  async sendPendingTransfers(agentId) {
    try {
      const ChatTransfer = require('../models/chatTransferSchema');
      const pendingTransfers = await ChatTransfer.getPendingTransfers(agentId);

      const agentWs = this.agentConnections.get(agentId);
      if (agentWs && agentWs.readyState === WebSocket.OPEN) {
        agentWs.send(JSON.stringify({
          type: 'pending_transfers',
          transfers: pendingTransfers,
          count: pendingTransfers.length,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error sending pending transfers:', error);
    }
  }

  broadcastToAgents(message, excludeAgentId = null) {
    this.agentConnections.forEach((ws, agentId) => {
      if (agentId !== excludeAgentId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  broadcastToAdmins(message) {
    this.agentConnections.forEach((ws, agentId) => {
      if (ws.readyState === WebSocket.OPEN && ['admin', 'supervisor'].includes(ws.agentRole)) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  // Public methods for external use
  notifyTransferAccepted(transferId, sessionId, agentData) {
    const customerWs = this.customerConnections.get(sessionId);
    if (customerWs && customerWs.readyState === WebSocket.OPEN) {
      customerWs.send(JSON.stringify({
        type: 'transfer_accepted',
        transferId,
        agent: {
          name: agentData.name,
          department: agentData.department
        },
        message: `Great news! ${agentData.name} from our ${agentData.department} team is now here to help you! 👋`,
        timestamp: new Date().toISOString()
      }));
    }
  }

  notifyTransferDeclined(sessionId, reason) {
    const customerWs = this.customerConnections.get(sessionId);
    if (customerWs && customerWs.readyState === WebSocket.OPEN) {
      customerWs.send(JSON.stringify({
        type: 'transfer_declined',
        message: 'Looking for the next available agent...',
        reason,
        timestamp: new Date().toISOString()
      }));
    }
  }

  notifySessionEnded(sessionId, agentData) {
    const customerWs = this.customerConnections.get(sessionId);
    if (customerWs && customerWs.readyState === WebSocket.OPEN) {
      customerWs.send(JSON.stringify({
        type: 'session_ended',
        message: `Thank you for chatting with ${agentData.name}! Your session has ended. Feel free to start a new conversation anytime.`,
        timestamp: new Date().toISOString()
      }));

      // Close customer connection after a delay
      setTimeout(() => {
        if (customerWs.readyState === WebSocket.OPEN) {
          customerWs.close();
        }
      }, 5000);
    }

    // Remove from connections
    this.customerConnections.delete(sessionId);
  }

  // System notifications
  broadcastSystemNotification(message, userType = 'all') {
    const notification = {
      type: 'system_notification',
      message,
      timestamp: new Date().toISOString()
    };

    if (userType === 'agents' || userType === 'all') {
      this.broadcastToAgents(notification);
    }

    if (userType === 'customers' || userType === 'all') {
      this.customerConnections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(notification));
        }
      });
    }
  }

  // Connection stats
  getConnectionStats() {
    return {
      totalConnections: this.agentConnections.size + this.customerConnections.size,
      agentConnections: this.agentConnections.size,
      customerConnections: this.customerConnections.size,
      connectedAgents: Array.from(this.agentConnections.keys()),
      activeSessions: Array.from(this.customerConnections.keys())
    };
  }
}

module.exports = new RealTimeService();
