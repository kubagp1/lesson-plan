import { ICategories, IPlan } from "../../shared/types"

const API_ENTRYPOINT = `${location.protocol}//${location.hostname}:3000/`

const fetchData = async (endpoint: string) => {
  const response = await fetch(`${API_ENTRYPOINT}${endpoint}`)
  if (!response.ok) {
    throw new Error(`Could not fetch ${endpoint}, received ${response.status}`)
  }
  return response.json()
}

export const categories = () => fetchData("categories") as Promise<ICategories>

export const plan = (id: number) => fetchData(`plans/${id}`) as Promise<IPlan>

export default { categories, plan }
