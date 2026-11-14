import type { ComponentProps, ReactNode } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AppTooltipProps {
  content: ReactNode
  children: ReactNode
  side?: ComponentProps<typeof TooltipContent>['side']
}

export function AppTooltip({
  content,
  children,
  side = 'top',
}: AppTooltipProps) {
  if (!content) return <>{children}</>
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </Tooltip>
  )
}
