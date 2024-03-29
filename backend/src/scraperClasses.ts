import { JSDOM } from 'jsdom'
import { ScrapeResult, Urls, idGenerator } from './scraperFull.js'
import {
  ClassPlan,
  ClassroomPlan,
  Plan,
  TeacherPlan,
  weekdays
} from './shared/types.js'
import { applyTransformations } from './transformations.js'
import {
  classLongNameToShortName,
  getGroup,
  getMetadata,
  isAdvanced,
  removeEmptyPlans
} from './utils.js'

type ScrapePlanListResult = {
  url: string
  name: string
}[]

export default class Scraper {
  // teacherPlans and classroomPlans will be incrementally filled by scrapeStudentPlan()
  // key is the plan short name
  private teacherPlansByShortName: { [key: string]: TeacherPlan } = {}
  private classroomPlansByShortName: { [key: string]: ClassroomPlan } = {}

  private idGenerator = idGenerator()
  constructor(private readonly urls: Urls) {}

  public async scrape(): Promise<ScrapeResult> {
    let planList = await this.scrapePlanList()
    let classPlans = await this.scrapeClassPlans(planList)

    let categories = {
      class: Object.entries(classPlans).map(([name, plan]) => ({
        planId: plan.id,
        shortName: classLongNameToShortName(name),
        longName: name
      })),
      teacher: Object.entries(this.teacherPlansByShortName).map(
        ([name, plan]) => ({
          planId: plan.id,
          shortName: name,
          longName: name
        })
      ),
      classroom: Object.entries(this.classroomPlansByShortName).map(
        ([name, plan]) => ({
          planId: plan.id,
          shortName: name,
          longName: name
        })
      )
    }

    //if an timetable[weekday][i] has no entries, add null
    //class plans are already filled
    this.teacherPlansByShortName = this.fillEmptyEntries(
      this.teacherPlansByShortName
    )
    this.classroomPlansByShortName = this.fillEmptyEntries(
      this.classroomPlansByShortName
    )

    // plans derived from class plans are unsorted

    for (let plan of Object.values(this.teacherPlansByShortName))
      sortTimetable(plan.timetable, plan.hours)

    for (let plan of Object.values(this.classroomPlansByShortName))
      sortTimetable(plan.timetable, plan.hours)

    // i need to use ids instead of names as keys
    // for future me: you can't use the spread operator because it will overwrite the keys with the same name
    // that was the case with the teacher and classroom plans
    let plans: { [key: number]: Plan } = {}
    for (const category of [
      classPlans,
      this.teacherPlansByShortName,
      this.classroomPlansByShortName
    ]) {
      for (let [name, plan] of Object.entries(category)) {
        plans[plan.id] = plan
      }
    }

    removeEmptyPlans(categories, plans)

    return applyTransformations({
      categories,
      plans
    })
  }

  private fillEmptyEntries<
    T extends { timetable: { [key: string]: any[][] } }
  >(plans: { [key: string]: T }): { [key: string]: T } {
    for (let plan of Object.values(plans)) {
      for (let weekday of weekdays) {
        for (let i = 0; i < plan.timetable[weekday].length; i++) {
          if (plan.timetable[weekday][i].length === 0) {
            plan.timetable[weekday][i].push(null)
          }
        }
      }
    }
    return plans
  }

