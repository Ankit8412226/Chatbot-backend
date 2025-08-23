const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error", err));

const Agent = require('../models/agentSchema');

// Sample agents data
const sampleAgents = [
  {
    employeeId: 'AG001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    password: 'password123',
    role: 'senior_agent',
    department: 'technical',
    skills: [
      { service: 'web_development', proficiency: 'expert' },
      { service: 'mobile_development', proficiency: 'advanced' },
      { service: 'cloud_solutions', proficiency: 'intermediate' }
    ],
    languages: ['English', 'Spanish'],
    status: 'online',
    isAvailable: true,
    maxConcurrentChats: 4
  },
  {
    employeeId: 'AG002',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    password: 'password123',
    role: 'agent',
    department: 'technical',
    skills: [
      { service: 'cybersecurity', proficiency: 'expert' },
      { service: 'data_analytics', proficiency: 'advanced' },
      { service: 'web_development', proficiency: 'intermediate' }
    ],
    languages: ['English', 'Mandarin'],
    status: 'online',
    isAvailable: true,
    maxConcurrentChats: 3
  },
  {
    employeeId: 'AG003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    password: 'password123',
    role: 'agent',
    department: 'marketing',
    skills: [
      { service: 'digital_marketing', proficiency: 'expert' },
      { service: 'ui_ux_design', proficiency: 'advanced' },
      { service: 'consulting', proficiency: 'intermediate' }
    ],
    languages: ['English', 'Spanish'],
    status: 'online',
    isAvailable: true,
    maxConcurrentChats: 3
  },
  {
    employeeId: 'AG004',
    name: 'David Kim',
    email: 'david.kim@company.com',
    password: 'password123',
    role: 'supervisor',
    department: 'general',
    skills: [
      { service: 'consulting', proficiency: 'expert' },
      { service: 'web_development', proficiency: 'advanced' },
      { service: 'digital_marketing', proficiency: 'advanced' },
      { service: 'cloud_solutions', proficiency: 'intermediate' }
    ],
    languages: ['English', 'Korean'],
    status: 'online',
    isAvailable: true,
    maxConcurrentChats: 5
  }
];

async function setupAgents() {
  try {
    console.log('🚀 Setting up human agents...');

    // Clear existing agents (optional - remove this if you want to keep existing agents)
    // await Agent.deleteMany({});
    // console.log('✅ Cleared existing agents');

    for (const agentData of sampleAgents) {
      // Check if agent already exists
      const existingAgent = await Agent.findOne({
        $or: [
          { employeeId: agentData.employeeId },
          { email: agentData.email }
        ]
      });

      if (existingAgent) {
        console.log(`⚠️  Agent ${agentData.name} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(agentData.password, 10);

      // Create agent
      const agent = new Agent({
        ...agentData,
        password: hashedPassword
      });

      await agent.save();
      console.log(`✅ Created agent: ${agentData.name} (${agentData.employeeId})`);
    }

    // Display summary
    const totalAgents = await Agent.countDocuments();
    const onlineAgents = await Agent.countDocuments({ status: 'online', isAvailable: true });

    console.log('\n📊 Agent Setup Summary:');
    console.log(`Total agents: ${totalAgents}`);
    console.log(`Online agents: ${onlineAgents}`);
    console.log('\n🎉 Human agent setup completed!');
    console.log('\n📝 Agent Login Credentials:');
    console.log('Email: agent-email@company.com');
    console.log('Password: password123');
    console.log('\n🔗 Your chatbot now supports human agent handoff!');

  } catch (error) {
    console.error('❌ Error setting up agents:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the setup
setupAgents();
