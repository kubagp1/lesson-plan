// CATEGORY

export type CategoryName = "class" | "teacher" | "classroom";
export const categoryNames: CategoryName[] = ["class", "teacher", "classroom"];

export type Category = Entity[]

export type Categories = {
  class: {
    [key: string]: Category;
  },
  teacher: Category,
  classroom: Category,
}

// WEEKDAY

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

export const weekdays: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

// CLASSROOM, TEACHER, CLASS

export type Entity = {
  planId: number;
  shortName: string;
  longName: string;
}

export type Classroom = Entity;
export type Teacher = Entity;
export type Class = Entity;

// PLAN

export type Plan = ClassPlan | TeacherPlan | ClassroomPlan;
export type Lesson = ClassLesson | TeacherLesson | ClassroomLesson;

export type ClassLesson = {
  name: string;
  classroom: Classroom;
  teacher: Teacher;
}

export type ClassPlan = {
  id: number;
  timetable: {
    [key in Weekday]: (ClassLesson | null)[][];
  }
}

export type TeacherLesson = {
  name: string;
  classroom: Classroom;
  class: Class;
}

export type TeacherPlan = {
  id: number;
  timetable: {
    [key in Weekday]: (TeacherLesson | null)[][];
  }
}

export type ClassroomLesson = {
  name: string;
  teacher: Teacher;
  class: Class;
}

export type ClassroomPlan = {
  id: number;
  timetable: {
    [key in Weekday]: (ClassroomLesson | null)[][];
  }
}