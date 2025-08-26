'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { AgentStatusBadge } from '@/components/ui/agent-status-badge'
import { adminAPI } from '@/lib/api'
import { 
  Users, 
  MessageSquare, 
  Clock, 
  Star,
  Settings
} from 'lucide-react'

export function AgentStatus() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 20000) // Refresh every 20 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await adminAPI.getAllAgents()
      setAgents(response.data.agents || [])
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (agentId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'online' ? 'offline' : 'online'
      await adminAPI.updateAgentStatus(agentId, { status: newStatus })
      fetchAgents() // Refresh the list
    } catch (error) {
      console.error('Failed to update agent status:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const onlineAgents = agents.filter(agent => agent.status === 'online').length
  const availableAgents = agents.filter(agent => agent.isAvailable && agent.status === 'online').length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Human Agents ({onlineAgents}/{agents.length} online)
        </CardTitle>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          {availableAgents} Available
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {agent.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{agent.name}</span>
                    <AgentStatusBadge status={agent.status} />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {agent.currentChatCount || 0}/{agent.maxConcurrentChats || 3} chats
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {agent.averageSatisfactionRating?.toFixed(1) || 'N/A'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {agent.department}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-sm">
                  <div className="font-medium">
                    {agent.totalChatsHandled || 0} handled
                  </div>
                  <div className="text-muted-foreground">
                    {agent.averageResponseTime || 0}s avg response
                  </div>
                </div>

                <Switch
                  checked={agent.status === 'online'}
                  onCheckedChange={() => handleStatusToggle(agent._id, agent.status)}
                />

                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No agents configured</p>
            <Button variant="outline" className="mt-2">
              Add Agent
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}