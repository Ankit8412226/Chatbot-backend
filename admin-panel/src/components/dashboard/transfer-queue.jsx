'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { adminAPI } from '@/lib/api'
import { formatTime, getPriorityColor } from '@/lib/utils'
import { 
  ArrowRight, 
  Clock, 
  User, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export function TransferQueue() {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingTransfers()
    const interval = setInterval(fetchPendingTransfers, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchPendingTransfers = async () => {
    try {
      const response = await adminAPI.getPendingTransfers()
      setTransfers(response.data.pendingTransfers || [])
    } catch (error) {
      console.error('Failed to fetch pending transfers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransferReasonIcon = (reason) => {
    const icons = {
      customer_request: User,
      ai_escalation: AlertTriangle,
      complexity_escalation: AlertTriangle,
      skill_mismatch: ArrowRight,
      technical_issue: AlertTriangle,
      supervisor_request: User,
      agent_unavailable: XCircle,
      workload_balance: ArrowRight,
      emergency: AlertTriangle
    }
    return icons[reason] || ArrowRight
  }

  const getTransferReasonColor = (reason) => {
    const colors = {
      customer_request: 'bg-blue-100 text-blue-800',
      ai_escalation: 'bg-orange-100 text-orange-800',
      complexity_escalation: 'bg-red-100 text-red-800',
      skill_mismatch: 'bg-yellow-100 text-yellow-800',
      technical_issue: 'bg-red-100 text-red-800',
      supervisor_request: 'bg-purple-100 text-purple-800',
      agent_unavailable: 'bg-gray-100 text-gray-800',
      workload_balance: 'bg-green-100 text-green-800',
      emergency: 'bg-red-100 text-red-800'
    }
    return colors[reason] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transfer Queue</CardTitle>
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
          <ArrowRight className="h-5 w-5" />
          Transfer Queue ({transfers.length})
        </CardTitle>
        {transfers.length > 0 && (
          <Badge variant="destructive">
            {transfers.filter(t => t.priority === 'urgent' || t.priority === 'high').length} High Priority
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {transfers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
            <p>No pending transfers</p>
            <p className="text-sm">All handoffs are being handled smoothly!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => {
              const ReasonIcon = getTransferReasonIcon(transfer.transferReason)
              
              return (
                <div
                  key={transfer.transferId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2">
                      <ReasonIcon className="h-4 w-4 text-muted-foreground" />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {transfer.customerName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{transfer.customerName}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Agent needed
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Waiting {formatTime(transfer.requestedAt)}</span>
                        <Badge variant="outline" className="text-xs">
                          {transfer.serviceType?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(transfer.priority)}>
                      {transfer.priority}
                    </Badge>
                    
                    <Badge className={getTransferReasonColor(transfer.transferReason)}>
                      {transfer.transferReason.replace('_', ' ')}
                    </Badge>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}