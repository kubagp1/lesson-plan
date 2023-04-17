import { Table, TableBody, TableCell, TableRow } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import type {
  ClassLesson,
  ClassroomLesson,
  Lesson,
  Plan,
  TeacherLesson,
  Weekday
} from '../shared/types'
import { AppContext } from './App'

import './WeekdaySlide.less'

interface WeekdaySlideProps {
  lessons: Plan['timetable'][Weekday]
  hours: string[]
}

type Entry = {
  left: string
  centerAndRight: {
    centerLeft: { text: string; planId?: number }
    centerRight: { text: string; planId?: number }
    right: { text: string; planId?: number }
  }[]
  higlight: boolean
}

type Entries = Entry[]

const lessonIsClassroomLesson = (lesson: Lesson): lesson is ClassroomLesson => {
  return (lesson as ClassLesson | TeacherLesson).classroom === undefined
}

const lessonIsClassLesson = (lesson: Lesson): lesson is ClassLesson => {
  return (lesson as ClassroomLesson | TeacherLesson).class === undefined
}

const lessonIsTeacherLesson = (lesson: Lesson): lesson is TeacherLesson => {
  return (lesson as ClassroomLesson | ClassLesson).teacher === undefined
}

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

export default function WeekdaySlide({ lessons, hours }: WeekdaySlideProps) {
  const { setPlanId } = useContext(AppContext)
  const [currentTime, setCurrentTime] = useState(getSecondsSinceMidnight())

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
            ? { text: lesson.teacher.shortName, planId: lesson.teacher.planId }
            : { text: lesson.class.shortName, planId: lesson.class.planId },
          centerRight: lessonIsClassroomLesson(lesson)
            ? { text: lesson.teacher.longName, planId: lesson.teacher.planId }
            : { text: lesson.name },
          right: lessonIsClassroomLesson(lesson)
            ? { text: lesson.name }
            : {
                text: lesson.classroom.shortName,
                planId: lesson.classroom.planId
              }
        }
      }),
      higlight: shouldBeHighlighted(
        hoursAsTimeRanges[i],
        i > 0 ? hoursAsTimeRanges[i - 1][1] : -1,
        currentTime
      )
    }
  })

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
                  backgroundColor: entry.higlight ? 'lightcyan' : undefined
                }}
              >
                <TableCell size={cellSize} className="left">
                  {entry.left}
                </TableCell>
                <TableCell size={cellSize} className="centerLeft">
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
                      {centerAndRight.centerLeft.text}
                    </div>
                  ))}
                </TableCell>
                <TableCell size={cellSize} className="centerRight">
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
                      {centerAndRight.centerRight.text}
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
                      {centerAndRight.right.text}
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
