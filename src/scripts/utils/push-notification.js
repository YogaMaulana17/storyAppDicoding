import CONFIG from "../config";
import {
  subscribePushNotification as sendToServer,
  unsubscribePushNotification as removeFromServer,
} from "../data/api";

const pushNotificationHelper = {
  async askPermission() {
    if (!("Notification" in window)) {
      console.error("Browser tidak mendukung notifikasi");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      alert(
        "Notifikasi telah diblokir. Silakan aktifkan manual di pengaturan browser."
      );
      return false;
    }

    const status = await Notification.requestPermission();
    return status === "granted";
  },
  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      console.error("Service Worker tidak didukung browser");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("✅ Service Worker terdaftar:", registration);
      return registration;
    } catch (error) {
      console.error("Gagal mendaftarkan Service Worker:", error);
      return null;
    }
  },

  _urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  },

  async subscribePushNotification(registration) {
    if (!("PushManager" in window)) {
      console.error("PushManager tidak tersedia");
      return;
    }

    const permissionGranted = await this.askPermission();
    if (!permissionGranted) return;

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(
          CONFIG.PUSH_PUBLIC_KEY
        ),
      });

      if (!subscription) {
        console.error("Subscription gagal dibuat.");
        return;
      }

      const json = subscription.toJSON();
      const p256dh = json?.keys?.p256dh;
      const auth = json?.keys?.auth;

      if (!p256dh || !auth) {
        console.error(
          "Keys tidak lengkap. Pastikan p256dh dan auth ada.",
          json?.keys
        );
        return;
      }

      const response = await sendToServer({
        endpoint: subscription.endpoint,
        keys: { p256dh, auth },
      });

      if (response.ok) {
        console.log(
          "Subscription berhasil dikirim ke server:",
          response.message
        );
      } else {
        console.warn(
          "Gagal mengirim subscription ke server:",
          response.message
        );
      }

      console.log("✅ Subscription Object:", JSON.stringify(json, null, 2));
    } catch (error) {
      console.error("Gagal subscribe push:", error);
    }
  },
  async unsubscribePushNotification(registration) {
    try {
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        console.log("Tidak ada langganan aktif.");
        return;
      }

      const endpoint = subscription.endpoint;

      const unsubscribed = await subscription.unsubscribe();
      if (unsubscribed) {
        console.log("Berhasil unsubscribe dari push");

        const response = await removeFromServer(endpoint);
        if (response.ok) {
          console.log(
            "✅ Endpoint berhasil dihapus dari server:",
            response.message
          );
        } else {
          console.warn("Gagal menghapus endpoint di server:", response.message);
        }
      }
    } catch (error) {
      console.error("Gagal unsubscribe:", error);
    }
  },
};

export default pushNotificationHelper;
