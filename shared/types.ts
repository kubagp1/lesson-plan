export interface ICategories {
  students: [ILevel];
  teachers: [
    {
      id: number;
      name: string;
    }
  ];
}

export interface ILevel {
  name: string;
  plans: [
    {
      id: number;
      name: string;
    }
  ];
}

export interface IPlan<
  T extends IStudentPlanEntry | ITeacherPlanEntry | IRoomPlanEntry
> {
  id: number;
  hours: string[];
  lessons: {
    [key in Weekday]: (T | null)[][];
  };
}
export interface IStudentPlanEntry {
  name: string;
  teacher: string;
  room: string;
}

export interface ITeacherPlanEntry {
  name: string;
  students: string;
  room: string;
}

export interface IRoomPlanEntry {
  name: string;
  teacher: string;
  students: string;
}

export type CategoryName = "students" | "teachers" | "rooms";

export const CategoryNames: CategoryName[] = ["students", "teachers", "rooms"];

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

export const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];
