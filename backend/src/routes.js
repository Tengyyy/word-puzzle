const GameController = require("./controllers/GameController");

module.exports = (app) => {
  //GET
  app.get("/api/game", GameController.createGame);
  app.get("/api/game/:gameId", GameController.loadGame);

  //POST
  app.post("/api/create-word-list", GameController.createWordList);
  app.post("/api/create-custom-game", GameController.createCustomGame);
  app.post("/api/persist-game", GameController.persistGame);
  app.post("/api/save-game", GameController.saveGame);
};
