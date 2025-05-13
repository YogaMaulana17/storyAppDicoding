import Database from "../../data/database.js";

export default class FavoritePresenter {
  constructor(view) {
    this.view = view;
  }

  async loadFavorites() {
    try {
      const stories = await Database.getAllStories();
      this.view.showFavorites(stories);
    } catch (error) {
      this.view.showError("Gagal memuat data favorit.");
    }
  }

  async deleteFavorite(id) {
    try {
      await Database.deleteStory(id);
      this.loadFavorites();
    } catch (error) {
      this.view.showError("Gagal menghapus data favorit.");
    }
  }
}
