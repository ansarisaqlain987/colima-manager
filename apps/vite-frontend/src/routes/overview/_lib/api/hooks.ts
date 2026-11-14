import { useQuery } from '@tanstack/react-query'
import { getDiskUsage, getDockerInfo } from './api'

export const useDockerInfoQuery = () =>
  useQuery({
    queryKey: ['overview', 'info'],
    queryFn: getDockerInfo,
    refetchInterval: 15_000,
  })

export const useDiskUsageQuery = () =>
  useQuery({
    queryKey: ['overview', 'disk'],
    queryFn: getDiskUsage,
    refetchInterval: 60_000,
  })
