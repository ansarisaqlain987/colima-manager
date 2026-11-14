import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { useContainerQuery } from '../_lib/api/hooks'
import { ContainerActions } from '../_lib/components/ContainerActions'
import { ContainerStateBadge } from '../_lib/components/ContainerStateBadge'
import { ErrorBanner } from '@/components/common/ErrorBanner'
import { PageHeader } from '@/components/common/PageHeader'
import { Terminal } from '@/components/Terminal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { shortId } from '@/lib/format'
import { wsUrl } from '@/lib/ws'

const TABS = ['logs', 'terminal', 'inspect'] as const
type Tab = (typeof TABS)[number]

export const Route = createFileRoute('/containers/$containerId/')({
  validateSearch: (search: Record<string, unknown>): { tab: Tab } => ({
    tab: TABS.includes(search.tab as Tab) ? (search.tab as Tab) : 'logs',
  }),
  component: ContainerDetailPage,
})

function ContainerDetailPage() {
  const { containerId } = Route.useParams()
  const { tab } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data: detail, error } = useContainerQuery(containerId)

  const state = detail?.State.Status ?? 'unknown'
  const name = detail?.Name.replace(/^\//, '') ?? shortId(containerId)
  const running = state === 'running'

  return (
    <>
      <Button variant="ghost" size="sm" className="-ml-2 self-start" asChild>
        <Link to="/containers">
          <ArrowLeftIcon />
          Containers
        </Link>
      </Button>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {name}
            <ContainerStateBadge state={state} />
          </span>
        }
        description={
          <span className="font-mono">
            {shortId(containerId)} · {detail?.Config.Image ?? ''}
          </span>
        }
      >
        <ContainerActions
          id={containerId}
          name={name}
          state={state}
          onRemoved={() => void navigate({ to: '/containers' })}
        />
      </PageHeader>

      {error && <ErrorBanner message={error.message} />}

      <Tabs
        value={tab}
        onValueChange={(value) =>
          void navigate({ search: { tab: value as Tab }, replace: true })
        }
        className="flex flex-1 flex-col"
      >
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
          <TabsTrigger value="inspect">Inspect</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="flex flex-1 flex-col">
          <Terminal
            key={`${containerId}-${running}`}
            url={wsUrl(`/containers/${containerId}/logs?tail=1000`)}
            interactive={false}
            className="h-[calc(100vh-18rem)]"
          />
        </TabsContent>

        <TabsContent value="terminal" className="flex flex-1 flex-col">
          {running ? (
            <Terminal
              url={wsUrl(
                `/terminal?container=${encodeURIComponent(containerId)}`,
              )}
              className="h-[calc(100vh-18rem)]"
            />
          ) : (
            <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              Start the container to open a shell inside it.
            </p>
          )}
        </TabsContent>

        <TabsContent value="inspect">
          {detail ? (
            <pre className="max-h-[calc(100vh-18rem)] overflow-auto rounded-lg border bg-muted/40 p-4 font-mono text-xs">
              {JSON.stringify(detail, null, 2)}
            </pre>
          ) : (
            <div className="flex flex-col gap-2 rounded-lg border p-4">
              {Array.from({ length: 12 }, (_, i) => (
                <Skeleton
                  key={i}
                  className="h-3"
                  style={{ width: `${40 + ((i * 37) % 55)}%` }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}
