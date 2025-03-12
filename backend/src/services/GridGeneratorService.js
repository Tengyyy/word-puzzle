import { ServerException, TimeoutException } from "../controller/Exceptions";
import { Worker } from "worker_threads";
import { resolve as _resolve } from "path";

export class GridGeneratorService {
  static worker = null;

  static init() {
    this.worker = new Worker(_resolve(__dirname, "../workers/gridWorker.js"));
    this.worker.on("error", (err) => {
      console.error("GridGeneratorWorker Error:", err);
      throw new ServerException("Rägastiku genereerimine ebaõnnestus");
    });
  }

  static async generateGrid(words, options) {
    if (!this.worker) throw new Error("GridGeneratorWorker not initialized");

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

      this.worker.postMessage({ words, options });
    });
  }
}

// Initialize worker when the module is loaded
GridGeneratorService.init();
