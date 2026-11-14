import { createFileRoute } from '@tanstack/react-router'
import { BrushCleaningIcon } from 'lucide-react'
import { usePruneVolumesMutation, useVolumesQuery } from './_lib/api/hooks'
import { CreateVolumeDialog } from './_lib/components/CreateVolumeDialog'
import { VolumesTable } from './_lib/components/VolumesTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageHeader } from '@/components/common/PageHeader'
import { RefreshButton } from '@/components/common/RefreshButton'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/volumes/')({
  component: VolumesPage,
})

function VolumesPage() {
  const {
    data: volumes = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useVolumesQuery()
  const { mutate: prune, isPending: isPruning } = usePruneVolumesMutation()

  return (
    <>
      <PageHeader title="Volumes" description={`${volumes.length} volumes`}>
        <RefreshButton refreshing={isFetching} onClick={() => void refetch()} />
        <ConfirmDialog
          title="Remove unused volumes?"
          description="Deletes every volume (named and anonymous) that no container uses, including the data in it. This cannot be undone."
          confirmLabel="Prune"
          onConfirm={() => prune()}
          trigger={
            <Button variant="outline" disabled={isPruning}>
              {isPruning ? <Spinner /> : <BrushCleaningIcon />}
              Prune unused
            </Button>
          }
        />
        <CreateVolumeDialog />
      </PageHeader>

      {error && <ErrorBanner message={error.message} />}

      <VolumesTable volumes={volumes} loading={isPending} />
    </>
  )
}
