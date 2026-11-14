import { createFileRoute } from '@tanstack/react-router'
import { BrushCleaningIcon } from 'lucide-react'
import { useImagesQuery, usePruneImagesMutation } from './_lib/api/hooks'
import { ImagesTable } from './_lib/components/ImagesTable'
import { PullImageDialog } from './_lib/components/PullImageDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageHeader } from '@/components/common/PageHeader'
import { RefreshButton } from '@/components/common/RefreshButton'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/images/')({
  component: ImagesPage,
})

function ImagesPage() {
  const {
    data: images = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useImagesQuery()
  const { mutate: prune, isPending: isPruning } = usePruneImagesMutation()

  return (
    <>
      <PageHeader title="Images" description={`${images.length} images`}>
        <RefreshButton refreshing={isFetching} onClick={() => void refetch()} />
        <ConfirmDialog
          title="Remove unused images?"
          description="Deletes every image that no container uses (not just dangling ones). They can be pulled again later."
          confirmLabel="Prune"
          onConfirm={() => prune(true)}
          trigger={
            <Button variant="outline" disabled={isPruning}>
              {isPruning ? <Spinner /> : <BrushCleaningIcon />}
              Prune unused
            </Button>
          }
        />
        <PullImageDialog />
      </PageHeader>

      {error && <ErrorBanner message={error.message} />}

      <ImagesTable images={images} loading={isPending} />
    </>
  )
}
