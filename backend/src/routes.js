import {
  createGame,
  loadGame,
  createWordList,
  createCustomGame,
  persistGame,
  saveGame,
} from "./controller/Controller.js";

import { ENDPOINTS } from "../../shared/ApiEndpoints.js";

export default (app) => {
  //GET
  app.get(ENDPOINTS.getGame.relative, createGame);
  app.get(`${ENDPOINTS.getGame.relative}/:gameId`, loadGame);

  //POST
  app.post(ENDPOINTS.createWordList.relative, createWordList);
  app.post(ENDPOINTS.createCustomGame.relative, createCustomGame);
  app.post(ENDPOINTS.persistGame.relative, persistGame);
  app.post(ENDPOINTS.saveGame.relative, saveGame);
};
