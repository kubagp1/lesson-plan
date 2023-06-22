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
import { useTranslation } from 'react-i18next'

type HideColumsDialogProps = {
  open: boolean
  handleClose: () => void
}

export default function HideColumnsDialog({
  open,
  handleClose
}: HideColumsDialogProps) {
  const { t } = useTranslation()

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
            key={i}
            control={<Checkbox />}
            label={label}
            checked={!configuration[category][columns[i]]}
            onChange={(e, checked) =>
              dispatch({
                category,
                column: columns[i],
                value: !checked
              })
            }
          />
        ))}
      </FormGroup>
    )
  }

  const restoreDefaults = () => {
    dispatch({
      restoreDefaults: true
    })
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle variant="h5">{t('Hide / show columns')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ marginBottom: '12px' }}>
            {t('Select the columns to be shown for each category')}
          </DialogContentText>
          <section>
            <Typography variant="h6">{t('Students')}</Typography>
            {checkBoxesFactory('class', [
              t('Teacher'),
              t('Lesson'),
              t('Classroom')
            ])}
          </section>
          <section>
            <Typography variant="h6">{t('Teachers')}</Typography>
            {checkBoxesFactory('teacher', [
              t('Class'),
              t('Lesson'),
              t('Classroom')
            ])}
          </section>
          <section>
            <Typography variant="h6">{t('Classrooms')}</Typography>
            {checkBoxesFactory('classroom', [
              t('Class'),
              t('Teacher'),
              t('Lesson')
            ])}
          </section>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button color="error" onClick={restoreDefaults}>
            {t('Restore defaults')}
          </Button>
          <Button onClick={handleClose}>{t('Close')}</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
