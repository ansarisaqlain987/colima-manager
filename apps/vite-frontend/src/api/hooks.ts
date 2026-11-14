import { useQuery } from '@tanstack/react-query'
import { getHealth } from './api'

export const useHealthQuery = () =>
  useQuery({
    queryKey: ['system', 'health'],
    queryFn: getHealth,
    refetchInterval: 10_000,
    retry: false,
  })
