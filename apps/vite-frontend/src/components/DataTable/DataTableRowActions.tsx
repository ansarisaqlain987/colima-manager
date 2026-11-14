import { Fragment, useState } from 'react'
import { EllipsisVerticalIcon } from 'lucide-react'
import type { DataTableRowAction } from './types'
import { AppTooltip } from '@/components/common/AppTooltip'
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

interface DataTableRowActionsProps<T> {
  row: T
  actions: Array<DataTableRowAction<T>>
}

export function DataTableRowActions<T>({
  row,
  actions,
}: DataTableRowActionsProps<T>) {
  const [confirming, setConfirming] = useState<DataTableRowAction<T> | null>(
    null,
  )

  const visible = actions.filter((action) => !action.hidden?.(row))
  const inline = visible.filter((action) => action.inline)
  const menu = visible.filter((action) => !action.inline)
  const running = visible.find((action) => action.loading?.(row))

  const trigger = (action: DataTableRowAction<T>) => {
    if (action.confirm) setConfirming(action)
    else action.onClick(row)
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {running ? (
        <Button variant="ghost" size="sm" disabled>
          <Spinner />
          {running.label}…
        </Button>
      ) : (
        inline.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.id}
              variant={action.destructive ? 'destructive' : 'ghost'}
              size="sm"
              disabled={action.disabled?.(row)}
              onClick={() => trigger(action)}
            >
              {Icon && <Icon />}
              {action.label}
            </Button>
          )
        })
      )}

      {menu.length > 0 && (
        <DropdownMenu>
          <AppTooltip content="More actions">
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="More actions"
                disabled={Boolean(running)}
              >
                <EllipsisVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
          </AppTooltip>
          <DropdownMenuContent align="end">
            {menu.map((action, index) => {
              const Icon = action.icon
              return (
                <Fragment key={action.id}>
                  {action.separatorBefore && index > 0 && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem
                    variant={action.destructive ? 'destructive' : 'default'}
                    disabled={action.disabled?.(row)}
                    onSelect={() => trigger(action)}
                  >
                    {Icon && <Icon />}
                    {action.label}
                  </DropdownMenuItem>
                </Fragment>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {confirming?.confirm && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setConfirming(null)}
          title={confirming.confirm.title(row)}
          description={
            typeof confirming.confirm.description === 'function'
              ? confirming.confirm.description(row)
              : confirming.confirm.description
          }
          confirmLabel={confirming.confirm.confirmLabel ?? confirming.label}
          destructive={confirming.destructive}
          onConfirm={() => confirming.onClick(row)}
        />
      )}
    </div>
  )
}
