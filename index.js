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



app.use("/api/v1/support", chatbot);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
