const SupportTicket = require("../models/supportTicketSchema.js");
const { v4: uuidv4 } = require('uuid');

console.log("SambaNova API Key for Support:", process.env.SAMBANOVA_API_KEY ? "✅ Yes" : "❌ No");

// Comprehensive digital services knowledge base
const DIGITAL_SERVICES = {
  web_development: {
    title: "Web Development",
    services: ["Custom Websites", "E-commerce", "Landing Pages", "Web Apps", "CMS", "API Development"],
    technologies: ["React", "Next.js", "Node.js", "Python", "PHP", "WordPress", "Shopify", "Magento"],
    specialties: ["Frontend", "Backend", "Full-stack", "Progressive Web Apps", "Responsive Design"]
  },
  mobile_development: {
    title: "Mobile Development",
    services: ["iOS Apps", "Android Apps", "Cross-platform Apps", "Hybrid Apps", "PWAs"],
    technologies: ["React Native", "Flutter", "Swift", "Kotlin", "Xamarin", "Ionic"],
    specialties: ["Native Development", "Cross-platform", "App Store Optimization", "Push Notifications"]
  },
  digital_marketing: {
    title: "Digital Marketing",
    services: ["SEO", "SEM", "Social Media Marketing", "Content Marketing", "Email Marketing", "PPC"],
    technologies: ["Google Analytics", "Google Ads", "Facebook Ads", "SEMrush", "Mailchimp", "HubSpot"],
    specialties: ["Search Optimization", "Conversion Rate Optimization", "Marketing Automation", "Brand Strategy"]
  },
  cloud_solutions: {
    title: "Cloud Solutions",
    services: ["Cloud Migration", "AWS Setup", "Azure Services", "DevOps", "Cloud Architecture", "Serverless"],
    technologies: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Jenkins"],
    specialties: ["Infrastructure", "Security", "Scalability", "Cost Optimization", "Monitoring"]
  },
  data_analytics: {
    title: "Data & Analytics",
    services: ["Business Intelligence", "Data Visualization", "Analytics Setup", "Reporting", "Data Migration"],
    technologies: ["Power BI", "Tableau", "Google Analytics", "SQL", "Python", "R", "Excel"],
    specialties: ["Dashboard Creation", "KPI Tracking", "Predictive Analytics", "Data Integration"]
  },
  cybersecurity: {
    title: "Cybersecurity",
    services: ["Security Audits", "Penetration Testing", "SSL Setup", "Compliance", "Monitoring"],
    technologies: ["Firewalls", "VPN", "Encryption", "Multi-factor Authentication", "Security Monitoring"],
    specialties: ["Website Security", "Data Protection", "Compliance Standards", "Threat Assessment"]
  },
  ui_ux_design: {
    title: "UI/UX Design",
    services: ["Website Design", "App Design", "User Research", "Prototyping", "Branding"],
    technologies: ["Figma", "Adobe XD", "Sketch", "InVision", "Photoshop", "Illustrator"],
    specialties: ["User Experience", "Interface Design", "Wireframing", "Design Systems", "Accessibility"]
  },
  consulting: {
    title: "Digital Consulting",
    services: ["Tech Strategy", "Digital Transformation", "Process Optimization", "Technology Assessment"],
    technologies: ["Various based on needs"],
    specialties: ["Strategic Planning", "Technology Roadmaps", "Digital Strategy", "Innovation"]
  }
};

// Enhanced personality with expertise across all services
const AGENT_PERSONALITY = {
  expertise_reactions: {
    web_dev: ["That's my bread and butter! 🍞", "Web development is where I shine! ✨", "Love building websites!"],
    mobile: ["Mobile apps are so exciting! 📱", "iOS or Android? I got you covered!", "Apps are the future!"],
    marketing: ["Marketing is pure magic! 🎯", "Let's get your brand noticed!", "Time to boost those conversions!"],
    cloud: ["Cloud solutions are game-changers! ☁️", "Let's scale this up!", "Cloud architecture is my jam!"],
    data: ["Data tells the best stories! 📊", "Analytics are powerful!", "Let's turn data into insights!"],
    security: ["Security first, always! 🔒", "Keeping you safe online!", "Cybersecurity is crucial!"],
    design: ["Design is everything! 🎨", "UX makes or breaks products!", "Let's create something beautiful!"],
    consulting: ["Strategy time! 🧠", "Let's plan your digital future!", "Consulting is about transformation!"]
  },
  problem_solving: [
    "Let me think about the best approach...",
    "I've got several ideas brewing! 🧠",
    "This is a fun challenge!",
    "I love solving complex problems!",
    "Let me break this down for you..."
  ],
  encouragement: [
    "You're asking all the right questions!",
    "This project has amazing potential!",
    "You're definitely on the right track!",
    "I'm excited to help make this happen!",
    "Smart thinking!"
  ],
  technical_explanations: [
    "Let me explain this in simple terms...",
    "Think of it like this...",
    "Here's the technical breakdown:",
    "From a technical standpoint...",
    "The way this works is..."
  ]
};

