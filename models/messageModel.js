const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "email",
      "linkedin",
      "cover_letter",
      "resume_summary",
      "interview_prep",
      "thank_you_note",
      "social_media_post",
      "product_description",
      "blog_outline",
      "meeting_agenda",
      "press_release",
      "text_rewrite"
    ],
    required: true
  },
  input: {
    type: Object,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

// Add index for better query performance
messageSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
