// types are broken here, but this is not used so whatever, check out scraperClasses.ts for some better code

import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

import {
  Categories,
  CategoryName,
  Entity,
  Plan,
  weekdays,
  Teacher,
  Weekday
} from './shared/types.js'
import { applyTransformations } from './transformations.js'
import { getGroup, getMetadata, isAdvanced, removeEmptyPlans } from './utils.js'

export type ScrapeResult = {
  categories: Categories
  plans: {
    [key: string]: Plan
  }
}

type ScrapePlanListResult = {
  type: CategoryName
  url: string
  name: string
  id: number
}[]

export function* idGenerator(): Generator<number, never, never> {
  let id = 0
  while (true) {
    yield id++
  }
}

export interface Urls {
  entrypoint: string
  planList: string
}

export default class Scraper {
  private idGenerator: Generator<number, never, never>
  private entityCache: { [key: string]: Entity } = {}

  constructor(private readonly urls: Urls) {
    this.idGenerator = idGenerator()
  }

  async scrape(): Promise<ScrapeResult> {
    const planList = await this.scrapePlanList()
    const plans = await this.scrapePlans(planList)

    const categories = this.planListToCategories(planList)

    console.log(`Scraped ${Object.keys(plans).length} plans`)

    removeEmptyPlans(categories, plans)

    return applyTransformations({
      categories,
      plans
    })
  }
  private planListToCategories(planList: ScrapePlanListResult): Categories {
    let categories: Categories = {
      class: [],
      teacher: [],
      classroom: []
    }

    for (const plan of planList) {
      const category = {
        planId: plan.id,
        shortName: this.entityCache[plan.id]?.shortName || plan.name,
        longName: plan.name
      }

      categories[plan.type].push(category)
    }

    return categories
  }

  private async scrapePlanList(): Promise<ScrapePlanListResult> {
    const categoriesHTML = await (
      await fetch(new URL(this.urls.planList, this.urls.entrypoint).toString())
    ).text()

    const document = new JSDOM(categoriesHTML).window.document

    const selectors = {
      class: 'body > ul:nth-child(2)',
      teacher: 'body > ul:nth-child(4)',
      classroom: 'body > ul:nth-child(6)'
    }

    let result = [] as ScrapePlanListResult

    let categoryName: keyof typeof selectors
    for (categoryName in selectors) {
      result = [
        ...result,
        ...Array.from(
          document
            .querySelector<HTMLUListElement>(selectors[categoryName])!
            .querySelectorAll<HTMLAnchorElement>('li > a')!
        ).map((linkEl) => ({
          type: categoryName,
          url: linkEl.href,
          name: linkEl.textContent!,
          id: this.idGenerator.next().value
        }))
      ]
    }

    console.log(`Scraped plan list (${result.length} plans)`)

    return result
  }

  private async scrapePlans(
    planList: ScrapePlanListResult
  ): Promise<ScrapeResult['plans']> {
    let plans = {} as ScrapeResult['plans']

    for (const plan of planList) {
      plans[plan.id] = await this.scrapePlan(plan, planList)
      console.log(`Scraped plan ${plan.name}`)
    }
    return plans
  }

  private async scrapePlan(
    plan: ScrapePlanListResult[0],
    planList: ScrapePlanListResult
  ): Promise<Plan> {
    const absoluteUrl = new URL(plan.url, this.urls.entrypoint).toString()
    const planHTML = await (await fetch(absoluteUrl)).text()

    const document = new JSDOM(planHTML).window.document

    const table = document.querySelector('table.tabela')!

    const relevantRows = Array.from(table.querySelectorAll('tr')).slice(1)

    let hours = relevantRows.map(
      (row) => row.querySelector('td:nth-child(2)')!.textContent!
    )

    let timetable: Plan['timetable'] = {
      monday: [[null]],
      tuesday: [[null]],
      wednesday: [[null]],
      thursday: [[null]],
      friday: [[null]]
    }

    for (let weekdayIndex = 0; weekdayIndex < weekdays.length; weekdayIndex++) {
      const weekday = weekdays[weekdayIndex]

      timetable[weekday] = Array.from(
        relevantRows.map((row) => {
          let td = row.querySelector(`td:nth-child(${3 + weekdayIndex})`)!

          let entriesSpans = td.querySelectorAll('span.p')

          if (entriesSpans.length === 0) return [null]

          let entityFactory = (el: HTMLAnchorElement): Entity => {
            // This is necessary because we get the long name from the plan list,
            // our internal id is also stored there, but it's easier to get the short name
            // from the plan itself.
            let shortName = el.textContent!
            let url = el.href

            let entity = {
              longName: planList.find((plan) => plan.url.endsWith(url))!.name,
              planId: planList.find((plan) => plan.url.endsWith(url))!.id,
              shortName
            }

            this.entityCache[entity.planId] = entity

            return entity
          }

          if (plan.type === 'class') {
            return Array.from(entriesSpans).map((span) => ({
              name: span.textContent!,
              teacher: entityFactory(
                span.parentElement!.querySelector<HTMLAnchorElement>('.n')!
              ),
              classroom: entityFactory(
                span.parentElement!.querySelector<HTMLAnchorElement>('.s')!
              ),
              chips: {
                group: getGroup(span.textContent!),
                advanced: isAdvanced(span.textContent!)
              }
            }))
          } else if (plan.type === 'teacher') {
            return Array.from(entriesSpans).map((span) => ({
              name: span.textContent!,
              class: entityFactory(
                span.parentElement!.querySelector<HTMLAnchorElement>('.o')!
              ),
              classroom: entityFactory(
                span.parentElement!.querySelector<HTMLAnchorElement>('.s')!
              ),
              chips: {
                group: getGroup(span.textContent!),
                advanced: isAdvanced(span.textContent!)
              }
            }))
          } else if (plan.type === 'classroom') {
            return Array.from(entriesSpans).map((span) => ({
              name: span.textContent!,
              teacher: entityFactory(
                span.parentElement!.querySelector<HTMLAnchorElement>('.n')!
              ),
              class: entityFactory(
                span.parentElement!.querySelector<HTMLAnchorElement>('.o')!
              ),
              chips: {
                group: getGroup(span.textContent!),
                advanced: isAdvanced(span.textContent!)
              }
            }))
          }
        })
      ) as Plan['timetable'][Weekday] // not exactly a good solution, but it works
    }

    return {
      id: plan.id,
      timetable,
      hours,
      metadata: getMetadata(document, absoluteUrl, 'full')
    } as Plan // i hate this
  }
}
