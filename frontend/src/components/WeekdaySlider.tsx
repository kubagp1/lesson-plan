import { useEffect, useState } from 'react'

import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'

import './../carousel-overrides.less'
// This is surpisingly the least painful way to have a swipeable things
// I have tried other libraries, but they all had some issues
// This one is the least bad (only weird DOM and some annoying defaults), but still not great

import { Plan, Weekday, weekdays } from '../shared/types'
import WeekdaySlide from './WeekdaySlide'
import apiCalls from '../apiCalls'

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

  if (!isLoaded) return <div>Loading...</div>

  type WeekdayLessonDict = { [K in Weekday]: Plan['timetable'][Weekday] }
  // for readability

  const weekdayLessonDict = weekdays.reduce<WeekdayLessonDict>(
    (acc, weekday) => {
      return { ...acc, ...{ [weekday]: plan!.timetable[weekday] } }
    },
    {} as WeekdayLessonDict
  )

  return (
    <Carousel
      selectedItem={weekdays.indexOf(weekday)}
      onChange={(index) => {
        setWeekday(weekdays[index])
      }}
      showThumbs={false}
      showArrows={false}
      showIndicators={false}
      showStatus={false}
    >
      {weekdays.map((weekday) => (
        <WeekdaySlide
          key={weekday}
          lessons={weekdayLessonDict[weekday]}
          hours={plan!.hours}
        ></WeekdaySlide>
      ))}
    </Carousel>
  )
}
