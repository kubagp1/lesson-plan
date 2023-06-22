import { useContext, useEffect, useMemo, useState } from 'react'

import { Plan, Weekday, weekdays } from '../shared/types'
import WeekdaySlide from './WeekdaySlide'
import SignalCellularConnectedNoInternet0BarIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0Bar'
import EmblaCarousel from './EmblaCarousel'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { AppContext } from './AppContext'
import { WeekdayContext } from './WeekdayContext'
import { useTranslation } from 'react-i18next'

export default function WeekdaySlider() {
  const { t } = useTranslation()

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

  if (isError)
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '10vh',
          paddingInline: '16px',
          gap: '16px'
        }}
      >
        <SignalCellularConnectedNoInternet0BarIcon
          sx={{
            fontSize: '40vw',
            opacity: '0.5'
          }}
        />
        <Typography textAlign="center">
          {t('Failed to load. Please check your internet connection.')}
        </Typography>

        <a href={import.meta.env.VITE_FALLBACK_URL || 'http://example.com'}>
          <Button variant="contained" fullWidth size="large">
            {t('Go to original plan site')}
          </Button>
        </a>
      </Box>
    )

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
