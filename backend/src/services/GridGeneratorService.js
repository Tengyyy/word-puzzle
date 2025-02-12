const { Worker } = require("worker_threads");
const path = require("path");

class GridGeneratorService {
  static worker = null;

  static init() {
    this.worker = new Worker(
      path.resolve(__dirname, "../workers/gridWorker.js")
    );
    this.worker.on("error", (err) => {
      console.error("GridGeneratorWorker Error:", err);
    });
  }

  static async generateGrid(words, options) {
    if (!this.worker) throw new Error("GridGeneratorWorker not initialized");

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Grid generation timed out after 5 seconds"));
      }, 5000); // 5 seconds timeout

      this.worker.once("message", (msg) => {
        clearTimeout(timeout); // Clear timeout if worker responds in time

        if (msg.status === "success") {
          resolve(msg.data);
        } else {
          reject(new Error(msg.message || "Grid generation failed"));
        }
      });

      this.worker.postMessage({ words, options });
    });
  }
}

// Initialize worker when the module is loaded
GridGeneratorService.init();

module.exports = GridGeneratorService;
