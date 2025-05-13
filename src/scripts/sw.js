import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.origin === "https://story-api.dicoding.dev",
  new StaleWhileRevalidate({
    cacheName: "api-cache",
  })
);

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  self.clients.claim();
});

self.addEventListener("push", function (event) {
  event.waitUntil(
    (async () => {
      let data = {
        title: "Notifikasi Baru!",
        body: "Ada sesuatu yang baru di aplikasi kamu.",
      };

      if (event.data) {
        try {
          data = event.data.json();
        } catch (e) {
          const text = await event.data.text();
          data.body = text;
        }
      }

      const options = {
        body: data.body,
        icon: "/favicon.png",
        badge: "/images/logo.png",
      };

      await self.registration.showNotification(data.title, options);
    })()
  );
});