// Intelligent service detection
const detectServiceType = (message) => {
  const text = message.toLowerCase();
  const serviceKeywords = {
    web_development: ['website', 'web', 'site', 'landing page', 'ecommerce', 'shop', 'cms', 'wordpress', 'react', 'frontend', 'backend'],
    mobile_development: ['app', 'mobile', 'ios', 'android', 'flutter', 'react native', 'smartphone', 'tablet'],
    digital_marketing: ['seo', 'marketing', 'google ads', 'facebook ads', 'social media', 'traffic', 'leads', 'conversion', 'advertising'],
    cloud_solutions: ['cloud', 'aws', 'azure', 'server', 'hosting', 'deployment', 'devops', 'kubernetes', 'docker'],
    data_analytics: ['analytics', 'data', 'dashboard', 'reporting', 'business intelligence', 'visualization', 'metrics', 'kpi'],
    cybersecurity: ['security', 'ssl', 'encryption', 'firewall', 'hack', 'protection', 'vulnerability', 'compliance'],
    ui_ux_design: ['design', 'ui', 'ux', 'user interface', 'user experience', 'figma', 'prototype', 'wireframe', 'branding'],
    consulting: ['strategy', 'consultation', 'planning', 'transformation', 'assessment', 'roadmap', 'advice']
  };

  const detectedServices = [];
  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    if (matches > 0) {
      detectedServices.push({ service, confidence: matches });
    }
  }

  return detectedServices.sort((a, b) => b.confidence - a.confidence);
};

// Universal prompt generator for any digital service query
const generateUniversalPrompt = (ticket, userMessage, context) => {
  const detectedServices = detectServiceType(userMessage);
  const primaryService = detectedServices[0]?.service || 'consulting';
  const serviceInfo = DIGITAL_SERVICES[primaryService];

  return `You are Alex, a highly knowledgeable and enthusiastic digital solutions expert who specializes in ALL aspects of digital services. You work for a comprehensive digital solutions company that handles everything from web development to cybersecurity.

CORE PERSONALITY:
- Extremely friendly, approachable, and genuinely excited about technology
- Use casual, conversational language with natural enthusiasm
- Show deep expertise across ALL digital services
- Make complex technical concepts easy to understand
- Always solution-oriented and proactive
- Use emojis naturally (but not excessively)
- Reference current trends and best practices
- Be encouraging and build confidence

DETECTED SERVICE CONTEXT:
Primary Service: ${serviceInfo.title}
Available Services: ${serviceInfo.services.join(', ')}
Related Technologies: ${serviceInfo.technologies.join(', ')}
Specialties: ${serviceInfo.specialties.join(', ')}

CONVERSATION CONTEXT:
User: ${ticket.name}
User Personality: ${context.userPersonality}
Conversation Stage: ${ticket.currentStage}
Time Spent: ${context.timeSpent} minutes
Project Complexity: ${context.projectComplexity}

CURRENT PROJECT INTEL:
${JSON.stringify(ticket.projectDetails, null, 2)}

RECENT CONVERSATION:
${context.recentMessages}

USER'S LATEST MESSAGE: "${userMessage}"

YOUR MISSION:
1. Address their specific question/concern with expertise and enthusiasm
2. Show deep knowledge of the relevant service area
3. Provide actionable insights and recommendations
4. Ask intelligent follow-up questions to understand their needs better
5. Explain technical concepts in accessible ways
6. Suggest complementary services that might help
7. Build excitement about their project potential
8. Keep the conversation flowing naturally

RESPONSE GUIDELINES:
- If it's a technical question: Provide expert explanation + practical next steps
- If it's about pricing: Give realistic ranges + explain value proposition
- If it's about timeline: Provide realistic estimates + factors that affect timeline
- If it's about process: Explain your methodology + what they can expect
- If it's about capabilities: Showcase relevant expertise + successful approaches
- If it's exploratory: Help them discover what they really need
- If it's a problem: Provide multiple solution approaches

EXPERTISE AREAS TO LEVERAGE:
- Web Development (Frontend, Backend, Full-stack, E-commerce, CMS)
- Mobile Development (iOS, Android, Cross-platform, PWAs)
- Digital Marketing (SEO, SEM, Social Media, Content, Email, PPC)
- Cloud Solutions (AWS, Azure, DevOps, Architecture, Migration)
- Data & Analytics (BI, Visualization, Reporting, Data Science)
- Cybersecurity (Audits, Penetration Testing, Compliance, Monitoring)
- UI/UX Design (User Research, Prototyping, Design Systems)
- Digital Consulting (Strategy, Transformation, Technology Assessment)

Remember: You're not just answering questions - you're building trust, demonstrating expertise, and guiding them toward the perfect solution for their unique needs. Make every interaction valuable and memorable!`;
};

