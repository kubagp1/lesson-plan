import {
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControl,
  Select,
  MenuItem,
  DialogActions,
  Button
} from '@mui/material'
import { i18n } from 'i18next'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  handleClose: () => void
}

export default function ChangeLanguageDialog(props: Props) {
  const { t, i18n } = useTranslation()
  const { open, handleClose } = props

  const handleChange = (e: SelectChangeEvent<'en' | 'pl'>) => {
    i18n.changeLanguage(e.target.value)
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t('Change language')}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 1 }}>
          {t('Select display language')}
        </DialogContentText>
        <FormControl fullWidth>
          <Select value={getLanguage(i18n)} onChange={handleChange}>
            <MenuItem value={'en'}>{t('English')}</MenuItem>
            <MenuItem value={'pl'}>{t('Polish')}</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('Close')}</Button>
      </DialogActions>
    </Dialog>
  )
}

function getLanguage(i18n: i18n) {
  if (i18n.language.toLowerCase().startsWith('pl')) {
    return 'pl'
  } else {
    return 'en'
  }
}
