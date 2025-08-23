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



app.use("/api/v1/support", chatbot);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
