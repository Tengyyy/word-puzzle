const GameController = require("./controllers/GameController");

module.exports = (app) => {
  app.get("/random-game", GameController.randomGame);
};
