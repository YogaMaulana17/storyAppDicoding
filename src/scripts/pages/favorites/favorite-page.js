import FavoritePresenter from "./favorite-presenter.js";

export default class FavoritePage {
  constructor() {
    this.presenter = new FavoritePresenter(this);
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  async render() {
    return `
      <section class="container">
        <h1>Favorite Stories</h1>
        <div id="favorites-list" class="row"></div>
      </section>
    `;
  }

  async afterRender() {
    this.presenter.loadFavorites();
  }

  showFavorites(stories) {
    const container = document.getElementById("favorites-list");
    if (!stories.length) {
      container.innerHTML = "<p>Belum ada story favorit.</p>";
      return;
    }

    container.innerHTML = stories
      .map(
        (story) => `
        <div class="col-md-4 mb-3">
          <div class="card h-100">
            <img src="${story.photoUrl}" class="card-img-top" alt="${story.name}">
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 class="card-title">${story.name}</h5>
                <p class="card-text">${story.description}</p>
              </div>
              <div class="d-flex gap-2 mt-3">
                <a href="#/story/${story.id}" class="btn btn-primary btn-sm flex-fill">Lihat Detail</a>
                <button class="btn btn-danger btn-sm flex-fill" data-id="${story.id}">Hapus</button>
              </div>
            </div>
          </div>
        </div>
      `
      )
      .join("");

    // Tambahkan listener untuk hapus
    container.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.presenter.deleteFavorite(id);
      });
    });
  }

  showError(message) {
    const container = document.getElementById("favorites-list");
    container.innerHTML = `<p class="text-danger">${message}</p>`;
  }
}
