import MoreIcon from '@mui/icons-material/MoreVert'
import { IconButton, Tooltip } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState, MouseEvent, Fragment, useEffect } from 'react'
import HideColumnsDialog from './HideColumnsDialog'

export default function OptionsMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [hideColumnsDialogOpen, setHideColumnsDialogOpen] = useState(false)
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
      }, 3000)

      document.addEventListener('click', handleAnyClick)
      document.addEventListener('touchstart', handleAnyClick)

      return () => {
        clearTimeout(timeout)
        document.removeEventListener('click', handleAnyClick)
        document.removeEventListener('touchstart', handleAnyClick)
      }
    }
  }, [])

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const handleHideColumnsClick = () => {
    handleClose()
    setHideColumnsDialogOpen(true)
  }
  const handleHideColumnsDialogClose = () => {
    setHideColumnsDialogOpen(false)
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
        <MenuItem onClick={handleHideColumnsClick}>
          Ukryj / pokaż kolumny
        </MenuItem>
      </Menu>
      <HideColumnsDialog
        open={hideColumnsDialogOpen}
        handleClose={handleHideColumnsDialogClose}
      />
    </Fragment>
  )
}
