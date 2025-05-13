import StoryPresenter from "./story-presenter";
import {
  initCamera,
  capturePhoto,
  stopCamera,
  switchCamera,
} from "../../utils/camera";
import { initMap, getUserLocation } from "../../utils/map";

class StoryPage {
  #presenter;
  #videoElement = null;
  #capturedPhoto = null;
  #currentFacingMode = "environment";
  #isCameraActive = false;
  #latitude = null;
  #longitude = null;

  constructor() {
    this.#presenter = new StoryPresenter({ view: this });
  }

  render() {
    return `
    <section class="container">
      <h2>Upload Cerita</h2>
      <form id="story-form" class="story-form" style="margin-top: 1em;">
        <div class="form-group mb-3">
          <label class="form-label">Ambil Foto dari Kamera</label>
          <div class="mb-2">
            <video id="camera-stream" autoplay playsinline style="width: 100%; max-height: 300px; background: #000;"></video>
          </div>
          <div class="d-flex gap-2 mb-2">
            <button type="button" id="toggle-camera" class="btn btn-primary">Buka Kamera</button>
            <button type="button" id="switch-camera" class="btn btn-secondary">Ganti Kamera</button>
            <button type="button" id="capture-photo" class="btn btn-warning">Ambil Foto</button>
          </div>
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Lokasi Anda Sekarang</label>
          <div id="map" style="height: 300px; background: #eee;"></div>
        </div>

        <div class="form-group mb-3">
          <label for="photo" class="form-label">Atau Pilih File Foto</label>
          <input type="file" id="photo" class="form-control" accept="image/*" />
        </div>
        
        <div class= "d-flex gap-2 mb-2">
          <div class="form-group mb-3 flex-fill">
            <label for="latitude" class="form-label">Latitude</label>
            <input type="text" id="latitude" class="form-control" readonly />
          </div>

          <div class="form-group mb-3 flex-fill">
            <label for="longitude" class="form-label">Longitude</label>
            <input type="text" id="longitude" class="form-control" readonly />
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="description" class="form-label">Deskripsi Cerita</label>
          <textarea id="description" class="form-control" rows="3" required></textarea>
        </div>

        <div id="preview-photo" class="mb-3"></div>

        <button type="submit" class="btn btn-success">Upload</button>
      </form>

      <div id="upload-message" class="mt-3"></div>
    </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector("#story-form");
    const toggleCameraButton = document.querySelector("#toggle-camera");
    const switchCameraButton = document.querySelector("#switch-camera");
    const capturePhotoButton = document.querySelector("#capture-photo");
    this.#videoElement = document.querySelector("#camera-stream");
    const previewDiv = document.querySelector("#preview-photo");
    const latInput = document.querySelector("#latitude");
    const lonInput = document.querySelector("#longitude");

    const map = initMap({ id: "map" });
    const position = await getUserLocation(map);
    if (position) {
      this.#latitude = position.latitude;
      this.#longitude = position.longitude;
      latInput.value = this.#latitude;
      lonInput.value = this.#longitude;
    }
    let selectedMarker = null;
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;

      this.#latitude = lat;
      this.#longitude = lng;

      latInput.value = lat;
      lonInput.value = lng;

      // Hapus marker sebelumnya jika ada
      if (selectedMarker) {
        map.removeLayer(selectedMarker);
      }

      // Tambahkan marker baru
      selectedMarker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup("Lokasi dipilih")
        .openPopup();
    });
    this.#capturedPhoto = null;
    this.#isCameraActive = false;

    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      tempStream.getTracks().forEach((track) => track.stop());
      console.log("Izin kamera diminta di awal");
    } catch (error) {
      console.warn("Izin kamera tidak diberikan:", error);
    }

    toggleCameraButton.addEventListener("click", async () => {
      if (this.#isCameraActive) {
        this.#stopCamera();
        this.#isCameraActive = false;
        toggleCameraButton.textContent = "Buka Kamera";
      } else {
        await initCamera(this.#videoElement, this.#currentFacingMode);
        this.#isCameraActive = true;
        toggleCameraButton.textContent = "Tutup Kamera";
      }
    });

    switchCameraButton.addEventListener("click", async () => {
      if (!this.#isCameraActive) {
        this.showFeedback("Kamera belum aktif.", "warning");
        return;
      }
      const { facingMode } = await switchCamera(
        this.#videoElement,
        this.#currentFacingMode
      );
      this.#currentFacingMode = facingMode;
    });

    capturePhotoButton.addEventListener("click", async () => {
      if (!this.#isCameraActive) {
        this.showFeedback("Kamera belum aktif.", "warning");
        return;
      }
      this.#capturedPhoto = await capturePhoto(this.#videoElement);

      const imgURL = URL.createObjectURL(this.#capturedPhoto);
      previewDiv.innerHTML = `<img src="${imgURL}" alt="Preview Foto" class="img-fluid rounded"/>`;

      // this.#stopCamera();
      // this.#isCameraActive = false;
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const description = document.querySelector("#description").value;
      const fileInput = document.querySelector("#photo");

      let photo = null;

      if (this.#capturedPhoto) {
        photo = this.#capturedPhoto;
      } else if (fileInput.files.length > 0) {
        photo = fileInput.files[0];
      } else {
        this.showFeedback("Silakan ambil atau pilih foto dulu.", "warning");
        return;
      }

      this.#presenter.uploadStory({
        description,
        photo,
        latitude: this.#latitude,
        longitude: this.#longitude,
      });
    });
  }

  destroy() {
    if (this.#isCameraActive) {
      this.#stopCamera();
    }
  }

  #stopCamera() {
    stopCamera();
    if (this.#videoElement) {
      this.#videoElement.srcObject = null;
    }
  }

  resetCameraPreview() {
    this.#capturedPhoto = null;
    this.#stopCamera();
  }

  showFeedback(message, type = "info") {
    const messageDiv = document.querySelector("#upload-message");
    messageDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  }
}

export default StoryPage;
