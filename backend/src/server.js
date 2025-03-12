import express, { json, urlencoded } from "express";
import cors from "cors";
import morgan from "morgan";
import { port, host } from "./config/config";
import { ready } from "./services/WordNetService";
import { path } from "path";

const app = express();
app.use(morgan("combined"));
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

require("./routes")(app);

async function startServer() {
  console.log("Waiting for WordNet to load...");
  while (!ready) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
  });
}

startServer();
