import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography
} from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

type HideColumsDialogProps = {
  open: boolean
  handleClose: () => void
}

export default function HideColumnsDialog({
  open,
  handleClose
}: HideColumsDialogProps) {
  return (
    <div>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle variant="h5">Ukryj kolumny</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ marginBottom: '8px' }}>
            Zaznacz kolumny które mają być ukryte dla każdej kategorii
          </DialogContentText>
          <section>
            <Typography variant="h6">Uczniowie</Typography>
            <FormGroup row>
              <FormControlLabel control={<Checkbox />} label="Nauczyciel" />
              <FormControlLabel control={<Checkbox />} label="Lekcja" />
              <FormControlLabel control={<Checkbox />} label="Sala" />
            </FormGroup>
          </section>
          <section>
            <Typography variant="h6">Nauczyciele</Typography>
            <FormGroup row>
              <FormControlLabel control={<Checkbox />} label="Klasa" />
              <FormControlLabel control={<Checkbox />} label="Lekcja" />
              <FormControlLabel control={<Checkbox />} label="Sala" />
            </FormGroup>
          </section>
          <section>
            <Typography variant="h6">Sale</Typography>
            <FormGroup row>
              <FormControlLabel control={<Checkbox />} label="Klasa" />
              <FormControlLabel control={<Checkbox />} label="Nauczyciel" />
              <FormControlLabel control={<Checkbox />} label="Lekcja" />
            </FormGroup>
          </section>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>zamknij</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
