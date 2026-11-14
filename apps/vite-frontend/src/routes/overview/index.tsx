import { createFileRoute } from '@tanstack/react-router'
import { BoxIcon, CpuIcon, LayersIcon, MemoryStickIcon } from 'lucide-react'
import { useDiskUsageQuery, useDockerInfoQuery } from './_lib/api/hooks'
import { DiskUsageCard } from './_lib/components/DiskUsageCard'
import { EngineCard } from './_lib/components/EngineCard'
import { OverviewSkeleton } from './_lib/components/OverviewSkeleton'
import { StatCard } from './_lib/components/StatCard'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageHeader } from '@/components/common/PageHeader'
import { RefreshButton } from '@/components/common/RefreshButton'
import { formatBytes } from '@/lib/format'

export const Route = createFileRoute('/overview/')({
  component: OverviewPage,
})

function OverviewPage() {
  const {
    data: info,
    isPending,
    isFetching: isFetchingInfo,
    error: infoError,
    refetch: refetchInfo,
  } = useDockerInfoQuery()
  const {
    data: disk = [],
    isFetching: isFetchingDisk,
    error: diskError,
    refetch: refetchDisk,
  } = useDiskUsageQuery()
  const error = infoError ?? diskError

  return (
    <>
      <PageHeader
        title="Overview"
        description="Resources of the Colima VM and its Docker engine"
      >
        <RefreshButton
          refreshing={isFetchingInfo || isFetchingDisk}
          onClick={() => {
            void refetchInfo()
            void refetchDisk()
          }}
        />
      </PageHeader>

      {error && <ErrorBanner message={error.message} />}

      {isPending ? (
        <OverviewSkeleton />
      ) : (
        info && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={CpuIcon} label="CPUs" value={info.NCPU} />
              <StatCard
                icon={MemoryStickIcon}
                label="Memory"
                value={formatBytes(info.MemTotal)}
              />
              <StatCard
                icon={BoxIcon}
                label="Containers"
                value={info.Containers}
                hint={`${info.ContainersRunning} running · ${info.ContainersStopped} stopped · ${info.ContainersPaused} paused`}
              />
              <StatCard icon={LayersIcon} label="Images" value={info.Images} />
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <EngineCard info={info} />
              <DiskUsageCard rows={disk} />
            </div>
          </>
        )
      )}
    </>
  )
}
