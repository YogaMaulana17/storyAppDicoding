import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import { scrollToMainContent } from "./utils/skipContent.js";

import pushNotificationHelper from "./utils/push-notification.js";
import routes, { NotFoundPage } from "./routes/routes.js";

const parseUrl = () => {
  const hash = window.location.hash.slice(1).toLowerCase();
  return hash || "/";
};

const findPage = (url) => {
  if (routes[url]) return routes[url];

  const dynamicRoute = Object.keys(routes).find(
    (route) => route.includes(":") && url.startsWith(route.split("/:")[0])
  );

  return dynamicRoute ? routes[dynamicRoute] : new NotFoundPage();
};

const router = async () => {
  const main = document.getElementById("main-content");
  const url = parseUrl();
  const page = findPage(url);

  main.innerHTML = await page.render();
  await page.afterRender();
};

window.addEventListener("hashchange", router);
window.addEventListener("load", router);

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();

  const skipLink = document.getElementById("skipToContent");
  if (skipLink) skipLink.addEventListener("click", scrollToMainContent);

  await pushNotificationHelper.registerServiceWorker();
  const registration = await navigator.serviceWorker.ready;
  registration.update();
  const pushButton = document.getElementById("push-button");
  let isSubscribed = false;

  if (registration) {
    const subscription = await registration.pushManager.getSubscription();
    isSubscribed = Boolean(subscription);
    updatePushButton();

    pushButton.addEventListener("click", async () => {
      if (isSubscribed) {
        await pushNotificationHelper.unsubscribePushNotification(registration);
        isSubscribed = false;
      } else {
        const permission = await pushNotificationHelper.askPermission();
        if (!permission) return;
        await pushNotificationHelper.subscribePushNotification(registration);
        isSubscribed = true;
      }
      updatePushButton();
    });
  }

  function updatePushButton() {
    if (isSubscribed) {
      pushButton.textContent = "Nonaktifkan Notifikasi";
      pushButton.classList.replace("btn-outline-primary", "btn-outline-danger");
    } else {
      pushButton.textContent = "Aktifkan Notifikasi";
      pushButton.classList.replace("btn-outline-danger", "btn-outline-primary");
    }
  }

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
