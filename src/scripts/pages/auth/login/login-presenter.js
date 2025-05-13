export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      // Memanggil API login
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        console.error("getLogin: response:", response);
        this.#view.loginFailed(response.message);
        return;
      }

      // Simpan token akses setelah login berhasil
      this.#authModel.putAccessToken(response.data.token);

      // Tampilkan pesan sukses dan arahkan ke halaman utama
      this.#view.loginSuccessfully(response.message);
    } catch (error) {
      console.error("getLogin: error:", error);
      this.#view.loginFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
