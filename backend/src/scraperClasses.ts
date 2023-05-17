import { JSDOM } from 'jsdom'
import {
  ScrapeResult,
  Urls,
  idGenerator,
  transformHours
} from './scraperFull.js'
import {
  ClassPlan,
  ClassroomPlan,
  Plan,
  TeacherPlan,
  weekdays
} from './shared/types.js'

type ScrapePlanListResult = {
  url: string
  name: string
}[]

export default class Scraper {
  // teacherPlans and classroomPlans will be incrementally filled by scrapeStudentPlan()
  // key is the plan short name
  private teacherPlans: { [key: string]: TeacherPlan } = {}
  private classroomPlans: { [key: string]: ClassroomPlan } = {}

  private idGenerator = idGenerator()
  constructor(private readonly urls: Urls) {}

  public async scrape(): Promise<ScrapeResult> {
    let planList = await this.scrapePlanList()
    let classPlans = await this.scrapeClassPlans(planList)

    let categories = {
      class: {
        '1337': Object.entries(classPlans).map(([name, plan]) => ({
          planId: plan.id,
          shortName: name,
          longName: name
        }))
      },
      teacher: Object.entries(this.teacherPlans).map(([name, plan]) => ({
        planId: plan.id,
        shortName: name,
        longName: name
      })),
      classroom: Object.entries(this.classroomPlans).map(([name, plan]) => ({
        planId: plan.id,
        shortName: name,
        longName: name
      }))
    }

    let plansWithNamesAsKeys: { [key: string]: Plan } = {
      ...classPlans,
      ...this.teacherPlans,
      ...this.classroomPlans
    }

    // i need to use ids instead of names as keys
    let plans: { [key: number]: Plan } = {}
    for (let [name, plan] of Object.entries(plansWithNamesAsKeys)) {
      plans[plan.id] = plan
    }

    return {
      categories,
      plans
    }
  }

  private async scrapeClassPlans(planList: ScrapePlanListResult) {
    let classPlans: { [key: string]: ClassPlan } = {}
    for (let plan of planList) {
      classPlans[plan.name] = await this.scrapeClassPlan(plan)
    }
    return classPlans
  }

  private async scrapeClassPlan(plan: {
    name: string
    url: string
  }): Promise<ClassPlan> {
    let url = plan.url

    console.log(`Scraping class plan ${plan.name} from ${url}`)

    let planId = this.idGenerator.next().value

    let planHTML = await (
      await fetch(new URL(url, this.urls.entrypoint).toString())
    ).text()

    let document = new JSDOM(planHTML).window.document

    let table = document.querySelector('table.tabela')
    if (table == null) throw new Error('No table in planHTML')

    const rows = Array.from(table.querySelectorAll('tr')).slice(1) // skip header row

    let hours = rows.map(
      (row) =>
        row.querySelector('td:nth-child(2)')?.textContent ?? 'missing hour'
    )

    hours = hours.map((hour) => transformHours(hour))

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

          let entries = Array.from(td.querySelectorAll(':scope > span.l'))

          if (entries.length === 0) {
            // this might mean that this is a lesson with one or zero entries
            // (span.l is not there if there is only one entry)
            if (td.querySelector('span') == null) {
              return [null]
            }
            entries = [td]
          }

          return entries.map((parent) => {
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

            if (!(teacherShortName in this.teacherPlans)) {
              console.log('creating teacher plan for', teacherShortName)
              this.teacherPlans[teacherShortName] = {
                timetable: {
                  monday: [],
                  tuesday: [],
                  wednesday: [],
                  thursday: [],
                  friday: []
                },
                hours: [],
                id: this.idGenerator.next().value
              }
            }

            if (!(roomShortName in this.classroomPlans)) {
              console.log('creating classroom plan for', roomShortName)
              this.classroomPlans[roomShortName] = {
                timetable: {
                  monday: [],
                  tuesday: [],
                  wednesday: [],
                  thursday: [],
                  friday: []
                },
                hours: [],
                id: this.idGenerator.next().value
              }
            }

            // at this point we know that the teacher and room plans exist in memory and have their ids set

            if (teacherShortName in this.teacherPlans) {
              // first we need to make sure that the teacher plan has enough rows but we can't override any entries

              let teacherPlan = this.teacherPlans[teacherShortName]

              let teacherPlanTimetable = teacherPlan.timetable

              if (teacherPlanTimetable.monday.length < rowIndex + 1) {
                // we need to add rows
                let rowsToAdd =
                  rowIndex + 1 - teacherPlanTimetable.monday.length
                for (let i = 0; i < rowsToAdd; i++) {
                  for (let day of weekdays) {
                    teacherPlanTimetable[day].push([null])
                  }
                }
              }

              if (teacherPlan.hours.length < rowIndex + 1) {
                // we need to add hours
                let hoursToAdd = rowIndex + 1 - teacherPlan.hours.length
                for (let i = 0; i < hoursToAdd; i++) {
                  teacherPlan.hours.push(hours[rowIndex - hoursToAdd + 1 + i])
                }
              }

              let teacherPlanRows = teacherPlanTimetable[weekday]

              teacherPlanRows[rowIndex].push({
                name: subjectName,
                class: {
                  planId: planId,
                  longName: plan.name,
                  shortName: plan.name // TODO: get short name
                },
                classroom: {
                  planId: this.classroomPlans[roomShortName].id,
                  longName: roomShortName,
                  shortName: roomShortName
                }
              })

              // TODO: override hour
            }

            if (roomShortName in this.classroomPlans) {
              // first we need to make sure that the room plan has enough rows but we can't override any entries

              let roomPlan = this.classroomPlans[roomShortName]

              let roomPlanTimetable = roomPlan.timetable

              if (roomPlanTimetable.monday.length < rowIndex + 1) {
                // we need to add rows
                let rowsToAdd = rowIndex + 1 - roomPlanTimetable.monday.length
                for (let i = 0; i < rowsToAdd; i++) {
                  for (let day of weekdays) {
                    roomPlanTimetable[day].push([null])
                  }
                }
              }

              if (roomPlan.hours.length < rowIndex + 1) {
                // we need to add hours
                let hoursToAdd = rowIndex + 1 - roomPlan.hours.length
                for (let i = 0; i < hoursToAdd; i++) {
                  roomPlan.hours.push(hours[rowIndex - hoursToAdd + 1 + i])
                }
              }

              let roomPlanRows = roomPlanTimetable[weekday]

              roomPlanRows[rowIndex].push({
                name: subjectName,
                class: {
                  planId: planId,
                  longName: plan.name,
                  shortName: plan.name // TODO: get short name
                },
                teacher: {
                  planId: this.teacherPlans[teacherShortName].id,
                  longName: teacherShortName,
                  shortName: teacherShortName
                }
              })
            }

            // at this point we derived the teacher and room plans from the current entry and added the entry to them

            return {
              name: subjectName,
              teacher: {
                planId: this.teacherPlans[teacherShortName].id,
                longName: teacherShortName,
                shortName: teacherShortName
              },
              classroom: {
                planId: this.classroomPlans[roomShortName].id,
                longName: roomShortName,
                shortName: roomShortName
              }
            }
          })
        })
      )
    }

    return {
      timetable: timetable,
      hours: hours,
      id: planId
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
