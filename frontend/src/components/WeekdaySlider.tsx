import { useContext, useEffect, useMemo, useState } from 'react'

import { Plan, Weekday, weekdays } from '../shared/types'
import WeekdaySlide from './WeekdaySlide'
import apiCalls from '../apiCalls'
import EmblaCarousel from './EmblaCarousel'
import { Box, CircularProgress } from '@mui/material'
import { AppContext } from './AppContext'
import { WeekdayContext } from './WeekdayContext'

export default function WeekdaySlider() {
  const { plan: planQuery } = useContext(AppContext)
  const { weekday, setWeekday } = useContext(WeekdayContext)

  const { data: plan, isLoading, isError } = planQuery

  type WeekdayLessonDict = { [K in Weekday]: Plan['timetable'][Weekday] }
  // for readability

  const weekdayLessonDict = useMemo(() => {
    if (!plan) return {} as WeekdayLessonDict
    return weekdays.reduce<WeekdayLessonDict>((acc, weekday) => {
      return { ...acc, ...{ [weekday]: plan.timetable[weekday] } }
    }, {} as WeekdayLessonDict)
  }, [plan])

  const slides = useMemo(() => {
    if (!plan) return []
    return weekdays.map((weekday) => (
      <WeekdaySlide
        key={weekday}
        lessons={weekdayLessonDict[weekday]}
        hours={plan.hours}
        isToday={isToday(weekday)}
      ></WeekdaySlide>
    ))
  }, [plan])

  if (isLoading)
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}
      >
        <CircularProgress />
      </Box>
    )

  if (isError) return <div>Error</div> // TODO: Better error

  return (
    <EmblaCarousel
      index={weekdays.indexOf(weekday)}
      onChange={(index) => {
        setWeekday(weekdays[index])
      }}
    >
      {slides}
    </EmblaCarousel>
  )
}

function isToday(weekday: Weekday): boolean {
  const today = new Date().getDay()
  const days: { [key: number]: Weekday } = {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday'
  }
  return days[today] === weekday
}
