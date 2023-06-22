import MoreIcon from '@mui/icons-material/MoreVert'
import { IconButton, Tooltip } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState, MouseEvent, Fragment, useEffect } from 'react'
import HideColumnsDialog from './HideColumnsDialog'
import DarkModeDialog from './DarkModeDialog'
import PlanInfoDialog from './PlanInfoDialog'

import { useTranslation } from 'react-i18next'

export default function OptionsMenu() {
  const { t } = useTranslation()

  const options = [
    {
      name: t('Hide / show columns'),
      dialog: HideColumnsDialog
    },
    {
      name: t('Dark mode'),
      dialog: DarkModeDialog
    },
    {
      name: t('About this plan'),
      dialog: PlanInfoDialog
    }
  ]

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const tooltipOpen = useTooltip()

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const [dialogsState, setDialogsState] = useState(options.map(() => false))

  const handleDialogClose = (index: number) => {
    setDialogsState((dialogsState) => {
      const newDialogsState = [...dialogsState]
      newDialogsState[index] = false
      return newDialogsState
    })
  }

  const handleOptionClick = (index: number) => {
    setDialogsState((dialogsState) => {
      const newDialogsState = [...dialogsState]
      newDialogsState[index] = true
      return newDialogsState
    })
    handleClose()
  }

  const open = Boolean(anchorEl)

  return (
    <Fragment>
      <Tooltip
        arrow
        title={t('You can show more columns here')}
        open={tooltipOpen}
        PopperProps={{
          modifiers: [
            {
              name: 'preventOverflow',
              options: {
                padding: 8
              }
            }
          ]
        }}
      >
        <IconButton
          size="large"
          edge="end"
          color="inherit"
          onClick={handleClick}
        >
          <MoreIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {options.map((option, index) => (
          <MenuItem key={index} onClick={() => handleOptionClick(index)}>
            {option.name}
          </MenuItem>
        ))}
      </Menu>

      {options.map((option, index) => {
        const Dialog = option.dialog
        return (
          <Dialog
            key={index}
            open={dialogsState[index]}
            handleClose={() => handleDialogClose(index)}
          />
        )
      })}
    </Fragment>
  )
}

function useTooltip() {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  useEffect(() => {
    let timeout: number | undefined
    if (localStorage.getItem('hideColumnsTooltip') === null) {
      const handleAnyClick = () => {
        localStorage.setItem('hideColumnsTooltip', 'true')
        setTooltipOpen(false)
        clearTimeout(timeout)
      }

      setTooltipOpen(true)

      timeout = setTimeout(() => {
        localStorage.setItem('hideColumnsTooltip', 'true')
        setTooltipOpen(false)
        document.removeEventListener('click', handleAnyClick)
        document.removeEventListener('touchstart', handleAnyClick)
      }, 5000)

      document.addEventListener('click', handleAnyClick)
      document.addEventListener('touchstart', handleAnyClick)

      return () => {
        clearTimeout(timeout)
        document.removeEventListener('click', handleAnyClick)
        document.removeEventListener('touchstart', handleAnyClick)
      }
    }
  }, [])

  return tooltipOpen
}
