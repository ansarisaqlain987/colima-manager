import type { VolumeSummary } from '@/types'
import { ApiError, apiClient } from '@/lib/apiClient'
import { runForEach } from '@/lib/bulk'

export const getVolumes = async (): Promise<Array<VolumeSummary>> => {
  try {
    return await apiClient.get<Array<VolumeSummary>>('/volumes')
  } catch (error) {
    throw ApiError.from(error, 'Could not load volumes')
  }
}

export const createVolume = async (name: string): Promise<void> => {
  try {
    await apiClient.post('/volumes', { name })
  } catch (error) {
    throw ApiError.from(error, `Could not create volume ${name}`)
  }
}

export const removeVolume = async (name: string): Promise<void> => {
  try {
    await apiClient.delete(`/volumes/${encodeURIComponent(name)}`)
  } catch (error) {
    throw ApiError.from(error, `Could not remove volume ${name}`)
  }
}

export const removeVolumes = async (names: Array<string>): Promise<void> => {
  try {
    await runForEach(names, removeVolume, 'removals')
  } catch (error) {
    throw ApiError.from(error, 'Could not remove volumes')
  }
}

export const pruneVolumes = async (): Promise<void> => {
  try {
    await apiClient.post('/volumes/prune')
  } catch (error) {
    throw ApiError.from(error, 'Could not prune volumes')
  }
}