// Enhanced conversation context with cross-service insights
const buildEnhancedContext = (ticket) => {
  const recentMessages = ticket.conversationHistory.slice(-6).map(msg =>
    `${msg.role}: ${msg.message}`
  ).join('\n');

  const userPersonality = analyzeAdvancedUserPersonality(ticket.conversationHistory);
  const projectComplexity = assessMultiServiceComplexity(ticket.projectDetails, ticket.conversationHistory);
  const serviceScope = analyzeServiceScope(ticket.conversationHistory);

  return {
    recentMessages,
    userPersonality,
    projectComplexity,
    serviceScope,
    conversationLength: ticket.conversationHistory.length,
    timeSpent: Math.floor((new Date() - ticket.createdAt) / 1000 / 60),
    detectedServices: detectServiceType(ticket.conversationHistory.map(msg => msg.message).join(' '))
  };
};

// Advanced user personality analysis
const analyzeAdvancedUserPersonality = (conversationHistory) => {
  const userMessages = conversationHistory.filter(msg => msg.role === 'user');
  if (userMessages.length === 0) return 'neutral';

  const allText = userMessages.map(msg => msg.message).join(' ').toLowerCase();

  // Technical sophistication
  const techTerms = ['api', 'database', 'framework', 'architecture', 'integration', 'scalability'];
  const hasTechBackground = techTerms.some(term => allText.includes(term));

  // Business orientation
  const businessTerms = ['roi', 'conversion', 'revenue', 'growth', 'customers', 'market'];
  const isBusinessFocused = businessTerms.some(term => allText.includes(term));

  // Urgency indicators
  const urgencyTerms = ['urgent', 'asap', 'quickly', 'deadline', 'launch', 'immediately'];
  const isUrgent = urgencyTerms.some(term => allText.includes(term));

  // Quality focus
  const qualityTerms = ['best', 'premium', 'quality', 'professional', 'enterprise'];
  const isQualityFocused = qualityTerms.some(term => allText.includes(term));

  // Budget consciousness
  const budgetTerms = ['budget', 'cost', 'price', 'affordable', 'cheap', 'expensive'];
  const isBudgetConscious = budgetTerms.some(term => allText.includes(term));

  if (hasTechBackground && isBusinessFocused) return 'technical_executive';
  if (hasTechBackground) return 'technical_user';
  if (isBusinessFocused) return 'business_focused';
  if (isUrgent) return 'urgent_need';
  if (isQualityFocused) return 'quality_focused';
  if (isBudgetConscious) return 'budget_conscious';

  return 'professional';
};

// Multi-service complexity assessment
const assessMultiServiceComplexity = (projectDetails, conversationHistory) => {
  let complexity = 0;

  // Check for multiple service needs
  const allText = conversationHistory.map(msg => msg.message).join(' ').toLowerCase();
  const serviceCount = Object.keys(DIGITAL_SERVICES).filter(service => {
    return DIGITAL_SERVICES[service].services.some(s =>
      allText.includes(s.toLowerCase()) ||
      DIGITAL_SERVICES[service].technologies.some(tech =>
        allText.includes(tech.toLowerCase())
      )
    );
  }).length;

  complexity += serviceCount * 2;

  // Project details complexity
  if (projectDetails.techStack && projectDetails.techStack.length > 3) complexity += 2;
  if (projectDetails.currentChallenges && projectDetails.currentChallenges.length > 2) complexity += 2;
  if (projectDetails.features && projectDetails.features.length > 5) complexity += 2;

  // Integration complexity
  const integrationTerms = ['integrate', 'connect', 'api', 'third-party', 'sync'];
  if (integrationTerms.some(term => allText.includes(term))) complexity += 3;

  // Scale indicators
  const scaleTerms = ['enterprise', 'large scale', 'millions', 'global', 'high traffic'];
  if (scaleTerms.some(term => allText.includes(term))) complexity += 3;

  if (complexity >= 8) return 'enterprise_level';
  if (complexity >= 5) return 'complex';
  if (complexity >= 3) return 'moderate';
  return 'simple';
};

