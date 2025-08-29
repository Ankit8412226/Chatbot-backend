const express = require('express');
const router = express.Router();
const agentAuth = require('../middleware/agentAuth');
const {
  agentLogin,
  agentLogout,
  updateAgentStatus,
  requestTransfer,
  acceptTransfer,
  declineTransfer,
  getPendingTransfers,
  getAgentDashboard,
  getAgentPerformance,
  sendAgentMessage,
  endAgentSession,
  createAgent,
  getAllAgents,
  getSystemStats
} = require('../controllers/agentController');

// Public
router.post('/agent/login', agentLogin);

// Authenticated Agent
router.post('/agent/logout', agentAuth, agentLogout);
router.put('/agent/status', agentAuth, updateAgentStatus);

router.get('/agent/pending-transfers', agentAuth, getPendingTransfers);
router.post('/agent/accept-transfer/:transferId', agentAuth, acceptTransfer);
router.post('/agent/decline-transfer/:transferId', agentAuth, declineTransfer);

router.post('/agent/send-message', agentAuth, sendAgentMessage);
router.post('/agent/end-session', agentAuth, endAgentSession);

router.get('/agent/dashboard', agentAuth, getAgentDashboard);
router.get('/agent/performance', agentAuth, getAgentPerformance);

// Admin-ish (keep them here for now; ideally under separate admin router)
router.post('/agent/create', createAgent);
router.get('/agent/list', getAllAgents);
router.get('/agent/system-stats', getSystemStats);

module.exports = router;


