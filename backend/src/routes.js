const GameController = require("./controllers/GameController");

module.exports = (app) => {
  app.get("/api/game", GameController.createGame);

  app.get("/api/game/:gameId", GameController.loadGame);
};
