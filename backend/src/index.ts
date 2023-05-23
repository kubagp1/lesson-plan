import * as fs from 'fs/promises'
import * as fsExtra from 'fs-extra'
import FullScraper, { ScrapeResult } from './scraperFull.js'
import ClassesScraper from './scraperClasses.js'

const interval = 1000 * 60 * 60 // 1 hour

if (process.env.ENTRYPOINT === undefined) {
  var entrypoint = 'http://127.0.0.1:3000/'
  var entrypointClasses = 'https://zst-radom.edu.pl/plan_www/' // I don't have a local copy available, and couldn't bother to make one
  var outputDir = './output/'

  console.log('Using default entrypoint: ' + entrypoint)
  console.log('Using default entrypoint for classes: ' + entrypointClasses)
  console.log('Using default output directory: ' + outputDir)
} else {
  var entrypoint = process.env.ENTRYPOINT
  var entrypointClasses = process.env.ENTRYPOINT_BACKUP || 'http://0.0.0.0/'
  var outputDir = '/mnt/data/'

  console.log('Using entrypoint: ' + entrypoint)
  console.log('Using entrypoint for classes: ' + entrypointClasses)
  console.log('Using output directory: ' + outputDir)
}

async function mainLoop() {
  let hasFullPlanFailed = false
  let hasFailed = false
  let scraperResult = null
  try {
    try {
      scraperResult = await scrapeUsingFullPlan()
    } catch (e) {
      hasFullPlanFailed = true
      console.error(e)
      console.log(
        'Scraping using full plan failed, trying to scrape using classes plan.'
      )
      scraperResult = await scrapeUsingClassesPlan()
    }

    await fsExtra.emptyDir(outputDir)
    await fs.writeFile(
      outputDir + 'categories',
      JSON.stringify(scraperResult.categories)
    )
    await fs.mkdir(outputDir + 'plans')
    for (let plan of Object.entries(scraperResult.plans)) {
      await fs.writeFile(
        outputDir + 'plans/' + plan[0],
        JSON.stringify(plan[1])
      )
    }
  } catch (e) {
    hasFailed = true
    console.error(e)
  }

  setTimeout(mainLoop, interval)

  console.log(
    `Scraping finished ${
      hasFailed ? 'UNSUCCESSFULLY' : 'successfully'
    } using the ${
      hasFullPlanFailed ? 'classes' : 'full'
    } plan. Next scraping will start at ${new Date(
      Date.now() + interval
    ).toLocaleString('pl-PL', {
      timeZone: 'Europe/Warsaw'
    })}`
  )
}

mainLoop()

async function scrapeUsingFullPlan(): Promise<ScrapeResult> {
  let scraper = new FullScraper({
    entrypoint,
    planList: 'lista.html'
  })

  let scraperResult = await scraper.scrape()
  return scraperResult
}
async function scrapeUsingClassesPlan(): Promise<ScrapeResult> {
  let scraper = new ClassesScraper({
    entrypoint: entrypointClasses,
    planList: 'lista.html'
  })

  let scraperResult = await scraper.scrape()
  return scraperResult
}
