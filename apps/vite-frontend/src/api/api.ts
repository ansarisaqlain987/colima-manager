import { ApiError, apiClient } from '@/lib/apiClient'

export const getHealth = async (): Promise<{ ok: boolean }> => {
  try {
    return await apiClient.get<{ ok: boolean }>('/health', { timeout: 5_000 })
  } catch (error) {
    throw ApiError.from(error, 'Backend health check failed')
  }
}
