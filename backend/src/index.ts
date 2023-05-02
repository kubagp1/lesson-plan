import * as fs from 'fs/promises'
import * as fsExtra from 'fs-extra'
import Scraper from './scraper.js'

const interval = 1000 * 60 * 60 // 1 hour

if (process.env.ENTRYPOINT === undefined) {
  console.log('Using default entrypoint: http://127.0.0.1:3000/')
  console.log('Using default output directory: ./output/')
  var entrypoint = 'http://127.0.0.1:3000/'
  var outputDir = './output/'
} else {
  var entrypoint = process.env.ENTRYPOINT
  var outputDir = '/mnt/data/'
}

async function mainLoop() {
  let hasFailed = false
  try {
    let scraper = new Scraper({
      entrypoint,
      categories: 'lista.html'
    })

    let scraperResult = await scraper.scrape()

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
    }. Next scraping will start at ` +
      new Date(Date.now() + interval).toLocaleString('pl-PL', {
        timeZone: 'Europe/Warsaw'
      })
  )
}

mainLoop()
