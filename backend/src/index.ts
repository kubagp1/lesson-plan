import Scraper from "./scraper/scraper.js";

var res = await new Scraper({
  entrypoint: "http://localhost:5555/",
  categories: "lista.html",
}).scrape();

// save to file
import fs from "fs";
fs.writeFileSync("./scraped.json", JSON.stringify(res, null, 1));
