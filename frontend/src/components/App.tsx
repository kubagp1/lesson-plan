import { useEffect, useState } from 'react'
import { AppBar, Toolbar } from '@mui/material'
import PlanSelector from './PlanSelector'
import WeekdayTabs, { getCurrentWeekday } from './WeekdayTabs'
import { Weekday } from '../shared/types'
import { Box } from '@mui/system'
import WeekdaySlider from './WeekdaySlider'

function getPlanIdFromUrl(): number | null {
  const currentUrl = window.location.pathname

  const regex = /^\/plan\/(\d+)/

  const match = regex.exec(currentUrl)?.[1]
  return match === undefined ? null : parseInt(match)
}

export default function App() {
  const [planId, setPlanId] = useState<number | null>(getPlanIdFromUrl())
  const [weekday, setWeekday] = useState<Weekday>(getCurrentWeekday())

  useEffect(() => {
    const popstateHandler = () => {
      setPlanId(getPlanIdFromUrl())
    }
    window.addEventListener('popstate', popstateHandler)
    return () => window.removeEventListener('popstate', popstateHandler)
  }, [])

  useEffect(() => {
    if (planId === null) return
    if (planId === getPlanIdFromUrl()) return

    history.pushState(null, '', `/plan/${planId}`)
  }, [planId])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1100, // z-index of AppBar
          backgroundColor: '#fff'
        }}
      >
        <AppBar position="static">
          <Toolbar>
            <PlanSelector planId={planId} setPlanId={setPlanId}></PlanSelector>
          </Toolbar>
        </AppBar>
        <WeekdayTabs weekday={weekday} setWeekday={setWeekday}></WeekdayTabs>
      </Box>
      <WeekdaySlider
        planId={planId}
        weekday={weekday}
        setWeekday={setWeekday}
      ></WeekdaySlider>
    </Box>
  )
}
