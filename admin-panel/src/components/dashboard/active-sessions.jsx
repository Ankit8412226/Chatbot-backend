'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { adminAPI } from '@/lib/api'
import { formatTime, getPriorityColor } from '@/lib/utils'
import { 
  MessageSquare, 
  User, 
  Clock, 
  ArrowRight,
  Eye,
  UserPlus
} from 'lucide-react'

export function ActiveSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveSessions()
    const interval = setInterval(fetchActiveSessions, 15000) // Refresh every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchActiveSessions = async () => {
    try {
      const response = await adminAPI.getActiveSessions()
      setSessions(response.data.sessions || [])
    } catch (error) {
      console.error('Failed to fetch active sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleForceTransfer = async (sessionId) => {
    try {
      await adminAPI.forceTransfer(sessionId, {
        reason: 'admin_intervention',
        priority: 'high'
      })
      fetchActiveSessions() // Refresh the list
    } catch (error) {
      console.error('Failed to force transfer:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Active Sessions ({sessions.length})
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchActiveSessions}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {session.customerName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.customerName}</span>
                      <Badge variant="outline" className="text-xs">
                        {session.serviceType?.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(session.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {session.messageCount || 0} messages
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(session.priority || 'medium')}>
                    {session.priority || 'medium'}
                  </Badge>
                  
                  {session.currentStage === 'human_agent' ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      With Agent
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      AI Handling
                    </Badge>
                  )}

                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {session.currentStage !== 'human_agent' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleForceTransfer(session.sessionId)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}