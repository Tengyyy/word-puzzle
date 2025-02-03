const GameController = require("./controllers/GameController");

module.exports = (app) => {
  app.get("/api/game", GameController.createGame);

  app.get("/api/game/:gameId", GameController.loadGame);

  app.post("/api/create-custom-game", GameController.createCustomGame);

  app.post("/api/persist-game", GameController.persistGame);

  app.post("/api/save-game", GameController.saveGame);
};
