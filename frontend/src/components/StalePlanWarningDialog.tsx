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
import { useTranslation } from 'react-i18next'

const MAX_STALE_PLAN_AGE = 1000 * 60 * 60 * 24 // 24 hours

export default function StalePlanWarningDialog() {
  const { t } = useTranslation()

  const { plan } = useContext(AppContext)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (import.meta.env.DEV) {
      const handle = (e: KeyboardEvent): void => {
        if (e.key === 'p') {
          setOpen(true)
        }
      }
      document.addEventListener('keydown', handle)

      return () => {
        document.removeEventListener('keydown', handle)
      }
    }
  }, [])

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
      <DialogTitle variant="h5">{t('Outdated plan')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 1 }}>
          {t(
            'It has been {{hoursSinceScraped}} hour(s) since this plan was scraped. This may indicate an error occurred while gathering data from the official website.',
            { hoursSinceScraped }
          )}
        </DialogContentText>
        <DialogContentText>
          {t('If this problem persists, please contact the administrator.')}
        </DialogContentText>
        <a href={plan.data.metadata.scrapedFrom}>
          <Button size="large" fullWidth variant="contained" sx={{ my: 2 }}>
            {t('Go to official plan website')}
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
          {t('Ignore')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
