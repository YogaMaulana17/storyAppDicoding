import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { getAccessToken, removeAccessToken } from "../utils/auth";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  async renderPage() {
    const rawUrl = getActiveRoute();
    const url = rawUrl.replace("#", "");
    const page = routes[url];

    const hideNavbarRoutes = ["/login", "/register"];
    const navbar = document.getElementById("navigation-drawer");

    if (navbar) {
      if (hideNavbarRoutes.includes(url)) {
        navbar.classList.add("d-none");
      } else {
        navbar.classList.remove("d-none");
      }
    }

    if (this.#currentPage && typeof this.#currentPage.destroy === "function") {
      this.#currentPage.destroy();
    }

    const doRender = async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this._updateNavigationMenu();

      this.#currentPage = page;
    };

    if (document.startViewTransition) {
      // ViewTransition
      document.startViewTransition(doRender);
    } else {
      // Fallback ke animasi manual jika tidak didukung browser
      this.#content.classList.add("fade-out");
      await new Promise((resolve) => {
        this.#content.addEventListener("animationend", resolve, { once: true });
      });
      await doRender();
      this.#content.classList.remove("fade-out");
      this.#content.classList.add("fade-in");
      setTimeout(() => {
        this.#content.classList.remove("fade-in");
      }, 500);
    }
  }

  _updateNavigationMenu() {
    const token = getAccessToken();

    const navLogin = document.getElementById("nav-login");
    const navRegister = document.getElementById("nav-register");
    const navLogout = document.getElementById("nav-logout");

    if (token) {
      // Sudah login: sembunyikan login & register, tampilkan logout
      navLogin.style.display = "none";
      navRegister.style.display = "none";
      navLogout.style.display = "inline-block";
    } else {
      // Belum login: tampilkan login & register, sembunyikan logout
      navLogin.style.display = "inline-block";
      navRegister.style.display = "inline-block";
      navLogout.style.display = "none";
    }

    // Tombol logout handler
    if (navLogout) {
      navLogout.addEventListener("click", (event) => {
        event.preventDefault();
        removeAccessToken();
        window.location.hash = "/login";
        this._updateNavigationMenu(); // update tampilan ulang
      });
    }
  }
}

export default App;
