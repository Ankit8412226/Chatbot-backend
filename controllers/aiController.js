const Message = require("../models/messageModel");

// Debug: Check if API key is loaded
console.log("SambaNova API Key loaded:", process.env.SAMBANOVA_API_KEY ? "✅ Yes" : "❌ No");
console.log("API Key starts with:", process.env.SAMBANOVA_API_KEY?.substring(0, 10));

// Helper function to make API calls
const callSambaNova = async (prompt, maxTokens = 1000, temperature = 0.7) => {
  const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SAMBANOVA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "Llama-4-Maverick-17B-128E-Instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            }
          ]
        }
      ],
      stream: false,
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// Generate Email
const generateEmail = async (req, res) => {
  const { purpose, details, tone } = req.body;

  const prompt = `Write a professional email with:
- Purpose: ${purpose}
- Details: ${details}
- Tone: ${tone || "formal"}
Include subject line and closing.`;

  try {
    console.log("Making request to SambaNova API...");
    const email = await callSambaNova(prompt, 1000);

    const saved = await Message.create({
      type: "email",
      input: { purpose, details, tone },
      output: email,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Email generation failed:", err.message);
    handleAPIError(err, res, "Email generation failed");
  }
};

// Generate LinkedIn Message
const generateLinkedInMessage = async (req, res) => {
  const { targetRole, intent, name } = req.body;

  const prompt = `Write a LinkedIn message to ${name || "someone"}:
- Intent: ${intent}
- Role: ${targetRole}
Keep it short, polite, and professional.`;

  try {
    const message = await callSambaNova(prompt, 500);

    const saved = await Message.create({
      type: "linkedin",
      input: { targetRole, intent, name },
      output: message,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("LinkedIn message generation failed:", err.message);
    handleAPIError(err, res, "LinkedIn message generation failed");
  }
};

// Generate Cover Letter
const generateCoverLetter = async (req, res) => {
  const { jobTitle, companyName, skills, experience, requirements } = req.body;

  const prompt = `Write a professional cover letter for:
- Job Title: ${jobTitle}
- Company: ${companyName}
- Key Skills: ${skills}
- Experience: ${experience}
- Job Requirements: ${requirements}
Make it compelling and tailored to the role.`;

  try {
    const coverLetter = await callSambaNova(prompt, 1500);

    const saved = await Message.create({
      type: "cover_letter",
      input: { jobTitle, companyName, skills, experience, requirements },
      output: coverLetter,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Cover letter generation failed:", err.message);
    handleAPIError(err, res, "Cover letter generation failed");
  }
};

// Generate Resume Summary
const generateResumeSummary = async (req, res) => {
  const { profession, experience, skills, achievements } = req.body;

  const prompt = `Write a compelling resume summary for:
- Profession: ${profession}
- Years of Experience: ${experience}
- Key Skills: ${skills}
- Notable Achievements: ${achievements}
Keep it concise, impactful, and ATS-friendly.`;

  try {
    const summary = await callSambaNova(prompt, 800);

    const saved = await Message.create({
      type: "resume_summary",
      input: { profession, experience, skills, achievements },
      output: summary,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Resume summary generation failed:", err.message);
    handleAPIError(err, res, "Resume summary generation failed");
  }
};

// Generate Job Interview Preparation
const generateInterviewPrep = async (req, res) => {
  const { jobTitle, companyName, interviewType, experience } = req.body;

  const prompt = `Generate interview preparation material for:
- Job Title: ${jobTitle}
- Company: ${companyName}
- Interview Type: ${interviewType}
- Candidate Experience: ${experience}

Include:
1. 5 likely interview questions
2. Sample answers framework
3. Questions to ask the interviewer
4. Key points to highlight`;

  try {
    const interviewPrep = await callSambaNova(prompt, 1500);

    const saved = await Message.create({
      type: "interview_prep",
      input: { jobTitle, companyName, interviewType, experience },
      output: interviewPrep,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Interview prep generation failed:", err.message);
    handleAPIError(err, res, "Interview prep generation failed");
  }
};

// Generate Thank You Note
const generateThankYouNote = async (req, res) => {
  const { recipientName, occasion, personalDetails, tone } = req.body;

  const prompt = `Write a ${tone || "professional"} thank you note:
- To: ${recipientName}
- Occasion: ${occasion}
- Personal Details: ${personalDetails}
Make it sincere and appropriate for the context.`;

  try {
    const thankYouNote = await callSambaNova(prompt, 600);

    const saved = await Message.create({
      type: "thank_you_note",
      input: { recipientName, occasion, personalDetails, tone },
      output: thankYouNote,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Thank you note generation failed:", err.message);
    handleAPIError(err, res, "Thank you note generation failed");
  }
};

// Generate Social Media Post
const generateSocialMediaPost = async (req, res) => {
  const { platform, topic, tone, hashtags, callToAction } = req.body;

  const prompt = `Create a ${platform} post about:
- Topic: ${topic}
- Tone: ${tone}
- Include hashtags: ${hashtags}
- Call to action: ${callToAction}
Make it engaging and platform-appropriate.`;

  try {
    const post = await callSambaNova(prompt, 500);

    const saved = await Message.create({
      type: "social_media_post",
      input: { platform, topic, tone, hashtags, callToAction },
      output: post,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Social media post generation failed:", err.message);
    handleAPIError(err, res, "Social media post generation failed");
  }
};

// Generate Product Description
const generateProductDescription = async (req, res) => {
  const { productName, features, benefits, targetAudience, tone } = req.body;

  const prompt = `Write a compelling product description for:
- Product: ${productName}
- Key Features: ${features}
- Benefits: ${benefits}
- Target Audience: ${targetAudience}
- Tone: ${tone || "persuasive"}
Make it conversion-focused and engaging.`;

  try {
    const description = await callSambaNova(prompt, 800);

    const saved = await Message.create({
      type: "product_description",
      input: { productName, features, benefits, targetAudience, tone },
      output: description,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Product description generation failed:", err.message);
    handleAPIError(err, res, "Product description generation failed");
  }
};

// Generate Blog Post Outline
const generateBlogOutline = async (req, res) => {
  const { topic, targetAudience, keywords, postLength } = req.body;

  const prompt = `Create a detailed blog post outline for:
- Topic: ${topic}
- Target Audience: ${targetAudience}
- SEO Keywords: ${keywords}
- Estimated Length: ${postLength} words

Include:
1. Compelling headline
2. Introduction hook
3. Main sections with subheadings
4. Key points for each section
5. Conclusion and call-to-action`;

  try {
    const outline = await callSambaNova(prompt, 1200);

    const saved = await Message.create({
      type: "blog_outline",
      input: { topic, targetAudience, keywords, postLength },
      output: outline,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Blog outline generation failed:", err.message);
    handleAPIError(err, res, "Blog outline generation failed");
  }
};

// Generate Meeting Agenda
const generateMeetingAgenda = async (req, res) => {
  const { meetingTitle, attendees, duration, objectives, topics } = req.body;

  const prompt = `Create a professional meeting agenda for:
- Meeting: ${meetingTitle}
- Attendees: ${attendees}
- Duration: ${duration}
- Objectives: ${objectives}
- Topics to Cover: ${topics}

Include time allocations and action items template.`;

  try {
    const agenda = await callSambaNova(prompt, 1000);

    const saved = await Message.create({
      type: "meeting_agenda",
      input: { meetingTitle, attendees, duration, objectives, topics },
      output: agenda,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Meeting agenda generation failed:", err.message);
    handleAPIError(err, res, "Meeting agenda generation failed");
  }
};

// Generate Press Release
const generatePressRelease = async (req, res) => {
  const { headline, companyName, announcement, quote, contactInfo } = req.body;

  const prompt = `Write a professional press release:
- Headline: ${headline}
- Company: ${companyName}
- Announcement: ${announcement}
- Key Quote: ${quote}
- Contact: ${contactInfo}

Follow standard press release format with dateline, body, and boilerplate.`;

  try {
    const pressRelease = await callSambaNova(prompt, 1200);

    const saved = await Message.create({
      type: "press_release",
      input: { headline, companyName, announcement, quote, contactInfo },
      output: pressRelease,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Press release generation failed:", err.message);
    handleAPIError(err, res, "Press release generation failed");
  }
};

// Rewrite/Improve Text
const rewriteText = async (req, res) => {
  const { originalText, style, purpose, tone } = req.body;

  const prompt = `Rewrite the following text:
Original: "${originalText}"

Requirements:
- Style: ${style}
- Purpose: ${purpose}
- Tone: ${tone}

Make it more engaging, clear, and effective.`;

  try {
    const rewrittenText = await callSambaNova(prompt, 1000);

    const saved = await Message.create({
      type: "text_rewrite",
      input: { originalText, style, purpose, tone },
      output: rewrittenText,
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error("Text rewrite failed:", err.message);
    handleAPIError(err, res, "Text rewrite failed");
  }
};

// Get all messages (history)
const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Get messages by type
const getMessagesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const messages = await Message.find({ type }).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages by type" });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndDelete(id);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message" });
  }
};

// Get message statistics
const getMessageStats = async (req, res) => {
  try {
    const stats = await Message.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          latestDate: { $max: "$createdAt" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalMessages = await Message.countDocuments();

    res.status(200).json({
      totalMessages,
      messagesByType: stats
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

// Error handling helper
const handleAPIError = (err, res, defaultMessage) => {
  if (err.message.includes('401')) {
    res.status(401).json({ error: "Invalid API key. Please check your SambaNova API key." });
  } else if (err.message.includes('429')) {
    res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
  } else if (err.message.includes('400')) {
    res.status(400).json({ error: "Bad request. Please check your input parameters." });
  } else {
    res.status(500).json({ error: defaultMessage, details: err.message });
  }
};

module.exports = {
  generateEmail,
  generateLinkedInMessage,
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
  getAllMessages,
  getMessagesByType,
  deleteMessage,
  getMessageStats,
};
