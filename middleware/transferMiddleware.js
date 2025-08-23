const AgentService = require('../services/agentService');
const realTimeService = require('../services/realTimeService');

// Enhanced support controller to integrate with human agents
const enhancedSupportController = {

  // Enhanced continue chat to detect when human agent is needed
  async continueSupportChat(req, res) {
    try {
      const { sessionId, message } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({
          error: "Session ID and message are required"
        });
      }

      const SupportTicket = require('../models/supportTicketSchema');
      const ticket = await SupportTicket.findActiveSession(sessionId);

      if (!ticket) {
        return res.status(404).json({
          error: "Support session not found or has ended"
        });
      }

      // Add user message
      await ticket.addMessage('user', message.trim());

      // Check if session is currently with a human agent
      if (ticket.assignedAgentId && ticket.currentStage === 'human_agent') {
        // Forward message to human agent via WebSocket
        const agentWs = realTimeService.agentConnections.get(ticket.assignedAgentId.toString());
        if (agentWs) {
          agentWs.send(JSON.stringify({
            type: 'customer_message',
            sessionId,
            message: message.trim(),
            customerName: ticket.name,
            timestamp: new Date().toISOString()
          }));
        }

        return res.status(200).json({
          sessionId,
          message: 'Message forwarded to human agent',
          stage: 'human_agent',
          waitingForAgent: true,
          assignedAgent: ticket.assignedAgentId
        });
      }

      // Check if customer is requesting human agent
      const humanRequestKeywords = [
        'human', 'person', 'agent', 'representative', 'speak to someone',
        'talk to human', 'real person', 'customer service', 'supervisor',
        'escalate', 'manager', 'human help', 'live agent', 'staff member'
      ];

      const messageText = message.toLowerCase();
      const requestsHuman = humanRequestKeywords.some(keyword =>
        messageText.includes(keyword)
      );

      // Check if AI should escalate based on complexity or confidence
      const complexityKeywords = [
        'complex', 'difficult', 'challenging', 'advanced', 'technical issue',
        'not working', 'problem with', 'error', 'broken', 'failed',
        'urgent', 'critical', 'emergency', 'asap', 'immediately'
      ];

      const isComplex = complexityKeywords.some(keyword =>
        messageText.includes(keyword)
      );

      // Check conversation length and AI confidence
      const conversationLength = ticket.conversationHistory.length;
      const shouldEscalate = requestsHuman ||
                            (isComplex && conversationLength > 6) ||
                            conversationLength > 15;

      if (shouldEscalate) {
        // Check if human agents are available
        const Agent = require('../models/agentSchema');
        const availableAgents = await Agent.findAvailableAgents(ticket.serviceType);

        if (availableAgents.length > 0) {
          // Initiate transfer to human agent
          try {
            const transfer = await AgentService.requestTransfer(sessionId, {
              reason: requestsHuman ? 'customer_request' : 'ai_escalation',
              serviceType: ticket.serviceType,
              priority: isComplex ? 'high' : 'medium',
              fromType: 'ai',
              context: {
                summary: requestsHuman ?
                  'Customer explicitly requested human assistance' :
                  'AI detected complexity requiring human expertise',
                customerIssue: message,
                urgencyLevel: isComplex ? 'high' : 'medium',
                aiConfidence: requestsHuman ? 0.2 : 0.4,
                complexity: 'requires_human_expertise'
              }
            });

            const escalationMessage = requestsHuman ?
              `I understand you'd like to speak with a human agent! I've connected you with ${transfer.assignedAgent.name} from our ${transfer.assignedAgent.department} team. They'll be with you in about ${Math.ceil(transfer.estimatedWaitTime / 60)} minutes.

In the meantime, feel free to share any additional details about what you need help with! 👋` :

              `I can see this requires some specialized expertise! Let me connect you with ${transfer.assignedAgent.name}, one of our human experts in ${ticket.serviceType.replace('_', ' ')}.

They'll be able to provide you with the detailed, personalized assistance you need. Expected wait time: ${Math.ceil(transfer.estimatedWaitTime / 60)} minutes. 🚀`;

            // Add escalation message to conversation
            await ticket.addMessage('assistant', escalationMessage, {
              isEscalation: true,
              transferId: transfer.transferId,
              assignedAgentId: transfer.assignedAgent.id
            });

            // Notify via WebSocket
            realTimeService.notifyTransferRequest(transfer.transferId, {
              sessionId,
              customerName: ticket.name,
              serviceType: ticket.serviceType,
              priority: isComplex ? 'high' : 'medium',
              estimatedWaitTime: transfer.estimatedWaitTime
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

          } catch (transferError) {
            console.error('Transfer failed:', transferError);
            // Fall back to AI response with high priority flag
          }
        } else {
          // No agents available
          const queueMessage = requestsHuman ?
            `I'd love to connect you with one of our human agents, but they're all currently helping other customers.

However, I'm equipped with advanced capabilities and can provide expert-level assistance! What specific challenge are you facing? I'll make sure to give you the detailed help you need, and I'll flag this as high priority for when an agent becomes available. 🌟` :

            `I can see this is a complex topic that deserves special attention! While our human agents are currently busy, I have access to comprehensive solutions and can provide detailed technical guidance.

Let me tackle this challenge for you right now - what specifically would you like me to help you with? I'll also flag this as high priority for follow-up! 🚀`;

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
      }

      // Continue with AI response (normal flow)
      const { generateUniversalResponse, analyzeUniversalTicket } = require('../controllers/supportController');

      // Analyze and update ticket
      await analyzeUniversalTicket(ticket, message);

      // Generate AI response
      const response = await generateUniversalResponse(ticket, message);

      // Add assistant response
      await ticket.addMessage('assistant', response);

      ticket.updatedAt = new Date();
      await ticket.save();

      return res.status(200).json({
        sessionId,
        message: response,
        stage: ticket.currentStage,
        status: ticket.status,
        serviceType: ticket.serviceType,
        projectDetails: ticket.projectDetails,
        humanAgentAvailable: true, // Indicate human help is available if needed
        escalationHint: conversationLength > 10 ?
          "Need human assistance? Just ask to speak with an agent!" : undefined
      });

    } catch (error) {
      console.error("Error in enhanced support chat:", error);
      res.status(500).json({
        error: "Failed to process support message",
        details: error.message
      });
    }
  },

  // Handle agent response to customer
  async handleAgentResponse(req, res) {
    try {
      const { sessionId, message, agentId } = req.body;

      const SupportTicket = require('../models/supportTicketSchema');
      const Agent = require('../models/agentSchema');

      const ticket = await SupportTicket.findOne({ sessionId });
      const agent = await Agent.findById(agentId);

      if (!ticket || !agent) {
        return res.status(404).json({
          error: 'Session or agent not found'
        });
      }

      if (ticket.assignedAgentId?.toString() !== agentId) {
        return res.status(403).json({
          error: 'Agent not assigned to this session'
        });
      }

      // Add agent message to conversation
      await ticket.addMessage('agent', message, {
        agentId,
        agentName: agent.name
      });

      // Notify customer via WebSocket
      const customerWs = realTimeService.customerConnections.get(sessionId);
      if (customerWs) {
        customerWs.send(JSON.stringify({
          type: 'agent_message',
          sessionId,
          message,
          agentName: agent.name,
          timestamp: new Date().toISOString()
        }));
      }

      res.status(200).json({
        sessionId,
        message: 'Response sent to customer',
        timestamp: new Date().toISOString(),
        agent: {
          id: agentId,
          name: agent.name
        }
      });

    } catch (error) {
      console.error('Agent response error:', error);
      res.status(500).json({
        error: 'Failed to send agent response',
        message: error.message
      });
    }
  },

  // Get online agents status for customers
  async getHumanSupportAvailability(req, res) {
    try {
      const Agent = require('../models/agentSchema');

      const onlineAgents = await Agent.getOnlineCount();
      const availableAgents = await Agent.countDocuments({
        isAvailable: true,
        status: 'online',
        $expr: { $lt: ['$currentChatCount', '$maxConcurrentChats'] }
      });

      const averageWaitTime = availableAgents > 0 ?
        Math.max(1, Math.ceil(5 / availableAgents)) : null;

      res.status(200).json({
        humanSupportAvailable: availableAgents > 0,
        onlineAgents,
        availableAgents,
        estimatedWaitTime: averageWaitTime ? `${averageWaitTime} minutes` : 'Not available',
        message: availableAgents > 0 ?
          `${availableAgents} human agents available to help` :
          'All agents are currently busy, but I can provide expert assistance!'
      });

    } catch (error) {
      console.error('Support availability error:', error);
      res.status(500).json({
        error: 'Failed to check support availability',
        message: error.message
      });
    }
  }
};

module.exports = enhancedSupportController;
