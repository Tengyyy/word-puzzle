const { parentPort } = require("worker_threads");
const Puzzle = require("./GridGenerator");

parentPort.on("message", (data) => {
  try {
    const { words, options } = data;
    const puzzle = new Puzzle(words, options);
    const grid = puzzle.to2DArray();
    parentPort.postMessage({ success: true, grid, answers: puzzle.answers });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});
