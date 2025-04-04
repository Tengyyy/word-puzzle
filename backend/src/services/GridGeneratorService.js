import {ServerException, TimeoutException} from "../controller/Exceptions.js";
import {Worker} from "worker_threads";
import {resolve as _resolve} from "path";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class GridGeneratorService {
  static worker = null;

  static init() {
    this.worker = new Worker(_resolve(__dirname, "../workers/gridWorker.js"));
    this.worker.on("error", (err) => {
      console.error("GridGeneratorWorker Error:", err);
      throw new ServerException("Sõnarägastiku genereerimine ebaõnnestus");
    });
  }

  static async generateGrid(customWords, words, options) {
    if (!this.worker)
      throw new Error("Sõnarägastike generaator pole veel initsialiseeritud");

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new TimeoutException(
            "Sõnarägastiku genereerimine aegus peale 5 sekundit"
          )
        );
      }, 5000); // 5 seconds timeout

      this.worker.once("message", (msg) => {
        clearTimeout(timeout); // Clear timeout if worker responds in time

        if (msg.status === "success") {
          resolve(msg.data);
        } else {
          reject(
            new ServerException(
              "Sõnarägastiku genereerimine ebaõnnestus: " + msg.message
            )
          );
        }
      });

      this.worker.postMessage({ customWords, words, options });
    });
  }
}

// Initialize worker when the module is loaded
GridGeneratorService.init();
