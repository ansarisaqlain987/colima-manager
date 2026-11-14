import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  running: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  paused: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  restarting: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  exited: 'bg-muted text-muted-foreground',
  created: 'bg-muted text-muted-foreground',
  dead: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

export function ContainerStateBadge({ state }: { state: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn('capitalize', STYLES[state] ?? STYLES.exited)}
    >
      {state}
    </Badge>
  )
}
