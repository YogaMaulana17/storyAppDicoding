export default class HomePage {
  constructor() {
    this.presenter = null;
  }

  setPresenter(presenter) {
    this.presenter = presenter;
  }

  async render() {
    return `
      <section class="container">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h1>Home Page</h1>
          <a href="#/upload" id="upload-button" class="btn btn-success">Upload Cerita</a>
        </div>
        <div id="story-list" class="row">
          <p>Loading stories...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.presenter?.loadStories();
  }

  showStories(stories) {
    const storyListElement = document.getElementById("story-list");
    const storyItems = stories
      .map(
        (story) => `
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <img src="${story.photoUrl}" class="card-img-top" alt="Story Image">
            <div class="card-body">
              <h5 class="card-title">${story.name}</h5>
              <p class="card-text">${story.description}</p>
              <p class="text-muted">Diposting pada: ${new Date(
                story.createdAt
              ).toLocaleDateString()}</p>
              <a href="#/story/${
                story.id
              }" class="btn btn-primary">Lihat Detail</a>
            </div>
          </div>
        </div>
      `
      )
      .join("");

    storyListElement.innerHTML = storyItems;
  }

  showError(message) {
    const storyListElement = document.getElementById("story-list");
    storyListElement.innerHTML = `<p class="text-danger">${message}</p>`;
  }
}
