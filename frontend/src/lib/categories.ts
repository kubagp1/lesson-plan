import { getCategories } from '../apiCalls'
import { Categories, CategoryName, Category, Entity } from '../shared/types'

export function flattenCategories(categories: Categories) {
  return Object.values(categories).flat()
}

export function getCategoryNameFromPlanId(
  categories: Categories,
  planId: number
): CategoryName {
  if (categories.class.find((plan) => plan.planId === planId)) return 'class'
  if (categories.classroom.find((plan) => plan.planId === planId))
    return 'classroom'
  if (categories.teacher.find((plan) => plan.planId === planId))
    return 'teacher'
  throw new Error(`No category found for planId ${planId}`)
}

export function getClassesByGrades(classCat: Category): {
  [key: string]: Category
} {
  let classesByGrades: { [key: string]: Category } = {}
  classCat.forEach((c) => {
    let grade = getGrade(c.shortName)
    if (classesByGrades[grade] === undefined) classesByGrades[grade] = []
    classesByGrades[grade].push(c)
  })
  return classesByGrades
}

export function getGrade(name: string): string {
  let grade = name.match(/\d+/)?.[0]
  return grade || 'inne'
}

export function getEntityByPlanId(
  categories: Categories,
  planId: number
): Entity {
  const r = flattenCategories(categories).find((p) => p.planId === planId)
  if (r === undefined) throw new Error(`No entity found for planId ${planId}`)
  return r
}
