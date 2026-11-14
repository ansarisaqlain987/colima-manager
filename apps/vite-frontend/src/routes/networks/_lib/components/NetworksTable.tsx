import { Trash2Icon } from 'lucide-react'
import {
  BUILT_IN_NETWORKS,
  useBulkRemoveNetworksMutation,
  useRemoveNetworkMutation,
} from '../api/hooks'
import type {
  DataTableBulkAction,
  DataTableColumn,
  DataTableRowAction,
} from '@/components/DataTable'
import type { NetworkSummary } from '@/types'
import { DataTable } from '@/components/DataTable'
import { Badge } from '@/components/ui/badge'
import { shortId } from '@/lib/format'

const isBuiltIn = (network: NetworkSummary) =>
  BUILT_IN_NETWORKS.has(network.Name)

const columns: Array<DataTableColumn<NetworkSummary>> = [
  {
    id: 'name',
    header: 'Name',
    accessor: (network) => network.Name,
    sortable: true,
    className: 'font-medium',
    cell: (network) => (
      <span className="flex items-center gap-2">
        {network.Name}
        {isBuiltIn(network) && <Badge variant="outline">built-in</Badge>}
      </span>
    ),
  },
  {
    id: 'id',
    header: 'Network ID',
    accessor: (network) => network.ID,
    className: 'font-mono text-xs',
    cell: (network) => shortId(network.ID),
  },
  {
    id: 'driver',
    header: 'Driver',
    accessor: (network) => network.Driver,
    sortable: true,
  },
  {
    id: 'scope',
    header: 'Scope',
    accessor: (network) => network.Scope,
  },
]

export function NetworksTable({
  networks,
  loading = false,
}: {
  networks: Array<NetworkSummary>
  loading?: boolean
}) {
  const removeMutation = useRemoveNetworkMutation()
  const bulkRemoveMutation = useBulkRemoveNetworksMutation()

  const rowActions: Array<DataTableRowAction<NetworkSummary>> = [
    {
      id: 'remove',
      label: 'Remove',
      icon: Trash2Icon,
      destructive: true,
      disabled: isBuiltIn,
      loading: (network) =>
        removeMutation.isPending && removeMutation.variables.id === network.ID,
      confirm: {
        title: (network) => `Remove network ${network.Name}?`,
        description: 'It fails if containers are still connected to it.',
      },
      onClick: (network) =>
        removeMutation.mutate({ id: network.ID, name: network.Name }),
    },
  ]

  const bulkActions: Array<DataTableBulkAction<NetworkSummary>> = [
    {
      id: 'remove',
      label: 'Remove',
      icon: Trash2Icon,
      destructive: true,
      loading: bulkRemoveMutation.isPending,
      confirm: {
        title: (rows) => `Remove ${rows.length} networks?`,
        description: (rows) =>
          `${rows.map((n) => n.Name).join(', ')} will be removed. Networks with connected containers are skipped with an error.`,
      },
      onClick: (rows) =>
        bulkRemoveMutation.mutate(rows.map((network) => network.ID)),
    },
  ]

  return (
    <DataTable
      data={networks}
      loading={loading}
      columns={columns}
      getRowId={(network) => network.ID}
      rowActions={rowActions}
      bulkActions={bulkActions}
      isRowSelectable={(network) => !isBuiltIn(network)}
      search={{ placeholder: 'Filter by name or driver' }}
      pagination={{ pageSize: 10 }}
      emptyMessage="No networks."
    />
  )
}
