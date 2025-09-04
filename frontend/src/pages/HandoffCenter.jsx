import { AlertCircle, MessageSquare } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Badge from '../components/Badge.jsx';
import { chatAPI } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';

const HandoffCenter = () => {
  const { user, isAgent } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadConversations();

    // Set up real-time updates
    const interval = setInterval(loadConversations, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const loadConversations = async () => {
    try {
      const params = {};

      if (filter === 'transferred') {
        params.status = 'transferred';
      } else if (filter === 'escalated') {
        params.status = 'escalated';
      } else if (filter === 'my-chats' && isAgent) {
        params.assignedAgent = user._id;
      }

      const response = await chatAPI.getConversations(params);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeConversation = async (conversationId) => {
    try {
      // In a real implementation, this would assign the conversation to the current agent
      toast.success('Conversation assigned to you');
      await loadConversations();
    } catch (error) {
      console.error('Failed to take conversation:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      transferred: 'warning',
      escalated: 'error',
      ended: 'default'
    };

    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'urgent' || priority === 'high') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Handoff Center</h1>
          <p className="mt-2 text-gray-600">
            Manage customer conversations and human agent handoffs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversation List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Conversations</h3>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="transferred">Transferred</option>
                <option value="escalated">Escalated</option>
                {isAgent && <option value="my-chats">My Chats</option>}
              </select>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No conversations found</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    onClick={() => setActiveConversation(conversation)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      activeConversation?._id === conversation._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {conversation.visitor?.name || 'Anonymous'}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getPriorityIcon(conversation.handoffData?.priority)}
                        {getStatusBadge(conversation.status)}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      {conversation.messageCount} messages
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(conversation.createdAt).toLocaleString()}
                    </div>

                    {conversation.handoffData?.reason && (
                      <div className="text-xs text-gray-600 mt-1 italic">
                        Reason: {conversation.handoffData.reason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Chats</span>
                <span className="font-medium">
                  {conversations.filter(c => c.status === 'active').length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Handoffs</span>
                <span className="font-medium">
                  {conversations.filter(c => c.status === 'transferred').length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Escalated</span>
                <span className="font-medium">
                  {conversations.filter(c => c.status === 'escalated').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Detail */}
        <div className="lg:col-span-2">
          {activeConversation ? (
            <ConversationDetail
              conversation={activeConversation}
              onTakeConversation={handleTakeConversation}
              onUpdate={loadConversations}
            />
          ) : (
            <div className="card h-96 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Conversation</h3>
                <p className="text-gray-600">
                  Choose a conversation from the list to view details and chat history
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConversationDetail = ({ conversation, onTakeConversation, onUpdate }) => {
  const { user, isAgent } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [conversation._id]);

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getHistory(conversation.sessionId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // In a real implementation, this would send an agent message
      const message = {
        id: Date.now(),
        role: 'agent',
        content: newMessage.trim(),
        timestamp: new Date(),
        metadata: { userId: user._id }
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {conversation.visitor?.name || 'Anonymous'}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            {getStatusBadge(conversation.status)}
            {conversation.handoffData?.priority && (
              <Badge variant="warning" size="xs">
                {conversation.handoffData.priority} priority
              </Badge>
            )}
          </div>
        </div>

        {isAgent && conversation.status === 'transferred' && !conversation.assignedAgent && (
          <button
            onClick={() => onTakeConversation(conversation._id)}
            className="btn-primary"
          >
            Take Conversation
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.role === 'agent'
                    ? 'bg-green-100 text-green-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                  {message.role === 'agent' && message.metadata?.userId && (
                    <span className="ml-2">• Agent</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      {isAgent && conversation.assignedAgent === user._id && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your response..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Conversation Info */}
      <div className="pt-4 border-t border-gray-200 mt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Email:</span>
            <span className="ml-2 font-medium">{conversation.visitor?.email || 'Not provided'}</span>
          </div>
          <div>
            <span className="text-gray-600">Started:</span>
            <span className="ml-2 font-medium">
              {new Date(conversation.createdAt).toLocaleString()}
            </span>
          </div>
          {conversation.handoffData?.requestedAt && (
            <div>
              <span className="text-gray-600">Handoff requested:</span>
              <span className="ml-2 font-medium">
                {new Date(conversation.handoffData.requestedAt).toLocaleString()}
              </span>
            </div>
          )}
          {conversation.assignedAgent && (
            <div>
              <span className="text-gray-600">Assigned to:</span>
              <span className="ml-2 font-medium">
                {conversation.assignedAgent.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HandoffCenter;
