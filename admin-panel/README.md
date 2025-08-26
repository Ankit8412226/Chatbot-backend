# AI Support Admin Panel

A comprehensive Next.js admin panel for managing AI-to-human chat handoffs and monitoring the support system.

## Features

### 🎯 **Core Functionality**
- **Real-time Dashboard**: Monitor active sessions, agent status, and system health
- **AI-to-Human Handoffs**: Track and manage when AI escalates to human agents
- **Agent Management**: Monitor human agent availability, workload, and performance
- **Transfer Queue**: View pending transfers and their priority levels
- **Live Monitoring**: Real-time activity feed and system health monitoring

### 📊 **Dashboard Sections**

#### Overview Tab
- System statistics and KPIs
- Active sessions overview
- Agent status summary
- Transfer queue highlights

#### Sessions Tab
- All active chat sessions
- Customer information and chat history
- Service type and priority indicators
- Force transfer capabilities

#### Agents Tab
- Human agent status and availability
- Performance metrics and ratings
- Workload management
- Online/offline toggle controls

#### Transfers Tab
- Pending AI-to-human transfers
- Transfer reasons and priorities
- Queue management
- Accept/decline actions

#### Monitor Tab
- Real-time activity feed
- System health indicators
- Broadcast messaging
- Performance monitoring

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- Your backend API running on `http://localhost:5000`

### Installation

1. **Navigate to the admin panel directory:**
   ```bash
   cd admin-panel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint:**
   Update the API base URL in `src/lib/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api/v1';
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 **Configuration**

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws
```

### API Integration
The admin panel connects to your existing backend API endpoints:

- `GET /support/stats/quick` - Dashboard statistics
- `GET /support/admin/tickets` - Active sessions
- `GET /support/admin/agents` - Agent management
- `GET /support/admin/transfers/pending` - Transfer queue
- `POST /support/admin/broadcast` - Broadcast messages

## 📱 **Key Components**

### OverviewStats
- Real-time system metrics
- Session counts and satisfaction ratings
- Service utilization statistics

### ActiveSessions
- Live chat session monitoring
- Customer information display
- Force transfer capabilities

### AgentStatus
- Human agent availability
- Performance metrics
- Status management controls

### TransferQueue
- Pending AI-to-human transfers
- Priority-based queue display
- Transfer reason indicators

### RealTimeMonitor
- Live activity feed
- System health monitoring
- Broadcast messaging interface

## 🎨 **UI Components**

Built with **shadcn/ui** components:
- Modern, accessible design
- Consistent styling with Tailwind CSS
- Responsive layout for all screen sizes
- Dark/light mode support

## 📊 **Monitoring Features**

### Real-time Updates
- Auto-refresh every 10-30 seconds
- WebSocket integration for live updates
- Activity feed with timestamps

### Performance Tracking
- Agent response times
- Customer satisfaction ratings
- Transfer success rates
- System uptime monitoring

### Alert System
- High-priority transfer notifications
- Agent availability alerts
- System health warnings

## 🔐 **Security Features**

- JWT token authentication
- Role-based access control
- API request validation
- Secure WebSocket connections

## 📈 **Analytics & Insights**

- Transfer pattern analysis
- Agent performance metrics
- Customer satisfaction trends
- Service utilization reports

## 🛠 **Customization**

### Adding New Metrics
1. Update the API endpoints in `src/lib/api.js`
2. Create new components in `src/components/dashboard/`
3. Add to the main dashboard tabs

### Styling Customization
- Modify `tailwind.config.js` for theme changes
- Update component styles in individual files
- Customize the color scheme in `globals.css`

## 🚀 **Deployment**

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📞 **Support Integration**

This admin panel is designed to work with your existing AI support system:

1. **AI Agent**: Monitors when AI decides to escalate
2. **Human Agents**: Tracks availability and workload
3. **Transfer System**: Manages the handoff process
4. **Customer Experience**: Ensures smooth transitions

## 🔄 **Workflow**

1. **Customer starts chat** with AI agent
2. **AI detects complexity** or customer requests human help
3. **Transfer request** appears in admin panel queue
4. **Human agent** accepts the transfer
5. **Seamless handoff** to human agent
6. **Admin monitors** the entire process

## 📋 **Best Practices**

- Monitor transfer queue regularly
- Keep agents' status updated
- Use broadcast messages for system announcements
- Review performance metrics weekly
- Maintain optimal agent-to-session ratios

---

**Your AI-to-human handoff system is now fully manageable through this comprehensive admin panel!** 🎉

For additional support or customization needs, refer to the component documentation or contact your development team.