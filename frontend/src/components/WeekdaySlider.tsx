import { useEffect, useState } from 'react'

import { Plan, Weekday, weekdays } from '../shared/types'
import WeekdaySlide from './WeekdaySlide'
import apiCalls from '../apiCalls'
import EmblaCarousel from './EmblaCarousel'
import { Box, CircularProgress } from '@mui/material'

interface WeekdayViewsProps {
  planId: number | null
  weekday: Weekday
  setWeekday: (weekday: Weekday) => void
}

export default function WeekdayViews({
  planId,
  weekday,
  setWeekday
}: WeekdayViewsProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)

  useEffect(() => {
    if (planId === null) return
    setIsLoaded(false)
    apiCalls.getPlan(planId).then((plan) => {
      if (plan.id !== planId) return
      setPlan(plan)
      setIsLoaded(true)
    })
  }, [planId])

  if (!isLoaded)
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', paddingTop: '16px' }}
      >
        <CircularProgress />
      </Box>
    )

  type WeekdayLessonDict = { [K in Weekday]: Plan['timetable'][Weekday] }
  // for readability

  const weekdayLessonDict = weekdays.reduce<WeekdayLessonDict>(
    (acc, weekday) => {
      return { ...acc, ...{ [weekday]: plan!.timetable[weekday] } }
    },
    {} as WeekdayLessonDict
  )

  return (
    <EmblaCarousel
      index={weekdays.indexOf(weekday)}
      onChange={(index) => {
        setWeekday(weekdays[index])
      }}
    >
      {weekdays.map((weekday) => (
        <WeekdaySlide
          key={weekday}
          lessons={weekdayLessonDict[weekday]}
          hours={plan!.hours}
        ></WeekdaySlide>
      ))}
    </EmblaCarousel>
  )
}
