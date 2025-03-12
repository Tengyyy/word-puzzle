import {
  createGame,
  loadGame,
  createWordList,
  createCustomGame,
  persistGame,
  saveGame,
} from "./controller/Controller";

export default (app) => {
  //GET
  app.get("/api/game", createGame);
  app.get("/api/game/:gameId", loadGame);

  //POST
  app.post("/api/create-word-list", createWordList);
  app.post("/api/create-custom-game", createCustomGame);
  app.post("/api/persist-game", persistGame);
  app.post("/api/save-game", saveGame);
};
