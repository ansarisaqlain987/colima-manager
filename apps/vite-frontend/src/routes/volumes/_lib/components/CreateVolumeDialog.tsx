import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { useCreateVolumeMutation } from '../api/hooks'
import { AppDialog } from '@/components/common/AppDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CreateVolumeDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const createMutation = useCreateVolumeMutation()

  const submit = () =>
    createMutation.mutate(name.trim(), {
      onSuccess: () => {
        setName('')
        setOpen(false)
      },
    })

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <PlusIcon />
          Create volume
        </Button>
      }
      title="Create a volume"
      description="Named volumes keep data across container restarts and removals."
      onSubmit={submit}
      submitLabel="Create"
      submitIcon={PlusIcon}
      submitting={createMutation.isPending}
      submitDisabled={!name.trim()}
    >
      <div className="grid gap-2">
        <Label htmlFor="volume-name">Name</Label>
        <Input
          id="volume-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="my-data"
          autoFocus
          disabled={createMutation.isPending}
        />
      </div>
    </AppDialog>
  )
}
