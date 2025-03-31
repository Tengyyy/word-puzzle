import {
  createGame,
  loadGame,
  createCustomGame,
  persistGame,
  saveGame,
  autocomplete,
} from "./controller/Controller.js";

import {ENDPOINTS} from "../../shared/ApiEndpoints.js";

export default (app) => {
  //GET
  app.get(ENDPOINTS.getGame.relative, createGame);
  app.get(`${ENDPOINTS.getGame.relative}/:gameId`, loadGame);
  app.get(ENDPOINTS.autocomplete.relative, autocomplete);

  //POST
  app.post(ENDPOINTS.createCustomGame.relative, createCustomGame);
  app.post(ENDPOINTS.persistGame.relative, persistGame);
  app.post(ENDPOINTS.saveGame.relative, saveGame);
};
