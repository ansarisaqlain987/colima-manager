import type { NetworkSummary } from '@/types'
import { ApiError, apiClient } from '@/lib/apiClient'
import { runForEach } from '@/lib/bulk'

export const getNetworks = async (): Promise<Array<NetworkSummary>> => {
  try {
    return await apiClient.get<Array<NetworkSummary>>('/networks')
  } catch (error) {
    throw ApiError.from(error, 'Could not load networks')
  }
}

export const removeNetwork = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/networks/${encodeURIComponent(id)}`)
  } catch (error) {
    throw ApiError.from(error, `Could not remove network ${id}`)
  }
}

export const removeNetworks = async (ids: Array<string>): Promise<void> => {
  try {
    await runForEach(ids, removeNetwork, 'removals')
  } catch (error) {
    throw ApiError.from(error, 'Could not remove networks')
  }
}

export const pruneNetworks = async (): Promise<void> => {
  try {
    await apiClient.post('/networks/prune')
  } catch (error) {
    throw ApiError.from(error, 'Could not prune networks')
  }
}