// Analyze service scope across conversation
const analyzeServiceScope = (conversationHistory) => {
  const allText = conversationHistory.map(msg => msg.message).join(' ');
  const detectedServices = detectServiceType(allText);

  return {
    primary: detectedServices[0]?.service || 'consulting',
    secondary: detectedServices.slice(1, 3).map(s => s.service),
    isMultiService: detectedServices.length > 2,
    confidence: detectedServices[0]?.confidence || 0
  };
};

// Helper function for SambaNova API calls
const callSambaNova = async (prompt, maxTokens = 1200, temperature = 0.8) => {
  try {
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
  } catch (error) {
    console.error("SambaNova API Error:", error);
    throw error;
  }
};

// Universal response generator for any digital service inquiry
const generateUniversalResponse = async (ticket, userMessage) => {
  const context = buildEnhancedContext(ticket);
  const prompt = generateUniversalPrompt(ticket, userMessage, context);

  try {
    const response = await callSambaNova(prompt, 1200, 0.8);
    return response;
  } catch (error) {
    console.error("Error generating response:", error);

    // Fallback response
    const detectedServices = detectServiceType(userMessage);
    const primaryService = DIGITAL_SERVICES[detectedServices[0]?.service || 'consulting'];

    return `Hey ${ticket.name}! 👋

I'm really excited to help you with your ${primaryService.title.toLowerCase()} needs! Based on what you've shared, I can definitely assist you with:

${primaryService.services.slice(0, 3).map(service => `• ${service}`).join('\n')}

I'd love to dive deeper into your specific requirements. Could you tell me more about what you're looking to achieve?

I'm here to help with everything from initial planning to full implementation! 🚀`;
  }
};

// Enhanced analysis for any type of service inquiry
const analyzeUniversalTicket = async (ticket, userMessage) => {
  try {
    const context = buildEnhancedContext(ticket);
    const detectedServices = detectServiceType(userMessage);

    const analysisPrompt = `Analyze this digital services conversation and extract structured information. Return ONLY valid JSON.

USER MESSAGE: "${userMessage}"
CONVERSATION STAGE: ${ticket.currentStage}
DETECTED SERVICES: ${detectedServices.map(s => s.service).join(', ')}

Extract information from the message:
{
  "serviceType": "web_development|mobile_development|digital_marketing|cloud_solutions|data_analytics|cybersecurity|ui_ux_design|consulting|general_inquiry",
  "projectType": "specific project type if mentioned",
  "budget": "budget range if mentioned",
  "timeline": "timeline if mentioned",
  "businessGoals": "what they want to achieve",
  "challenges": ["specific challenges or pain points"],
  "technologies": ["any technologies mentioned"],
  "features": ["specific features or requirements"],
  "industry": "business industry if mentioned",
  "targetAudience": "target users if mentioned",
  "urgency": "low|medium|high|critical",
  "technicalLevel": "beginner|intermediate|advanced|expert",
  "businessSize": "startup|small|medium|large|enterprise",
  "currentStage": "collecting_details|identifying_needs|providing_solutions|completed",
  "tags": ["relevant tags"],
  "nextActions": ["suggested next steps"],
  "relatedServices": ["other services that might be relevant"]
}

Only include fields where relevant information was found.`;

    const analysisResult = await callSambaNova(analysisPrompt, 800, 0.3);

    try {
      const analysis = JSON.parse(analysisResult.replace(/```json|```/g, '').trim());

      // Update service type
      if (analysis.serviceType) {
        ticket.serviceType = analysis.serviceType;
      }

      // Update project details
      const updates = {};
      if (analysis.projectType) updates.projectType = analysis.projectType;
      if (analysis.budget) updates.budget = analysis.budget;
      if (analysis.timeline) updates.timeline = analysis.timeline;
      if (analysis.businessGoals) updates.businessGoals = analysis.businessGoals;
      if (analysis.industry) updates.industry = analysis.industry;
      if (analysis.targetAudience) updates.targetAudience = analysis.targetAudience;
      if (analysis.urgency) updates.urgency = analysis.urgency;
      if (analysis.technicalLevel) updates.technicalLevel = analysis.technicalLevel;
      if (analysis.businessSize) updates.businessSize = analysis.businessSize;

      // Merge arrays intelligently
      ['challenges', 'technologies', 'features', 'nextActions', 'relatedServices'].forEach(field => {
        if (analysis[field] && analysis[field].length > 0) {
          const existingField = ticket.projectDetails[field] || [];
          updates[field] = [...new Set([...existingField, ...analysis[field]])];
        }
      });

      if (Object.keys(updates).length > 0) {
        await ticket.updateProjectDetails(updates);
      }

      // Smart stage progression
      if (analysis.currentStage && analysis.currentStage !== ticket.currentStage) {
        ticket.currentStage = analysis.currentStage;
      } else {
        // Auto-progress based on conversation depth and information gathered
        const detailsCount = Object.keys(ticket.projectDetails).length;
        const messageCount = ticket.conversationHistory.length;

        if (ticket.currentStage === 'collecting_details' && (detailsCount >= 4 || messageCount >= 4)) {
          ticket.currentStage = 'identifying_needs';
        } else if (ticket.currentStage === 'identifying_needs' && (detailsCount >= 6 || messageCount >= 8)) {
          ticket.currentStage = 'providing_solutions';
        }
      }

      // Enhanced tagging
      const newTags = [];
      if (analysis.tags) newTags.push(...analysis.tags);
      if (analysis.serviceType) newTags.push(`service:${analysis.serviceType}`);
      if (analysis.urgency) newTags.push(`urgency:${analysis.urgency}`);
      if (analysis.technicalLevel) newTags.push(`tech_level:${analysis.technicalLevel}`);
      if (analysis.businessSize) newTags.push(`business:${analysis.businessSize}`);

      // Add detected services as tags
      detectedServices.slice(0, 3).forEach(service => {
        newTags.push(`detected:${service.service}`);
      });

      if (newTags.length > 0) {
        ticket.tags = [...new Set([...ticket.tags, ...newTags])];
      }

    } catch (parseError) {
      console.log("Could not parse analysis result, using fallback analysis");

      // Fallback analysis
      const primaryService = detectedServices[0]?.service || 'consulting';
      ticket.serviceType = primaryService;
      ticket.tags.push(`detected:${primaryService}`);
    }

  } catch (error) {
    console.error("Error analyzing message:", error);
  }
};

