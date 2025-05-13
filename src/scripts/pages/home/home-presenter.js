import { getAllStories } from "../../data/api";

export default class HomePresenter {
  constructor(view) {
    this.view = view;
    this.view.setPresenter(this);
  }

  async loadStories() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        this.view.showError("Anda harus login untuk melihat cerita.");
        return;
      }

      const { ok, stories, message } = await getAllStories(token);

      if (ok) {
        this.view.showStories(stories);
      } else {
        this.view.showError(message || "Gagal mengambil cerita.");
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      this.view.showError("Terjadi kesalahan saat mengambil cerita.");
    }
  }
}
