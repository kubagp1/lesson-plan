import { EventFunction } from "@google-cloud/functions-framework";
import { Storage } from "@google-cloud/storage";

import Scraper from "./scraper/scraper.js";
import { sleep } from "./utils.js";

const BUCKET_NAME = process.env.BUCKET_NAME as string;

const bucket = new Storage().bucket(BUCKET_NAME);

const urls = {
  entrypoint: "https://zst-radom.edu.pl/nauczyciele/",
  categories: "lista.html",
};

export const event: EventFunction = async (event, context) => {
  console.log("Scraping has started.")

  const scraper = new Scraper(urls);
  const data = await scraper.scrape();

  console.log("Scraping finished. Uploading...")

  const uploadPromises: Promise<void>[] = [];
  let resolvedPromises = 0;

  uploadPromises.push(
    bucket.file("categories").save(JSON.stringify(data.categories)).then(() => {
      resolvedPromises++
      console.log(`Categories uploaded successfully. (${resolvedPromises}/${uploadPromises.length})`)
    })
  );

  for (const plan of data.plans) {

    while (uploadPromises.length - resolvedPromises > 5) {
      await sleep(100)
    }

    uploadPromises.push(
      bucket.file(`plans/${plan.id}`).save(JSON.stringify(plan)).then(() => {
        resolvedPromises++
        console.log(`Plan #${plan.id} (${resolvedPromises}/${uploadPromises.length}) uploaded successfully.`)
      })
    );
  }

  await Promise.all(uploadPromises)

  console.log("Lesson plan uploaded successfully.")
};
