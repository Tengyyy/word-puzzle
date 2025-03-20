import {Worker} from "worker_threads";
import {join} from "path";
import path from "path";
import {ServerException, TimeoutException} from "../controller/Exceptions.js";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class WordNetService {
  static worker = null;
  static ready = false;

  static init() {
    this.worker = new Worker(join(__dirname, "../workers/wordNetWorker.js"));
    this.ready = false;

    this.worker.on("message", (msg) => {
      if (msg.status === "ready") {
        this.ready = true;
        console.log("WordNet loaded in worker!");
      }
    });

    this.worker.postMessage({ type: "load" });
  }

  static async getWords(
    topic,
    inputLanguage,
    outputLanguage,
    mode,
    width,
    height,
    spacesAllowed
  ) {
    if (!this.ready) {
      throw new ServerException("WordNet pole veel laetud");
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new TimeoutException(
            "Sõnade nimekirja loomine aegus peale 5 sekundit"
          )
        );
      }, 5000); // 5 seconds timeout

      const onMessage = (msg) => {
        if (msg.type === "result") {
          resolve(msg.result);
          this.worker.off("message", onMessage);
        }
      };

      this.worker.once("message", (msg) => {
        clearTimeout(timeout); // Clear timeout if worker responds in time

        if (msg.type === "result") {
          if (msg.result.inputs && msg.result.inputs.length > 0)
            resolve(msg.result);
          else
            reject(
              new ServerException(
                `Sõnade nimekirja loomine sisendsõna ${topic} põhjal ebaõnnestus`
              )
            );
        }
      });

      this.worker.postMessage({
        type: "getWords",
        topic: topic,
        inputLanguage: inputLanguage,
        outputLanguage: outputLanguage,
        mode: mode,
        width: width,
        height: height,
        spacesAllowed: spacesAllowed,
      });
    });
  }
}

// Initialize worker when the module is loaded
WordNetService.init();
