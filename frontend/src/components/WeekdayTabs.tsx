import { Tab, Tabs } from '@mui/material'
import { Weekday, weekdays } from '../shared/types'

export function getCurrentWeekday(): Weekday {
  const date = new Date()
  var weekdayNumber = date.getDay()
  if (weekdayNumber > 5 || weekdayNumber < 1) weekdayNumber = 1

  return weekdays[weekdayNumber - 1]
}

const labels = ['pon.', 'wt.', 'śr.', 'czw.', 'pt.']

interface WeekdayTabsProps {
  weekday: Weekday
  setWeekday: (weekday: Weekday) => void
}

export default function WeekdayTabs({ weekday, setWeekday }: WeekdayTabsProps) {
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
