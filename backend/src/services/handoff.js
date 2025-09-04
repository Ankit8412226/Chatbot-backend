import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

class HandoffService {
  constructor() {
    this.pendingHandoffs = new Map(); // conversationId -> handoff data
    this.agentQueues = new Map(); // tenantId -> agent queue
  }

  async requestHandoff(conversationId, reason, priority = 'medium', department = null) {
    try {
      const conversation = await Conversation.findById(conversationId).populate('tenantId');
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Find available agents
      const availableAgents = await this.findAvailableAgents(
        conversation.tenantId._id,
        department
      );

      if (availableAgents.length === 0) {
        // No agents available - queue the request
        this.pendingHandoffs.set(conversationId, {
          reason,
          priority,
          department,
          requestedAt: new Date(),
          status: 'queued'
        });

        // Add system message
        await this.addSystemMessage(
          conversationId,
          'Your request has been queued. An agent will be with you shortly.',
          { type: 'handoff_queued' }
        );

        return {
          status: 'queued',
          message: 'Request queued - no agents available',
          estimatedWait: this.estimateWaitTime(conversation.tenantId._id)
        };
      }

      // Assign to best available agent
      const selectedAgent = this.selectBestAgent(availableAgents, priority);
      
      await conversation.assignToAgent(selectedAgent._id, {
        reason,
        priority,
        department,
        notes: `Handoff requested: ${reason}`
      });

      // Notify agent via Socket.IO
      const io = this.getSocketIO();
      if (io) {
        io.to(`agent-${selectedAgent._id}`).emit('handoff-request', {
          conversationId,
          customer: conversation.visitor,
          reason,
          priority,
          messages: await this.getRecentMessages(conversationId, 5)
        });
      }

      // Add system message
      await this.addSystemMessage(
        conversationId,
        `You've been connected to ${selectedAgent.name}. They'll be with you shortly!`,
        { 
          type: 'handoff_assigned',
          agentId: selectedAgent._id,
          agentName: selectedAgent.name
        }
      );

      return {
        status: 'assigned',
        agent: {
          id: selectedAgent._id,
          name: selectedAgent.name,
          department: selectedAgent.role
        },
        estimatedWait: '1-2 minutes'
      };

    } catch (error) {
      console.error('Handoff request error:', error);
      throw error;
    }
  }

  async acceptHandoff(conversationId, agentId, message = null) {
    try {
      const conversation = await Conversation.findById(conversationId);
      
      if (!conversation || conversation.assignedAgent?.toString() !== agentId) {
        throw new Error('Unauthorized or conversation not found');
      }

      // Update conversation status
      conversation.status = 'transferred';
      await conversation.save();

      // Send agent introduction message
      const agent = await User.findById(agentId);
      const introMessage = message || `Hi! I'm ${agent.name} and I'll be helping you today. How can I assist you?`;

      await this.addAgentMessage(conversationId, agentId, introMessage);

      // Notify customer via Socket.IO
      const io = this.getSocketIO();
      if (io) {
        io.to(`conversation-${conversationId}`).emit('agent-joined', {
          agent: {
            id: agent._id,
            name: agent.name
          },
          message: introMessage
        });
      }

      // Remove from pending handoffs
      this.pendingHandoffs.delete(conversationId);

      return {
        success: true,
        agent: {
          id: agent._id,
          name: agent.name
        }
      };

    } catch (error) {
      console.error('Accept handoff error:', error);
      throw error;
    }
  }

  async findAvailableAgents(tenantId, department = null) {
    const query = {
      tenantId,
      role: { $in: ['agent', 'admin'] },
      isActive: true
    };

    // Add department filter if specified
    if (department) {
      query.department = department;
    }

    // In a real implementation, you'd also check:
    // - Current workload
    // - Online status
    // - Working hours
    
    return User.find(query).select('name email role preferences');
  }

  selectBestAgent(agents, priority) {
    // Simple selection - in production, consider:
    // - Current workload
    // - Expertise match
    // - Performance metrics
    // - Round-robin assignment
    
    if (priority === 'urgent' || priority === 'high') {
      // Prefer admins for high priority
      const admins = agents.filter(agent => agent.role === 'admin');
      if (admins.length > 0) return admins[0];
    }
    
    return agents[0];
  }

  estimateWaitTime(tenantId) {
    // Simple estimation - in production, calculate based on:
    // - Queue length
    // - Average handling time
    // - Agent availability
    
    const queueLength = Array.from(this.pendingHandoffs.values())
      .filter(handoff => handoff.status === 'queued').length;
    
    return `${Math.max(1, queueLength * 2)} minutes`;
  }

  async addSystemMessage(conversationId, content, metadata = {}) {
    const Message = (await import('../models/Message.js')).default;
    const conversation = await Conversation.findById(conversationId);
    
    const message = new Message({
      conversationId,
      tenantId: conversation.tenantId,
      role: 'system',
      content,
      metadata: {
        messageType: 'system',
        ...metadata
      }
    });

    await message.save();
    return message;
  }

  async addAgentMessage(conversationId, agentId, content, metadata = {}) {
    const Message = (await import('../models/Message.js')).default;
    const conversation = await Conversation.findById(conversationId);
    
    const message = new Message({
      conversationId,
      tenantId: conversation.tenantId,
      role: 'agent',
      content,
      metadata: {
        userId: agentId,
        messageType: 'text',
        ...metadata
      }
    });

    await message.save();
    return message;
  }

  async getRecentMessages(conversationId, limit = 10) {
    const Message = (await import('../models/Message.js')).default;
    
    return Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('metadata.userId', 'name');
  }

  getSocketIO() {
    // This would be injected or accessed from app context
    return null; // Placeholder
  }

  // Queue management
  async processQueue() {
    for (const [conversationId, handoffData] of this.pendingHandoffs) {
      if (handoffData.status === 'queued') {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) continue;

        const availableAgents = await this.findAvailableAgents(
          conversation.tenantId,
          handoffData.department
        );

        if (availableAgents.length > 0) {
          await this.requestHandoff(
            conversationId,
            handoffData.reason,
            handoffData.priority,
            handoffData.department
          );
        }
      }
    }
  }

  getQueueStatus(tenantId) {
    const tenantHandoffs = Array.from(this.pendingHandoffs.values())
      .filter(handoff => handoff.tenantId === tenantId);

    return {
      total: tenantHandoffs.length,
      queued: tenantHandoffs.filter(h => h.status === 'queued').length,
      assigned: tenantHandoffs.filter(h => h.status === 'assigned').length,
      avgWaitTime: this.estimateWaitTime(tenantId)
    };
  }
}

export default new HandoffService();