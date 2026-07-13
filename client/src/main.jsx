import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Service Worker Registration and Localhost Development Bypass
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  const isProduction = import.meta.env.PROD;
  const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "[::1]"
  );

  if (!isProduction || isLocalhost) {
    console.info("[Client] Development/Localhost environment. Bypassing service worker registration.");

    // Proactively unregister any active service workers on localhost to avoid cached chunk conflicts
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().then((success) => {
            if (success) {
              console.info("[Client] Proactively unregistered service worker on localhost.");
            }
          }).catch((err) => {
            console.error("[Client] Failed to proactively unregister service worker:", err);
          });
        });
      })
      .catch((err) => {
        console.error("[Client] Failed to retrieve service worker registrations:", err);
      });

    // Proactively clear browser caches in local development
    if (window.caches) {
      window.caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            console.info("[Client] Proactively deleting browser cache:", key);
            return window.caches.delete(key).catch((err) => {
              console.error(`[Client] Failed to delete cache "${key}":`, err);
            });
          })
        );
      }).catch((err) => {
        console.error("[Client] Failed to retrieve cache keys:", err);
      });
    }

    // Force client reload if the service worker self-destructs and signals
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SW_SELF_DESTRUCT_RELOAD") {
        console.info("[Client] Service Worker self-destruct signal received. Reloading window...");
        window.location.reload();
      }
    });
  } else {
    // Production builds running on live domains: Register Service Worker
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js")
        .then((registration) => {
          console.info("[Client] Service Worker registered successfully under scope:", registration.scope);
        })
        .catch((err) => {
          console.error("[Client] Service Worker registration failed:", err);
        });
    });
  }
}