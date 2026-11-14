import type { ImageSummary } from '@/types'
import { ApiError, apiClient } from '@/lib/apiClient'
import { runForEach } from '@/lib/bulk'

export const getImages = async (): Promise<Array<ImageSummary>> => {
  try {
    return await apiClient.get<Array<ImageSummary>>('/images')
  } catch (error) {
    throw ApiError.from(error, 'Could not load images')
  }
}

export const pullImage = async (image: string): Promise<void> => {
  try {
    await apiClient.post('/images/pull', { image }, { timeout: 0 })
  } catch (error) {
    throw ApiError.from(error, `Could not pull ${image}`)
  }
}

export const removeImage = async (id: string, force = false): Promise<void> => {
  try {
    await apiClient.delete(`/images/${encodeURIComponent(id)}`, {
      params: { force },
    })
  } catch (error) {
    throw ApiError.from(error, `Could not remove image ${id}`)
  }
}

export const removeImages = async (ids: Array<string>): Promise<void> => {
  try {
    await runForEach(ids, (id) => removeImage(id), 'removals')
  } catch (error) {
    throw ApiError.from(error, 'Could not remove images')
  }
}

export const pruneImages = async (all: boolean): Promise<void> => {
  try {
    await apiClient.post('/images/prune', undefined, { params: { all } })
  } catch (error) {
    throw ApiError.from(error, 'Could not prune images')
  }
}
