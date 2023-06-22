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
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  handleClose: () => void
}

export default function DarkModeDialog(props: Props) {
  const { t } = useTranslation()
  const { open, handleClose } = props
  const darkModeContext = useContext(DarkModeContext)

  const handleChange = (e: SelectChangeEvent<'auto' | 'always' | 'never'>) => {
    darkModeContext.setOption(e.target.value as 'auto' | 'always' | 'never') // TODO: find a way to avoid this cast
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t('Dark mode')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 1 }}>
          {t('Use dark mode')}
        </DialogContentText>
        <FormControl fullWidth>
          <Select value={darkModeContext.option} onChange={handleChange}>
            <MenuItem value={'always'}>{t('Always')}</MenuItem>
            <MenuItem value={'never'}>{t('Never')}</MenuItem>
            <MenuItem value={'auto'}>{t('Automatically')}</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('Close')}</Button>
      </DialogActions>
    </Dialog>
  )
}
