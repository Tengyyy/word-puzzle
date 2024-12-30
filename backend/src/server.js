const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/config");

const app = express();
app.use(morgan("combined"));
app.use(cors());
app.use(express.json());

require("./routes")(app);

app.listen(config.port, config.host, () => {
  console.log(`Server running at http://${config.host}:${config.port}/`);
});

app.use((req, res) => {
  res.status(404).send("Resource not found.");
});