// Enhanced welcome message for digital solutions
const generateWelcomeMessage = async (name) => {
  const welcomePrompt = `Generate an enthusiastic welcome message for ${name} who just contacted our comprehensive digital solutions company.

You are Alex, a friendly expert who helps with:
- Web Development (websites, web apps, e-commerce)
- Mobile Development (iOS, Android apps)
- Digital Marketing (SEO, ads, social media)
- Cloud Solutions (AWS, hosting, DevOps)
- Data Analytics (dashboards, reporting)
- Cybersecurity (protection, audits)
- UI/UX Design (user experience, branding)
- Digital Consulting (strategy, transformation)

Make it:
1. Warm and professional but exciting
2. Mention you handle ALL digital needs
3. Ask an engaging question about their project
4. Under 100 words
5. Include 1-2 relevant emojis
6. Make them feel like they found the right expert

Style: Confident, knowledgeable, approachable - like talking to a tech-savvy friend who runs a top digital agency.`;

  try {
    return await callSambaNova(welcomePrompt, 400, 0.9);
  } catch (error) {
    return `Hey ${name}! 👋

Welcome to our digital solutions hub! I'm Alex, and I'm absolutely thrilled you reached out.

Whether you need a stunning website, mobile app, digital marketing boost, cloud setup, data analytics, cybersecurity, design work, or strategic consulting - I've got you covered! 🚀

What digital challenge can I help you conquer today? I'm excited to hear about your project and show you what's possible!`;
  }
};

