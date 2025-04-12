
// Determine BASE_URL based on environment
let BASE_URL;

// If running in Node (backend)
if (typeof process !== "undefined" && process.env && process.env.BASE_URL) {
  BASE_URL = process.env.BASE_URL;
}
// If running in browser (frontend with Vite)
else if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BASE_URL) {
  BASE_URL = import.meta.env.VITE_BASE_URL;
}
// Fallback default
else {
  BASE_URL = "http://127.0.0.1:8081";
}

const API_PATH = "/api";

export const ENDPOINTS = Object.freeze({
  createCustomGame: {
    full: `${BASE_URL}${API_PATH}/create-custom-game`,
    relative: `${API_PATH}/create-custom-game`,
  },
  persistGame: {
    full: `${BASE_URL}${API_PATH}/persist-game`,
    relative: `${API_PATH}/persist-game`,
  },
  saveGame: {
    full: `${BASE_URL}${API_PATH}/save-game`,
    relative: `${API_PATH}/save-game`,
  },
  getGame: {
    full: `${BASE_URL}${API_PATH}/get-game`,
    relative: `${API_PATH}/get-game`,
  },
  autocomplete: {
    full: `${BASE_URL}${API_PATH}/autocomplete`,
    relative: `${API_PATH}/autocomplete`,
  },
  home: {
    full: `${BASE_URL}/`,
    relative: "/",
  },
  game: {
    full: `${BASE_URL}/game`,
    relative: "/game",
  },
  printer: {
    full: `${BASE_URL}/print`,
    relative: "/print",
  },
  creator: {
    full: `${BASE_URL}/create`,
    relative: "/create",
  },
  notFound: {
    full: `${BASE_URL}/not-found`,
    relative: "/not-found",
  }
});
