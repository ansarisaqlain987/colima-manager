import type { FormEvent, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

interface AppDialogProps {
  title: ReactNode
  description?: ReactNode
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
  onSubmit?: () => void
  submitLabel?: string
  submitIcon?: LucideIcon
  submitting?: boolean
  submitDisabled?: boolean
  footer?: ReactNode
}

export function AppDialog({
  title,
  description,
  trigger,
  open,
  onOpenChange,
  children,
  onSubmit,
  submitLabel = 'Save',
  submitIcon: SubmitIcon,
  submitting = false,
  submitDisabled = false,
  footer,
}: AppDialogProps) {
  const header = (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      {description && <DialogDescription>{description}</DialogDescription>}
    </DialogHeader>
  )

  const actions = (footer || onSubmit) && (
    <DialogFooter>
      {footer}
      {onSubmit && (
        <Button type="submit" disabled={submitting || submitDisabled}>
          {submitting ? <Spinner /> : SubmitIcon && <SubmitIcon />}
          {submitLabel}
        </Button>
      )}
    </DialogFooter>
  )

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!submitting && !submitDisabled) onSubmit?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        {onSubmit ? (
          <form onSubmit={handleSubmit} className="grid gap-4">
            {header}
            {children}
            {actions}
          </form>
        ) : (
          <>
            {header}
            {children}
            {actions}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
