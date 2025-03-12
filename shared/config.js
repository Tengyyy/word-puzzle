const BASE_URL = 'http://127.0.0.1:8081'
const API_BASE_URL = BASE_URL + '/api'
export const ENDPOINTS = {
  createWordList: `${API_BASE_URL}/create-word-list`,
  createCustomGame: `${API_BASE_URL}/create-custom-game`,
  persistGame: `${API_BASE_URL}/persist-game`,
  saveGame: `${API_BASE_URL}/save-game`,
  getGame: `${API_BASE_URL}/get-game`,
  home: `${BASE_URL}/`,
  game: `${BASE_URL}/game`,
  printer: `${BASE_URL}/print`,
  creator: `${BASE_URL}/create`,
}
