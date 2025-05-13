import CONFIG from "../config";

function putAccessToken(token) {
  localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
}

function getAccessToken() {
  return localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
}

function removeAccessToken() {
  localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
}

export { putAccessToken, getAccessToken, removeAccessToken };
