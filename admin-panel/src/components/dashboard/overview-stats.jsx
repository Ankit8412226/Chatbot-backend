'use client'

import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/ui/stats-card'
import { adminAPI } from '@/lib/api'
import { 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Activity,
  Zap
} from 'lucide-react'

export function OverviewStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Sessions"
        value={stats?.totalSessions || 0}
        description="All time support sessions"
        icon={MessageSquare}
      />
      
      <StatsCard
        title="Active Sessions"
        value={stats?.activeSessions || 0}
        description="Currently ongoing chats"
        icon={Activity}
        className="border-green-200"
      />
      
      <StatsCard
        title="Avg Satisfaction"
        value={stats?.avgSatisfaction || 'N/A'}
        description="Customer satisfaction rating"
        icon={TrendingUp}
      />
      
      <StatsCard
        title="Services Covered"
        value={`${stats?.servicesCovered || 0}/${stats?.availableServices || 8}`}
        description="Digital services utilized"
        icon={Zap}
      />
      
      <StatsCard
        title="Human Agents"
        value="4"
        description="Available for handoff"
        icon={UserCheck}
        className="border-blue-200"
      />
      
      <StatsCard
        title="AI Escalations"
        value="12"
        description="Today's AI-to-human transfers"
        icon={AlertTriangle}
        trend={{ type: 'positive', value: '+15% from yesterday' }}
      />
      
      <StatsCard
        title="Avg Response Time"
        value="2.3m"
        description="Human agent response time"
        icon={Clock}
      />
      
      <StatsCard
        title="System Uptime"
        value={`${Math.floor((stats?.uptime || 0) / 3600)}h`}
        description="Current system uptime"
        icon={Activity}
        className="border-purple-200"
      />
    </div>
  )
}