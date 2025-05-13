import { getStoryDetail } from "../../data/api";

class StoryDetailPresenter {
  constructor(view) {
    this.view = view;
  }

  async fetchDetail(id) {
    try {
      const { ok, story, message } = await getStoryDetail(id);
      if (ok) {
        this.view.showStory(story);
      } else {
        alert(message || "Gagal mengambil detail cerita.");
      }
    } catch (error) {
      console.error("Error fetching story detail:", error);
    }
  }
}

export default StoryDetailPresenter;
