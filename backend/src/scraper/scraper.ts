import fetch from "node-fetch";
import { JSDOM } from "jsdom";

import { CategoryName } from "../../../shared/types";

export interface Urls {
  entrypoint: string;
  categories: string;
}

type IScrapedCategories = {
  [key in CategoryName]: { url: string; name: string }[];
};

export default class Scraper {
  constructor(private readonly urls: Urls) {}

  public async scrapeCategories() {
    const categoriesHTML = await (
      await fetch(
        new URL(this.urls.categories, this.urls.entrypoint).toString()
      )
    ).text();

    const document = new JSDOM(categoriesHTML).window.document;

    const selectors: { [key in CategoryName]: string } = {
      students: "body > ul:nth-child(2)",
      teachers: "body > ul:nth-child(4)",
      rooms: "body > ul:nth-child(6)",
    };

    var result: Partial<IScrapedCategories> = {};

    let categoryName: CategoryName;
    for (categoryName in selectors) {
      result[categoryName] = Array.from(
        document
          .querySelector(selectors[categoryName])!
          .querySelectorAll("li > a")!
      ).map((linkEl) => ({
        url: linkEl.attributes.getNamedItem("href")!.value,
        name: linkEl.textContent!,
      }));
    }

    return result as IScrapedCategories;
  }
}
