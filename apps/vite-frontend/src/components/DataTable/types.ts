import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface DataTableConfirm<TArg> {
  title: (arg: TArg) => string
  description: ReactNode | ((arg: TArg) => ReactNode)
  confirmLabel?: string
}

export interface DataTableColumn<T> {
  id: string
  header: string
  accessor?: (row: T) => string | number
  cell?: (row: T) => ReactNode
  sortable?: boolean
  searchable?: boolean
  align?: 'left' | 'right'
  className?: string
}

export interface DataTableRowAction<T> {
  id: string
  label: string
  icon?: LucideIcon
  onClick: (row: T) => void
  inline?: boolean
  hidden?: (row: T) => boolean
  disabled?: (row: T) => boolean
  loading?: (row: T) => boolean
  destructive?: boolean
  separatorBefore?: boolean
  confirm?: DataTableConfirm<T>
}

export interface DataTableBulkAction<T> {
  id: string
  label: string
  icon?: LucideIcon
  onClick: (rows: Array<T>) => void
  disabled?: (rows: Array<T>) => boolean
  loading?: boolean
  destructive?: boolean
  confirm?: DataTableConfirm<Array<T>>
}

export interface DataTablePaginationConfig {
  pageSize?: number
  pageSizeOptions?: Array<number>
}

export interface DataTableSearchConfig {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export interface DataTableProps<T> {
  data: Array<T>
  columns: Array<DataTableColumn<T>>
  getRowId: (row: T) => string
  rowActions?: Array<DataTableRowAction<T>>
  bulkActions?: Array<DataTableBulkAction<T>>
  isRowSelectable?: (row: T) => boolean
  pagination?: DataTablePaginationConfig | false
  search?: DataTableSearchConfig | false
  emptyMessage?: ReactNode
  loading?: boolean
  skeletonRows?: number
}
