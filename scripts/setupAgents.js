const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error", err));

const Agent = require('../models/agentSchema');

// Sample agents data (single demo agent)
const sampleAgents = [
  {
    employeeId: 'AGDEMO',
    name: 'Demo Agent',
    email: 'agent@demo.com',
    password: 'password123',
    role: 'agent',
    department: 'general',
    skills: [
      { service: 'consulting', proficiency: 'advanced' },
      { service: 'web_development', proficiency: 'intermediate' }
    ],
    languages: ['English'],
    status: 'online',
    isAvailable: true,
    maxConcurrentChats: 3
  }
];

async function setupAgents() {
  try {
    console.log('🚀 Setting up human agents...');

    // Clear existing agents
    await Agent.deleteMany({});
    console.log('✅ Cleared existing agents');

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

      // Create agent (password will be hashed by Mongoose pre-save hook)
      const agent = new Agent({
        ...agentData
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
    console.log('Email: agent@demo.com');
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
