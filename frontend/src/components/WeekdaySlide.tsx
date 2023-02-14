import { Table, TableBody, TableCell, TableRow } from '@mui/material'
import { useContext } from 'react'
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
}

type Entrries = Entry[]

const lessonIsClassroomLesson = (lesson: Lesson): lesson is ClassroomLesson => {
  return (lesson as ClassLesson | TeacherLesson).classroom === undefined
}

const lessonIsClassLesson = (lesson: Lesson): lesson is ClassLesson => {
  return (lesson as ClassroomLesson | TeacherLesson).class === undefined
}

const lessonIsTeacherLesson = (lesson: Lesson): lesson is TeacherLesson => {
  return (lesson as ClassroomLesson | ClassLesson).teacher === undefined
}

export default function WeekdaySlide({ lessons, hours }: WeekdaySlideProps) {
  const { setPlanId } = useContext(AppContext)

  const entries: Entrries = hours.map((hour, i) => {
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
      })
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
              <TableRow key={i}>
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