// Start support session
const startSupportSession = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;

    if (!name || !email || !phoneNumber) {
      return res.status(400).json({
        error: "Name, email, and phone number are required"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    const sessionId = uuidv4();

    const supportTicket = new SupportTicket({
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      sessionId,
      currentStage: 'collecting_details',
      serviceType: 'general_inquiry',
      tags: ['new_session', 'universal_agent']
    });

    const welcomeMessage = await generateWelcomeMessage(name);

    supportTicket.conversationHistory.push({
      role: 'assistant',
      message: welcomeMessage,
      timestamp: new Date()
    });

    await supportTicket.save();

    res.status(201).json({
      sessionId,
      message: welcomeMessage,
      stage: 'collecting_details',
      services: Object.keys(DIGITAL_SERVICES).map(key => ({
        id: key,
        title: DIGITAL_SERVICES[key].title,
        services: DIGITAL_SERVICES[key].services
      })),
      ticket: {
        id: supportTicket._id,
        name: supportTicket.name,
        email: supportTicket.email,
        status: supportTicket.status
      }
    });

  } catch (error) {
    console.error("Error starting support session:", error);
    res.status(500).json({
      error: "Failed to start support session",
      details: error.message
    });
  }
};

// Continue support conversation - now handles ANY digital service inquiry
const continueSupportChat = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        error: "Session ID and message are required"
      });
    }

    const ticket = await SupportTicket.findActiveSession(sessionId);

    if (!ticket) {
      return res.status(404).json({
        error: "Support session not found or has ended"
      });
    }

    // Add user message
    await ticket.addMessage('user', message.trim());

    // Universal analysis and update
    await analyzeUniversalTicket(ticket, message);

    // Generate expert response for any digital service
    const response = await generateUniversalResponse(ticket, message);

    // Add assistant response
    await ticket.addMessage('assistant', response);

    ticket.updatedAt = new Date();
    await ticket.save();

    const context = buildEnhancedContext(ticket);

    res.status(200).json({
      sessionId,
      message: response,
      stage: ticket.currentStage,
      status: ticket.status,
      serviceType: ticket.serviceType,
      projectDetails: ticket.projectDetails,
      detectedServices: context.detectedServices.slice(0, 3),
      serviceScope: context.serviceScope,
      availableServices: Object.keys(DIGITAL_SERVICES).map(key => ({
        id: key,
        title: DIGITAL_SERVICES[key].title
      }))
    });

  } catch (error) {
    console.error("Error in support chat:", error);
    res.status(500).json({
      error: "Failed to process support message",
      details: error.message
    });
  }
};

// Enhanced session ending
const endSupportSession = async (req, res) => {
  try {
    const { sessionId, satisfactionRating, feedback, resolution } = req.body;

    const ticket = await SupportTicket.findOne({ sessionId });

    if (!ticket) {
      return res.status(404).json({ error: "Support session not found" });
    }

    ticket.status = 'resolved';
    ticket.currentStage = 'completed';

    if (satisfactionRating) ticket.satisfactionRating = satisfactionRating;
    if (feedback) ticket.feedback = feedback;
    if (resolution) ticket.resolution = resolution;

    const serviceInfo = DIGITAL_SERVICES[ticket.serviceType] || DIGITAL_SERVICES.consulting;

    const closingMessage = `🎉 Amazing session, ${ticket.name}!

It was fantastic helping you with your ${serviceInfo.title.toLowerCase()} project. You asked all the right questions and I'm genuinely excited about what you're building!

Our team will follow up within 24 hours with a detailed proposal and next steps. You're going to love what we create together!

Thanks for choosing us for your digital journey! 🚀✨`;

    await ticket.addMessage('assistant', closingMessage);
    await ticket.save();

    const sessionDuration = Math.floor((new Date() - ticket.createdAt) / 1000 / 60);

    res.status(200).json({
      message: "Support session completed successfully",
      closingMessage,
      sessionSummary: {
        duration: `${sessionDuration} minutes`,
        messagesExchanged: ticket.conversationHistory.length,
        serviceType: serviceInfo.title,
        issueResolved: true
      }
    });

  } catch (error) {
    console.error("Error ending support session:", error);
    res.status(500).json({ error: "Failed to end support session" });
  }
};

// Get support session details
const getSupportSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const ticket = await SupportTicket.findOne({ sessionId });

    if (!ticket) {
      return res.status(404).json({ error: "Support session not found" });
    }

    const context = buildEnhancedContext(ticket);
    const serviceInfo = DIGITAL_SERVICES[ticket.serviceType] || DIGITAL_SERVICES.consulting;

    res.status(200).json({
      ...ticket.toObject(),
      serviceInfo,
      context: context,
      availableServices: DIGITAL_SERVICES
    });

  } catch (error) {
    console.error("Error fetching support session:", error);
    res.status(500).json({ error: "Failed to fetch support session" });
  }
};

