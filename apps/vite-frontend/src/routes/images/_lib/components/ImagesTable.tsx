import { Trash2Icon } from 'lucide-react'
import {
  useBulkRemoveImagesMutation,
  useRemoveImageMutation,
} from '../api/hooks'
import type {
  DataTableBulkAction,
  DataTableColumn,
  DataTableRowAction,
} from '@/components/DataTable'
import type { ImageSummary } from '@/types'
import { DataTable } from '@/components/DataTable'
import { shortId } from '@/lib/format'

const imageLabel = (image: ImageSummary) =>
  image.Repository === '<none>'
    ? shortId(image.ID)
    : `${image.Repository}:${image.Tag}`

const rowId = (image: ImageSummary) =>
  `${image.ID}|${image.Repository}|${image.Tag}`

const columns: Array<DataTableColumn<ImageSummary>> = [
  {
    id: 'repository',
    header: 'Repository',
    accessor: (image) => image.Repository,
    sortable: true,
    className: 'max-w-72 truncate font-medium',
  },
  {
    id: 'tag',
    header: 'Tag',
    accessor: (image) => image.Tag,
    sortable: true,
  },
  {
    id: 'id',
    header: 'Image ID',
    accessor: (image) => image.ID,
    className: 'font-mono text-xs',
    cell: (image) => shortId(image.ID),
  },
  {
    id: 'created',
    header: 'Created',
    accessor: (image) => image.CreatedAt,
    sortable: true,
    className: 'text-muted-foreground',
    cell: (image) => image.CreatedSince,
  },
  {
    id: 'size',
    header: 'Size',
    accessor: (image) => image.Size,
    align: 'right',
    className: 'tabular-nums',
  },
]

export function ImagesTable({
  images,
  loading = false,
}: {
  images: Array<ImageSummary>
  loading?: boolean
}) {
  const removeMutation = useRemoveImageMutation()
  const bulkRemoveMutation = useBulkRemoveImagesMutation()

  const rowActions: Array<DataTableRowAction<ImageSummary>> = [
    {
      id: 'remove',
      label: 'Remove',
      icon: Trash2Icon,
      destructive: true,
      loading: (image) =>
        removeMutation.isPending && removeMutation.variables.id === image.ID,
      confirm: {
        title: (image) => `Remove ${imageLabel(image)}?`,
        description:
          'Deletes the image. It fails if a container still uses it — remove that container first.',
      },
      onClick: (image) =>
        removeMutation.mutate({ id: image.ID, label: imageLabel(image) }),
    },
  ]

  const bulkActions: Array<DataTableBulkAction<ImageSummary>> = [
    {
      id: 'remove',
      label: 'Remove',
      icon: Trash2Icon,
      destructive: true,
      loading: bulkRemoveMutation.isPending,
      confirm: {
        title: (rows) => `Remove ${rows.length} images?`,
        description: (rows) =>
          `${rows.map(imageLabel).join(', ')} will be deleted. Images still used by a container are skipped with an error.`,
      },
      onClick: (rows) =>
        bulkRemoveMutation.mutate([...new Set(rows.map((image) => image.ID))]),
    },
  ]

  return (
    <DataTable
      data={images}
      loading={loading}
      columns={columns}
      getRowId={rowId}
      rowActions={rowActions}
      bulkActions={bulkActions}
      search={{ placeholder: 'Filter by repository, tag or ID' }}
      pagination={{ pageSize: 10 }}
      emptyMessage="No images. Use “Pull image” to download one."
    />
  )
}
