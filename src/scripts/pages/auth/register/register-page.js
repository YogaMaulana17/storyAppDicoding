import RegisterPresenter from "./register-presenter";
import * as StoryAPI from "../../../data/api";

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="container d-flex align-items-center justify-content-center min-vh-100">
        <div class="card p-4 shadow animate-fade-in-up" style="max-width: 400px; width: 100%;">
          <h2 class="text-center mb-4">Daftar Akun</h2>
          <div id="register-alert"></div>

          <form id="register-form" novalidate>
            <div class="mb-3">
              <label for="name-input" class="form-label">Nama Lengkap</label>
              <input type="text" class="form-control" id="name-input" required placeholder="Masukkan nama lengkap Anda">
            </div>
            <div class="mb-3">
              <label for="email-input" class="form-label">Email</label>
              <input type="email" class="form-control" id="email-input" required placeholder="Contoh: nama@email.com">
            </div>
            <div class="mb-3">
              <label for="password-input" class="form-label">Password</label>
              <input type="password" class="form-control" id="password-input" required placeholder="Masukkan password baru">
            </div>
            <div class="d-grid mb-2" id="submit-button-container">
              <button class="btn btn-success" type="submit">Daftar Akun</button>
            </div>
            <p class="text-center">
              Sudah punya akun? <a href="#/login">Masuk</a>
            </p>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: StoryAPI,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("register-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("name-input").value;
        const email = document.getElementById("email-input").value;
        const password = document.getElementById("password-input").value;

        // Validasi kosong
        if (!name || !email || !password) {
          this.showAlert("Semua field wajib diisi.", "danger");
          return;
        }

        // Validasi email
        const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailPattern.test(email)) {
          this.showAlert("Format email tidak valid.", "danger");
          return;
        }

        // Validasi password minimal 8 karakter
        if (password.length < 8) {
          this.showAlert("Password minimal harus 8 karakter.", "danger");
          return;
        }

        this.clearAlert();

        const data = { name, email, password };
        await this.#presenter.getRegistered(data);
      });
  }

  registeredSuccessfully(message) {
    this.#showAlert("success", message);
    setTimeout(() => {
      location.hash = "/login";
    }, 1500);
  }

  registeredFailed(message) {
    this.#showAlert("danger", message);
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn btn-success" type="submit" disabled>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn btn-success" type="submit">Daftar Akun</button>
    `;
  }

  #showAlert(type, message) {
    document.getElementById("register-alert").innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }

  showAlert(message, type = "danger") {
    const alertContainer = document.getElementById("register-alert");

    if (!alertContainer) {
      console.warn("Elemen #register-alert belum tersedia di DOM.");
      return;
    }

    alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  }

  clearAlert() {
    const alertContainer = document.getElementById("register-alert");
    if (!alertContainer) return;
    alertContainer.innerHTML = "";
  }
}