  private async scrapeClassPlans(planList: ScrapePlanListResult) {
    let classPlans: { [key: string]: ClassPlan } = {}
    for (let plan of planList) {
      classPlans[plan.name] = await this.scrapeClassPlan(plan)
    }
    return classPlans
  }
  /**
   * Scrapes the list of class plans from the entrypoint
   * It also scrapes the teacher and classroom plans from the class plans
   */
  private async scrapeClassPlan(plan: {
    name: string
    url: string
  }): Promise<ClassPlan> {
    let url = plan.url

    console.log(`Scraping class plan ${plan.name} from ${url}`)

    let planId = this.idGenerator.next().value

    const absoluteUrl = new URL(url, this.urls.entrypoint).toString()
    let planHTML = await (await fetch(absoluteUrl)).text()

    let document = new JSDOM(planHTML).window.document

    let table = document.querySelector('table.tabela')
    if (table == null) throw new Error('No table in planHTML')

    const rows = Array.from(table.querySelectorAll('tr')).slice(1) // skip header row

    let hours = rows.map(
      (row) =>
        row.querySelector('td:nth-child(2)')?.textContent ?? 'missing hour'
    )

    let timetable: ClassPlan['timetable'] = {
      monday: [[null]],
      tuesday: [[null]],
      wednesday: [[null]],
      thursday: [[null]],
      friday: [[null]]
    }

    for (let weekdayIndex = 0; weekdayIndex < weekdays.length; weekdayIndex++) {
      const weekday = weekdays[weekdayIndex]

      timetable[weekday] = Array.from(
        rows.map((row, rowIndex) => {
          let td = row.querySelector(`td:nth-child(${3 + weekdayIndex})`)!

          let entries = Array.from(td.querySelectorAll('span.p')).map(
            (span) => span.parentElement!
          )

          return entries.length === 0
            ? [null]
            : entries.map((parent) => {
                let teacherShortName =
                  parent.querySelector('span.n')?.textContent ?? null
                let roomShortName =
                  parent.querySelector('span.s')?.textContent ?? null
                let subjectName =
                  parent.querySelector('span.p')?.textContent ?? null

                if (
                  teacherShortName == null ||
                  roomShortName == null ||
                  subjectName == null
                ) {
                  throw new Error(
                    'Missing teacherShortName, roomShortName or subjectName from entry'
                  )
                }

                if (!(teacherShortName in this.teacherPlansByShortName)) {
                  console.log('creating teacher plan for', teacherShortName)
                  this.teacherPlansByShortName[teacherShortName] = {
                    timetable: {
                      monday: [],
                      tuesday: [],
                      wednesday: [],
                      thursday: [],
                      friday: []
                    },
                    hours: [],
                    id: this.idGenerator.next().value,
                    metadata: getMetadata(document, absoluteUrl, 'classes')
                  }
                }

                if (!(roomShortName in this.classroomPlansByShortName)) {
                  console.log('creating classroom plan for', roomShortName)
                  this.classroomPlansByShortName[roomShortName] = {
                    timetable: {
                      monday: [],
                      tuesday: [],
                      wednesday: [],
                      thursday: [],
                      friday: []
                    },
                    hours: [],
                    id: this.idGenerator.next().value,
                    metadata: getMetadata(document, absoluteUrl, 'classes')
                  }
                }

                // TEACHER DERIVE

                if (teacherShortName in this.teacherPlansByShortName) {
                  let teacherPlan =
                    this.teacherPlansByShortName[teacherShortName]

                  let teacherPlanTimetable = teacherPlan.timetable

                  let hourIndex = teacherPlan.hours.indexOf(hours[rowIndex])

                  if (hourIndex === -1) {
                    hourIndex = teacherPlan.hours.length
                    teacherPlan.hours.push(hours[rowIndex])
                    for (let day of weekdays) {
                      teacherPlanTimetable[day].push([])
                    }
                  }

                  let teacherPlanRows = teacherPlanTimetable[weekday]

                  teacherPlanRows[hourIndex].push({
                    name: subjectName,
                    class: {
                      planId: planId,
                      longName: plan.name,
                      shortName: classLongNameToShortName(plan.name)
                    },
                    classroom: {
                      planId: this.classroomPlansByShortName[roomShortName].id,
                      longName: roomShortName,
                      shortName: roomShortName
                    },
                    chips: {
                      group: getGroup(subjectName),
                      advanced: isAdvanced(subjectName)
                    }
                  })
                } else {
                  throw new Error("Teacher plan doesn't exist (this is a bug)")
                }

                // CLASSROOM DERIVE

                if (roomShortName in this.classroomPlansByShortName) {
                  let classroomPlan =
                    this.classroomPlansByShortName[roomShortName]

                  let classroomPlanTimetable = classroomPlan.timetable

                  let hourIndex = classroomPlan.hours.indexOf(hours[rowIndex])

                  if (hourIndex === -1) {
                    hourIndex = classroomPlan.hours.length
                    classroomPlan.hours.push(hours[rowIndex])
                    for (let day of weekdays) {
                      classroomPlanTimetable[day].push([])
                    }
                  }

                  let classroomPlanRows = classroomPlanTimetable[weekday]

                  classroomPlanRows[hourIndex].push({
                    name: subjectName,
                    class: {
                      planId: planId,
                      longName: plan.name,
                      shortName: classLongNameToShortName(plan.name)
                    },
                    teacher: {
                      planId: this.teacherPlansByShortName[teacherShortName].id,
                      longName: teacherShortName,
                      shortName: teacherShortName
                    },
                    chips: {
                      group: getGroup(subjectName),
                      advanced: isAdvanced(subjectName)
                    }
                  })
                } else {
                  throw new Error(
                    "Classroom plan doesn't exist (this is a bug)"
                  )
                }

                // at this point we derived the teacher and room plans from the current entry and added the entry to them

                return {
                  name: subjectName,
                  teacher: {
                    planId: this.teacherPlansByShortName[teacherShortName].id,
                    longName: teacherShortName,
                    shortName: teacherShortName
                  },
                  classroom: {
                    planId: this.classroomPlansByShortName[roomShortName].id,
                    longName: roomShortName,
                    shortName: roomShortName
                  },
                  chips: {
                    group: getGroup(subjectName),
                    advanced: isAdvanced(subjectName)
                  }
                }
              })
        })
      )
    }

    return {
      timetable: timetable,
      hours: hours,
      id: planId,
      metadata: getMetadata(document, absoluteUrl, 'classes')
    }
  }

  private async scrapePlanList(): Promise<ScrapePlanListResult> {
    console.log('Scraping plan list from', this.urls.entrypoint.toString())

    let planListHTML = await (
      await fetch(new URL(this.urls.planList, this.urls.entrypoint).toString())
    ).text()

    let document = new JSDOM(planListHTML).window.document

    let planListUl = document.querySelector('ul')
    if (planListUl == null) throw new Error('No ul in planListHTML')

    let planList = Array.from(
      planListUl.querySelectorAll<HTMLAnchorElement>('li > a')
    ).map((a) => {
      return {
        url: a.href,
        name: a.textContent ?? 'missing name'
      }
    })

    return planList
  }
}
function sortTimetable<T extends Plan['timetable']>(
  timetable: T,
  hours: string[]
): void {
  for (let day of weekdays) {
    timetable[day].sort((a, b) => {
      const aIndex = timetable[day].findIndex((entry) => entry === a)
      const bIndex = timetable[day].findIndex((entry) => entry === b)

      if (aIndex === -1 || bIndex === -1) {
        throw new Error('Index not found in timetable (this is a bug)')
      }

      return hourToMinutes(hours[aIndex]) - hourToMinutes(hours[bIndex])
    })
  }

  hours.sort((a, b) => {
    return hourToMinutes(a) - hourToMinutes(b)
  })
}

function hourToMinutes(hour: string): number {
  const [h, m] = hour.split(':').map((s) => parseInt(s))
  return h * 60 + m
}
