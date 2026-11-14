import { useState } from 'react'
import { DownloadIcon } from 'lucide-react'
import { usePullImageMutation } from '../api/hooks'
import { AppDialog } from '@/components/common/AppDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function PullImageDialog() {
  const [open, setOpen] = useState(false)
  const [image, setImage] = useState('')
  const pullMutation = usePullImageMutation()

  const submit = () =>
    pullMutation.mutate(image.trim(), {
      onSuccess: () => {
        setImage('')
        setOpen(false)
      },
    })

  return (
    <AppDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button>
          <DownloadIcon />
          Pull image
        </Button>
      }
      title="Pull an image"
      description={
        <>
          Downloads an image from a registry, e.g. <code>nginx:latest</code> or{' '}
          <code>ghcr.io/org/app:1.0</code>.
        </>
      }
      onSubmit={submit}
      submitLabel={pullMutation.isPending ? 'Pulling…' : 'Pull'}
      submitIcon={DownloadIcon}
      submitting={pullMutation.isPending}
      submitDisabled={!image.trim()}
    >
      <div className="grid gap-2">
        <Label htmlFor="image-ref">Image</Label>
        <Input
          id="image-ref"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="nginx:latest"
          autoFocus
          disabled={pullMutation.isPending}
        />
      </div>
    </AppDialog>
  )
}
