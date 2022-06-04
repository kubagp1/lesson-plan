new BroadcastChannel("cache-update").addEventListener("message", event => {
  if (event.data.type === "app") window.location.reload()
})

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("sw.ts", import.meta.url), {
      type: "module"
    })
  })
}

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"

import React from "react"
import ReactDom from "react-dom"

import App from "./components/App"

ReactDom.render(<App />, document.getElementById("app"))
