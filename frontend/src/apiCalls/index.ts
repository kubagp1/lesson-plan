import { Plan, Categories } from '../shared/types'

// this is so that if you port forward to localhost from codespaces, it will not try to access the codespace url
function isAccessedFromCodespace() {
  return (
    import.meta.env.VITE_CODESPACES &&
    location.hostname.endsWith(
      import.meta.env.VITE_GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    )
  )
}

function generateDevEntrypoint(port: number): string {
  if (port % 1 !== 0) throw new Error('Port must be an integer')

  if (isAccessedFromCodespace()) {
    return `https://${import.meta.env.VITE_CODESPACE_NAME}-${port}.${
      import.meta.env.VITE_GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    }/`
  }

  return `${location.protocol}//${location.hostname}:${port}/`
}

const entrypoint = import.meta.env.PROD
  ? location.origin + '/data/'
  : generateDevEntrypoint(5000)

console.log({ entrypoint, env: import.meta.env })

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
