import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth.js';
import { apiKeyAPI } from '../lib/api.js';
import { Plus, Key, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import Badge from '../components/Badge.jsx';
import CopyField from '../components/CopyField.jsx';
import toast from 'react-hot-toast';

const ApiKeys = () => {
  const { user, isAdmin } = useAuth();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKey, setNewKey] = useState({
    name: '',
    permissions: ['chat:read', 'chat:write'],
    expiresIn: null
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await apiKeyAPI.getAll();
      setApiKeys(response.data.apiKeys);
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    
    try {
      const response = await apiKeyAPI.create(newKey);
      
      // Show the new key in a modal or alert
      const keyValue = response.data.apiKey.key;
      
      // Create a temporary element to show the full key
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold mb-4">API Key Created</h3>
            <p class="text-sm text-gray-600 mb-4">
              Please copy this API key now. You won't be able to see it again.
            </p>
            <div class="bg-gray-50 p-3 rounded border font-mono text-sm break-all">
              ${keyValue}
            </div>
            <div class="flex space-x-3 mt-4">
              <button onclick="navigator.clipboard.writeText('${keyValue}'); this.textContent='Copied!'" 
                      class="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Copy Key
              </button>
              <button onclick="this.closest('.fixed').remove()" 
                      class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400">
                Close
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Reset form and reload keys
      setNewKey({ name: '', permissions: ['chat:read', 'chat:write'], expiresIn: null });
      setShowCreateForm(false);
      await loadApiKeys();
      
      toast.success('API key created successfully!');
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiKeyAPI.delete(keyId);
      await loadApiKeys();
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const handleToggleKeyStatus = async (keyId, currentStatus) => {
    try {
      await apiKeyAPI.update(keyId, { isActive: !currentStatus });
      await loadApiKeys();
      toast.success(`API key ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to update API key:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
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
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-2 text-gray-600">
            Manage API keys for your chatbot integrations
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create API Key</span>
          </button>
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
            
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Production API Key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'chat:read', label: 'Read chat data' },
                    { value: 'chat:write', label: 'Send messages' },
                    { value: 'kb:read', label: 'Read knowledge base' },
                    { value: 'kb:write', label: 'Modify knowledge base' },
                    { value: 'analytics:read', label: 'View analytics' }
                  ].map((permission) => (
                    <label key={permission.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newKey.permissions.includes(permission.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKey({
                              ...newKey,
                              permissions: [...newKey.permissions, permission.value]
                            });
                          } else {
                            setNewKey({
                              ...newKey,
                              permissions: newKey.permissions.filter(p => p !== permission.value)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires in (days)
                </label>
                <input
                  type="number"
                  value={newKey.expiresIn || ''}
                  onChange={(e) => setNewKey({ ...newKey, expiresIn: e.target.value ? parseInt(e.target.value) : null })}
                  className="input-field"
                  placeholder="Leave empty for no expiration"
                  min="1"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Create Key
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="card text-center py-12">
            <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first API key to start integrating your chatbot
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Create API Key
              </button>
            )}
          </div>
        ) : (
          apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                    <Badge variant={apiKey.isActive ? 'success' : 'error'}>
                      {apiKey.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <CopyField
                    value={apiKey.maskedKey}
                    label="API Key"
                    showValue={false}
                  />
                  
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                    {apiKey.lastUsed && (
                      <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                    )}
                    <span>Usage: {apiKey.usageCount} calls</span>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.map((permission) => (
                        <Badge key={permission} variant="info" size="xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleKeyStatus(apiKey.id, apiKey.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        apiKey.isActive 
                          ? 'text-gray-600 hover:bg-gray-100' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={apiKey.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {apiKey.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete API key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Integration Guide */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Guide</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">JavaScript Widget</h4>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`<script>
  window.ChatBotConfig = {
    apiKey: 'YOUR_API_KEY',
    apiUrl: '${window.location.origin}/api'
  };
</script>
<script src="${window.location.origin}/widget.js"></script>`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">API Endpoints</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Badge variant="info" size="xs">POST</Badge>
                <code className="text-gray-700">/api/chat/start</code>
                <span className="text-gray-500">- Start new conversation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="info" size="xs">POST</Badge>
                <code className="text-gray-700">/api/chat/message</code>
                <span className="text-gray-500">- Send message</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="success" size="xs">GET</Badge>
                <code className="text-gray-700">/api/chat/:sessionId/history</code>
                <span className="text-gray-500">- Get conversation history</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeys;