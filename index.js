const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors"); // ✅ Import cors

dotenv.config();
const app = express();

// ✅ Enable CORS for all origins
app.use(cors());

// Middleware
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error", err));


const chatbot = require("./routes/supportRoutes");
const agentRoutes = require("./routes/agentRoutes");
const companyRoutes = require("./routes/companyRoutes");

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Backend is running fine!"
  });
});

// Agent dashboard route
app.get("/agent-dashboard", (req, res) => {
  res.sendFile(__dirname + '/public/agent-dashboard.html');
});

// Main landing page route
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Company dashboard route
app.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + '/public/dashboard.html');
});

// Integration example route
app.get("/integration-example", (req, res) => {
  res.sendFile(__dirname + '/public/integration-example.html');
});

// Chat test route
app.get("/chat-test", (req, res) => {
  res.sendFile(__dirname + '/public/chat-test.html');
});

// Support test route
app.get("/support-test", (req, res) => {
  res.sendFile(__dirname + '/public/support-test.html');
});

app.use("/api/v1/support", chatbot);
app.use("/api/v1/company", companyRoutes);
app.use("/api/v1/agents", agentRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Initialize WebSocket server
try {
  const realTimeService = require('./services/realTimeService');
  realTimeService.initialize(server);
} catch (e) {
  console.error('Failed to initialize WebSocket service:', e);
}
