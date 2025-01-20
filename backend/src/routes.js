const GameController = require("./controllers/GameController");

module.exports = (app) => {
  app.get("/api/game", GameController.createGame);

  app.get("/api/game/:gameId", GameController.loadGame);

  app.post("/api/createCustomGame", GameController.createCustomGame);

  app.post("/api/saveGame", GameController.saveGame);
};
