const Agent = require('../models/agentSchema');
const ChatTransfer = require('../models/chatTransferSchema');
const SupportTicket = require('../models/supportTicketSchema');
const { v4: uuidv4 } = require('uuid');

class AgentService {
  // Agent Management
  static async createAgent(agentData) {
    try {
      const agent = new Agent({
        ...agentData,
        employeeId: agentData.employeeId || `AGT-${Date.now()}`,
        status: 'offline'
      });

      await agent.save();

      // Remove password from response
      const agentResponse = agent.toObject();
      delete agentResponse.password;

      return agentResponse;
    } catch (error) {
      throw new Error(`Failed to create agent: ${error.message}`);
    }
  }

  static async authenticateAgent(email, password) {
    try {
      const agent = await Agent.findOne({ email });

      if (!agent || !(await agent.comparePassword(password))) {
        throw new Error('Invalid credentials');
      }

      // Check if agent's company has active subscription
      const Company = require('../models/companySchema');
      const company = await Company.findById(agent.companyId);

      if (!company || !company.isSubscriptionActive()) {
        throw new Error('Company subscription is not active');
      }

      // Update last activity and login history
      agent.lastActivity = new Date();
      agent.loginHistory.push({
        loginTime: new Date(),
        ipAddress: '0.0.0.0', // This should be passed from the request
        userAgent: 'Agent Dashboard'
      });

      // Keep only last 50 login records
      if (agent.loginHistory.length > 50) {
        agent.loginHistory = agent.loginHistory.slice(-50);
      }

      // Ensure agent is online and available on login
      if (agent.status !== 'online' || !agent.isAvailable) {
        agent.status = 'online';
        agent.isAvailable = true;
      }

      await agent.save();

      const agentResponse = agent.toObject();
      delete agentResponse.password;

      return agentResponse;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  static async updateAgentStatus(agentId, status) {
    try {
      const agent = await Agent.findById(agentId);

      if (!agent) {
        throw new Error('Agent not found');
      }

      await agent.updateStatus(status);

      // If going offline, handle current chats
      if (status === 'offline' && agent.currentSessions.length > 0) {
        await this.handleAgentOffline(agentId);
      }

      return agent;
    } catch (error) {
      throw new Error(`Failed to update agent status: ${error.message}`);
    }
  }

  // Chat Transfer System
  static async requestTransfer(sessionId, transferData) {
    try {
      const {
        reason,
        serviceType,
        priority = 'medium',
        fromType = 'ai',
        fromAgentId,
        preferredAgentId,
        context
      } = transferData;

      // Find the best available agent
      const availableAgents = await Agent.findAvailableAgents(serviceType, fromAgentId);

      if (availableAgents.length === 0) {
        throw new Error('No available agents for transfer');
      }

      // Select agent (preferredAgentId if available, otherwise best match)
      let selectedAgent;
      if (preferredAgentId) {
        selectedAgent = availableAgents.find(agent =>
          agent._id.toString() === preferredAgentId
        );
      }

      if (!selectedAgent) {
        selectedAgent = availableAgents[0]; // Best match from sorted results
      }

      // Get conversation history for context
      const ticket = await SupportTicket.findOne({ sessionId });
      if (!ticket) {
        throw new Error('Support session not found');
      }

      // Create transfer record
      const transfer = new ChatTransfer({
        transferId: uuidv4(),
        sessionId,
        fromType,
        fromAgentId,
        toAgentId: selectedAgent._id,
        transferReason: reason,
        transferTrigger: 'manual',
        customerName: ticket.name,
        serviceType,
        priority,
        transferContext: {
          summary: context?.summary || 'Customer needs human assistance',
          customerIssue: context?.customerIssue || 'Complex inquiry',
          urgencyLevel: priority,
          aiConfidence: context?.aiConfidence || 0,
          detectedComplexity: context?.complexity || 'moderate'
        },
        conversationSnapshot: ticket.conversationHistory.slice(-10) // Last 10 messages
      });

      await transfer.save();

      // Notify the agent in real-time if WS is available
      try {
        const realTimeService = require('./realTimeService');
        if (typeof realTimeService.notifyTransferRequest === 'function') {
          realTimeService.notifyTransferRequest(transfer.transferId, {
            sessionId,
            customerName: ticket.name,
            serviceType,
            priority,
            estimatedWaitTime: this.calculateEstimatedWaitTime(selectedAgent),
            assignedAgent: {
              id: selectedAgent._id,
              name: selectedAgent.name,
              department: selectedAgent.department
            }
          });
        }
      } catch (e) {
        // fallback: console log if WS not initialized
        console.log('Real-time notifyTransferRequest unavailable:', e.message);
      }

      return {
        transferId: transfer.transferId,
        assignedAgent: {
          id: selectedAgent._id,
          name: selectedAgent.name,
          department: selectedAgent.department,
          averageResponseTime: selectedAgent.averageResponseTime
        },
        estimatedWaitTime: this.calculateEstimatedWaitTime(selectedAgent)
      };

    } catch (error) {
      throw new Error(`Transfer request failed: ${error.message}`);
    }
  }

  static async acceptTransfer(transferId, agentId, handoffMessage = '') {
    try {
      const transfer = await ChatTransfer.findOne({
        transferId,
        toAgentId: agentId,
        status: 'pending'
      });

      if (!transfer) {
        throw new Error('Transfer not found or already handled');
      }

      const agent = await Agent.findById(agentId);

      if (!agent.canTakeNewChat()) {
        throw new Error('Agent cannot take new chats');
      }

      // Accept the transfer
      await transfer.accept(handoffMessage);

      // Assign chat to agent
      await agent.assignChat({
        sessionId: transfer.sessionId,
        customerName: transfer.customerName,
        serviceType: transfer.serviceType,
        startTime: new Date(),
        priority: transfer.priority
      });

      // Update support ticket
      const ticket = await SupportTicket.findOne({ sessionId: transfer.sessionId });
      if (ticket) {
        ticket.assignedAgentId = agentId;
        ticket.status = 'active';
        ticket.currentStage = 'human_agent';

        // Add handoff message to conversation
        const handoffMsg = handoffMessage ||
          `Hi ${transfer.customerName}! I'm ${agent.name}, and I'll be helping you from here. I've reviewed your conversation and I'm ready to assist! 👋`;

        await ticket.addMessage('agent', handoffMsg, {
          agentId,
          agentName: agent.name,
          transferId: transfer.transferId
        });

        // Ensure ticket state persists
        await ticket.save();
      }

      // Notify customer that transfer was accepted
      try {
        const realTimeService = require('./realTimeService');
        if (typeof realTimeService.notifyTransferAccepted === 'function') {
          realTimeService.notifyTransferAccepted(transfer.transferId, transfer.sessionId, {
            name: agent.name,
            department: agent.department
          });
        }
      } catch (e) {}

      return {
        success: true,
        transfer,
        agent: {
          id: agent._id,
          name: agent.name,
          department: agent.department
        }
      };

    } catch (error) {
      throw new Error(`Failed to accept transfer: ${error.message}`);
    }
  }

  static async declineTransfer(transferId, agentId, reason = '') {
    try {
      const transfer = await ChatTransfer.findOne({
        transferId,
        toAgentId: agentId,
        status: 'pending'
      });

      if (!transfer) {
        throw new Error('Transfer not found or already handled');
      }

      await transfer.decline(reason);

      // Find another agent for the transfer
      const alternativeAgents = await Agent.findAvailableAgents(
        transfer.serviceType,
        agentId
      );

      if (alternativeAgents.length > 0) {
        // Create new transfer to next best agent
        const newTransfer = new ChatTransfer({
          transferId: uuidv4(),
          sessionId: transfer.sessionId,
          fromType: transfer.fromType,
          fromAgentId: transfer.fromAgentId,
          toAgentId: alternativeAgents[0]._id,
          transferReason: transfer.transferReason,
          transferTrigger: 'automatic', // Auto-reroute
          customerName: transfer.customerName,
          serviceType: transfer.serviceType,
          priority: transfer.priority,
          transferContext: transfer.transferContext,
          conversationSnapshot: transfer.conversationSnapshot
        });

        await newTransfer.save();
        // Notify the next agent via WS if available
        try {
          const realTimeService = require('./realTimeService');
          if (typeof realTimeService.notifyTransferRequest === 'function') {
            realTimeService.notifyTransferRequest(newTransfer.transferId, {
              sessionId: newTransfer.sessionId,
              customerName: transfer.customerName,
              serviceType: transfer.serviceType,
              priority: transfer.priority,
              estimatedWaitTime: this.calculateEstimatedWaitTime(alternativeAgents[0]),
              assignedAgent: {
                id: alternativeAgents[0]._id,
                name: alternativeAgents[0].name,
                department: alternativeAgents[0].department
              }
            });
          }
        } catch (e) {}

        return { rerouted: true, newTransferId: newTransfer.transferId };
      } else {
        // No other agents available - return to AI with escalation
        const ticket = await SupportTicket.findOne({ sessionId: transfer.sessionId });
        if (ticket) {
          await ticket.addMessage('system',
            `I apologize, but all our human agents are currently busy. I'll continue to help you and have flagged your case as high priority for the next available agent. Let me see what I can do for you right now! 🚀`,
            { priority: 'high', escalated: true }
          );
        }

        return { rerouted: false, escalated: true };
      }

    } catch (error) {
      throw new Error(`Failed to decline transfer: ${error.message}`);
    }
  }

  // Agent Dashboard Methods
  static async getAgentDashboard(agentId) {
    try {
      const agent = await Agent.findById(agentId);

      if (!agent) {
        throw new Error('Agent not found');
      }

      // Get pending transfers
      const pendingTransfers = await ChatTransfer.getPendingTransfers(agentId);

      // Get current active sessions details
      const activeSessions = await Promise.all(
        agent.currentSessions.map(async session => {
          const ticket = await SupportTicket.findOne({
            sessionId: session.sessionId
          });

          return {
            ...session.toObject(),
            lastMessage: ticket ? ticket.conversationHistory.slice(-1)[0] : null,
            messageCount: ticket ? ticket.conversationHistory.length : 0,
            duration: Math.floor((new Date() - session.startTime) / 1000 / 60)
          };
        })
      );

      // Calculate today's performance
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayStats = await this.getAgentPerformanceStats(agentId, 1);

      return {
        agent: {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          status: agent.status,
          department: agent.department,
          currentChatCount: agent.currentChatCount,
          maxConcurrentChats: agent.maxConcurrentChats,
          skills: agent.skills,
          averageSatisfactionRating: agent.averageSatisfactionRating
        },
        activeSessions,
        pendingTransfers: pendingTransfers.slice(0, 5), // Show top 5
        todayStats,
        notifications: {
          pendingTransfersCount: pendingTransfers.length,
          highPrioritySessions: activeSessions.filter(s => s.priority === 'high').length
        }
      };

    } catch (error) {
      throw new Error(`Failed to get agent dashboard: ${error.message}`);
    }
  }

  static async getAgentPerformanceStats(agentId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const agent = await Agent.findById(agentId);

      // Get transfer stats
      const transferStats = await ChatTransfer.getTransferStats(agentId, days);

      // Get ticket resolution stats
      const ticketStats = await SupportTicket.aggregate([
        {
          $match: {
            assignedAgentId: agentId,
            updatedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalTickets: { $sum: 1 },
            resolvedTickets: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
            },
            averageSatisfaction: { $avg: '$satisfactionRating' },
            averageMessages: { $avg: { $size: '$conversationHistory' } }
          }
        }
      ]);

      return {
        period: `${days} days`,
        agent: {
          totalChatsHandled: agent.totalChatsHandled,
          averageResponseTime: agent.averageResponseTime,
          averageSatisfactionRating: agent.averageSatisfactionRating
        },
        recent: {
          ticketsHandled: ticketStats[0]?.totalTickets || 0,
          ticketsResolved: ticketStats[0]?.resolvedTickets || 0,
          resolutionRate: ticketStats[0] ?
            (ticketStats[0].resolvedTickets / ticketStats[0].totalTickets * 100).toFixed(1) : 0,
          averageSatisfaction: ticketStats[0]?.averageSatisfaction || 0,
          transfersReceived: transferStats[0]?.totalTransfers || 0,
          transfersAccepted: transferStats[0]?.acceptedTransfers || 0,
          transferAcceptanceRate: transferStats[0] ?
            (transferStats[0].acceptedTransfers / transferStats[0].totalTransfers * 100).toFixed(1) : 0
        }
      };

    } catch (error) {
      throw new Error(`Failed to get performance stats: ${error.message}`);
    }
  }

