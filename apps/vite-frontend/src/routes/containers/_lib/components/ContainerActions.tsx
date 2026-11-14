import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  EllipsisVerticalIcon,
  FileTextIcon,
  PauseIcon,
  PlayIcon,
  RotateCwIcon,
  SquareIcon,
  SquareTerminalIcon,
  Trash2Icon,
} from 'lucide-react'
import {
  useContainerActionMutation,
  useRemoveContainerMutation,
} from '../api/hooks'
import type { ContainerAction } from '@/types'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'

interface ContainerActionsProps {
  id: string
  name: string
  state: string
  onRemoved?: () => void
}

export function ContainerActions({
  id,
  name,
  state,
  onRemoved,
}: ContainerActionsProps) {
  const actionMutation = useContainerActionMutation()
  const removeMutation = useRemoveContainerMutation()
  const [confirmRemove, setConfirmRemove] = useState(false)

  const running = state === 'running'
  const paused = state === 'paused'
  const pending = actionMutation.isPending
    ? actionMutation.variables.action
    : removeMutation.isPending
      ? 'remove'
      : null

  const run = (action: ContainerAction) =>
    actionMutation.mutate({ id, name, action })

  const remove = () =>
    removeMutation.mutate({ id, name }, { onSuccess: () => onRemoved?.() })

  return (
    <div className="flex items-center justify-end gap-1">
      {pending ? (
        <Button variant="ghost" size="sm" disabled>
          <Spinner />
          <span className="capitalize">{pending}…</span>
        </Button>
      ) : running || paused ? (
        <Button variant="destructive" size="sm" onClick={() => run('stop')}>
          <SquareIcon />
          Stop
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => run('start')}>
          <PlayIcon />
          Start
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`More actions for ${name}`}
            disabled={pending !== null}
          >
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              to="/containers/$containerId"
              params={{ containerId: id }}
              search={{ tab: 'logs' }}
            >
              <FileTextIcon />
              Logs
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild disabled={!running}>
            <Link
              to="/containers/$containerId"
              params={{ containerId: id }}
              search={{ tab: 'terminal' }}
            >
              <SquareTerminalIcon />
              Terminal
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!running && !paused}
            onSelect={() => run('restart')}
          >
            <RotateCwIcon />
            Restart
          </DropdownMenuItem>
          {paused ? (
            <DropdownMenuItem onSelect={() => run('unpause')}>
              <PlayIcon />
              Unpause
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled={!running} onSelect={() => run('pause')}>
              <PauseIcon />
              Pause
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirmRemove(true)}
          >
            <Trash2Icon />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title={`Remove ${name}?`}
        description="The container is stopped if needed and deleted together with its anonymous volumes. This cannot be undone."
        confirmLabel="Remove"
        onConfirm={remove}
      />
    </div>
  )
}
