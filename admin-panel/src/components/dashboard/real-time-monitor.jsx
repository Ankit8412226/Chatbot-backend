'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminAPI } from '@/lib/api'
import { formatTime } from '@/lib/utils'
import { 
  Activity, 
  Send, 
  AlertCircle, 
  CheckCircle,
  MessageSquare,
  Zap
} from 'lucide-react'

export function RealTimeMonitor() {
  const [activities, setActivities] = useState([])
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastTarget, setBroadcastTarget] = useState('all')
  const [systemHealth, setSystemHealth] = useState(null)

  useEffect(() => {
    fetchSystemHealth()
    
    // Simulate real-time activities
    const interval = setInterval(() => {
      addActivity({
        id: Date.now(),
        type: 'ai_escalation',
        message: 'AI escalated customer to human agent',
        customer: 'John Doe',
        timestamp: new Date(),
        status: 'success'
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchSystemHealth = async () => {
    try {
      const response = await adminAPI.getSystemHealth()
      setSystemHealth(response.data)
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    }
  }

  const addActivity = (activity) => {
    setActivities(prev => [activity, ...prev.slice(0, 9)]) // Keep last 10 activities
  }

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return

    try {
      await adminAPI.broadcastMessage({
        message: broadcastMessage,
        targetService: broadcastTarget === 'all' ? null : broadcastTarget,
        urgencyLevel: 'info'
      })

      addActivity({
        id: Date.now(),
        type: 'broadcast',
        message: `Broadcast sent: "${broadcastMessage}"`,
        timestamp: new Date(),
        status: 'success'
      })

      setBroadcastMessage('')
    } catch (error) {
      console.error('Failed to send broadcast:', error)
      addActivity({
        id: Date.now(),
        type: 'error',
        message: 'Failed to send broadcast message',
        timestamp: new Date(),
        status: 'error'
      })
    }
  }

  const getActivityIcon = (type) => {
    const icons = {
      ai_escalation: Zap,
      transfer_complete: CheckCircle,
      agent_online: CheckCircle,
      agent_offline: AlertCircle,
      broadcast: Send,
      error: AlertCircle,
      session_start: MessageSquare,
      session_end: CheckCircle
    }
    return icons[type] || Activity
  }

  const getActivityColor = (status) => {
    const colors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600'
    }
    return colors[status] || 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {systemHealth?.agent?.name || 'Alex'}
              </div>
              <div className="text-sm text-muted-foreground">AI Agent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemHealth?.services?.available || 8}
              </div>
              <div className="text-sm text-muted-foreground">Services Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {systemHealth?.api?.sambanova_connected ? 'Connected' : 'Offline'}
              </div>
              <div className="text-sm text-muted-foreground">AI Engine</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.floor((systemHealth?.uptime || 0) / 3600)}h
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Broadcast Message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Broadcast Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="broadcast-message">Message</Label>
              <Input
                id="broadcast-message"
                placeholder="Enter message to broadcast to active sessions..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="broadcast-target">Target</Label>
              <Select value={broadcastTarget} onValueChange={setBroadcastTarget}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="web_development">Web Development</SelectItem>
                  <SelectItem value="mobile_development">Mobile Development</SelectItem>
                  <SelectItem value="digital_marketing">Digital Marketing</SelectItem>
                  <SelectItem value="cloud_solutions">Cloud Solutions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleBroadcast} disabled={!broadcastMessage.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send Broadcast
          </Button>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              activities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type)
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <ActivityIcon className={`h-4 w-4 mt-0.5 ${getActivityColor(activity.status)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      {activity.customer && (
                        <p className="text-xs text-muted-foreground">
                          Customer: {activity.customer}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </p>
                    </div>
                    <Badge variant={activity.status === 'success' ? 'default' : 'destructive'}>
                      {activity.status}
                    </Badge>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}