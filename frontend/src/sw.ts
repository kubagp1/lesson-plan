/// <reference lib="WebWorker" />
export type {}
declare const self: ServiceWorkerGlobalScope
// /\ typescript bs

const CACHE_NAME = "cache-v1"

self.addEventListener("install", event => {
  event.waitUntil(async () => {
    console.log("SW installed")
    self.skipWaiting()
    return
  })
})

self.addEventListener("activate", event => {
  event.waitUntil(async () => {
    console.log("SW activated")
    return
  })
})

const broadcast = new BroadcastChannel("cache-update")

console.log(new URL("api/", self.registration.scope))

async function broadcastUpdate(request: Request, response: Response) {
  // if (request.url.match(new RegExp($`^${process.env.API_ENDPOINT}.*`))) {

  switch (request.destination) {
    case "document" || "font" || "image" || "media" || "script" || "style":
      broadcast.postMessage({ type: "app" })
      break

    default:
      break
  }
}

// Stale-while-revalidate strategy
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        var fetchPromise = fetch(event.request).then(function (
          networkResponse
        ) {
          if (networkResponse.ok)
            if (
              response &&
              response.headers.get("Content-Length") !==
                networkResponse.headers.get("Content-Length") &&
              response.headers.get("ETag") !==
                networkResponse.headers.get("ETag") &&
              response.headers.get("Last-Modified") !==
                networkResponse.headers.get("Last-Modified")
            ) {
              broadcastUpdate(event.request, response)
            }

          cache.put(event.request, networkResponse.clone())
          return networkResponse
        })
        return response || fetchPromise
      })
    })
  )
})
