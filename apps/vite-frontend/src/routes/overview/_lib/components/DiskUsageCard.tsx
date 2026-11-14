import type { DiskUsageRow } from '@/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function DiskUsageCard({ rows }: { rows: Array<DiskUsageRow> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Disk usage</CardTitle>
        <CardDescription>Space used inside the Colima VM</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Active</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Reclaimable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.Type}>
                <TableCell className="font-medium">{row.Type}</TableCell>
                <TableCell className="text-right">{row.TotalCount}</TableCell>
                <TableCell className="text-right">{row.Active}</TableCell>
                <TableCell className="text-right">{row.Size}</TableCell>
                <TableCell className="text-right">{row.Reclaimable}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
