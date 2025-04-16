import { ServerException, TimeoutException } from "../controller/Exceptions.js";
import { Worker } from "worker_threads";
import { resolve as _resolve } from "path";
import path from "path";
import { fileURLToPath } from "url";
import logger from '../logger.js';
import {getMessage} from "./LocalizationService.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gridWorkerPath = _resolve(__dirname, "../workers/gridWorker.js");

export default class GridGeneratorService {
  static maxQueueSize = 100;
  static activeTasks = 0;
  static maxParallelWorkers = 4;
  static queue = [];
  static workers = [];

  static async generateGrid(customWords, words, options, clientLanguage) {
    if (this.queue.length >= this.maxQueueSize) {
      throw new ServerException( getMessage('serverBusy', clientLanguage) );
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ customWords, words, options, clientLanguage, resolve, reject });
      this.#processQueue();
    });
  }

  static #processQueue() {
    while (this.activeTasks < this.maxParallelWorkers && this.queue.length > 0) {
      const task = this.queue.shift();
      this.#runWorker(task.customWords, task.words, task.options, task.clientLanguage)
        .then(task.resolve)
        .catch(task.reject)
        .finally(() => {
          this.activeTasks--;
          this.#processQueue();
        });

      this.activeTasks++;
    }
  }

  static #runWorker(customWords, words, options, clientLanguage) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(gridWorkerPath);

      this.workers.push(worker);

      const timeout = setTimeout(() => {
        worker.terminate();
        this.workers = this.workers.filter(w => w !== worker);
        reject(new TimeoutException(getMessage('gridGenerationTimeout', clientLanguage)));
      }, 10_000);

      worker.once("message", (msg) => {
        clearTimeout(timeout);
        worker.terminate();
        this.workers = this.workers.filter(w => w !== worker);
        if (msg.status === "success") {
          resolve(msg.data);
        } else {
          reject(new ServerException( getMessage('gridGenerationFailure', clientLanguage, msg.message) ));
        }
      });

      worker.once("error", (err) => {
        clearTimeout(timeout);
        worker.terminate();
        this.workers = this.workers.filter(w => w !== worker);
        logger.error("GridWorker error:", err);
        reject(new ServerException( getMessage('gridGenerationFailure', clientLanguage) ));
      });

      worker.postMessage({ customWords, words, options, clientLanguage });
    });
  }

  static shutdown() {
    logger.info("GridGeneratorService: Shutting down workers...");

    // Terminate all active workers
    this.workers.forEach(worker => worker.terminate());

    // Reject any pending tasks in the queue
    this.queue.forEach(task => task.reject(new ServerException( getMessage('serverClosing', task.clientLanguage) )));

    this.queue = [];
    this.activeTasks = 0;

    this.workers = [];
  }
}