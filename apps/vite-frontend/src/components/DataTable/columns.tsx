import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react'
import { DataTableRowActions } from './DataTableRowActions'
import type { Column, ColumnDef } from '@tanstack/react-table'
import type { DataTableColumn, DataTableRowAction } from './types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export const SELECT_COLUMN_ID = '__select'
export const ACTIONS_COLUMN_ID = '__actions'

function SortableHeader<T>({
  column,
  title,
  align,
}: {
  column: Column<T>
  title: string
  align?: 'left' | 'right'
}) {
  const sorted = column.getIsSorted()
  const Icon =
    sorted === 'asc'
      ? ArrowUpIcon
      : sorted === 'desc'
        ? ArrowDownIcon
        : ArrowUpDownIcon
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('-mx-2 h-7', align === 'right' && 'ml-auto flex')}
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {title}
      <Icon className={cn('size-3.5', !sorted && 'text-muted-foreground')} />
    </Button>
  )
}

export function buildColumnDefs<T>(
  columns: Array<DataTableColumn<T>>,
  rowActions: Array<DataTableRowAction<T>>,
  selectable: boolean,
): Array<ColumnDef<T>> {
  const defs: Array<ColumnDef<T>> = []

  if (selectable) {
    defs.push({
      id: SELECT_COLUMN_ID,
      enableSorting: false,
      enableGlobalFilter: false,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows on this page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    })
  }

  for (const col of columns) {
    const { accessor } = col
    defs.push({
      id: col.id,
      ...(accessor ? { accessorFn: (row: T) => accessor(row) } : {}),
      enableSorting: Boolean(col.sortable && accessor),
      enableGlobalFilter: col.searchable ?? Boolean(accessor),
      header: ({ column }) =>
        col.sortable && accessor ? (
          <SortableHeader
            column={column}
            title={col.header}
            align={col.align}
          />
        ) : (
          col.header
        ),
      cell: ({ row }) =>
        col.cell
          ? col.cell(row.original)
          : String(accessor?.(row.original) ?? '—'),
    })
  }

  if (rowActions.length > 0) {
    defs.push({
      id: ACTIONS_COLUMN_ID,
      enableSorting: false,
      enableGlobalFilter: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DataTableRowActions row={row.original} actions={rowActions} />
      ),
    })
  }

  return defs
}
