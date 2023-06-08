import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  useTheme
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import type { CategoryName, Plan, Weekday } from '../shared/types'
import { AppContext } from './AppContext'
import { HideColumnsContext } from './HideColumnsContext'

import './WeekdaySlide.less'
import { getCategoryNameFromPlanId } from '../lib/categories'
import {
  lessonIsClassLesson,
  lessonIsClassroomLesson
} from '../shared/lessonIsXLesson'

type WeekdaySlideProps = {
  lessons: Plan['timetable'][Weekday]
  hours: string[]
  isToday: boolean
}

type EntryCell = {
  text: string
  planId?: number
  chipLeft?: string
  chipRight?: string
}

type Entry = {
  left: string
  centerAndRight: {
    centerLeft: EntryCell
    centerRight: EntryCell
    right: EntryCell
  }[]
  higlight: boolean
}

type Entries = Entry[]

function hourToMinutes(hour: string): number {
  const [h, m] = hour.split(':').map((s) => parseInt(s))
  return h * 60 + m
}

function shouldBeHighlighted(
  timeRange: [number, number],
  previousEnd: number,
  time: number
): boolean {
  const [start, end] = timeRange

  if (previousEnd === -1) return time >= start && time <= end

  if (start === -1 || end === -1) return false

  return time >= previousEnd && time < end
}

function getTimeRange(str: string): [number, number] {
  try {
    const [start, end] = str.split('-')

    const [startHours, startMinutes] = start.split(':').map(Number)
    const [endHours, endMinutes] = end.split(':').map(Number)

    const startSeconds = startHours * 3600 + startMinutes * 60
    const endSeconds = endHours * 3600 + endMinutes * 60

    return [startSeconds, endSeconds]
  } catch {
    return [-1, -1]
  }
}

function getSecondsSinceMidnight(): number {
  //@ts-ignore
  if (window._time) {
    //@ts-ignore
    const [hours, minutes, seconds] = window._time.split(':')
    const secondsSinceMidnight =
      (parseInt(hours, 10) * 60 + parseInt(minutes, 10)) * 60 +
      parseInt(seconds, 10)
    return secondsSinceMidnight
  }

  const date = new Date()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  // I'm not using seconds because it would cause unnecessary updates to the UI
  return hours * 3600 + minutes * 60
}

