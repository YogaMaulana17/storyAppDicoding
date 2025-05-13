import { getAccessToken } from "../../utils/auth";
import { addStory } from "../../data/api";

export default class StoryPresenter {
  #view;

  constructor({ view }) {
    this.#view = view;
  }

  async uploadStory({ description, photo, latitude, longitude }) {
    const token = getAccessToken();

    if (!token) {
      this.#view.showFeedback(
        "Token tidak valid. Silakan login ulang.",
        "danger"
      );
      return;
    }

    try {
      const result = await addStory({
        description,
        photo,
        lat: latitude,
        lon: longitude,
        token,
      });

      if (!result.ok) {
        this.#view.showFeedback(`Gagal upload: ${result.message}`, "danger");
      } else {
        this.#view.showFeedback("Cerita berhasil diupload!", "success");
        document.querySelector("#story-form").reset();
        this.#view.resetCameraPreview();

        // Tampilkan notifikasi lokal di browser
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration) {
            registration.showNotification("Story berhasil diunggah!", {
              body: "Terima kasih telah berbagi cerita 🙌",
              icon: "/favicon.png",
              badge: "/images/logo.png",
              tag: "upload-story-success",
            });
          }
        }

        // Redirect ke halaman utama
        window.location.hash = "/";
      }
    } catch (error) {
      this.#view.showFeedback(`Error: ${error.message}`, "danger");
    }
  }
}
