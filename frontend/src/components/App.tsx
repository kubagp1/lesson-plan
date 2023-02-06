import { useState } from 'react'
import { AppBar, Toolbar } from '@mui/material'
import PlanSelector from './PlanSelector'
import WeekdayTabs, { getCurrentWeekday } from './WeekdayTabs'
import { Weekday } from '../shared/types'
import { Box } from '@mui/system'
import WeekdaySlider from './WeekdaySlider'

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
      <AppBar position="static">
        <Toolbar>
          <PlanSelector planId={planId} setPlanId={setPlanId}></PlanSelector>
        </Toolbar>
      </AppBar>
      <WeekdayTabs weekday={weekday} setWeekday={setWeekday}></WeekdayTabs>
      <WeekdaySlider
        planId={planId}
        weekday={weekday}
        setWeekday={setWeekday}
      ></WeekdaySlider>
    </Box>
  )
}