  // Utility Methods
  static async notifyAgentOfTransfer(agentId, transfer) {
    // In a real application, this would send WebSocket notification,
    // email, SMS, or push notification to the agent
    console.log(`Notifying agent ${agentId} of new transfer: ${transfer.transferId}`);

    // You could implement:
    // - WebSocket real-time notification
    // - Email notification
    // - SMS for urgent transfers
    // - Push notification to mobile app

    return true;
  }

  static calculateEstimatedWaitTime(agent) {
    // Calculate based on current workload and average response time
    const baseWaitTime = agent.averageResponseTime || 60; // seconds
    const workloadMultiplier = 1 + (agent.currentChatCount / agent.maxConcurrentChats);

    return Math.round(baseWaitTime * workloadMultiplier);
  }

  static async handleAgentOffline(agentId) {
    try {
      const agent = await Agent.findById(agentId);

      // Transfer all current sessions to other agents or back to AI
      for (const session of agent.currentSessions) {
        const availableAgents = await Agent.findAvailableAgents(
          session.serviceType,
          agentId
        );

        if (availableAgents.length > 0) {
          // Transfer to another agent
          await this.requestTransfer(session.sessionId, {
            reason: 'agent_unavailable',
            serviceType: session.serviceType,
            priority: session.priority,
            fromType: 'agent',
            fromAgentId: agentId,
            context: {
              summary: `Agent ${agent.name} went offline, transferring session`,
              customerIssue: 'Continuation of service',
              urgencyLevel: session.priority
            }
          });
        } else {
          // Return to AI with context
          const ticket = await SupportTicket.findOne({
            sessionId: session.sessionId
          });

          if (ticket) {
            ticket.assignedAgentId = null;
            ticket.currentStage = 'ai_fallback';

            await ticket.addMessage('system',
              `I'm back to help you! Our agent had to step away, but I have all the context from your conversation. How can I continue to assist you? 🤖`,
              {
                fallback: true,
                previousAgentId: agentId,
                fallbackReason: 'agent_offline'
              }
            );
          }
        }
      }

      // Clear agent's current sessions
      agent.currentSessions = [];
      agent.currentChatCount = 0;
      await agent.save();

    } catch (error) {
      console.error(`Error handling agent offline: ${error.message}`);
    }
  }

