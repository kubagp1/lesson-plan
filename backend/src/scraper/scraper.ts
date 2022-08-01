import fetch from "node-fetch";
import { JSDOM } from "jsdom";

import {
  CategoryName,
  ILevel,
  IPlan,
  IRoomPlanEntry,
  IStudentPlanEntry,
  ITeacherPlanEntry,
  WEEKDAYS,
} from "../shared/types.js";

export interface Urls {
  entrypoint: string;
  categories: string;
}

type IScrapedCategories = {
  [key in CategoryName]: { url: string; name: string; id: number }[];
};

function* idGenerator(): Generator<number, number, number> {
  var index = 0;
  while (true) yield index++;
}

export default class Scraper {
  private idGenerator: Generator<number, number, number>;

  constructor(private readonly urls: Urls) {
    this.idGenerator = idGenerator();
  }

  public async scrape() {
    let categories = await this.scrapeCategories();

    categories.students.forEach((plan) => ({
      ...plan,
      name: this.transformStsudentPlanName(plan.name),
    }));

    let categoriesGrouped = {
      ...categories,
      students: this.groupStudentsCategory(categories.students),
    };

    let plans = [];

    let categoryName: CategoryName;
    for (categoryName in categories) {
      for (let plan of categories[categoryName]) {
        plans.push(await this.scrapePlan(plan.url, plan.id, categoryName));
      }
    }
    return {
      categories: categoriesGrouped,
      plans,
    };
  }

  private async scrapeCategories(): Promise<IScrapedCategories> {
    console.log("Scraping categories: " + this.urls.categories);

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

    let result: Partial<IScrapedCategories> = {};

    let categoryName: CategoryName;
    for (categoryName in selectors) {
      result[categoryName] = Array.from(
        document
          .querySelector(selectors[categoryName])!
          .querySelectorAll("li > a")!
      ).map((linkEl) => ({
        url: linkEl.attributes.getNamedItem("href")!.value,
        name: linkEl.textContent!,
        id: this.idGenerator.next().value,
      }));
    }

    return result as IScrapedCategories;
  }

  private async scrapePlan(
    url: string,
    id: number,
    category: CategoryName
  ): Promise<IPlan<IStudentPlanEntry | ITeacherPlanEntry | IRoomPlanEntry>> {
    console.log("Scraping plan: " + url);

    const planHTML = await (
      await fetch(new URL(url, this.urls.entrypoint).toString())
    ).text();

    const document = new JSDOM(planHTML).window.document;

    const table = document.querySelector("table.tabela")!;

    const relevantRows = Array.from(table.querySelectorAll("tr")).slice(1);

    let hours = relevantRows.map(
      (row) => row.querySelector("td:nth-child(2)")!.textContent!
    );

    hours = hours.map((hour) => this.transformHours(hour));

    let lessons: any = {
      monday: [[null]],
      tuesday: [[null]],
      wednesday: [[null]],
      thursday: [[null]],
      friday: [[null]],
    };

    for (let weekdayIndex = 0; weekdayIndex < 5; weekdayIndex++) {
      const weekdayName = WEEKDAYS[weekdayIndex];

      lessons[weekdayName] = Array.from(
        relevantRows.map((row) => {
          let td = row.querySelector(`td:nth-child(${3 + weekdayIndex})`)!;

          let entriesSpans = td.querySelectorAll("span.p");

          if (entriesSpans.length === 0) return [null];

          switch (category) {
            case "students":
              return Array.from(entriesSpans).map((span) => {
                return {
                  name: span.textContent!,
                  teacher:
                    span.parentElement!.querySelector(".n")!.textContent!,
                  room: span.parentElement!.querySelector(".s")!.textContent!,
                };
              });
            case "teachers":
              return Array.from(entriesSpans).map((span) => {
                return {
                  name: span.textContent!,
                  students:
                    span.parentElement!.querySelector(".o")!.textContent!,
                  room: span.parentElement!.querySelector(".s")!.textContent!,
                };
              });
            case "rooms":
              return Array.from(entriesSpans).map((span) => {
                return {
                  name: span.textContent!,
                  teacher:
                    span.parentElement!.querySelector(".n")!.textContent!,
                  students:
                    span.parentElement!.querySelector(".o")!.textContent!,
                };
              });
          }
        })
      );
    }

    return {
      id,
      hours,
      lessons,
    };
  }

  private groupStudentsCategory(
    category: { id: number; name: string }[]
  ): ILevel[] {
    var result: ILevel[] = [];

    for (var plan of category) {
      const level = plan.name.charAt(0);
      if (result.find((l) => l.name === level) === undefined) {
        result.push({
          name: level,
          plans: [plan],
        });
      } else {
        result.find((l) => l.name === level)!.plans.push(plan);
      }
    }

    return result;
  }

  // remove everything after a space e.g: 4W 4Wsp => 4W
  private transformStsudentPlanName(name: string): string {
    return name.split(" ")[0];
  }

  // given a string like " 9:00- 10:15" return "9:00 - 10:15"
  private transformHours(hour: string): string {
    return hour.replaceAll(" ", "").replace("-", " - ");
  }
}
