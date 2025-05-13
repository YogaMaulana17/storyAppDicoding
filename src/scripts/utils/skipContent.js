export function scrollToMainContent(event) {
  event.preventDefault();
  const target = document.getElementById("main-content");
  if (target) {
    target.setAttribute("tabindex", "-1");
    target.focus();
    target.scrollIntoView({ behavior: "smooth" });
  }
}
