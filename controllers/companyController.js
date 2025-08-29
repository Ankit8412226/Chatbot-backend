const Company = require('../models/companySchema');
const Agent = require('../models/agentSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const moment = require('moment');

// Company Registration
const registerCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      website,
      industry,
      size,
      timezone,
      address,
      adminName,
      adminEmail,
      adminPassword
    } = req.body;

    // Validation
    if (!name || !email || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({
      $or: [{ email }, { slug: name.toLowerCase().replace(/\s+/g, '-') }]
    });

    if (existingCompany) {
      return res.status(400).json({
        error: 'Company with this email or name already exists'
      });
    }

    // Create company slug
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create company
    const company = new Company({
      name,
      slug,
      email,
      phone,
      website,
      industry,
      size,
      timezone,
      address,
      adminUser: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword
      }
    });

    await company.save();

    // Generate admin JWT token
    const token = jwt.sign(
      {
        companyId: company._id,
        email: adminEmail,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Company registered successfully',
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
        email: company.email,
        subscription: company.subscription,
        limits: company.limits
      },
      token
    });

  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({
      error: 'Failed to register company',
      message: error.message
    });
  }
};

// Company Login
const companyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find company by admin email
    const company = await Company.findOne({
      'adminUser.email': email,
      status: 'active'
    });

    if (!company) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, company.adminUser.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check subscription status
    if (!company.isSubscriptionActive()) {
      return res.status(403).json({
        error: 'Subscription is not active',
        subscription: company.subscription
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        companyId: company._id,
        email: company.adminUser.email,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
        email: company.email,
        subscription: company.subscription,
        limits: company.limits,
        usage: company.usage
      },
      token
    });

  } catch (error) {
    console.error('Company login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
};

// Get Company Dashboard
const getCompanyDashboard = async (req, res) => {
  try {
    const { companyId } = req.company;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        error: 'Company not found'
      });
    }

    // Get agents count
    const agentsCount = await Agent.countDocuments({ companyId });

    // Get recent tickets
    const SupportTicket = require('../models/supportTicketSchema');
    const recentTickets = await SupportTicket.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get subscription plans
    const plans = Company.getSubscriptionPlans();

    res.status(200).json({
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
        email: company.email,
        subscription: company.subscription,
        limits: company.limits,
        usage: company.usage,
        settings: company.settings
      },
      stats: {
        agentsCount,
        recentTickets: recentTickets.length,
        monthlyChats: company.usage.monthlyChats,
        apiCalls: company.usage.apiCalls
      },
      plans
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get dashboard',
      message: error.message
    });
  }
};

// Update Company Settings
const updateCompanySettings = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { settings } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        error: 'Company not found'
      });
    }

    // Update settings
    if (settings) {
      company.settings = { ...company.settings, ...settings };
    }

    await company.save();

    res.status(200).json({
      message: 'Settings updated successfully',
      settings: company.settings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      error: 'Failed to update settings',
      message: error.message
    });
  }
};

// Generate API Key
const generateApiKey = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { name, permissions } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'API key name is required'
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        error: 'Company not found'
      });
    }

    const apiKey = await company.generateApiKey(name, permissions || ['read']);

    res.status(200).json({
      message: 'API key generated successfully',
      apiKey,
      name,
      permissions: permissions || ['read']
    });

  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({
      error: 'Failed to generate API key',
      message: error.message
    });
  }
};

// List API Keys
const listApiKeys = async (req, res) => {
  try {
    const { companyId } = req.company;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        error: 'Company not found'
      });
    }

    const apiKeys = company.apiKeys.map(key => ({
      id: key._id,
      name: key.name,
      permissions: key.permissions,
      isActive: key.isActive,
      lastUsed: key.lastUsed,
      createdAt: key.createdAt
    }));

    res.status(200).json({
      apiKeys
    });

  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({
      error: 'Failed to list API keys',
      message: error.message
    });
  }
};

// Revoke API Key
const revokeApiKey = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { keyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        error: 'Company not found'
      });
    }

    await company.revokeApiKey(keyId);

    res.status(200).json({
      message: 'API key revoked successfully'
    });

  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({
      error: 'Failed to revoke API key',
      message: error.message
    });
  }
};

// Get Subscription Plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = Company.getSubscriptionPlans();

    res.status(200).json({
      plans
    });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      error: 'Failed to get subscription plans',
      message: error.message
    });
  }
};

// Create Stripe Checkout Session
const createCheckoutSession = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { plan } = req.body;

    if (!plan || !['starter', 'professional', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        error: 'Valid plan is required'
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        error: 'Company not found'
      });
    }

    const plans = Company.getSubscriptionPlans();
    const selectedPlan = plans[plan];

    // Create Stripe customer if not exists
    let stripeCustomerId = company.subscription.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: company.email,
        name: company.name,
        metadata: {
          companyId: company._id.toString()
        }
      });
      stripeCustomerId = customer.id;
      company.subscription.stripeCustomerId = stripeCustomerId;
      await company.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: `${selectedPlan.agents} agents, ${selectedPlan.monthlyChats} chats/month`
            },
            unit_amount: selectedPlan.price * 100, // Stripe expects cents
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        companyId: company._id.toString(),
        plan
      }
    });

    res.status(200).json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
};

// Webhook handler for Stripe events
const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).json({
        error: 'Webhook signature verification failed'
      });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await handlePaymentFailed(failedInvoice);
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      error: 'Webhook processing failed'
    });
  }
};

// Helper functions for webhook handlers
const handleCheckoutCompleted = async (session) => {
  const { companyId, plan } = session.metadata;
  const company = await Company.findById(companyId);

  if (company) {
    const plans = Company.getSubscriptionPlans();
    const selectedPlan = plans[plan];

    company.subscription.plan = plan;
    company.subscription.status = 'active';
    company.subscription.stripeSubscriptionId = session.subscription;
    company.subscription.currentPeriodStart = new Date(session.subscription.current_period_start * 1000);
    company.subscription.currentPeriodEnd = new Date(session.subscription.current_period_end * 1000);

    // Update limits based on plan
    company.limits = {
      agents: selectedPlan.agents,
      monthlyChats: selectedPlan.monthlyChats,
      apiCalls: selectedPlan.apiCalls,
      storage: selectedPlan.storage
    };

    await company.save();
  }
};

const handlePaymentSucceeded = async (invoice) => {
  const company = await Company.findOne({
    'subscription.stripeSubscriptionId': invoice.subscription
  });

  if (company) {
    company.subscription.status = 'active';
    company.subscription.currentPeriodStart = new Date(invoice.period_start * 1000);
    company.subscription.currentPeriodEnd = new Date(invoice.period_end * 1000);
    await company.save();
  }
};

const handlePaymentFailed = async (invoice) => {
  const company = await Company.findOne({
    'subscription.stripeSubscriptionId': invoice.subscription
  });

  if (company) {
    company.subscription.status = 'past_due';
    await company.save();
  }
};

const handleSubscriptionDeleted = async (subscription) => {
  const company = await Company.findOne({
    'subscription.stripeSubscriptionId': subscription.id
  });

  if (company) {
    company.subscription.status = 'canceled';
    await company.save();
  }
};

module.exports = {
  registerCompany,
  companyLogin,
  getCompanyDashboard,
  updateCompanySettings,
  generateApiKey,
  listApiKeys,
  revokeApiKey,
  getSubscriptionPlans,
  createCheckoutSession,
  handleStripeWebhook
};
