import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { RotateCcwIcon } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Terminal } from '@/components/Terminal'
import { Button } from '@/components/ui/button'
import { wsUrl } from '@/lib/ws'

export const Route = createFileRoute('/terminal/')({
  component: TerminalPage,
})

function TerminalPage() {
  const [session, setSession] = useState(0)

  return (
    <>
      <PageHeader
        title="Terminal"
        description={
          <>
            A bash shell in the rust-backend container with the Docker CLI
            connected to Colima — try <code>docker ps</code> or{' '}
            <code>docker run -d nginx</code>.
          </>
        }
      >
        <Button variant="outline" onClick={() => setSession((n) => n + 1)}>
          <RotateCcwIcon />
          New session
        </Button>
      </PageHeader>

      <Terminal
        key={session}
        url={wsUrl('/terminal')}
        className="h-[calc(100vh-12rem)]"
      />
    </>
  )
}
