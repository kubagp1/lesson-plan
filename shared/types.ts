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

export interface IPlan {
  id: number;
  hours: [string];
  lessons: {
    [key in Weekday]: [[IPlanEntry | null]];
  };
}
export interface IPlanEntry {
  name: string;
  teacher: string;
  room: string;
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
