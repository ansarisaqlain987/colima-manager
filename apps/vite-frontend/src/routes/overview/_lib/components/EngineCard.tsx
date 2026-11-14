import type { DockerInfo } from '@/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function EngineCard({ info }: { info: DockerInfo }) {
  const rows: Array<[string, string]> = [
    ['Docker version', info.ServerVersion],
    ['Operating system', info.OperatingSystem],
    ['Kernel', info.KernelVersion],
    ['Architecture', info.Architecture],
    ['Storage driver', info.Driver],
    ['Data root', info.DockerRootDir],
    ['Host name', info.Name],
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Docker engine</CardTitle>
        <CardDescription>
          The Docker daemon running in the Colima VM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="truncate font-medium">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
