'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewStats } from '@/components/dashboard/overview-stats'
import { ActiveSessions } from '@/components/dashboard/active-sessions'
import { AgentStatus } from '@/components/dashboard/agent-status'
import { TransferQueue } from '@/components/dashboard/transfer-queue'
import { RealTimeMonitor } from '@/components/dashboard/real-time-monitor'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  ArrowRight, 
  Activity,
  Settings
} from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI Support Admin Panel
              </h1>
              <p className="text-gray-600">
                Monitor AI-to-human chat handoffs and system performance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                System Online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Transfers
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewStats />
            
            <div className="grid gap-6 md:grid-cols-2">
              <ActiveSessions />
              <AgentStatus />
            </div>
            
            <TransferQueue />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <ActiveSessions />
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <AgentStatus />
          </TabsContent>

          <TabsContent value="transfers" className="space-y-6">
            <TransferQueue />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <RealTimeMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}