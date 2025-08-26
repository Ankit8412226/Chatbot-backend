import axios from 'axios';

// Configure API base URL - Update this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Dashboard Stats
  getDashboardStats: () => api.get('/support/stats/quick'),
  getDetailedAnalytics: (params) => api.get('/support/admin/analytics/detailed', { params }),

  // Support Tickets
  getAllTickets: (params) => api.get('/support/admin/tickets', { params }),
  getTicketDetails: (ticketId) => api.get(`/support/admin/tickets/${ticketId}`),
  assignTicket: (ticketId, data) => api.put(`/support/admin/tickets/${ticketId}/assign`, data),

  // Agents Management
  getAllAgents: (params) => api.get('/support/admin/agents', { params }),
  createAgent: (data) => api.post('/support/admin/agents', data),
  updateAgentStatus: (agentId, data) => api.put(`/support/admin/agents/${agentId}/status`, data),
  getAgentPerformance: (agentId, days) => api.get(`/support/admin/agents/${agentId}/performance?days=${days}`),

  // Transfers Management
  getPendingTransfers: () => api.get('/support/admin/transfers/pending'),
  getTransferHistory: (params) => api.get('/support/admin/transfers/history', { params }),
  forceTransfer: (sessionId, data) => api.post(`/support/admin/transfers/force`, { sessionId, ...data }),

  // Real-time Operations
  broadcastMessage: (data) => api.post('/support/admin/broadcast', data),
  getSystemHealth: () => api.get('/support/health'),

  // Human Agent Availability
  getHumanAvailability: () => api.get('/support/human-availability'),
  
  // Session Management
  getActiveSessions: () => api.get('/support/admin/sessions/active'),
  endSession: (sessionId, data) => api.put(`/support/session/${sessionId}/end`, data),
};

export default api;