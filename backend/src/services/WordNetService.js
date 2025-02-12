const { Worker } = require("worker_threads");
const path = require("path");

class WordNetService {
  constructor() {
    this.worker = new Worker(
      path.join(__dirname, "../workers/wordNetWorker.js")
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

  async getWordsByTopic(topic) {
    if (!this.ready) {
      throw new Error("WordNet not loaded yet");
    }

    return new Promise((resolve, reject) => {
      const onMessage = (msg) => {
        if (msg.type === "result") {
          resolve(msg.words);
          this.worker.off("message", onMessage);
        }
      };

      this.worker.on("message", onMessage);
      this.worker.postMessage({ type: "getWordsByTopic", topic });
    });
  }
}

module.exports = new WordNetService();
