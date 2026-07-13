const isLocalhost = Boolean(
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1" ||
  self.location.hostname === "[::1]"
);

if (isLocalhost) {
  console.info("[Service Worker] Localhost environment detected. Initiating self-destruction...");

  self.addEventListener("install", () => {
    try {
      self.skipWaiting();
    } catch (err) {
      console.error("[Service Worker] skipWaiting failed during install:", err);
    }
  });

  self.addEventListener("activate", (event) => {
    try {
      event.waitUntil(
        Promise.all([
          self.clients.claim(),
          // Delete all caches safely
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => {
                console.info("[Service Worker] Deleting browser cache:", cacheName);
                return caches.delete(cacheName).catch((err) => {
                  console.error(`[Service Worker] Failed to delete cache "${cacheName}":`, err);
                });
              })
            );
          }),
          // Unregister service worker registration safely
          self.registration.unregister().then((success) => {
            if (success) {
              console.info("[Service Worker] Successfully unregistered registration on localhost.");
            } else {
              console.warn("[Service Worker] Unregister returned false.");
            }
          }).catch((err) => {
            console.error("[Service Worker] Failed to unregister registration:", err);
          })
        ])
        .then(() => {
          // Retrieve clients and message them to reload
          return self.clients.matchAll({ type: "window" });
        })
        .then((clients) => {
          if (clients && clients.length > 0) {
            clients.forEach((client) => {
              try {
                client.postMessage({ type: "SW_SELF_DESTRUCT_RELOAD" });
              } catch (err) {
                console.error("[Service Worker] Failed to postMessage to client window:", err);
              }
            });
          }
        })
        .catch((err) => {
          console.error("[Service Worker] Error during self-destruction promise sequence:", err);
        })
      );
    } catch (err) {
      console.error("[Service Worker] Uncaught synchronous activation error:", err);
    }
  });
} else {
  // Production Behavior: standard pass-through or basic lifecycle
  self.addEventListener("install", (event) => {
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
  });

  self.addEventListener("fetch", (event) => {
    // Pass-through to network, preserving production network behavior
    event.respondWith(fetch(event.request));
  });
}
