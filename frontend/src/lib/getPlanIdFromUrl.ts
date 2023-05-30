export function getPlanIdFromUrl(): number | null {
  const currentUrl = window.location.pathname

  const regex = /^\/plan\/(\d+)/

  const match = regex.exec(currentUrl)?.[1]
  return match === undefined ? null : parseInt(match)
}