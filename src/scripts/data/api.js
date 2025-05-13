import CONFIG from "../config";
import { getAccessToken } from "../utils/auth";

const API_URL = CONFIG.BASE_URL;

// login
export async function getLogin({ email, password }) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      message: result.message || "Login gagal",
    };
  }

  return {
    ok: true,
    message: result.message,
    data: {
      token: result.loginResult.token,
      userId: result.loginResult.userId,
      name: result.loginResult.name,
    },
  };
}

// register
export async function register({ name, email, password }) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      message: result.message || "Register gagal",
    };
  }

  return {
    ok: true,
    message: result.message,
  };
}

// addstory
export async function addStory({ description, photo, lat, lon, token }) {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  if (lat) formData.append("lat", lat);
  if (lon) formData.append("lon", lon);

  const response = await fetch(`${API_URL}/stories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      message: result.message || "Failed to add story",
    };
  }

  return {
    ok: true,
    message: result.message,
  };
}

// getstory
export async function getAllStories(token) {
  const response = await fetch(`${API_URL}/stories`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      message: result.message || "Failed to fetch stories",
    };
  }

  return {
    ok: true,
    message: result.message,
    stories: result.listStory,
  };
}

// detail story berdasarkan ID
export async function getStoryDetail(id) {
  const response = await fetch(`${API_URL}/stories/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      message: result.message || "Failed to fetch story detail",
    };
  }

  return {
    ok: true,
    message: result.message,
    story: result.story,
  };
}

// Subscribe
export async function subscribePushNotification({
  endpoint,
  keys: { p256dh, auth },
}) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const response = await fetch(`${API_URL}/notifications/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });

  const result = await response.json();

  return {
    ok: response.ok,
    message: result.message,
  };
}

// Unsubscribe
export async function unsubscribePushNotification(endpoint) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ endpoint });

  const response = await fetch(`${API_URL}/notifications/subscribe`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });

  const result = await response.json();

  return {
    ok: response.ok,
    message: result.message,
  };
}
