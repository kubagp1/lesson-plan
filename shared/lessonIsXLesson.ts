import type {
  ClassLesson,
  ClassroomLesson,
  Lesson,
  TeacherLesson
} from './types'

export const lessonIsClassroomLesson = (
  lesson: Lesson
): lesson is ClassroomLesson => {
  return (lesson as ClassLesson | TeacherLesson).classroom === undefined
}
export const lessonIsClassLesson = (lesson: Lesson): lesson is ClassLesson => {
  return (lesson as ClassroomLesson | TeacherLesson).class === undefined
}
export const lessonIsTeacherLesson = (
  lesson: Lesson
): lesson is TeacherLesson => {
  return (lesson as ClassroomLesson | ClassLesson).teacher === undefined
}
