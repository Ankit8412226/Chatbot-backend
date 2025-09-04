import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth.js';
import { tenantAPI } from '../lib/api.js';
import { Settings, Save, RotateCcw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const PromptTuner = () => {
  const { tenant, isAdmin } = useAuth();
  const [settings, setSettings] = useState({
    ai: {
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 500,
      model: 'Meta-Llama-3.1-8B-Instruct'
    },
    chatWidget: {
      primaryColor: '#3B82F6',
      position: 'bottom-right',
      welcomeMessage: '',
      placeholder: 'Type your message...',
      showBranding: true
    },
    handoff: {
      enabled: true,
      triggerKeywords: [],
      autoEscalate: false,
      escalationThreshold: 3
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenant?.settings) {
      setSettings(tenant.settings);
    }
    setLoading(false);
  }, [tenant]);

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error('Only admins can modify settings');
      return;
    }

    setSaving(true);
    try {
      await tenantAPI.updateSettings({ settings });
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (tenant?.settings) {
      setSettings(tenant.settings);
      toast.success('Settings reset to saved values');
    }
  };

  const presetPrompts = {
    ecommerce: {
      name: 'E-commerce Support',
      prompt: `You are a helpful e-commerce customer support assistant. You help customers with:
- Product information and recommendations
- Order status and tracking
- Returns and refunds
- Shipping information
- Account management

Be friendly, professional, and always try to resolve customer issues quickly. If you cannot help with something, offer to connect them with a human agent.`
    },
    saas: {
      name: 'SaaS Support',
      prompt: `You are a knowledgeable SaaS customer support assistant. You help users with:
- Account setup and configuration
- Feature explanations and tutorials
- Billing and subscription questions
- Technical troubleshooting
- Integration support

Be technical when needed but explain things clearly. Always aim to help users get the most value from the product.`
    },
    healthcare: {
      name: 'Healthcare Support',
      prompt: `You are a professional healthcare support assistant. You help with:
- Appointment scheduling
- General information about services
- Insurance and billing questions
- Facility information
- Non-medical administrative support

IMPORTANT: Never provide medical advice. Always direct medical questions to qualified healthcare professionals.`
    },
    general: {
      name: 'General Support',
      prompt: `You are a helpful customer support assistant. Be friendly, professional, and helpful. 
Always try to understand the customer's needs and provide accurate information. 
If you cannot help with something, offer to connect them with a human agent.`
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompt Tuner</h1>
          <p className="mt-2 text-gray-600">
            Customize your AI assistant's behavior and personality
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="btn-secondary flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* AI Configuration */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary-600" />
            AI Configuration
          </h3>
          
          <div className="space-y-6">
            {/* Preset Prompts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Start Templates
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(presetPrompts).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => setSettings({
                      ...settings,
                      ai: { ...settings.ai, systemPrompt: preset.prompt }
                    })}
                    className="p-3 text-left border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                    disabled={!isAdmin}
                  >
                    <div className="font-medium text-gray-900">{preset.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {preset.prompt.substring(0, 100)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt
              </label>
              <textarea
                value={settings.ai.systemPrompt}
                onChange={(e) => setSettings({
                  ...settings,
                  ai: { ...settings.ai, systemPrompt: e.target.value }
                })}
                rows={8}
                className="input-field font-mono text-sm"
                placeholder="Define your AI assistant's personality and behavior..."
                disabled={!isAdmin}
              />
              <p className="mt-1 text-sm text-gray-500">
                This prompt defines how your AI assistant behaves and responds to customers.
              </p>
            </div>

            {/* AI Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature ({settings.ai.temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.ai.temperature}
                  onChange={(e) => setSettings({
                    ...settings,
                    ai: { ...settings.ai, temperature: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                  disabled={!isAdmin}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="50"
                  max="2000"
                  value={settings.ai.maxTokens}
                  onChange={(e) => setSettings({
                    ...settings,
                    ai: { ...settings.ai, maxTokens: parseInt(e.target.value) }
                  })}
                  className="input-field"
                  disabled={!isAdmin}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={settings.ai.model}
                  onChange={(e) => setSettings({
                    ...settings,
                    ai: { ...settings.ai, model: e.target.value }
                  })}
                  className="input-field"
                  disabled={!isAdmin}
                >
                  <option value="Meta-Llama-3.1-8B-Instruct">Llama 3.1 8B</option>
                  <option value="Meta-Llama-3.1-70B-Instruct">Llama 3.1 70B</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Widget Configuration */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-primary-600" />
            Chat Widget Settings
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Message
                </label>
                <textarea
                  value={settings.chatWidget.welcomeMessage}
                  onChange={(e) => setSettings({
                    ...settings,
                    chatWidget: { ...settings.chatWidget, welcomeMessage: e.target.value }
                  })}
                  rows={3}
                  className="input-field"
                  placeholder="Hi! How can I help you today?"
                  disabled={!isAdmin}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  value={settings.chatWidget.placeholder}
                  onChange={(e) => setSettings({
                    ...settings,
                    chatWidget: { ...settings.chatWidget, placeholder: e.target.value }
                  })}
                  className="input-field"
                  disabled={!isAdmin}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={settings.chatWidget.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      chatWidget: { ...settings.chatWidget, primaryColor: e.target.value }
                    })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                    disabled={!isAdmin}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <select
                    value={settings.chatWidget.position}
                    onChange={(e) => setSettings({
                      ...settings,
                      chatWidget: { ...settings.chatWidget, position: e.target.value }
                    })}
                    className="input-field"
                    disabled={!isAdmin}
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.chatWidget.showBranding}
                    onChange={(e) => setSettings({
                      ...settings,
                      chatWidget: { ...settings.chatWidget, showBranding: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    disabled={!isAdmin}
                  />
                  <span className="ml-2 text-sm text-gray-700">Show "Powered by" branding</span>
                </label>
              </div>
            </div>

            {/* Widget Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Widget Preview</h4>
              <div className="relative bg-white border-2 border-gray-200 rounded-lg p-4 h-64">
                <div 
                  className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer"
                  style={{ backgroundColor: settings.chatWidget.primaryColor }}
                >
                  💬
                </div>
                
                <div className="absolute bottom-20 right-4 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div 
                    className="p-3 text-white rounded-t-lg"
                    style={{ backgroundColor: settings.chatWidget.primaryColor }}
                  >
                    <div className="font-medium">Support Chat</div>
                  </div>
                  <div className="p-3">
                    <div className="bg-gray-100 p-2 rounded-lg text-sm mb-3">
                      {settings.chatWidget.welcomeMessage || 'Hi! How can I help you today?'}
                    </div>
                    <input
                      type="text"
                      placeholder={settings.chatWidget.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      disabled
                    />
                    {settings.chatWidget.showBranding && (
                      <div className="text-xs text-gray-500 text-center mt-2">
                        Powered by ChatBot SaaS
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Human Handoff Configuration */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Human Handoff Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.handoff.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    handoff: { ...settings.handoff, enabled: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  disabled={!isAdmin}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Enable human handoff</span>
              </label>
            </div>

            {settings.handoff.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={settings.handoff.triggerKeywords.join(', ')}
                    onChange={(e) => setSettings({
                      ...settings,
                      handoff: {
                        ...settings.handoff,
                        triggerKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }
                    })}
                    className="input-field"
                    placeholder="human, agent, representative, help"
                    disabled={!isAdmin}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    When customers use these words, they'll be offered human assistance
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.handoff.autoEscalate}
                        onChange={(e) => setSettings({
                          ...settings,
                          handoff: { ...settings.handoff, autoEscalate: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        disabled={!isAdmin}
                      />
                      <span className="ml-2 text-sm text-gray-700">Auto-escalate complex issues</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Escalation Threshold (messages)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={settings.handoff.escalationThreshold}
                      onChange={(e) => setSettings({
                        ...settings,
                        handoff: { ...settings.handoff, escalationThreshold: parseInt(e.target.value) }
                      })}
                      className="input-field"
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Integration Code */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget Integration Code</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm overflow-x-auto">
{`<!-- Add this to your website -->
<script>
  window.ChatBotConfig = {
    apiKey: 'YOUR_API_KEY',
    apiUrl: '${window.location.origin}/api',
    primaryColor: '${settings.chatWidget.primaryColor}',
    position: '${settings.chatWidget.position}',
    welcomeMessage: '${settings.chatWidget.welcomeMessage}',
    placeholder: '${settings.chatWidget.placeholder}',
    showBranding: ${settings.chatWidget.showBranding}
  };
</script>
<script src="${window.location.origin}/widget.js"></script>`}
            </pre>
          </div>
          
          <p className="mt-2 text-sm text-gray-500">
            Replace YOUR_API_KEY with an actual API key from the API Keys page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromptTuner;