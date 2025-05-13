export default class NotFoundPage {
  async render() {
    return `
        <section class="container text-center mt-5">
          <h1 class="display-4">404</h1>
          <p class="lead">Halaman tidak ditemukan</p>
          <img src="https://media.giphy.com/media/14uQ3cOFteDaU/giphy.gif" 
               alt="Not Found GIF" 
               class="img-fluid mt-4"
               style="max-width: 300px;">
          <br>
          <a href="#/" class="btn btn-primary mt-4">Kembali ke Beranda</a>
        </section>
      `;
  }

  async afterRender() {}
}
