import MoreIcon from '@mui/icons-material/MoreVert'
import { IconButton } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState, MouseEvent, Fragment } from 'react'
import HideColumnsDialog from './HideColumnsDialog'

export default function OptionsMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [hideColumnsDialogOpen, setHideColumnsDialogOpen] = useState(false)
  const open = Boolean(anchorEl)
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

  return (
    <Fragment>
      <IconButton size="large" edge="end" color="inherit" onClick={handleClick}>
        <MoreIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleHideColumnsClick}>Ukryj kolumny</MenuItem>
      </Menu>
      <HideColumnsDialog
        open={hideColumnsDialogOpen}
        handleClose={handleHideColumnsDialogClose}
      />
    </Fragment>
  )
}