  // Admin Methods
  static async getAllAgents(filters = {}) {
    try {
      const query = {};

      // Add company filter if provided
      if (filters.companyId) query.companyId = filters.companyId;

      if (filters.status) query.status = filters.status;
      if (filters.department) query.department = filters.department;
      if (filters.isAvailable !== undefined) query.isAvailable = filters.isAvailable;

      const agents = await Agent.find(query)
        .select('-password -loginHistory')
        .sort({ name: 1 });

      return agents;
    } catch (error) {
      throw new Error(`Failed to get agents: ${error.message}`);
    }
  }

  static async getSystemStats() {
    try {
      const totalAgents = await Agent.countDocuments();
      const onlineAgents = await Agent.countDocuments({ status: 'online' });
      const availableAgents = await Agent.countDocuments({
        isAvailable: true,
        status: 'online'
      });

      const currentLoad = await Agent.aggregate([
        {
          $group: {
            _id: null,
            totalCurrentChats: { $sum: '$currentChatCount' },
            totalCapacity: { $sum: '$maxConcurrentChats' }
          }
        }
      ]);

      const pendingTransfers = await ChatTransfer.countDocuments({
        status: 'pending'
      });

      return {
        agents: {
          total: totalAgents,
          online: onlineAgents,
          available: availableAgents,
          utilizationRate: totalAgents > 0 ?
            ((onlineAgents / totalAgents) * 100).toFixed(1) : 0
        },
        workload: {
          currentChats: currentLoad[0]?.totalCurrentChats || 0,
          totalCapacity: currentLoad[0]?.totalCapacity || 0,
          capacityUtilization: currentLoad[0] ?
            ((currentLoad[0].totalCurrentChats / currentLoad[0].totalCapacity) * 100).toFixed(1) : 0
        },
        transfers: {
          pending: pendingTransfers
        }
      };

    } catch (error) {
      throw new Error(`Failed to get system stats: ${error.message}`);
    }
  }
}

module.exports = AgentService;
