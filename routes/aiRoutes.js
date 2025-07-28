const express = require("express");
const router = express.Router();

const {
  // Original functions
  generateEmail,
  generateLinkedInMessage,
  getAllMessages,

  // New content generation functions
  generateCoverLetter,
  generateResumeSummary,
  generateInterviewPrep,
  generateThankYouNote,
  generateSocialMediaPost,
  generateProductDescription,
  generateBlogOutline,
  generateMeetingAgenda,
  generatePressRelease,
  rewriteText,

  // New utility functions
  getMessagesByType,
  deleteMessage,
  getMessageStats,
  interactWithAgent,
} = require("../controllers/aiController");

// ========== ORIGINAL ROUTES ==========
router.post("/generate-email", generateEmail);
router.post("/generate-linkedin", generateLinkedInMessage);
router.get("/history", getAllMessages);

// ========== CAREER & PROFESSIONAL ROUTES ==========
router.post("/generate-cover-letter", generateCoverLetter);
router.post("/generate-resume-summary", generateResumeSummary);
router.post("/generate-interview-prep", generateInterviewPrep);
router.post("/generate-thank-you", generateThankYouNote);

// ========== MARKETING & CONTENT ROUTES ==========
router.post("/generate-social-post", generateSocialMediaPost);
router.post("/generate-product-description", generateProductDescription);
router.post("/generate-blog-outline", generateBlogOutline);
router.post("/generate-press-release", generatePressRelease);

// ========== BUSINESS & COMMUNICATION ROUTES ==========
router.post("/generate-meeting-agenda", generateMeetingAgenda);
router.post("/rewrite-text", rewriteText);

// ========== MESSAGE MANAGEMENT ROUTES ==========
router.get("/messages/type/:type", getMessagesByType);
router.delete("/messages/:id", deleteMessage);
router.get("/stats", getMessageStats);


router.post('/agent', interactWithAgent);

// ========== HEALTH CHECK ROUTE ==========
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "AI Service is running",
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      "POST /generate-email",
      "POST /generate-linkedin",
      "POST /generate-cover-letter",
      "POST /generate-resume-summary",
      "POST /generate-interview-prep",
      "POST /generate-thank-you",
      "POST /generate-social-post",
      "POST /generate-product-description",
      "POST /generate-blog-outline",
      "POST /generate-meeting-agenda",
      "POST /generate-press-release",
      "POST /rewrite-text",
      "GET /history",
      "GET /messages/type/:type",
      "DELETE /messages/:id",
      "GET /stats"
    ]
  });
});

module.exports = router;
