// CATEGORY

export type CategoryName = 'class' | 'teacher' | 'classroom'
export const categoryNames: CategoryName[] = ['class', 'teacher', 'classroom']

export type Category = Entity[]

export type Categories = {
  class: Category
  teacher: Category
  classroom: Category
}

// WEEKDAY

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

export const weekdays: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday'
]

// CLASSROOM, TEACHER, CLASS

export type Entity = {
  planId: number
  shortName: string
  longName: string
}

export type Classroom = Entity
export type Teacher = Entity
export type Class = Entity

// PLAN

export type Chips = {
  group: string | null
  advanced: boolean
}

export type Plan = ClassPlan | TeacherPlan | ClassroomPlan
export type Lesson = ClassLesson | TeacherLesson | ClassroomLesson

export type ClassLesson = {
  name: string
  classroom: Classroom
  teacher: Teacher
  chips: Chips
}

export type ClassPlan = {
  id: number
  timetable: {
    [key in Weekday]: (ClassLesson | null)[][]
  }
  hours: string[]
}

export type TeacherLesson = {
  name: string
  classroom: Classroom
  class: Class
  chips: Chips
}

export type TeacherPlan = {
  id: number
  timetable: {
    [key in Weekday]: (TeacherLesson | null)[][]
  }
  hours: string[]
}

export type ClassroomLesson = {
  name: string
  teacher: Teacher
  class: Class
  chips: Chips
}

export type ClassroomPlan = {
  id: number
  timetable: {
    [key in Weekday]: (ClassroomLesson | null)[][]
  }
  hours: string[]
}
