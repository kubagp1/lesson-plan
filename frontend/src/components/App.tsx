import { useState } from 'react'
import { AppBar, Toolbar } from '@mui/material'
import PlanSelector from './PlanSelector'
import WeekdayTabs, { getCurrentWeekday } from './WeekdayTabs'
import { Weekday } from '../shared/types'
import { Box } from '@mui/system'
import WeekdaySlider from './WeekdaySlider'
import zIndex from '@mui/material/styles/zIndex'

export default function App() {
  const [planId, setPlanId] = useState<number | null>(null)
  const [weekday, setWeekday] = useState<Weekday>(getCurrentWeekday())

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
