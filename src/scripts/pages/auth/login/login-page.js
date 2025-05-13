import LoginPresenter from "./login-presenter";
import * as StoryAPI from "../../../data/api";
import * as AuthModel from "../../../utils/auth";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="container d-flex align-items-center justify-content-center min-vh-100">
        <div class="card p-4 shadow animate-fade-in-up" style="max-width: 400px; width: 100%;">
          <h2 class="text-center mb-4">Masuk Akun</h2>
          <div id="login-alert"></div>

          <form id="login-form" novalidate>
            <div class="mb-3">
              <label for="email-input" class="form-label">Email</label>
              <input type="email" class="form-control" id="email-input" required placeholder="Contoh: nama@email.com">
            </div>
            <div class="mb-3">
              <label for="password-input" class="form-label">Password</label>
              <input type="password" class="form-control" id="password-input" required placeholder="Masukkan password Anda">
            </div>
            <div class="d-grid mb-2" id="submit-button-container">
              <button class="btn btn-primary" type="submit">Masuk</button>
            </div>
            <p class="text-center">
              Belum punya akun? <a href="#/register">Daftar</a>
            </p>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: StoryAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("login-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
          email: document.getElementById("email-input").value,
          password: document.getElementById("password-input").value,
        };
        await this.#presenter.getLogin(data);
      });
  }

  loginSuccessfully(message) {
    this.#showAlert("success", message);
    setTimeout(() => {
      location.hash = "/";
    }, 1500);
  }

  loginFailed(message) {
    this.#showAlert("danger", message);
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn btn-primary" type="submit" disabled>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn btn-primary" type="submit">Masuk</button>
    `;
  }

  #showAlert(type, message) {
    document.getElementById("login-alert").innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }
}
