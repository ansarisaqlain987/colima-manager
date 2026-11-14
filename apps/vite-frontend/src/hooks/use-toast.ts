import { useMemo } from 'react'
import { toast } from 'sonner'
import { toErrorMessage } from '@/lib/errors'

export function useToast() {
  return useMemo(
    () => ({
      successToast: (message: string, description?: string) =>
        toast.success(message, { description }),
      errorToast: (message: string, error?: unknown) =>
        toast.error(message, {
          description: error === undefined ? undefined : toErrorMessage(error),
        }),
    }),
    [],
  )
}
