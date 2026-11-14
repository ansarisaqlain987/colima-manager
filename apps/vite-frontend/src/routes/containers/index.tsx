import { createFileRoute } from '@tanstack/react-router'
import { BrushCleaningIcon } from 'lucide-react'
import {
  useContainersQuery,
  usePruneContainersMutation,
} from './_lib/api/hooks'
import { ContainersTable } from './_lib/components/ContainersTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageHeader } from '@/components/common/PageHeader'
import { RefreshButton } from '@/components/common/RefreshButton'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/containers/')({
  component: ContainersPage,
})

function ContainersPage() {
  const {
    data: containers = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useContainersQuery()
  const { mutate: prune, isPending: isPruning } = usePruneContainersMutation()

  const running = containers.filter((c) => c.State === 'running').length

  return (
    <>
      <PageHeader
        title="Containers"
        description={`${containers.length} containers · ${running} running`}
      >
        <RefreshButton refreshing={isFetching} onClick={() => void refetch()} />
        <ConfirmDialog
          title="Remove all stopped containers?"
          description="Every container that is not running is deleted. This cannot be undone."
          confirmLabel="Prune"
          onConfirm={() => prune()}
          trigger={
            <Button variant="outline" disabled={isPruning}>
              {isPruning ? <Spinner /> : <BrushCleaningIcon />}
              Prune stopped
            </Button>
          }
        />
      </PageHeader>

      {error && <ErrorBanner message={error.message} />}

      <ContainersTable containers={containers} loading={isPending} />
    </>
  )
}
