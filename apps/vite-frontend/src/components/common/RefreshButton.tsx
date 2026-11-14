import { RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RefreshButtonProps {
  refreshing: boolean
  onClick: () => void
}

export function RefreshButton({ refreshing, onClick }: RefreshButtonProps) {
  return (
    <Button variant="outline" onClick={onClick} disabled={refreshing}>
      <RefreshCwIcon className={cn(refreshing && 'animate-spin')} />
      Refresh
    </Button>
  )
}
