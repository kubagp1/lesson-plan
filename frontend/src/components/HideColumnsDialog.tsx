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
import React, { useContext } from 'react'
import { CategoryName } from '../shared/types'
import {
  HideColumnsContext,
  HideColumnsDispatchContext
} from './HideColumnsContext'

type HideColumsDialogProps = {
  open: boolean
  handleClose: () => void
}

export default function HideColumnsDialog({
  open,
  handleClose
}: HideColumsDialogProps) {
  const configuration = useContext(HideColumnsContext)
  const dispatch = useContext(HideColumnsDispatchContext)

  const checkBoxesFactory = (
    category: CategoryName,
    labels: [string, string, string]
  ) => {
    const columns = ['centerLeft', 'centerRight', 'right'] as const

    return (
      <FormGroup row>
        {labels.map((label, i) => (
          <FormControlLabel
            control={<Checkbox />}
            label={label}
            checked={configuration[category][columns[i]]}
            onChange={(e, checked) =>
              dispatch({
                category,
                column: columns[i],
                value: checked
              })
            }
          />
        ))}
      </FormGroup>
    )
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose} fullWidth>
        {/* {JSON.stringify(configuration, null, 2)} */}
        <DialogTitle variant="h5">Ukryj kolumny</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ marginBottom: '12px' }}>
            Zaznacz kolumny które mają być ukryte dla każdej kategorii
          </DialogContentText>
          <section>
            <Typography variant="h6">Uczniowie</Typography>
            {checkBoxesFactory('class', ['Nauczyciel', 'Lekcja', 'Sala'])}
          </section>
          <section>
            <Typography variant="h6">Nauczyciele</Typography>
            {checkBoxesFactory('teacher', ['Klasa', 'Lekcja', 'Sala'])}
          </section>
          <section>
            <Typography variant="h6">Sale</Typography>
            {checkBoxesFactory('classroom', ['Klasa', 'Nauczyciel', 'Lekcja'])}
          </section>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>zamknij</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
