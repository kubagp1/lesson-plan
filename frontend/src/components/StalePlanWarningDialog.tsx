import { useContext, useEffect, useState } from 'react'
import { AppContext } from './AppContext'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'

const MAX_STALE_PLAN_AGE = 1000 * 60 * 60 * 24 // 24 hours

export default function StalePlanWarningDialog() {
  const { plan } = useContext(AppContext)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (plan.data?.metadata.scrapedAt == undefined) {
      return
    }

    const scrapedAt = new Date(plan.data.metadata.scrapedAt)

    if (Date.now() - scrapedAt.getTime() > MAX_STALE_PLAN_AGE) {
      setOpen(true)
    }
  }, [plan.data])

  if (plan.data?.metadata.scrapedAt == undefined) {
    return null
  }

  const hoursSinceScraped = Math.floor(
    (Date.now() - new Date(plan.data.metadata.scrapedAt).getTime()) /
      (1000 * 60 * 60)
  )

  const handleClose = (_: Event, reason: string) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle variant="h5">Nieaktualny plan</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 1 }}>
          Minęło {hoursSinceScraped} godzin(y) od kiedy ten plan został
          zdrapany. Może to oznaczać, że wystąpił błąd podczas zbierania danych
          z oficjalnej strony.
        </DialogContentText>
        <DialogContentText>
          Jeśli ten problem będzie się powtarzał, skontaktuj się z
          administratorem.
        </DialogContentText>
        <a href="#">
          <Button size="large" fullWidth variant="contained" sx={{ my: 2 }}>
            Pzejdź do oficjalnej strony z planem
          </Button>
        </a>
      </DialogContent>
      <DialogActions>
        <Button
          color="warning"
          onClick={() => {
            setOpen(false)
          }}
        >
          Ignoruj
        </Button>
      </DialogActions>
    </Dialog>
  )
}
