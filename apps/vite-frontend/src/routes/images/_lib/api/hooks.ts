import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getImages,
  pruneImages,
  pullImage,
  removeImage,
  removeImages,
} from './api'
import { useToast } from '@/hooks/use-toast'

export const useImagesQuery = () =>
  useQuery({
    queryKey: ['images', 'list'],
    queryFn: getImages,
  })

export const usePullImageMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: (image: string) => pullImage(image),
    onSuccess: (_data, image) => {
      successToast('Image pulled', image)
      queryClient.invalidateQueries({ queryKey: ['images'] })
    },
    onError: (error, image) => {
      console.error(`Failed to pull image ${image}`, error)
      errorToast(`Could not pull ${image}`, error)
    },
  })
}

export const useRemoveImageMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: ({ id }: { id: string; label: string }) => removeImage(id),
    onSuccess: (_data, { label }) => {
      successToast('Image removed', label)
      queryClient.invalidateQueries({ queryKey: ['images'] })
    },
    onError: (error, { label }) => {
      console.error(`Failed to remove image ${label}`, error)
      errorToast(`Could not remove ${label}`, error)
    },
  })
}

export const useBulkRemoveImagesMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: (ids: Array<string>) => removeImages(ids),
    onSuccess: (_data, ids) => {
      successToast(`${ids.length} images removed`)
      queryClient.invalidateQueries({ queryKey: ['images'] })
    },
    onError: (error) => {
      console.error('Failed to remove images', error)
      errorToast('Could not remove all images', error)
      queryClient.invalidateQueries({ queryKey: ['images'] })
    },
  })
}

export const usePruneImagesMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()

  return useMutation({
    mutationFn: (all: boolean) => pruneImages(all),
    onSuccess: () => {
      successToast('Unused images removed')
      queryClient.invalidateQueries({ queryKey: ['images'] })
    },
    onError: (error) => {
      console.error('Failed to prune images', error)
      errorToast('Could not prune images', error)
    },
  })
}
