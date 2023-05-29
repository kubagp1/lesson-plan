import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material'
import { useContext, useState } from 'react'
import { DarkModeContext } from './DarkModeContext'

type Props = {
  open: boolean
  handleClose: () => void
}

export default function DarkModeDialog(props: Props) {
  const { open, handleClose } = props
  const darkModeContext = useContext(DarkModeContext)

  const handleChange = (e: SelectChangeEvent<'auto' | 'always' | 'never'>) => {
    darkModeContext.setOption(e.target.value as 'auto' | 'always' | 'never') // TODO: find a way to avoid this cast
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Ciemny motyw</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 1 }}>
          Używaj ciemnego motywu
        </DialogContentText>
        <FormControl fullWidth>
          <Select value={darkModeContext.option} onChange={handleChange}>
            <MenuItem value={'always'}>Zawsze</MenuItem>
            <MenuItem value={'never'}>Nigdy</MenuItem>
            <MenuItem value={'auto'}>Automatycznie</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
