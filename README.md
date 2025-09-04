# SaaS Chatbot Platform – Full Stack MVP

A multi-tenant chatbot SaaS platform where users can sign up, create API keys, upload Q&A knowledge, configure prompts/personas, embed chat widgets, and enable human handoff.

## 🚀 Features

- **Multi-tenant Architecture**: Each user gets isolated data and API keys
- **Knowledge Base Management**: Upload and manage Q&A pairs
- **Customizable AI Personas**: Configure prompts for different industries
- **Embeddable Chat Widget**: Easy integration for any website
- **Human Handoff**: Seamless escalation to human agents
- **Real-time Chat**: Socket.IO for live agent communication
- **API Management**: Generate and manage API keys
- **Usage Analytics**: Track conversations and performance

## 🛠️ Tech Stack

- **Frontend**: Vite + React + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB + JWT
- **Real-time**: Socket.IO
- **LLM**: OpenAI-compatible API (SambaNova)
- **Database**: MongoDB with Mongoose

## 📦 Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and API keys
```

3. **Start development servers**:
```bash
npm run dev
```

4. **Access the application**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🔧 Configuration

Update `.env` with your credentials:
- MongoDB connection string
- SambaNova API key
- JWT secret
- Frontend URL for CORS

## 📚 Documentation

- See individual README files in `backend/` and `frontend/` directories
- API documentation available at `/api/docs` when running
- Integration examples in the dashboard

## 🚀 Deployment

The platform is ready for deployment to Vercel, Railway, or any Node.js hosting provider.