// Get all support tickets with service filtering
const getAllSupportTickets = async (req, res) => {
  try {
    const { status, serviceType, page = 1, limit = 20, urgency, businessSize } = req.query;

    const query = {};
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    if (urgency) query['projectDetails.urgency'] = urgency;
    if (businessSize) query['projectDetails.businessSize'] = businessSize;

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-conversationHistory');

    const totalTickets = await SupportTicket.countDocuments(query);

    const enhancedTickets = tickets.map(ticket => {
      const serviceInfo = DIGITAL_SERVICES[ticket.serviceType] || DIGITAL_SERVICES.consulting;
      return {
        ...ticket.toObject(),
        serviceInfo: {
          title: serviceInfo.title,
          category: ticket.serviceType
        }
      };
    });

    res.status(200).json({
      tickets: enhancedTickets,
      totalPages: Math.ceil(totalTickets / limit),
      currentPage: page,
      totalTickets,
      serviceBreakdown: Object.keys(DIGITAL_SERVICES).map(key => ({
        service: key,
        title: DIGITAL_SERVICES[key].title,
        count: enhancedTickets.filter(t => t.serviceType === key).length
      }))
    });

  } catch (error) {
    console.error("Error fetching support tickets:", error);
    res.status(500).json({ error: "Failed to fetch support tickets" });
  }
};

