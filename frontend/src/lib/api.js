import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';

    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Notify app to clear auth state without full page reload
      window.dispatchEvent(new Event('unauthorized'));
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      toast.error('Access denied: ' + message);
    } else if (error.response?.status === 429) {
      toast.error('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => api.post('/auth/logout')
};

export const tenantAPI = {
  getSettings: () => api.get('/tenant/settings'),
  updateSettings: (data) => api.put('/tenant/settings', data),
  getAnalytics: (days = 30) => api.get(`/tenant/analytics?days=${days}`),
  getTeam: () => api.get('/tenant/team'),
  addTeamMember: (data) => api.post('/tenant/team', data)
};

export const apiKeyAPI = {
  getAll: () => api.get('/keys'),
  create: (data) => api.post('/keys', data),
  update: (keyId, data) => api.put(`/keys/${keyId}`, data),
  delete: (keyId) => api.delete(`/keys/${keyId}`),
  getUsage: (keyId, days = 30) => api.get(`/keys/${keyId}/usage?days=${days}`)
};

export const kbAPI = {
  getAll: (params = {}) => api.get('/kb', { params }),
  create: (data) => api.post('/kb', data),
  update: (itemId, data) => api.put(`/kb/${itemId}`, data),
  delete: (itemId) => api.delete(`/kb/${itemId}`),
  import: (items) => api.post('/kb/import', { items }),
  search: (query, limit = 5) => api.post('/kb/search', { query, limit })
};

export const chatAPI = {
  getConversations: (params = {}) => api.get('/chat/conversations', { params }),
  getHistory: (sessionId, limit = 50) => api.get(`/chat/${sessionId}/history?limit=${limit}`),
  endConversation: (sessionId, data) => api.post(`/chat/${sessionId}/end`, data),
  requestHandoff: (sessionId, data) => api.post(`/chat/${sessionId}/handoff`, data),
  agentAccept: (conversationId, data) => api.post(`/chat/${conversationId}/agent/accept`, data),
  agentMessage: (conversationId, data) => api.post(`/chat/${conversationId}/agent/message`, data)
};

// Widget API (for external use)
export const widgetAPI = {
  start: (apiKey, data) =>
    axios.post('/api/chat/start', data, {
      headers: { 'X-API-Key': apiKey }
    }),

  sendMessage: (apiKey, data) =>
    axios.post('/api/chat/message', data, {
      headers: { 'X-API-Key': apiKey }
    }),

  getHistory: (apiKey, sessionId) =>
    axios.get(`/api/chat/${sessionId}/history`, {
      headers: { 'X-API-Key': apiKey }
    }),

  endChat: (apiKey, sessionId, data) =>
    axios.post(`/api/chat/${sessionId}/end`, data, {
      headers: { 'X-API-Key': apiKey }
    })
};

export default api;
