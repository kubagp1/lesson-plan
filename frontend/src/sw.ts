/// <reference lib="WebWorker" />
export type {}
declare const self: ServiceWorkerGlobalScope
// /\ typescript bs

import { API_ENTRYPOINT } from "./apiCalls"

const ABSOLUTE_API_ENTRYPOINT =
  API_ENTRYPOINT.startsWith("http://") || API_ENTRYPOINT.startsWith("https://")
    ? API_ENTRYPOINT
    : `${location.origin}${API_ENTRYPOINT}`

const CACHE_NAME = "cache-v1"

self.addEventListener("install", event => {
  console.log("[ServiceWorker] Installed")
})

self.addEventListener("activate", event => {
  console.log("[ServiceWorker] Activated")
})

const broadcast = new BroadcastChannel("cache-update")

async function broadcastUpdate(request: Request, response: Response) {
  if (
    request.url.match(new RegExp(`^${ABSOLUTE_API_ENTRYPOINT}categories.*`))
  ) {
    broadcast.postMessage({ type: "categories" })
  } else if (
    request.url.match(new RegExp(`^${ABSOLUTE_API_ENTRYPOINT}plans.*`))
  ) {
    broadcast.postMessage({ type: "plan" })
  } else if (request.url.match(new RegExp(`^${self.registration.scope}.*`))) {
    switch (request.destination) {
      case "document" || "font" || "image" || "media" || "script" || "style":
        caches.delete(CACHE_NAME)
        broadcast.postMessage({ type: "app" })
        break

      default:
        break
    }
  }
}

// Stale-while-revalidate strategy
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("if looks could kill", event.request.url)
      return cache.match(event.request).then(function (response) {
        var fetchPromise = fetch(event.request).then(function (
          networkResponse
        ) {
          if (
            response &&
            (response.headers.get("Content-Length") !==
              networkResponse.headers.get("Content-Length") ||
              response.headers.get("ETag") !==
                networkResponse.headers.get("ETag") ||
              response.headers.get("Last-Modified") !==
                networkResponse.headers.get("Last-Modified"))
          ) {
            broadcastUpdate(event.request, networkResponse)
          }

          console.log("youd be laying", event.request.url)
          cache.put(event.request, networkResponse.clone()).catch(() => {
            console.log("begging me please", event.request.url)
          })
          return networkResponse
        })
        return response || fetchPromise
      })
    })
  )
})
