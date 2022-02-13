import { ICategories } from "../../shared/types"

const API_ENDPOINT = `${location.protocol}//${location.hostname}:3000/`

alert(API_ENDPOINT)

export const categories = () =>
  fetch(API_ENDPOINT + "categories").then(res =>
    res.json()
  ) as Promise<ICategories>

export default { categories }
