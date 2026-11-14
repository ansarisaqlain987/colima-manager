import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createVolume,
  getVolumes,
  pruneVolumes,
  removeVolume,
  removeVolumes,
} from './api'
import { useToast } from '@/hooks/use-toast'

export const useVolumesQuery = () =>
  useQuery({
    queryKey: ['volumes', 'list'],
    queryFn: getVolumes,
  })

export const useCreateVolumeMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: (name: string) => createVolume(name),
    onSuccess: (_data, name) => {
      successToast('Volume created', name)
      queryClient.invalidateQueries({ queryKey: ['volumes'] })
    },
    onError: (error, name) => {
      console.error(`Failed to create volume ${name}`, error)
      errorToast(`Could not create ${name}`, error)
    },
  })
}

export const useRemoveVolumeMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: (name: string) => removeVolume(name),
    onSuccess: (_data, name) => {
      successToast('Volume removed', name)
      queryClient.invalidateQueries({ queryKey: ['volumes'] })
    },
    onError: (error, name) => {
      console.error(`Failed to remove volume ${name}`, error)
      errorToast(`Could not remove ${name}`, error)
    },
  })
}

export const useBulkRemoveVolumesMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: (names: Array<string>) => removeVolumes(names),
    onSuccess: (_data, names) => {
      successToast(`${names.length} volumes removed`)
      queryClient.invalidateQueries({ queryKey: ['volumes'] })
    },
    onError: (error) => {
      console.error('Failed to remove volumes', error)
      errorToast('Could not remove all volumes', error)
      queryClient.invalidateQueries({ queryKey: ['volumes'] })
    },
  })
}

export const usePruneVolumesMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: pruneVolumes,
    onSuccess: () => {
      successToast('Unused volumes removed')
      queryClient.invalidateQueries({ queryKey: ['volumes'] })
    },
    onError: (error) => {
      console.error('Failed to prune volumes', error)
      errorToast('Could not prune volumes', error)
    },
  })
}
