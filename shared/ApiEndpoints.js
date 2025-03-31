const BASE_URL = "http://127.0.0.1:8081";
const API_PATH = "/api";
const FRONTEND_URL = "http://localhost:5173";

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
    full: `${FRONTEND_URL}/`,
    relative: "/",
  },
  game: {
    full: `${FRONTEND_URL}/game`,
    relative: "/game",
  },
  printer: {
    full: `${FRONTEND_URL}/print`,
    relative: "/print",
  },
  creator: {
    full: `${FRONTEND_URL}/create`,
    relative: "/create",
  },
  notFound: {
    full: `${FRONTEND_URL}/not-found`,
    relative: "/not-found",
  }
});
