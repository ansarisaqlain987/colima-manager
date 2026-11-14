import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getContainer,
  getContainerStats,
  getContainers,
  pruneContainers,
  removeContainer,
  removeContainers,
  runContainerAction,
  runContainersAction,
} from './api'
import type { ContainerAction } from '@/types'
import { useToast } from '@/hooks/use-toast'

const POLL_MS = 5_000

const PAST_TENSE: Record<ContainerAction, string> = {
  start: 'started',
  stop: 'stopped',
  restart: 'restarted',
  pause: 'paused',
  unpause: 'unpaused',
  kill: 'killed',
}

export const useContainersQuery = () =>
  useQuery({
    queryKey: ['containers', 'list'],
    queryFn: getContainers,
    refetchInterval: POLL_MS,
  })

export const useContainerStatsQuery = () =>
  useQuery({
    queryKey: ['containers', 'stats'],
    queryFn: getContainerStats,
    refetchInterval: POLL_MS,
    select: (rows) => Object.fromEntries(rows.map((row) => [row.ID, row])),
  })

export const useContainerQuery = (id: string) =>
  useQuery({
    queryKey: ['containers', 'detail', id],
    queryFn: () => getContainer(id),
    refetchInterval: POLL_MS,
  })

export const useContainerActionMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string
      name: string
      action: ContainerAction
    }) => runContainerAction(id, action),
    onSuccess: (_data, { name, action }) => {
      successToast(`Container ${PAST_TENSE[action]}`, name)
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
    onError: (error, { name, action }) => {
      console.error(`Failed to ${action} container ${name}`, error)
      errorToast(`Could not ${action} ${name}`, error)
    },
  })
}

export const useBulkContainerActionMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: ({
      ids,
      action,
    }: {
      ids: Array<string>
      action: ContainerAction
    }) => runContainersAction(ids, action),
    onSuccess: (_data, { ids, action }) => {
      successToast(`${ids.length} containers ${PAST_TENSE[action]}`)
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
    onError: (error, { action }) => {
      console.error(`Failed to ${action} containers`, error)
      errorToast(`Could not ${action} all containers`, error)
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })
}

export const useRemoveContainerMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: ({ id }: { id: string; name: string }) => removeContainer(id),
    onSuccess: (_data, { id, name }) => {
      successToast('Container removed', name)
      queryClient.removeQueries({ queryKey: ['containers', 'detail', id] })
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
    onError: (error, { name }) => {
      console.error(`Failed to remove container ${name}`, error)
      errorToast(`Could not remove ${name}`, error)
    },
  })
}

export const useBulkRemoveContainersMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: (ids: Array<string>) => removeContainers(ids),
    onSuccess: (_data, ids) => {
      successToast(`${ids.length} containers removed`)
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
    onError: (error) => {
      console.error('Failed to remove containers', error)
      errorToast('Could not remove all containers', error)
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
  })
}

export const usePruneContainersMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: pruneContainers,
    onSuccess: () => {
      successToast('Stopped containers removed')
      queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
    onError: (error) => {
      console.error('Failed to prune containers', error)
      errorToast('Could not prune containers', error)
    },
  })
}
