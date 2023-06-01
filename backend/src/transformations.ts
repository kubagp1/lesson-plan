import { ScrapeResult } from './scraperFull'
import { Plan } from './shared/types'
import { lessonIsClassroomLesson } from './shared/lessonIsXLesson.js'

/** Applies transformHours to hours, transformSubjectNames to subject names, transformClassroomShortName to classroom shortName */
export function applyTransformations({
  categories,
  plans
}: ScrapeResult): ScrapeResult {
  for (let planId in plans) {
    const plan = plans[planId]

    plan.hours = plan.hours.map(transformHours)

    let weekday: keyof Plan['timetable']
    for (weekday in plan.timetable) {
      const day = plan.timetable[weekday]

      for (let entry of day) {
        for (let lesson of entry) {
          if (lesson === null) continue

          lesson.name = transformSubjectName(lesson.name)

          if (!lessonIsClassroomLesson(lesson)) {
            lesson.classroom.shortName = transformClassroomShortName(
              lesson.classroom.shortName
            )
          }
        }
      }
    }
  }

  let categoryName: keyof typeof categories
  for (categoryName in categories) {
    const category = categories[categoryName]

    if (categoryName === 'classroom') {
      for (let classroom of category) {
        classroom.shortName = transformClassroomShortName(classroom.shortName)
      }
    }
  }

  return {
    categories,
    plans
  }
}

/** Given a string like " 9:00- 10:15" return "9:00 - 10:15". */
export function transformHours(hour: string): string {
  return hour.replaceAll(' ', '').replace('-', ' - ')
}

export function transformSubjectName(name: string): string {
  name = name.replaceAll('e_dla_bezp', 'edb')
  name = name.replaceAll('Podst.inform', 'podst.inform')
  name = name.replaceAll('hist.i teraź', 'hit')

  name = name.replaceAll('. ', '.')
  name = name.replaceAll(' .', '.')
  name = name.replaceAll('  ', ' ')

  name = name.trim()

  return name
}

function transformClassroomShortName(name: string): string {
  name = name.replaceAll('Lin', 'L')

  name = name.trim()

  return name
}
