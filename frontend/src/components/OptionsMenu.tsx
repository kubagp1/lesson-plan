import MoreIcon from '@mui/icons-material/MoreVert'
import { IconButton, Tooltip } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState, MouseEvent, Fragment, useEffect } from 'react'
import HideColumnsDialog from './HideColumnsDialog'
import DarkModeDialog from './DarkModeDialog'
import PlanInfoDialog from './PlanInfoDialog'
import useTooltip from './OptionsMenu_useTooltip'

const options = [
  {
    name: 'Ukryj / pokaż kolumny',
    dialog: HideColumnsDialog
  },
  {
    name: 'Ciemny motyw',
    dialog: DarkModeDialog
  },
  {
    name: 'Informacje o planie',
    dialog: PlanInfoDialog
  }
]

export default function OptionsMenu() {
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
        title="Możesz pokazać więcej kolumn tutaj"
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
