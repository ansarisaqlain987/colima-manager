import { Link, useNavigate } from '@tanstack/react-router'
import {
  FileTextIcon,
  PauseIcon,
  PlayIcon,
  RotateCwIcon,
  SquareIcon,
  SquareTerminalIcon,
  Trash2Icon,
} from 'lucide-react'
import {
  useBulkContainerActionMutation,
  useBulkRemoveContainersMutation,
  useContainerActionMutation,
  useContainerStatsQuery,
  useRemoveContainerMutation,
} from '../api/hooks'
import { useContainersUiStore } from '../utils/containersUiStore'
import { ContainerStateBadge } from './ContainerStateBadge'
import type {
  DataTableBulkAction,
  DataTableColumn,
  DataTableRowAction,
} from '@/components/DataTable'
import type { ContainerAction, ContainerStats, ContainerSummary } from '@/types'
import { DataTable } from '@/components/DataTable'
import { shortId } from '@/lib/format'

const isUp = (c: ContainerSummary) =>
  c.State === 'running' || c.State === 'paused'

export function ContainersTable({
  containers,
  loading = false,
}: {
  containers: Array<ContainerSummary>
  loading?: boolean
}) {
  const navigate = useNavigate()
  const { data: stats = {} } = useContainerStatsQuery()
  const statsFor = (c: ContainerSummary): ContainerStats | undefined =>
    stats[shortId(c.ID)]
  const filter = useContainersUiStore((s) => s.filter)
  const setFilter = useContainersUiStore((s) => s.setFilter)

  const actionMutation = useContainerActionMutation()
  const removeMutation = useRemoveContainerMutation()
  const bulkActionMutation = useBulkContainerActionMutation()
  const bulkRemoveMutation = useBulkRemoveContainersMutation()

  const runAction = (c: ContainerSummary, action: ContainerAction) =>
    actionMutation.mutate({ id: c.ID, name: c.Names, action })
  const isRunning = (c: ContainerSummary, action: ContainerAction) =>
    actionMutation.isPending &&
    actionMutation.variables.id === c.ID &&
    actionMutation.variables.action === action
  const openDetail = (c: ContainerSummary, tab: 'logs' | 'terminal') =>
    void navigate({
      to: '/containers/$containerId',
      params: { containerId: c.ID },
      search: { tab },
    })
  const runBulk = (rows: Array<ContainerSummary>, action: ContainerAction) =>
    bulkActionMutation.mutate({ ids: rows.map((c) => c.ID), action })

  const columns: Array<DataTableColumn<ContainerSummary>> = [
    {
      id: 'name',
      header: 'Name',
      accessor: (c) => c.Names,
      sortable: true,
      className: 'max-w-56',
      cell: (c) => (
        <>
          <Link
            to="/containers/$containerId"
            params={{ containerId: c.ID }}
            search={{ tab: 'logs' }}
            className="block truncate font-medium hover:underline"
          >
            {c.Names}
          </Link>
          <span className="font-mono text-xs text-muted-foreground">
            {shortId(c.ID)}
          </span>
        </>
      ),
    },
    {
      id: 'image',
      header: 'Image',
      accessor: (c) => c.Image,
      sortable: true,
      className: 'max-w-56 truncate',
    },
    {
      id: 'state',
      header: 'State',
      accessor: (c) => c.State,
      sortable: true,
      cell: (c) => (
        <div className="flex flex-col items-start gap-1">
          <ContainerStateBadge state={c.State} />
          <span className="text-xs text-muted-foreground">{c.Status}</span>
        </div>
      ),
    },
    {
      id: 'ports',
      header: 'Ports',
      accessor: (c) => c.Ports,
      className: 'max-w-64 truncate font-mono text-xs',
      cell: (c) => c.Ports || '—',
    },
    {
      id: 'cpu',
      header: 'CPU',
      align: 'right',
      className: 'tabular-nums',
      cell: (c) => statsFor(c)?.CPUPerc ?? '—',
    },
    {
      id: 'memory',
      header: 'Memory',
      align: 'right',
      className: 'text-xs tabular-nums',
      cell: (c) => statsFor(c)?.MemUsage ?? '—',
    },
  ]

  const rowActions: Array<DataTableRowAction<ContainerSummary>> = [
    {
      id: 'start',
      label: 'Start',
      icon: PlayIcon,
      inline: true,
      hidden: isUp,
      loading: (c) => isRunning(c, 'start'),
      onClick: (c) => runAction(c, 'start'),
    },
    {
      id: 'stop',
      label: 'Stop',
      icon: SquareIcon,
      inline: true,
      destructive: true,
      hidden: (c) => !isUp(c),
      loading: (c) => isRunning(c, 'stop'),
      onClick: (c) => runAction(c, 'stop'),
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: FileTextIcon,
      onClick: (c) => openDetail(c, 'logs'),
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: SquareTerminalIcon,
      disabled: (c) => c.State !== 'running',
      onClick: (c) => openDetail(c, 'terminal'),
    },
    {
      id: 'restart',
      label: 'Restart',
      icon: RotateCwIcon,
      separatorBefore: true,
      disabled: (c) => !isUp(c),
      loading: (c) => isRunning(c, 'restart'),
      onClick: (c) => runAction(c, 'restart'),
    },
    {
      id: 'pause',
      label: 'Pause',
      icon: PauseIcon,
      hidden: (c) => c.State === 'paused',
      disabled: (c) => c.State !== 'running',
      loading: (c) => isRunning(c, 'pause'),
      onClick: (c) => runAction(c, 'pause'),
    },
    {
      id: 'unpause',
      label: 'Unpause',
      icon: PlayIcon,
      hidden: (c) => c.State !== 'paused',
      loading: (c) => isRunning(c, 'unpause'),
      onClick: (c) => runAction(c, 'unpause'),
    },
    {
      id: 'remove',
      label: 'Remove',
      icon: Trash2Icon,
      destructive: true,
      separatorBefore: true,
      loading: (c) =>
        removeMutation.isPending && removeMutation.variables.id === c.ID,
      confirm: {
        title: (c) => `Remove ${c.Names}?`,
        description:
          'The container is stopped if needed and deleted together with its anonymous volumes. This cannot be undone.',
      },
      onClick: (c) => removeMutation.mutate({ id: c.ID, name: c.Names }),
    },
  ]

  const bulkActions: Array<DataTableBulkAction<ContainerSummary>> = [
    {
      id: 'start',
      label: 'Start',
      icon: PlayIcon,
      loading: bulkActionMutation.isPending,
      onClick: (rows) => runBulk(rows, 'start'),
    },
    {
      id: 'stop',
      label: 'Stop',
      icon: SquareIcon,
      destructive: true,
      loading: bulkActionMutation.isPending,
      onClick: (rows) => runBulk(rows, 'stop'),
    },
    {
      id: 'restart',
      label: 'Restart',
      icon: RotateCwIcon,
      loading: bulkActionMutation.isPending,
      onClick: (rows) => runBulk(rows, 'restart'),
    },
    {
      id: 'remove',
      label: 'Remove',
      icon: Trash2Icon,
      destructive: true,
      loading: bulkRemoveMutation.isPending,
      confirm: {
        title: (rows) => `Remove ${rows.length} containers?`,
        description: (rows) =>
          `${rows.map((c) => c.Names).join(', ')} will be stopped if needed and deleted. This cannot be undone.`,
      },
      onClick: (rows) => bulkRemoveMutation.mutate(rows.map((c) => c.ID)),
    },
  ]

  return (
    <DataTable
      data={containers}
      loading={loading}
      columns={columns}
      getRowId={(c) => c.ID}
      rowActions={rowActions}
      bulkActions={bulkActions}
      search={{
        placeholder: 'Filter by name, image or state',
        value: filter,
        onChange: setFilter,
      }}
      pagination={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }}
      emptyMessage={
        filter
          ? 'No containers match your filter.'
          : 'No containers yet. Start one from the Terminal page, e.g. docker run -d nginx'
      }
    />
  )
}
