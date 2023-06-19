import { createContext, useState } from 'react'
import { Weekday } from '../shared/types'
import { getCurrentWeekday } from './WeekdayTabs'

const initialState = {
  weekday: 'monday' as Weekday,
  setWeekday: (weekday: Weekday) => {}
}

export const WeekdayContext = createContext(initialState)

export function WeekdayContextProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [weekday, setWeekday] = useState<Weekday>(getCurrentWeekday())

  return (
    <WeekdayContext.Provider value={{ weekday, setWeekday }}>
      {children}
    </WeekdayContext.Provider>
  )
}
