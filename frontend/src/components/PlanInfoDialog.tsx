import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from '@mui/material'
import { useContext } from 'react'
import { AppContext } from './AppContext'

import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  handleClose: () => void
}

export default function PlanInfoDialog(props: Props) {
  const { t } = useTranslation()

  const { open, handleClose } = props
  const { plan } = useContext(AppContext)

  if (plan.data == undefined) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle variant="h5">{t('About this plan')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('Loading...')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('Close')}</Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle variant="h5">{t('About this plan')}</DialogTitle>
      <DialogContent>
        {plan.data.metadata.applicableAt != null ? (
          <>
            <Typography variant="h6">{t('Effective from')}</Typography>
            <Typography>
              {formatDateTime(plan.data.metadata.applicableAt)}
            </Typography>
          </>
        ) : null}

        {plan.data.metadata.generatedAt != null ? (
          <>
            <Typography variant="h6">{t('Generated at')}</Typography>
            <Typography>
              {formatDateTime(plan.data.metadata.generatedAt)}
            </Typography>
          </>
        ) : null}

        <Typography variant="h6">{t('Scraped at')}</Typography>
        <Typography>
          {formatDateTimeScraped(plan.data.metadata.scrapedAt)}
        </Typography>

        <Typography variant="h6">{t('Scraper type')}</Typography>
        <Typography>
          {plan.data.metadata.scrapedUsing == 'full'
            ? t('Full')
            : t('Classes only')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('Close')}</Button>
      </DialogActions>
    </Dialog>
  )
}

function formatDateTime(dateTime: string) {
  const date = new Date(dateTime)
  return date.toLocaleDateString(navigator.language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatDateTimeScraped(dateTime: string) {
  const date = new Date(dateTime)
  return date.toLocaleDateString(navigator.language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
