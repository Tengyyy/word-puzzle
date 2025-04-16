import {Worker} from "worker_threads";
import {join} from "path";
import path from "path";
import {ServerException, TimeoutException} from "../controller/Exceptions.js";
import {fileURLToPath} from "url";
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger.js';
import {getMessage} from "./LocalizationService.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class WordNetService {
  static worker = null;
  static ready = false;
  static queue = [];
  static activeTasks = [];
  static maxQueueSize = 100;

  static init() {

    if (this.worker) {
      logger.info('Worker already initialized');
      return;
    }

    this.worker = new Worker(join(__dirname, "../workers/wordNetWorker.js"));
    this.ready = false;

    this.worker.on("error", (err) => {
      logger.error("WordNetWorker error:", err);
      this.activeTasks.forEach(task => {
        clearTimeout(task.timeout);
        task.reject(new ServerException( getMessage('genericError', task.clientLanguage) ));
      });
      this.activeTasks = [];
    });

    this.worker.on("message", (msg) => {
      if (msg.status === "ready") {
        this.ready = true;
        logger.info("WordNet loaded in worker!");
        return;
      }

      const task = this.activeTasks.find(t => t.id === msg.id);
      if (task) {
        clearTimeout(task.timeout);
        if (msg.type === "getWordsResult") {
          if (msg.result && msg.result.length > 0) {
            task.resolve(msg.result);
          } else {
            task.reject(new ServerException( getMessage('wordListGenerationFailed', task.clientLanguage, task.topic) ));
          }
        } else if (msg.type === "autocompleteResult") {
          task.resolve(msg.result);
        }

        this.activeTasks = this.activeTasks.filter(activeTask => activeTask.id !== task.id);
      }
    });

    this.worker.postMessage({ type: "load" });
  }

  static shutdown() {
    if (this.worker) {
      this.worker.terminate()
        .then(() => {
          logger.info("Wordnet worker terminated successfully.");
        })
        .catch(err => {
          logger.error("Error terminating wordnet worker:", err);
        });
    }

    // Clean up remaining tasks in the queue and active tasks
    this.queue.forEach(task => task.reject(new ServerException( getMessage('serverClosing', task.clientLanguage) )));
    this.activeTasks.forEach(task => task.reject(new ServerException( getMessage('serverClosing', task.clientLanguage) )));

    this.queue = [];
    this.activeTasks = [];
  }

  static async getWords(
    topic,
    inputLanguage,
    outputLanguage,
    mode,
    width,
    height,
    nonAlphaAllowed,
    clientLanguage,
  ) {
    if (!this.ready) {
      throw new ServerException( getMessage('wordNetNotInitialized', clientLanguage) );
    }

    if (this.queue.length >= this.maxQueueSize || this.activeTasks.length > this.maxQueueSize) {
      throw new ServerException( getMessage('serverBusy', clientLanguage) );
    }

    const taskId = uuidv4(); // Generate unique task ID
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new TimeoutException( getMessage('wordListGenerationTimeout', clientLanguage) ));
      }, 30_000); // 30 seconds timeout

      this.queue.push({ id: taskId, type: 'getWords', topic, inputLanguage, outputLanguage, mode, width, height, nonAlphaAllowed, clientLanguage, resolve, reject, timeout });
      this.#processQueue();
    });
  }

  static async autocomplete(query, language, clientLanguage) {
    if (!this.ready) {
      throw new ServerException( getMessage('wordNetNotInitialized', clientLanguage) );
    }

    if (this.queue.length >= this.maxQueueSize || this.activeTasks.length >= this.maxQueueSize) {
      throw new ServerException( getMessage('serverBusy', clientLanguage) );
    }

    const taskId = uuidv4(); // Generate unique task ID
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new TimeoutException( getMessage('autoCompleteTimeout', clientLanguage, query) ));
      }, 30_000); // 30 seconds timeout

      this.queue.push({ id: taskId, type: 'autocomplete', query, language, clientLanguage, resolve, reject, timeout });
      this.#processQueue();
    });
  }

  static #processQueue() {
    if (this.queue.length > 0) {
      const task = this.queue.shift();
      this.activeTasks.push(task);

      this.#runWorker(task);
      this.#processQueue(); // recursively process queue again
    }
  }

  static #runWorker(task) {
    if (task.type === "getWords") {
      this.worker.postMessage({
        id: task.id,
        type: task.type,
        topic: task.topic,
        inputLanguage: task.inputLanguage,
        outputLanguage: task.outputLanguage,
        mode: task.mode,
        width: task.width,
        height: task.height,
        nonAlphaAllowed: task.nonAlphaAllowed,
      });
    } else if (task.type === "autocomplete") {
      this.worker.postMessage({
        id: task.id,
        type: task.type,
        query: task.query,
        language: task.language,
      });
    }
  }
}

WordNetService.init();
