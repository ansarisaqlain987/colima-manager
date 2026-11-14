import { createFileRoute } from '@tanstack/react-router'
import { BrushCleaningIcon } from 'lucide-react'
import { useNetworksQuery, usePruneNetworksMutation } from './_lib/api/hooks'
import { NetworksTable } from './_lib/components/NetworksTable'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageHeader } from '@/components/common/PageHeader'
import { RefreshButton } from '@/components/common/RefreshButton'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/networks/')({
  component: NetworksPage,
})

function NetworksPage() {
  const {
    data: networks = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useNetworksQuery()
  const { mutate: prune, isPending: isPruning } = usePruneNetworksMutation()

  return (
    <>
      <PageHeader title="Networks" description={`${networks.length} networks`}>
        <RefreshButton refreshing={isFetching} onClick={() => void refetch()} />
        <ConfirmDialog
          title="Remove unused networks?"
          description="Deletes every custom network that no container is connected to."
          confirmLabel="Prune"
          onConfirm={() => prune()}
          trigger={
            <Button variant="outline" disabled={isPruning}>
              {isPruning ? <Spinner /> : <BrushCleaningIcon />}
              Prune unused
            </Button>
          }
        />
      </PageHeader>

      {error && <ErrorBanner message={error.message} />}

      <NetworksTable networks={networks} loading={isPending} />
    </>
  )
}
