# AI Agent Frontend – Full-Stack SaaS (Frontend + Backend)

A multi-tenant AI chatbot SaaS with knowledge base grounding, embeddable chat widget, human handoff to agents, API key management, subscriptions, and analytics.

## Monorepo Layout
```
ai-agent-frontend/
  backend/    // Node.js/Express API, MongoDB (Mongoose), Socket.IO, Stripe webhooks
  frontend/   // React (Vite) app with Tailwind UI, routing, and widget
  README.md
  test-suite.sh
```

## Features
- Multi-tenant auth (owners, admins, agents) with JWT
- API keys with permissions and usage tracking
- Knowledge base (Q&A) with simple embeddings and similarity search
- Chat API + embeddable widget (KB grounding + LLM)
- Human handoff (assign to agents, agent chat via Socket.IO)
- Tenant usage limits/rate limits
- Stripe subscriptions (checkout + webhook handlers)
- Analytics dashboard

## Quick Start
1) Install dependencies
```bash
# from repo root (recommended run per package)
cd backend && npm install && cd ../frontend && npm install
```

2) Configure environment
Create `backend/.env` with at least:
```bash
# backend/.env
PORT=5001
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/ai-agent-frontend
JWT_SECRET=change-me-please

# LLM (SambaNova-compatible; falls back to stub without a key)
SAMBANOVA_API_KEY=
LLM_BASE_URL=https://api.sambanova.ai/v1

# Optional Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PROFESSIONAL=price_xxx
STRIPE_PRICE_ENTERPRISE=price_xxx
```
Start a local MongoDB (choose one):
- Homebrew: `brew services start mongodb-community`
- Docker: `docker run -d -p 27017:27017 --name mongodb mongo:7`

3) Run the stack
```bash
# Terminal A
cd backend
npm run dev

# Terminal B
cd frontend
npm run dev
```
- Backend: http://localhost:5001
- Frontend: http://localhost:5173

---

## Backend
- Runtime: Node.js (ESM), Express, Mongoose, Socket.IO, Stripe
- Entry: `backend/src/index.js`
- Config: `backend/src/config/env.js` (loads `backend/.env`), `backend/src/config/db.js`

### Key Directories
- `routes/`
  - `authRoutes.js`: register/login/me, profile updates
  - `tenantRoutes.js`: tenant settings, analytics, team, billing checkout, subscription status
  - `apiKeyRoutes.js`: CRUD + usage for API keys
  - `kbRoutes.js`: KB CRUD + search (embeddings)
  - `chatRoutes.js`: chat start/message/history/end, handoff, agent endpoints
  - `webhookRoutes.js`: Stripe webhook handlers
- `models/`: `User.js`, `Tenant.js`, `Conversation.js`, `Message.js`, `KBItem.js`, `ApiKey.js`
- `services/`: `llmProvider.js`, `embedding.js`, `handoff.js`
- `middleware/`: `auth.js`, `tenant.js` (API key auth, permissions, usage limits)

### Chat and Handoff Flow
- Start conversation: `POST /api/chat/start` (X-API-Key)
- Send message: `POST /api/chat/message` (X-API-Key)
  - Detects handoff keywords; if enabled, attempts agent assignment
- Agent actions (JWT auth):
  - Accept handoff: `POST /api/chat/:conversationId/agent/accept`
  - Send message: `POST /api/chat/:conversationId/agent/message`
- History: `GET /api/chat/:sessionId/history`
- End conversation: `POST /api/chat/:sessionId/end`

### Subscriptions (Stripe)
- Create checkout session: `POST /api/tenant/billing/create-checkout-session`
- Subscription status: `GET /api/tenant/billing/subscription`
- Webhook: `POST /api/webhook/stripe` (configure Stripe endpoint to this route)

### Environment Variables (Backend)
- `PORT`: API port (default 3000; dev script uses 5001)
- `FRONTEND_URL`: CORS allow origin (e.g., http://localhost:5173)
- `MONGO_URI`: Mongo connection string
- `JWT_SECRET`: JWT signing secret
- `SAMBANOVA_API_KEY`, `LLM_BASE_URL`: optional LLM provider
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_*`: Stripe billing

### Scripts (Backend)
- `npm run dev`: start with nodemon on PORT=5001
- `npm start`: start Node (uses PORT or 3000)

---

## Frontend
- Stack: React 18, Vite, Tailwind, React Router
- Entry: `frontend/src/main.jsx`, `frontend/src/App.jsx`
- Public routes: `/` (Landing), `/login`, `/signup`
- App (protected): `/app`, `/dashboard`, `/api-keys`, `/knowledge-base`, `/prompt-tuner`, `/chat-tester`, `/handoff-center`

### Notable Pages
- `Landing.jsx`: marketing landing page
- `Dashboard.jsx`: usage, analytics, recent conversations, billing link
- `ApiKeys.jsx`: manage API keys
- `KnowledgeBase.jsx`: CRUD and search
- `ChatTester.jsx`: interact with the bot
- `HandoffCenter.jsx`: agents accept handoffs and reply to users

### Widget Usage
Use within your site/app:
```jsx
import ChatWidget from '@/components/ChatWidget.jsx';

<ChatWidget apiKey="YOUR_API_KEY" config={{ primaryColor: '#3B82F6' }} />
```
- Starts via `POST /api/chat/start`
- Sends user messages via `POST /api/chat/message`
- Reads history, handles errors, and displays responses

### Scripts (Frontend)
- `npm run dev`: Vite dev server
- `npm run build`: production build
- `npm run preview`: preview production build

---

## Testing
- Health check: `GET /api/health`
- Manual E2E: register → login → create API key → add KB items → Chat Tester → send "human" to trigger handoff → accept in Handoff Center → reply as agent.
- Hosted smoke-test script: `test-suite.sh` (targets a sample deployment); adapt endpoints if needed.

## Deployment
- Provide environment variables on your platform (Render, Railway, Fly, etc.)
- Point Stripe webhook to `/api/webhook/stripe`
- Serve the frontend build and set `FRONTEND_URL`

## Notes
- LLM and embeddings gracefully fall back to stubbed responses without API keys (for local dev).
- For production, replace stubbed embedding logic with a proper vector DB or embedding service.
