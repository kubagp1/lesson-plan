
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

import { Categories, CategoryName, Entity, Plan, weekdays, Teacher } from './shared/types.js';

type ScrapeResult = {
  categories: Categories,
  plans: {
    [key: string]: Plan;
  }
}

type ScrapePlanListResult = {
  type: CategoryName;
  url: string;
  name: string;
  id: any;
}[]

function* idGenerator() {
  let id = 0;
  while (true) {
    yield id++;
  }
}

export interface Urls {
  entrypoint: string;
  categories: string;
}

export default class Scraper {
  private idGenerator: Generator<number>;
  private entityCache: { [key: string]: Entity } = {};

  constructor(private readonly urls: Urls) {
    this.idGenerator = idGenerator();
  }

  async scrape(): Promise<ScrapeResult> {
    const planList = await this.scrapePlanList();
    const plans = await this.scrapePlans(planList);

    const categories = this.planListToCategories(planList);

    console.log(`Scraped ${Object.keys(plans).length} plans`);

    return {
      categories,
      plans,
    };
  }
  private planListToCategories(planList: ScrapePlanListResult): Categories {
    let categories: Categories = {
      class: {},
      teacher: [],
      classroom: [],
    }

    for (const plan of planList) {
      const category = {
        planId: plan.id,
        shortName: this.entityCache[plan.id]?.shortName || plan.name,
        longName: plan.name
      };

      if (plan.type == "class") {
        // get first number from plan.name
        const classNumber = plan.name.match(/\d+/)![0];
        if (!categories.class[classNumber]) {
          categories.class[classNumber] = [];
        }
        categories.class[classNumber].push(category);
      } else
        categories[plan.type].push(category);
    }

    return categories;
  }

  private async scrapePlanList(): Promise<ScrapePlanListResult> {
    const categoriesHTML = await (
      await fetch(
        new URL(this.urls.categories, this.urls.entrypoint).toString()
      )
    ).text();

    const document = new JSDOM(categoriesHTML).window.document;

    const selectors = {
      class: "body > ul:nth-child(2)",
      teacher: "body > ul:nth-child(4)",
      classroom: "body > ul:nth-child(6)",
    };

    let result = [] as ScrapePlanListResult;

    let categoryName: keyof typeof selectors;
    for (categoryName in selectors) {
      result = [...result, ...Array.from(
        document
          .querySelector<HTMLUListElement>(selectors[categoryName])!
          .querySelectorAll<HTMLAnchorElement>("li > a")!
      ).map((linkEl) => ({
        type: categoryName,
        url: linkEl.href,
        name: linkEl.textContent!,
        id: this.idGenerator.next().value,
      }))];
    }

    console.log(`Scraped plan list (${result.length} plans)`);

    return result;
  }

  private async scrapePlans(
    planList: ScrapePlanListResult
  ): Promise<ScrapeResult["plans"]> {
    let plans = {} as ScrapeResult["plans"];

    for (const plan of planList) {
      plans[plan.id] = await this.scrapePlan(plan, planList);
      console.log(`Scraped plan ${plan.name}`);
    }
    return plans;
  }

  private async scrapePlan(plan: ScrapePlanListResult[0], planList: ScrapePlanListResult): Promise<Plan> {
    const planHTML = await (
      await fetch(new URL(plan.url, this.urls.entrypoint).toString())
    ).text();

    const document = new JSDOM(planHTML).window.document;

    const table = document.querySelector("table.tabela")!;

    const relevantRows = Array.from(table.querySelectorAll("tr")).slice(1);

    let hours = relevantRows.map(
      (row) => row.querySelector("td:nth-child(2)")!.textContent!
    );

    hours = hours.map((hour) => this.transformHours(hour));

    let timetable: Plan["timetable"] = {
      monday: [[null]],
      tuesday: [[null]],
      wednesday: [[null]],
      thursday: [[null]],
      friday: [[null]],
    };

    for (let weekdayIndex = 0; weekdayIndex < weekdays.length; weekdayIndex++) {
      const weekday = weekdays[weekdayIndex];

      timetable[weekday] = Array.from(
        relevantRows.map((row) => {
          let td = row.querySelector(`td:nth-child(${3 + weekdayIndex})`)!;

          let entriesSpans = td.querySelectorAll("span.p");

          if (entriesSpans.length === 0) return [null];

          let entityFactory = (el: HTMLAnchorElement): Entity => {
            // This is necessary because we get the long name from the plan list,
            // our internal id is also stored there, but it's easier to get the short name
            // from the plan itself.
            let shortName = el.textContent!;
            let url = el.href;

            let entity = {
              longName: planList.find((plan) => plan.url.endsWith(url))!.name,
              planId: planList.find((plan) => plan.url.endsWith(url))!.id,
              shortName
            }

            this.entityCache[entity.planId] = entity;

            return entity;
            ;
          }

          switch (plan.type) {
            case "class":
              return Array.from(entriesSpans).map((span) => {
                return {
                  name: span.textContent!,
                  teacher: entityFactory(span.parentElement!.querySelector<HTMLAnchorElement>(".n")!) as Teacher,
                  classroom: entityFactory(span.parentElement!.querySelector<HTMLAnchorElement>(".s")!),
                };
              });
            case "teacher":
              return Array.from(entriesSpans).map((span) => {
                return {
                  name: span.textContent!,
                  class:
                    entityFactory(span.parentElement!.querySelector<HTMLAnchorElement>(".o")!),
                  classroom: entityFactory(span.parentElement!.querySelector<HTMLAnchorElement>(".s")!),
                };
              });
            case "classroom":
              return Array.from(entriesSpans).map((span) => {
                return {
                  name: span.textContent!,
                  teacher:
                    entityFactory(span.parentElement!.querySelector<HTMLAnchorElement>(".n")!),
                  class:
                    entityFactory(span.parentElement!.querySelector<HTMLAnchorElement>(".o")!),
                };
              });
          }
        })
      ) as Plan["timetable"][keyof Plan["timetable"]]; // not exactly a good solution, but it works
    }

    return {
      id: plan.id,
      timetable
    } as Plan // i hate this
  }

  // given a string like " 9:00- 10:15" return "9:00 - 10:15"
  private transformHours(hour: string): string {
    return hour.replaceAll(" ", "").replace("-", " - ");
  }
}