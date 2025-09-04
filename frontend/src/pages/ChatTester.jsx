import { MessageSquare, RotateCcw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ChatWidget from '../components/ChatWidget.jsx';
import { apiKeyAPI } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';

const ChatTester = () => {
  const { tenant } = useAuth();
  const [apiKeys, setApiKeys] = useState([]);
  const [selectedApiKey, setSelectedApiKey] = useState('');
  const [manualApiKey, setManualApiKey] = useState('');
  const [testConfig, setTestConfig] = useState({
    visitorName: 'Test User',
    visitorEmail: 'test@example.com',
    metadata: {
      page: 'Chat Tester',
      userAgent: navigator.userAgent
    }
  });
  const [chatKey, setChatKey] = useState(0); // Force re-render of chat widget

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await apiKeyAPI.getAll();
      const activeKeys = response.data.apiKeys.filter(key =>
        key.isActive && key.permissions.includes('chat:write')
      );
      setApiKeys(activeKeys);

      if (activeKeys.length > 0 && !selectedApiKey) {
        setSelectedApiKey(activeKeys[0].maskedKey);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const resetChat = () => {
    setChatKey(prev => prev + 1);
    toast.success('Chat reset successfully');
  };

  const handleMessage = (data) => {
    console.log('Chat message:', data);
    // You can add analytics or logging here
  };

  const testScenarios = [
    {
      name: 'General Inquiry',
      message: 'Hello, I have a question about your services.'
    },
    {
      name: 'Technical Support',
      message: 'I\'m having trouble with the integration. Can you help?'
    },
    {
      name: 'Billing Question',
      message: 'I need help with my billing and subscription.'
    },
    {
      name: 'Human Handoff',
      message: 'I need to speak with a human agent please.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat Tester</h1>
          <p className="mt-2 text-gray-600">
            Test your chatbot configuration and responses
          </p>
        </div>

        <button
          onClick={resetChat}
          className="btn-secondary flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Chat</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* API Key Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <select
                  value={selectedApiKey}
                  onChange={(e) => setSelectedApiKey(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select an API key</option>
                  {apiKeys.map((key) => (
                    <option key={key.id} value={key.maskedKey}>
                      {key.name} ({key.maskedKey})
                    </option>
                  ))}
                </select>

                {apiKeys.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    No active API keys found. Create one in the API Keys section.
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  Select a key to view it, then paste the full key below.
                </p>
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    value={manualApiKey}
                    onChange={(e) => setManualApiKey(e.target.value)}
                    placeholder="Paste full API key (starts with sk_)"
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setManualApiKey(text);
                        toast.success('Pasted from clipboard');
                      } catch (e) {
                        toast.error('Clipboard read failed');
                      }
                    }}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Paste
                  </button>
                </div>
                {manualApiKey && !/^sk_/.test(manualApiKey) && (
                  <p className="mt-2 text-xs text-red-600">
                    API key must start with <code>sk_</code>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Visitor Name
                </label>
                <input
                  type="text"
                  value={testConfig.visitorName}
                  onChange={(e) => setTestConfig({
                    ...testConfig,
                    visitorName: e.target.value
                  })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Visitor Email
                </label>
                <input
                  type="email"
                  value={testConfig.visitorEmail}
                  onChange={(e) => setTestConfig({
                    ...testConfig,
                    visitorEmail: e.target.value
                  })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Test Scenarios */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Scenarios</h3>

            <div className="space-y-2">
              {testScenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // This would send the test message to the chat widget
                    toast.info(`Test scenario: ${scenario.name}`);
                  }}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{scenario.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{scenario.message}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Settings</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{tenant?.settings?.ai?.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-medium">{tenant?.settings?.ai?.temperature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Tokens:</span>
                <span className="font-medium">{tenant?.settings?.ai?.maxTokens}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Handoff Enabled:</span>
                <span className="font-medium">
                  {tenant?.settings?.handoff?.enabled ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Widget */}
        <div className="lg:col-span-2">
          <div className="card h-[600px] relative">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Chat Test</h3>

            {manualApiKey ? (
              <div className="absolute inset-6 top-16">
                <ChatWidget
                  key={chatKey}
                  apiKey={manualApiKey}
                  config={tenant?.settings?.chatWidget}
                  onMessage={handleMessage}
                  className="relative h-full"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Paste an API Key</h4>
                  <p className="text-gray-600">
                    Choose a key and paste the full value above to start testing
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Testing Tips */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Testing Tips</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">What to Test</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Knowledge base accuracy</li>
              <li>• Response quality and tone</li>
              <li>• Human handoff triggers</li>
              <li>• Widget appearance and behavior</li>
              <li>• Mobile responsiveness</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Test with real customer questions</li>
              <li>• Try edge cases and unusual requests</li>
              <li>• Verify handoff keywords work</li>
              <li>• Check response times</li>
              <li>• Test on different devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTester;
