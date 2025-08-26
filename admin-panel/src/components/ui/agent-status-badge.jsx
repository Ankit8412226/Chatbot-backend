import { Badge } from "@/components/ui/badge"
import { getStatusColor } from "@/lib/utils"

export function AgentStatusBadge({ status, className }) {
  const statusConfig = {
    online: { label: 'Online', variant: 'default' },
    offline: { label: 'Offline', variant: 'secondary' },
    busy: { label: 'Busy', variant: 'destructive' },
    away: { label: 'Away', variant: 'outline' },
    break: { label: 'Break', variant: 'outline' }
  }

  const config = statusConfig[status] || statusConfig.offline

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
      <Badge variant={config.variant} className={className}>
        {config.label}
      </Badge>
    </div>
  )
}