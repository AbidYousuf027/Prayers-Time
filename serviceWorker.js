const ReminderApp = "Prayers-Time-App"
const assets = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/login.html",
  "/login.css",
  "/login.js",
  "/namaz.html",
  "/namaz.css",
  "/namaz.js",
  "/assets/icon-48x48.png",
  "/assets/icon-72x72.png",
  "/assets/icon-96x96.png",
  "/assets/icon-128x128.png",
  "/assets/icon-144x144.png",
  "/assets/icon-152x152.png",
  "/assets/icon-192x192.png",
  "/assets/icon-384x384.png",
  "/assets/icon-512x512.png",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(ReminderApp).then(cache => {
      cache.addAll(assets)
    })
  )
})



