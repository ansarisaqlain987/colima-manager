import { Trash2Icon } from 'lucide-react'
import {
  useBulkRemoveVolumesMutation,
  useRemoveVolumeMutation,
} from '../api/hooks'
import type {
  DataTableBulkAction,
  DataTableColumn,
  DataTableRowAction,
} from '@/components/DataTable'
import type { VolumeSummary } from '@/types'
import { DataTable } from '@/components/DataTable'

const columns: Array<DataTableColumn<VolumeSummary>> = [
  {
    id: 'name',
    header: 'Name',
    accessor: (volume) => volume.Name,
    sortable: true,
    className: 'max-w-80 truncate font-medium',
  },
  {
    id: 'driver',
    header: 'Driver',
    accessor: (volume) => volume.Driver,
    sortable: true,
  },
  {
    id: 'scope',
    header: 'Scope',
    accessor: (volume) => volume.Scope,
  },
  {
    id: 'mountpoint',
    header: 'Mount point',
    accessor: (volume) => volume.Mountpoint,
    className: 'max-w-96 truncate font-mono text-xs text-muted-foreground',
  },
]

export function VolumesTable({
  volumes,
  loading = false,
}: {
  volumes: Array<VolumeSummary>
  loading?: boolean
}) {
  const removeMutation = useRemoveVolumeMutation()
  const bulkRemoveMutation = useBulkRemoveVolumesMutation()

  const rowActions: Array<DataTableRowAction<VolumeSummary>> = [
    {
      id: 'remove',
      label: 'Remove',
      icon: Trash2Icon,
      destructive: true,
      loading: (volume) =>
        removeMutation.isPending && removeMutation.variables === volume.Name,
      confirm: {
        title: () => 'Remove this volume?',
        description: (volume) => (
          <>
            <span className="font-mono">{volume.Name}</span> and all data in it
            will be deleted. It fails if a container still uses the volume.
          </>
        ),
      },
      onClick: (volume) => removeMutation.mutate(volume.Name),
    },
  ]

  const bulkActions: Array<DataTableBulkAction<VolumeSummary>> = [
    {
      id: 'remove',
      label: 'Remove',
      icon: Trash2Icon,
      destructive: true,
      loading: bulkRemoveMutation.isPending,
      confirm: {
        title: (rows) => `Remove ${rows.length} volumes?`,
        description:
          'The selected volumes and all data in them will be deleted. Volumes still in use are skipped with an error.',
      },
      onClick: (rows) =>
        bulkRemoveMutation.mutate(rows.map((volume) => volume.Name)),
    },
  ]

  return (
    <DataTable
      data={volumes}
      loading={loading}
      columns={columns}
      getRowId={(volume) => volume.Name}
      rowActions={rowActions}
      bulkActions={bulkActions}
      search={{ placeholder: 'Filter by name or driver' }}
      pagination={{ pageSize: 10 }}
      emptyMessage="No volumes yet."
    />
  )
}
