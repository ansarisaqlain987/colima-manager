import { useEffect, useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ACTIONS_COLUMN_ID, SELECT_COLUMN_ID, buildColumnDefs } from './columns'
import { DataTablePagination } from './DataTablePagination'
import { DataTableToolbar } from './DataTableToolbar'
import type {
  PaginationState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'
import type { DataTableProps } from './types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function DataTable<T>({
  data,
  columns,
  getRowId,
  rowActions = [],
  bulkActions = [],
  isRowSelectable,
  pagination = {},
  search = {},
  emptyMessage = 'No results.',
  loading = false,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const selectable = bulkActions.length > 0
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pagination
      ? (pagination.pageSize ?? DEFAULT_PAGE_SIZE)
      : Number.MAX_SAFE_INTEGER,
  })
  const [localSearch, setLocalSearch] = useState('')
  const searchConfig = search || {}
  const searchValue = searchConfig.value ?? localSearch
  const setSearch = searchConfig.onChange ?? setLocalSearch

  const columnDefs = useMemo(
    () => buildColumnDefs(columns, rowActions, selectable),
    [columns, rowActions, selectable],
  )
  const columnConfig = useMemo(
    () => new Map(columns.map((col) => [col.id, col])),
    [columns],
  )

  const table = useReactTable({
    data,
    columns: columnDefs,
    getRowId,
    state: {
      sorting,
      rowSelection,
      globalFilter: searchValue,
      pagination: paginationState,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPaginationState,
    enableRowSelection: isRowSelectable
      ? (row) => isRowSelectable(row.original)
      : selectable,
    globalFilterFn: 'includesString',
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    const lastPage = Math.max(pageCount - 1, 0)
    if (paginationState.pageIndex > lastPage) {
      setPaginationState((p) => ({ ...p, pageIndex: lastPage }))
    }
  }, [pageCount, paginationState.pageIndex])

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original)
  const rows = table.getRowModel().rows

  const cellClass = (columnId: string) => {
    if (columnId === SELECT_COLUMN_ID || columnId === ACTIONS_COLUMN_ID) {
      return 'w-0'
    }
    const col = columnConfig.get(columnId)
    return cn(col?.align === 'right' && 'text-right', col?.className)
  }

  return (
    <div className="flex flex-col gap-3">
      <DataTableToolbar
        search={searchValue}
        onSearchChange={(value) => {
          setSearch(value)
          table.setPageIndex(0)
        }}
        searchPlaceholder={searchConfig.placeholder}
        showSearch={search !== false}
        selectedRows={selectedRows}
        bulkActions={bulkActions}
        onClearSelection={() => table.resetRowSelection()}
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(cellClass(header.column.id), 'max-w-none')}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRows }, (_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {columnDefs.map((col, colIndex) => (
                    <TableCell key={col.id ?? colIndex}>
                      <Skeleton
                        className={cn(
                          'h-4',
                          col.id === SELECT_COLUMN_ID
                            ? 'size-4'
                            : col.id === ACTIONS_COLUMN_ID
                              ? 'ml-auto w-16'
                              : 'w-full max-w-40',
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cellClass(cell.column.id)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnDefs.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={
            pagination.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS
          }
        />
      )}
    </div>
  )
}
