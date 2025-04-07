import express, {json, urlencoded} from "express";
import cors from "cors";
import morgan from "morgan";
import {port, host} from "./config/config.js";
import WordNetService from "./services/WordNetService.js";
import path from "path";
import {fileURLToPath} from "url";
import routes from "./routes.js";
import GridGeneratorService from "./services/GridGeneratorService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(morgan("combined"));
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// API routes
routes(app);

const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// Catch-all route to serve Vue frontend (must be **after** API routes)
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Graceful shutdown method
function shutdown() {

  console.log("Shutting down server...");

  WordNetService.shutdown();
  GridGeneratorService.shutdown();

  setTimeout(() => {
    console.log("Server shutdown complete.");
    process.exit(0);
  }, 1000); // Wait for 1 second before exiting (adjust if needed)
}

process.on("SIGINT", shutdown);  // For Ctrl+C termination
process.on("SIGTERM", shutdown); // For other termination signals


async function startServer() {
  console.log("Waiting for WordNet to load...");
  while (!WordNetService.ready) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
  });
}

startServer();