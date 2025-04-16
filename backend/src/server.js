import path from "path";
import {fileURLToPath} from "url";
import express, {json, urlencoded} from "express";
import cors from "cors";
import morgan from "morgan";
import WordNetService from "./services/WordNetService.js";
import routes from "./routes.js";
import GridGeneratorService from "./services/GridGeneratorService.js";
import logger from './logger.js';
import {detectLanguage} from "./middleware/language.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(morgan("combined"));
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(detectLanguage)

// API routes
routes(app);

const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// Catch-all route to serve Vue frontend (must be after API routes)
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Graceful shutdown method
function shutdown() {

  logger.info("Shutting down server...");

  WordNetService.shutdown();
  GridGeneratorService.shutdown();

  setTimeout(() => {
    logger.info("Server shutdown complete.");
    process.exit(0);
  }, 1000); // Wait for 1 second before exiting
}

process.on("SIGINT", shutdown);  // For Ctrl+C termination
process.on("SIGTERM", shutdown); // For other termination signals


async function startServer() {
  logger.info("Waiting for WordNet to load...");
  while (!WordNetService.ready) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  app.listen(process.env.PORT, () => {
    logger.info(`Server running on port ${process.env.PORT}`);
  });
}

startServer();
