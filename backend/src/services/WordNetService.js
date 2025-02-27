const { Worker } = require("worker_threads");
const path = require("path");

class WordNetService {
  constructor() {
    this.worker = new Worker(
      path.join(__dirname, "../workers/wordNetWorker.js"),
      { execArgv: ["--inspect"] }
    );
    this.ready = false;

    this.worker.on("message", (msg) => {
      if (msg.status === "ready") {
        this.ready = true;
        console.log("WordNet loaded in worker!");
      }
    });

    this.worker.postMessage({ type: "load" });
  }

  async getWords(
    topic,
    inputLanguage,
    outputLanguage,
    mode,
    width,
    height,
    spacesAllowed
  ) {
    if (!this.ready) {
      throw new Error("WordNet not loaded yet");
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Wordlist generation timed out after 5 seconds"));
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
              new Error(
                "Failed to generate a list of related words for topic " + topic
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

module.exports = new WordNetService();
