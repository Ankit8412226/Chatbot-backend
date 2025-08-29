const jwt = require('jsonwebtoken');

module.exports = function agentAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');

    if (!decoded || !decoded.agentId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.agent = { agentId: decoded.agentId, role: decoded.role, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: error.message });
  }
};


