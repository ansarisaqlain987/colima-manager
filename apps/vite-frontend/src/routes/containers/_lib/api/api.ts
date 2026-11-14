import type {
  ContainerAction,
  ContainerInspect,
  ContainerStats,
  ContainerSummary,
} from '@/types'
import { ApiError, apiClient } from '@/lib/apiClient'
import { runForEach } from '@/lib/bulk'

export const getContainers = async (): Promise<Array<ContainerSummary>> => {
  try {
    return await apiClient.get<Array<ContainerSummary>>('/containers')
  } catch (error) {
    throw ApiError.from(error, 'Could not load containers')
  }
}

export const getContainerStats = async (): Promise<Array<ContainerStats>> => {
  try {
    return await apiClient.get<Array<ContainerStats>>('/containers/stats')
  } catch (error) {
    throw ApiError.from(error, 'Could not load container stats')
  }
}

export const getContainer = async (id: string): Promise<ContainerInspect> => {
  try {
    return await apiClient.get<ContainerInspect>(
      `/containers/${encodeURIComponent(id)}`,
    )
  } catch (error) {
    throw ApiError.from(error, `Could not inspect container ${id}`)
  }
}

export const runContainerAction = async (
  id: string,
  action: ContainerAction,
): Promise<void> => {
  try {
    await apiClient.post(`/containers/${encodeURIComponent(id)}/${action}`)
  } catch (error) {
    throw ApiError.from(error, `Could not ${action} container ${id}`)
  }
}

export const runContainersAction = async (
  ids: Array<string>,
  action: ContainerAction,
): Promise<void> => {
  try {
    await runForEach(ids, (id) => runContainerAction(id, action), `${action}s`)
  } catch (error) {
    throw ApiError.from(error, `Could not ${action} containers`)
  }
}

export const removeContainer = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/containers/${encodeURIComponent(id)}`)
  } catch (error) {
    throw ApiError.from(error, `Could not remove container ${id}`)
  }
}

export const removeContainers = async (ids: Array<string>): Promise<void> => {
  try {
    await runForEach(ids, removeContainer, 'removals')
  } catch (error) {
    throw ApiError.from(error, 'Could not remove containers')
  }
}

export const pruneContainers = async (): Promise<void> => {
  try {
    await apiClient.post('/containers/prune')
  } catch (error) {
    throw ApiError.from(error, 'Could not prune containers')
  }
}
