import Scraper from "./scraper/scraper.js";

var scraper = new Scraper({
  entrypoint: "https://zst-radom.edu.pl/nauczyciele/",
  categories: "lista.html",
});

scraper.scrapeCategories().then((data) => console.log(data));