export default function WeekdaySlide({
  lessons,
  hours,
  isToday
}: WeekdaySlideProps) {
  const { setPlanId, planId, categories } = useContext(AppContext)
  const [currentTime, setCurrentTime] = useState(getSecondsSinceMidnight())
  const hideColumnsConfiguration = useContext(HideColumnsContext)
  const theme = useTheme()

  const highlightColor = theme.palette.mode === 'dark' ? '#333' : 'lightcyan'

  if (categories.data === undefined) return null
  if (planId === null) return null

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getSecondsSinceMidnight())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const hoursAsTimeRanges = hours.map(getTimeRange)

  const entries: Entries = hours.map((hour, i) => {
    const lessonsThisHour: Plan['timetable'][Weekday][0] = lessons[i]

    return {
      left: hour,
      centerAndRight: lessonsThisHour.map((lesson) => {
        if (lesson === null)
          return {
            centerLeft: { text: '' },
            centerRight: { text: '' },
            right: { text: '' }
          }
        return {
          centerLeft: lessonIsClassLesson(lesson)
            ? {
                text: lesson.teacher.shortName,
                planId: lesson.teacher.planId
              }
            : {
                text: lesson.class.shortName,
                planId: lesson.class.planId,
                chipRight: lesson.chips.group ?? undefined
              },
          centerRight: lessonIsClassroomLesson(lesson)
            ? {
                text: lesson.teacher.longName,
                planId: lesson.teacher.planId
              }
            : {
                text: lesson.name,
                chipLeft: lessonIsClassLesson(lesson)
                  ? lesson.chips.group ?? undefined
                  : undefined,
                chipRight: lesson.chips.advanced ? 'R' : undefined
              },
          right: lessonIsClassroomLesson(lesson)
            ? {
                text: lesson.name,
                chipRight: lesson.chips.advanced ? 'R' : undefined
              }
            : {
                text: lesson.classroom.shortName,
                planId: lesson.classroom.planId
              }
        }
      }),
      higlight:
        shouldBeHighlighted(
          hoursAsTimeRanges[i],
          i > 0 ? hoursAsTimeRanges[i - 1][1] : -1,
          currentTime
        ) && isToday
    }
  })

  let category: CategoryName = getCategoryNameFromPlanId(
    categories.data,
    planId
  )

  const hideCenterLeft = hideColumnsConfiguration[category].centerLeft
  const hideCenterRight = hideColumnsConfiguration[category].centerRight
  const hideRight = hideColumnsConfiguration[category].right

  return (
    <div style={{ height: '100%' }} className="WeekdaySlide">
      <Table size="medium">
        <TableBody>
          {entries.map((entry, i) => {
            const cellSize =
              entry.centerAndRight.length > 1 ? 'small' : 'medium'

            return (
              <TableRow
                key={i}
                sx={{
                  backgroundColor: entry.higlight ? highlightColor : undefined
                }}
              >
                <TableCell size={cellSize} className="left">
                  {entry.left}
                </TableCell>
                <TableCell
                  size={cellSize}
                  className="centerLeft"
                  sx={hideCenterLeft ? { display: 'none' } : undefined}
                >
                  {entry.centerAndRight.map((centerAndRight, i) => (
                    <div
                      key={i}
                      onClick={
                        centerAndRight.centerLeft.planId !== undefined
                          ? () => {
                              setPlanId(centerAndRight.centerLeft.planId!)
                            }
                          : undefined
                      }
                    >
                      {chipFactory(centerAndRight.centerLeft.chipLeft, 'l')}
                      {centerAndRight.centerLeft.text}
                      {chipFactory(centerAndRight.centerLeft.chipRight, 'r')}
                    </div>
                  ))}
                </TableCell>
                <TableCell
                  size={cellSize}
                  className="centerRight"
                  sx={hideCenterRight ? { display: 'none' } : undefined}
                >
                  {entry.centerAndRight.map((centerAndRight, i) => (
                    <div
                      key={i}
                      onClick={
                        centerAndRight.centerRight.planId !== undefined
                          ? () => {
                              setPlanId(centerAndRight.centerRight.planId!)
                            }
                          : undefined
                      }
                    >
                      {chipFactory(centerAndRight.centerRight.chipLeft, 'l')}
                      {centerAndRight.centerRight.text}
                      {chipFactory(centerAndRight.centerRight.chipRight, 'r')}
                    </div>
                  ))}
                </TableCell>
                <TableCell
                  size={cellSize}
                  onClick={
                    entry.centerAndRight[0].right.planId !== undefined
                      ? () => {
                          setPlanId(entry.centerAndRight[0].right.planId!)
                        }
                      : undefined
                  }
                  sx={hideRight ? { display: 'none' } : undefined}
                >
                  {entry.centerAndRight.map((centerAndRight, i) => (
                    <div
                      key={i}
                      onClick={
                        centerAndRight.right.planId !== undefined
                          ? () => {
                              setPlanId(centerAndRight.right.planId!)
                            }
                          : undefined
                      }
                    >
                      {chipFactory(centerAndRight.right.chipLeft, 'l')}
                      {centerAndRight.right.text}
                      {chipFactory(centerAndRight.right.chipRight, 'r')}
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function chipFactory(text: string | undefined, side: 'l' | 'r') {
  if (text === undefined) return null
  return (
    <Chip
      sx={{ [`m${side == 'l' ? 'r' : 'l'}`]: 0.5, my: 0.1 }}
      label={text}
      variant="filled"
      size="small"
    />
  )
}
