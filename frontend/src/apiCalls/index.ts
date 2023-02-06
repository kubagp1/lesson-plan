import { Plan, Categories } from '../shared/types'

const entrypoint = import.meta.env.PROD
  ? location.origin + '/data/'
  : location.protocol + '//' + location.hostname + ':5000/'

const fetchData = async (endpoint: string) => {
  const response = await fetch(entrypoint + endpoint)
  if (!response.ok) {
    throw new Error(`Could not fetch ${endpoint}, received ${response.status}`)
  }
  return response.json()
}

export const getCategories = () =>
  fetchData('categories') as Promise<Categories>

export const getPlan = (id: number) => fetchData(`plans/${id}`) as Promise<Plan>

export default { getCategories, getPlan }
