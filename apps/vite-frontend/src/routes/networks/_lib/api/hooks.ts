import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNetworks,
  pruneNetworks,
  removeNetwork,
  removeNetworks,
} from './api'
import { useToast } from '@/hooks/use-toast'

export const BUILT_IN_NETWORKS = new Set(['bridge', 'host', 'none'])

export const useNetworksQuery = () =>
  useQuery({
    queryKey: ['networks', 'list'],
    queryFn: getNetworks,
  })

export const useRemoveNetworkMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: ({ id }: { id: string; name: string }) => removeNetwork(id),
    onSuccess: (_data, { name }) => {
      successToast('Network removed', name)
      queryClient.invalidateQueries({ queryKey: ['networks'] })
    },
    onError: (error, { name }) => {
      console.error(`Failed to remove network ${name}`, error)
      errorToast(`Could not remove ${name}`, error)
    },
  })
}

export const useBulkRemoveNetworksMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: (ids: Array<string>) => removeNetworks(ids),
    onSuccess: (_data, ids) => {
      successToast(`${ids.length} networks removed`)
      queryClient.invalidateQueries({ queryKey: ['networks'] })
    },
    onError: (error) => {
      console.error('Failed to remove networks', error)
      errorToast('Could not remove all networks', error)
      queryClient.invalidateQueries({ queryKey: ['networks'] })
    },
  })
}

export const usePruneNetworksMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: pruneNetworks,
    onSuccess: () => {
      successToast('Unused networks removed')
      queryClient.invalidateQueries({ queryKey: ['networks'] })
    },
    onError: (error) => {
      console.error('Failed to prune networks', error)
      errorToast('Could not prune networks', error)
    },
  })
}
