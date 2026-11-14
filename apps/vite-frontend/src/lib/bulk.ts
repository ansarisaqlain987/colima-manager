import { ApiError } from './apiClient'
import { toErrorMessage } from './errors'

export const runForEach = async <T>(
  items: Array<T>,
  operation: (item: T) => Promise<unknown>,
  what: string,
): Promise<void> => {
  const results = await Promise.allSettled(items.map(operation))
  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  )
  if (failures.length > 0) {
    throw new ApiError(
      `${failures.length} of ${items.length} ${what} failed: ${toErrorMessage(failures[0].reason)}`,
    )
  }
}
