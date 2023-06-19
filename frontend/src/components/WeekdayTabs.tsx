import { Tab, Tabs } from '@mui/material'
import { Weekday, weekdays } from '../shared/types'
import { useContext } from 'react'
import { WeekdayContext } from './WeekdayContext'

export function getCurrentWeekday(): Weekday {
  const date = new Date()
  var weekdayNumber = date.getDay()
  if (weekdayNumber > 5 || weekdayNumber < 1) weekdayNumber = 1

  return weekdays[weekdayNumber - 1]
}

const labels = ['pon.', 'wt.', 'śr.', 'czw.', 'pt.']

export default function WeekdayTabs() {
  const { weekday, setWeekday } = useContext(WeekdayContext)

  return (
    <Tabs
      variant="fullWidth"
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
      value={weekday}
    >
      {weekdays.map((weekday) => (
        <Tab
          sx={{ minWidth: 0 }}
          key={weekday}
          label={labels[weekdays.indexOf(weekday)]}
          value={weekday}
          onClick={() => {
            setWeekday(weekday)
          }}
        />
      ))}
    </Tabs>
  )
}
