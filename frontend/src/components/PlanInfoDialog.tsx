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

type Props = {
  open: boolean
  handleClose: () => void
}

export default function PlanInfoDialog(props: Props) {
  const { open, handleClose } = props
  const { plan } = useContext(AppContext)

  if (plan.data == undefined) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle variant="h5">Informacje o planie</DialogTitle>
        <DialogContent>
          <DialogContentText>Ładowanie...</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle variant="h5">Informacje o planie</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Obowiązuje od</Typography>
        <Typography>
          {formatDateTime(plan.data.metadata.applicableAt)}
        </Typography>

        <Typography variant="h6">Wygenerowano</Typography>
        <Typography>
          {formatDateTime(plan.data.metadata.generatedAt)}
        </Typography>

        <Typography variant="h6">Zeskrobano</Typography>
        <Typography>
          {formatDateTimeScraped(plan.data.metadata.scrapedAt)}
        </Typography>

        <Typography variant="h6">Typ skrobacza</Typography>
        <Typography>
          {plan.data.metadata.scrapedUsing == 'full' ? 'Pełny' : 'Tylko klasy'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Zamknij</Button>
      </DialogActions>
    </Dialog>
  )
}

function formatDateTime(dateTime: string) {
  const date = new Date(dateTime)
  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatDateTimeScraped(dateTime: string) {
  const date = new Date(dateTime)
  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
