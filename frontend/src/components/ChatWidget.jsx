import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { widgetAPI } from '../lib/api.js';

const ChatWidget = ({ 
  apiKey,
  config = {},
  onMessage = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const widgetConfig = {
    primaryColor: '#3B82F6',
    position: 'bottom-right',
    welcomeMessage: 'Hi! How can I help you today?',
    placeholder: 'Type your message...',
    showBranding: true,
    ...config
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await widgetAPI.start(apiKey, {
        visitorId: getVisitorId(),
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          url: window.location.href
        }
      });

      setSessionId(response.data.sessionId);
      
      if (response.data.message) {
        setMessages([{
          id: Date.now(),
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date()
        }]);
      }

    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || loading || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setTyping(true);

    try {
      const response = await widgetAPI.sendMessage(apiKey, {
        sessionId,
        message: userMessage.content
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(),
        metadata: response.data.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Call onMessage callback if provided
      if (onMessage) {
        onMessage({
          userMessage: userMessage.content,
          assistantMessage: assistantMessage.content,
          sessionId,
          metadata: response.data.metadata
        });
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getVisitorId = () => {
    let visitorId = localStorage.getItem('chatbot_visitor_id');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatbot_visitor_id', visitorId);
    }
    return visitorId;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!apiKey) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
        API key required
      </div>
    );
  }

  return (
    <div className={`chat-widget ${className}`}>
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            if (!sessionId) startConversation();
          }}
          className="chat-widget-button"
          style={{ backgroundColor: widgetConfig.primaryColor }}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className={`chat-widget-window ${isOpen ? 'open' : ''}`}>
          {/* Header */}
          <div 
            className="chat-widget-header"
            style={{ background: widgetConfig.primaryColor }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium">Support Chat</div>
                <div className="text-xs opacity-90">We're here to help</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          {!isMinimized && (
            <>
              <div className="chat-widget-messages">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
                    {error}
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.role} ${message.isError ? 'error' : ''}`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                ))}

                {typing && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="chat-widget-input">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={widgetConfig.placeholder}
                    disabled={loading || !sessionId}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || loading || !sessionId}
                    className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                {widgetConfig.showBranding && (
                  <div className="text-xs text-gray-500 text-center mt-2">
                    Powered by ChatBot SaaS
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;