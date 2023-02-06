import { Table, TableBody, TableCell, TableRow } from '@mui/material'
import type {
  ClassLesson,
  ClassroomLesson,
  Lesson,
  Plan,
  TeacherLesson,
  Weekday
} from '../shared/types'

import './WeekdaySlide.less'

interface WeekdaySlideProps {
  lessons: Plan['timetable'][Weekday]
  hours: string[]
}

type Entry = {
  left: string
  centerAndRight: {
    centerLeft: string
    centerRight: string
    right: string
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
  const entries: Entrries = hours.map((hour, i) => {
    const lessonsThisHour: Plan['timetable'][Weekday][0] = lessons[i]

    return {
      left: hour,
      centerAndRight: lessonsThisHour.map((lesson) => {
        if (lesson === null)
          return { centerLeft: '', centerRight: '', right: '' }
        return {
          centerLeft: lessonIsClassLesson(lesson)
            ? lesson.teacher.shortName
            : lesson.class.shortName,
          centerRight: lessonIsClassroomLesson(lesson)
            ? lesson.teacher.longName
            : lesson.name,
          right: lessonIsClassroomLesson(lesson)
            ? lesson.name
            : lesson.classroom.shortName
        }
      })
    }
  })

  return (
    <div style={{ height: '100%' }} className="WeekdaySlide">
      <Table size="medium">
        <TableBody>
          {entries.map((entry) => (
            <TableRow>
              <TableCell className="left">{entry.left}</TableCell>
              <TableCell className="centerLeft">
                {entry.centerAndRight.map((centerAndRight) => (
                  <div>{centerAndRight.centerLeft}</div>
                ))}
              </TableCell>
              <TableCell className="centerRight">
                {entry.centerAndRight.map((centerAndRight) => (
                  <div>{centerAndRight.centerRight}</div>
                ))}
              </TableCell>
              <TableCell>
                {entry.centerAndRight.map((centerAndRight) => (
                  <div>{centerAndRight.right}</div>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
