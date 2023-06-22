import { Tab, Tabs } from '@mui/material'
import { Weekday, weekdays } from '../shared/types'
import { useContext } from 'react'
import { WeekdayContext } from './WeekdayContext'
import i18n from '../i18n'
import { useTranslation } from 'react-i18next'

export function getCurrentWeekday(): Weekday {
  const date = new Date()
  var weekdayNumber = date.getDay()
  if (weekdayNumber > 5 || weekdayNumber < 1) weekdayNumber = 1

  return weekdays[weekdayNumber - 1]
}

export default function WeekdayTabs() {
  const { i18n } = useTranslation()

  const labels = i18n.language.toLowerCase().startsWith('pl')
    ? ['pon.', 'wt.', 'śr.', 'czw.', 'pt.']
    : ['mon.', 'tue.', 'wed.', 'thu.', 'fri.']

  const { weekday: selectedWeekday, setWeekday: setSelectedWeekday } =
    useContext(WeekdayContext)

  return (
    <Tabs
      variant="fullWidth"
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}
      value={selectedWeekday}
    >
      {weekdays.map((weekday) => (
        <Tab
          sx={{ minWidth: 0 }}
          key={weekday}
          label={labels[weekdays.indexOf(weekday)]}
          value={weekday}
          onClick={() => {
            setSelectedWeekday(weekday)
          }}
        />
      ))}
    </Tabs>
  )
}
