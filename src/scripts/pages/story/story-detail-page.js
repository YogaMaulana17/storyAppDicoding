import StoryDetailPresenter from "../../pages/story/story-detail-presenter";
import { initMap, getLocationName } from "../../utils/map";
import Database from "../../data/database";
import pushNotificationHelper from "../../utils/push-notification";

export default class StoryDetailPage {
  constructor() {
    this.presenter = new StoryDetailPresenter(this);
  }

  async render() {
    return `
      <section class="container">
        <h1>Story Detail</h1>
        <div id="story-detail">
          <!-- Story Detail akan ditampilkan di sini -->
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyId = window.location.hash.split("/")[2];
    if (storyId) {
      this.presenter.fetchDetail(storyId);
    }
  }

  async showStory(story) {
    const storyDetailElement = document.getElementById("story-detail");
    if (!story) {
      storyDetailElement.innerHTML = "<p>Story not found.</p>";
      return;
    }

    storyDetailElement.innerHTML = `
      <h2 class="mt-4">Story by ${story.name}</h2>
      <p>Story Description : ${story.description}</p>
      <img src="${story.photoUrl}" alt="Story Image" class="img-fluid">
      <h3 class="mt-4">Lokasi Story</h3>
      <div id="map" style="height: 300px;"></div>
      <button id="toggle-favorite" class="btn btn-primary mt-3">Cek...</button>
    `;

    await new Promise((resolve) => {
      const check = () => {
        if (document.getElementById("map")) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });

    const locationName = await getLocationName(story.lat, story.lon);
    // initMap({ lat: story.lat, lng: story.lon, popupText: locationName });
    //diganti ini
    const mapInstance = initMap({
      lat: story.lat,
      lng: story.lon,
      popupText: locationName,
    });

    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 200);

    const toggleButton = document.getElementById("toggle-favorite");
    const existing = await Database.getStory(story.id);

    const updateButtonState = (isFavorite) => {
      toggleButton.textContent = isFavorite
        ? "Hapus dari Favorit"
        : "Simpan ke Favorit";
      toggleButton.classList.toggle("btn-danger", isFavorite);
      toggleButton.classList.toggle("btn-primary", !isFavorite);
    };

    updateButtonState(!!existing);

    toggleButton.addEventListener("click", async () => {
      if (await Database.getStory(story.id)) {
        await Database.deleteStory(story.id);
        alert("Story dihapus dari favorit!");
        updateButtonState(false);
      } else {
        await this.saveToFavorites(story);
        updateButtonState(true);
      }
    });
  }

  async saveToFavorites(story) {
    await Database.putStory(story);
    alert("Story berhasil disimpan ke favorit!");

    const registration = await pushNotificationHelper.registerServiceWorker();
    if (registration) {
      registration.showNotification("Berhasil disimpan!", {
        body: `"${story.name}" telah ditambahkan ke favorit.`,
        icon: "../../images/logo.png",
      });
    }
  }
}
