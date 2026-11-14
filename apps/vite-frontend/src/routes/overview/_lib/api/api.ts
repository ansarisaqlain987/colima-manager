import type { DiskUsageRow, DockerInfo } from '@/types'
import { ApiError, apiClient } from '@/lib/apiClient'

export const getDockerInfo = async (): Promise<DockerInfo> => {
  try {
    return await apiClient.get<DockerInfo>('/info')
  } catch (error) {
    throw ApiError.from(error, 'Could not load Docker info')
  }
}

export const getDiskUsage = async (): Promise<Array<DiskUsageRow>> => {
  try {
    return await apiClient.get<Array<DiskUsageRow>>('/disk')
  } catch (error) {
    throw ApiError.from(error, 'Could not load disk usage')
  }
}
