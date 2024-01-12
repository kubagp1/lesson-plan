import { Categories, Plan } from './shared/types'

const DATE_REGEX = /(\d{1,2}\.\d{1,2}\.\d{4})/

export function getMetadata(
  document: Document,
  url: string,
  scraper: 'full' | 'classes'
) {
  const applicableAtSource = [
    ...document.querySelectorAll('body>div>table>tbody>tr:not(:nth-child(1))')
  ]
    .map((tr) => [...tr.querySelectorAll('*')])
    .reduce((a, b) => [...a, ...b], [])
    .find((el) =>
      el.textContent?.toLowerCase().includes('obowiązuje od')
    )?.textContent

  const applicableAt =
    applicableAtSource && applicableAtSource.match(DATE_REGEX) != null
      ? new Date(
          applicableAtSource.match(DATE_REGEX)![0].replace(/\./g, '-')
        ).toJSON()
      : null

  const generatedAtSource = [
    ...document.querySelectorAll('body>div>table>tbody>tr:not(:nth-child(1))')
  ]
    .map((tr) => [...tr.querySelectorAll('*')])
    .reduce((a, b) => [...a, ...b], [])
    .find((el) =>
      el.textContent?.toLowerCase().includes('wygenerowano')
    )?.textContent

  const generatedAt =
    generatedAtSource && generatedAtSource.match(DATE_REGEX) != null
      ? new Date(
          generatedAtSource.match(DATE_REGEX)![0].replace(/\./g, '-')
        ).toJSON()
      : null

  const metadata = {
    applicableAt,
    generatedAt,
    scrapedAt: new Date().toJSON(),
    scrapedFrom: url,
    scrapedUsing: scraper
  }
  return metadata
}

export function classLongNameToShortName(longName: string): string {
  return longName.split(' ')[0]
}

/** Given "fizyka-1/2" returns "1/2", given "bhp" returns null */
export function getGroup(subjectName: string): string | null {
  let match = subjectName.match(/-(\d\/\d)$/)
  return match ? match[1] : null
}

export function isAdvanced(subjectName: string): boolean {
  return subjectName.trim().toLowerCase().startsWith('r_')
}

export function removeEmptyPlans(
  categories: Categories,
  plans: { [key: string]: Plan }
) {
  let planIdsToRemove: string[] = []

  for (let planId in plans) {
    let plan = plans[planId]

    let isEmpty = true
    let weekday: keyof Plan['timetable']
    for (weekday in plan.timetable) {
      if (
        plan.timetable[weekday].some((row) =>
          row.some((entry) => entry != null)
        )
      ) {
        isEmpty = false
        break
      }
    }

    if (isEmpty) {
      delete plans[planId]
      planIdsToRemove.push(planId)
    }
  }

  for (let planId of planIdsToRemove) {
    let category: keyof Categories
    for (category in categories) {
      categories[category] = categories[category].filter(
        (plan) => plan.planId.toString() !== planId
      )
    }
  }
}
