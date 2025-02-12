const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

let wordNet = new Map();
let synsets = {};

// Function to load and process WordNet
async function loadWordNet() {
  const filePath = path.join(__dirname, "../data/est-wn.xml");
  const xmlData = fs.readFileSync(filePath, "utf8");

  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlData);

  const lexicon = result.LexicalResource.Lexicon[0];

  // Store synsets
  lexicon.Synset.forEach((synset) => {
    synsets[synset.$.id] = synset;
  });

  // Store words and relationships
  lexicon.LexicalEntry.forEach((entry) => {
    const lemma = entry.Lemma[0].$.writtenForm.toLowerCase();
    const synsetId = entry.Sense[0].$.synset;

    if (!wordNet.has(lemma)) {
      wordNet.set(lemma, {
        synonyms: new Set(),
        hypernyms: new Set(),
        hyponyms: new Set(),
      });
    }

    const synset = synsets[synsetId];
    synset.LexicalEntry?.forEach((synEntry) => {
      const synLemma = synEntry.Lemma[0].$.writtenForm.toLowerCase();
      if (synLemma !== lemma) {
        wordNet.get(lemma).synonyms.add(synLemma);
      }
    });
  });

  parentPort.postMessage({ status: "ready" });
}

parentPort.on("message", (message) => {
  if (message.type === "load") {
    loadWordNet();
  } else if (message.type === "getWordsByTopic") {
    const topic = message.topic.toLowerCase();
    const words = wordNet.has(topic)
      ? Array.from(wordNet.get(topic).synonyms)
      : [];
    parentPort.postMessage({ type: "result", words });
  }
});
