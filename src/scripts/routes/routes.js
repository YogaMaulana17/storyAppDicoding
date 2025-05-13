import HomePage from "../pages/home/home-page";
import HomePresenter from "../pages/home/home-presenter";

import LoginPage from "../pages/auth/login/login-page";
import RegisterPage from "../pages/auth/register/register-page";
import UploadPage from "../pages/story/story-page";
import StoryDetailPage from "../pages/story/story-detail-page";
import FavoritePage from "../pages/favorites/favorite-page";
import FavoritePresenter from "../pages/favorites/favorite-presenter";
import NotFoundPage from "../pages/not-found/not-found-page";

const favoritePage = new FavoritePage();
favoritePage.setPresenter(new FavoritePresenter(favoritePage));

const homePage = new HomePage();
new HomePresenter(homePage);

const routes = {
  "/": homePage,
  "/favorite": new FavoritePage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/upload": new UploadPage(),
  "/story/:id": new StoryDetailPage(),
};

export default routes;
export { NotFoundPage };
