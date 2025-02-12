const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/config");
const WordNetService = require("./services/WordNetService");

const app = express();
app.use(morgan("combined"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require("./routes")(app);

async function startServer() {
  console.log("Waiting for WordNet to load...");
  while (!WordNetService.ready) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  app.listen(config.port, config.host, () => {
    console.log(`Server running at http://${config.host}:${config.port}/`);
  });
}

startServer();
