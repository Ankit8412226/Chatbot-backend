import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { loadEnv } from './config/env.js';
import { errorHandler } from './utils/error.js';
import { globalRateLimit } from './utils/rateLimit.js';

// Route imports
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import kbRoutes from './routes/kbRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import handoffService from './services/handoff.js';

// Load environment variables
loadEnv();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(globalRateLimit);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/webhook', webhookRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-tenant', (tenantId) => {
    socket.join(`tenant-${tenantId}`);
    console.log(`Socket ${socket.id} joined tenant ${tenantId}`);
  });

  socket.on('agent-online', (data) => {
    socket.join(`agent-${data.agentId}`);
    socket.to(`tenant-${data.tenantId}`).emit('agent-status', {
      agentId: data.agentId,
      status: 'online'
    });
  });

  socket.on('agent-offline', (data) => {
    socket.leave(`agent-${data.agentId}`);
    socket.to(`tenant-${data.tenantId}`).emit('agent-status', {
      agentId: data.agentId,
      status: 'offline'
    });
  });

  socket.on('chat-message', (data) => {
    socket.to(`conversation-${data.conversationId}`).emit('new-message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);
// Inject io into services that need it
handoffService.setSocketIO(io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;