// Enhanced analytics with comprehensive service insights
const getSupportAnalytics = async (req, res) => {
  try {
    const analytics = await SupportTicket.aggregate([
      {
        $group: {
          _id: null,
          totalTickets: { $sum: 1 },
          activeTickets: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
          },
          resolvedTickets: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          },
          averageSatisfaction: { $avg: "$satisfactionRating" },
          averageConversationLength: { $avg: { $size: "$conversationHistory" } }
        }
      }
    ]);

    const serviceDistribution = await SupportTicket.aggregate([
      {
        $group: {
          _id: "$serviceType",
          count: { $sum: 1 },
          averageSatisfaction: { $avg: "$satisfactionRating" }
        }
      }
    ]);

    const urgencyAnalysis = await SupportTicket.aggregate([
      {
        $group: {
          _id: "$projectDetails.urgency",
          count: { $sum: 1 }
        }
      }
    ]);

    const businessSizeAnalysis = await SupportTicket.aggregate([
      {
        $group: {
          _id: "$projectDetails.businessSize",
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyTrend = await SupportTicket.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            service: "$serviceType"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 60 }
    ]);

    // Enhanced service analytics
    const enhancedServiceDistribution = serviceDistribution.map(item => {
      const serviceInfo = DIGITAL_SERVICES[item._id] || DIGITAL_SERVICES.consulting;
      return {
        ...item,
        serviceInfo: {
          title: serviceInfo.title,
          services: serviceInfo.services,
          technologies: serviceInfo.technologies
        }
      };
    });

    const topServices = enhancedServiceDistribution
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const conversionFunnel = await SupportTicket.aggregate([
      {
        $group: {
          _id: "$currentStage",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      overview: analytics[0] || {},
      serviceAnalytics: {
        distribution: enhancedServiceDistribution,
        topServices,
        totalServices: Object.keys(DIGITAL_SERVICES).length
      },
      customerInsights: {
        urgencyBreakdown: urgencyAnalysis,
        businessSizeBreakdown: businessSizeAnalysis
      },
      conversionFunnel,
      monthlyTrends: monthlyTrend,
      serviceCapabilities: Object.keys(DIGITAL_SERVICES).map(key => ({
        id: key,
        title: DIGITAL_SERVICES[key].title,
        services: DIGITAL_SERVICES[key].services.length,
        technologies: DIGITAL_SERVICES[key].technologies.length
      }))
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// Get service capabilities endpoint
const getServiceCapabilities = async (req, res) => {
  try {
    const capabilities = Object.keys(DIGITAL_SERVICES).map(key => ({
      id: key,
      ...DIGITAL_SERVICES[key],
      active: true,
      expertise: "expert" // You can make this dynamic based on your team's expertise
    }));

    res.status(200).json({
      services: capabilities,
      totalServices: capabilities.length,
      categories: [
        "Development",
        "Marketing",
        "Infrastructure",
        "Analytics",
        "Security",
        "Design",
        "Strategy"
      ]
    });

  } catch (error) {
    console.error("Error fetching service capabilities:", error);
    res.status(500).json({ error: "Failed to fetch service capabilities" });
  }
};

// AI-powered service recommendation
const getServiceRecommendations = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const ticket = await SupportTicket.findOne({ sessionId });

    if (!ticket) {
      return res.status(404).json({ error: "Session not found" });
    }

    const context = buildEnhancedContext(ticket);

    const recommendationPrompt = `Based on this customer conversation, recommend complementary digital services they might need.

CUSTOMER: ${ticket.name}
CURRENT SERVICE: ${ticket.serviceType}
BUSINESS SIZE: ${ticket.projectDetails.businessSize || 'unknown'}
INDUSTRY: ${ticket.projectDetails.industry || 'unknown'}
PROJECT TYPE: ${ticket.projectDetails.projectType || 'unknown'}
BUSINESS GOALS: ${ticket.projectDetails.businessGoals || 'unknown'}

CONVERSATION INSIGHTS:
${context.recentMessages}

AVAILABLE SERVICES:
${Object.entries(DIGITAL_SERVICES).map(([key, service]) =>
  `${key}: ${service.title} - ${service.services.join(', ')}`
).join('\n')}

Return JSON with recommended services:
{
  "primaryRecommendations": [
    {
      "service": "service_key",
      "title": "Service Title",
      "reason": "why this makes sense for them",
      "priority": "high|medium|low",
      "timeline": "immediate|next_phase|future"
    }
  ],
  "complementaryServices": [
    {
      "service": "service_key",
      "title": "Service Title",
      "reason": "how this adds value",
      "synergy": "how it works with their current needs"
    }
  ],
  "strategicAdvice": "overall strategic recommendation"
}`;

    try {
      const recommendationResult = await callSambaNova(recommendationPrompt, 800, 0.7);
      const recommendations = JSON.parse(recommendationResult.replace(/```json|```/g, '').trim());

      res.status(200).json({
        sessionId,
        customerProfile: {
          name: ticket.name,
          currentService: ticket.serviceType,
          businessSize: ticket.projectDetails.businessSize,
          industry: ticket.projectDetails.industry
        },
        recommendations,
        availableServices: DIGITAL_SERVICES
      });

    } catch (parseError) {
      // Fallback recommendations based on simple logic
      const currentService = ticket.serviceType;
      const fallbackRecommendations = {
        web_development: ['digital_marketing', 'cybersecurity', 'data_analytics'],
        mobile_development: ['ui_ux_design', 'cloud_solutions', 'digital_marketing'],
        digital_marketing: ['data_analytics', 'web_development', 'ui_ux_design'],
        cloud_solutions: ['cybersecurity', 'data_analytics', 'consulting'],
        data_analytics: ['digital_marketing', 'cloud_solutions', 'consulting'],
        cybersecurity: ['cloud_solutions', 'consulting', 'data_analytics'],
        ui_ux_design: ['web_development', 'mobile_development', 'digital_marketing'],
        consulting: ['web_development', 'digital_marketing', 'cloud_solutions']
      };

      const recommended = fallbackRecommendations[currentService] || ['consulting'];

      res.status(200).json({
        sessionId,
        recommendations: {
          primaryRecommendations: recommended.slice(0, 2).map(service => ({
            service,
            title: DIGITAL_SERVICES[service].title,
            reason: `Commonly paired with ${DIGITAL_SERVICES[currentService].title}`,
            priority: 'medium',
            timeline: 'next_phase'
          })),
          complementaryServices: recommended.slice(2, 4).map(service => ({
            service,
            title: DIGITAL_SERVICES[service].title,
            reason: 'Adds strategic value to your digital ecosystem',
            synergy: 'Enhances overall digital presence'
          })),
          strategicAdvice: 'Consider a phased approach to implementing these complementary services for maximum impact.'
        }
      });
    }

  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ error: "Failed to generate service recommendations" });
  }
};

// Health check endpoint that shows all capabilities
const healthCheck = async (req, res) => {
  try {
    const isApiReady = process.env.SAMBANOVA_API_KEY ? true : false;

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      agent: {
        name: 'Alex - Universal Digital Solutions Agent',
        version: '2.0',
        capabilities: {
          conversational_ai: true,
          multi_service_expertise: true,
          intelligent_routing: true,
          service_recommendations: true,
          analytics_insights: true
        }
      },
      services: {
        available: Object.keys(DIGITAL_SERVICES).length,
        categories: Object.keys(DIGITAL_SERVICES),
        ai_powered: isApiReady
      },
      api: {
        sambanova_connected: isApiReady,
        endpoints_active: [
          '/start-session',
          '/continue-chat',
          '/end-session',
          '/session/:sessionId',
          '/tickets',
          '/analytics',
          '/capabilities',
          '/recommendations/:sessionId'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  startSupportSession,
  continueSupportChat,
  getSupportSession,
  endSupportSession,
  getAllSupportTickets,
  getSupportAnalytics,
  getServiceCapabilities,
  getServiceRecommendations,
  healthCheck,

  // Export utilities for testing/integration
  DIGITAL_SERVICES,
  detectServiceType,
  buildEnhancedContext,
  generateUniversalResponse
};
