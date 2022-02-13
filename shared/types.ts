export interface ICategories {
  students: [ILevel]
  teachers: [
    {
      id: number
      name: string
    }
  ]
}

export interface ILevel {
  name: string
  plans: [
    {
      id: number
      name: string
    }
  ]
}

export type CategoryName = "students" | "teachers"
