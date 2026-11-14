import { SearchIcon, XIcon } from 'lucide-react'
import type { DataTableBulkAction } from './types'
import { AppTooltip } from '@/components/common/AppTooltip'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

interface DataTableToolbarProps<T> {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  showSearch: boolean
  selectedRows: Array<T>
  bulkActions: Array<DataTableBulkAction<T>>
  onClearSelection: () => void
}

export function DataTableToolbar<T>({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  showSearch,
  selectedRows,
  bulkActions,
  onClearSelection,
}: DataTableToolbarProps<T>) {
  const selected = selectedRows.length

  const run = (action: DataTableBulkAction<T>) => {
    action.onClick(selectedRows)
    onClearSelection()
  }

  if (!showSearch && selected === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {showSearch ? (
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-72 pl-8"
          />
        </div>
      ) : (
        <span />
      )}

      {selected > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selected} selected
          </span>
          {bulkActions.map((action) => {
            const Icon = action.icon
            const disabled =
              action.loading || action.disabled?.(selectedRows) === true
            const button = (
              <Button
                key={action.id}
                size="sm"
                variant={action.destructive ? 'destructive' : 'outline'}
                disabled={disabled}
                onClick={action.confirm ? undefined : () => run(action)}
              >
                {action.loading ? <Spinner /> : Icon && <Icon />}
                {action.label}
              </Button>
            )
            return action.confirm ? (
              <ConfirmDialog
                key={action.id}
                title={action.confirm.title(selectedRows)}
                description={
                  typeof action.confirm.description === 'function'
                    ? action.confirm.description(selectedRows)
                    : action.confirm.description
                }
                confirmLabel={action.confirm.confirmLabel ?? action.label}
                destructive={action.destructive}
                onConfirm={() => run(action)}
                trigger={button}
              />
            ) : (
              button
            )
          })}
          <AppTooltip content="Clear selection">
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Clear selection"
              onClick={onClearSelection}
            >
              <XIcon />
            </Button>
          </AppTooltip>
        </div>
      )}
    </div>
  )
}
