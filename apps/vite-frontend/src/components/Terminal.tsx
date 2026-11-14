import { useEffect, useRef, useState } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status = 'connecting' | 'open' | 'closed'

interface TerminalProps {
  url: string
  interactive?: boolean
  className?: string
}

export function Terminal({
  url,
  interactive = true,
  className,
}: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>('connecting')

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const term = new XTerm({
      cursorBlink: interactive,
      disableStdin: !interactive,
      convertEol: !interactive,
      scrollback: 10_000,
      fontSize: 13,
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      theme: { background: '#09090b', foreground: '#e4e4e7' },
    })
    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(element)
    fit.fit()

    setStatus('connecting')
    const ws = new WebSocket(url)
    ws.binaryType = 'arraybuffer'

    const sendResize = () => {
      if (interactive && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }),
        )
      }
    }

    ws.onopen = () => {
      setStatus('open')
      sendResize()
      if (interactive) term.focus()
    }
    ws.onmessage = (event: MessageEvent<string | ArrayBuffer>) => {
      term.write(
        typeof event.data === 'string'
          ? event.data
          : new Uint8Array(event.data),
      )
    }
    ws.onclose = () => {
      setStatus('closed')
      term.write('\r\n\x1b[90m[session closed]\x1b[0m\r\n')
    }

    const input = interactive
      ? term.onData((data) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'input', data }))
          }
        })
      : undefined

    const observer = new ResizeObserver(() => {
      fit.fit()
      sendResize()
    })
    observer.observe(element)

    return () => {
      observer.disconnect()
      input?.dispose()
      ws.close()
      term.dispose()
    }
  }, [url, interactive])

  return (
    <div
      className={cn(
        'relative flex min-h-80 flex-col overflow-hidden rounded-lg border bg-[#09090b] p-2',
        className,
      )}
    >
      <Badge
        variant={status === 'open' ? 'secondary' : 'outline'}
        className="absolute top-2 right-3 z-10 bg-zinc-900 text-zinc-300"
      >
        {status === 'open'
          ? interactive
            ? 'Connected'
            : 'Live'
          : status === 'connecting'
            ? 'Connecting…'
            : 'Closed'}
      </Badge>
      <div ref={containerRef} className="min-h-0 flex-1" />
    </div>
  )
}
