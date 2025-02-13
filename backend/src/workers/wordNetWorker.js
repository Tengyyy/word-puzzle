const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const lemmaToSynsets = new Map(); // lemma -> [synset IDs]
const synsetToLemmas = new Map(); // synset ID -> [lemmas]
const synsetRelations = new Map(); // synset ID -> {hypernyms: [synset IDs], hyponyms: [synset IDs], similar: [synset IDs] ...}

// Function to load and process WordNet
async function loadWordNet() {
  const filePath = path.join(__dirname, "../data/est-wn.xml");
  const xmlData = fs.readFileSync(filePath, "utf8");

  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlData);

  const lexicalEntries = result.LexicalResource.Lexicon[0].LexicalEntry || [];
  const synsets = result.LexicalResource.Lexicon[0].Synset || [];

  // Process lexical entries
  lexicalEntries.forEach((entry) => {
    const lemma = entry.Lemma[0].$.writtenForm;
    if (!entry.Sense) return; // Skip entries without senses
    const senses = entry.Sense;

    if (!lemmaToSynsets.has(lemma)) {
      lemmaToSynsets.set(lemma, []);
    }

    senses.forEach((sense) => {
      const synsetID = sense.$.synset;
      lemmaToSynsets.get(lemma).push(synsetID);

      if (!synsetToLemmas.has(synsetID)) {
        synsetToLemmas.set(synsetID, []);
      }
      synsetToLemmas.get(synsetID).push(lemma);
    });
  });

  // Process synsets
  synsets.forEach((synset) => {
    const synsetID = synset.$.id;
    if (!synsetID) return; //invalid entry

    const relations = { hypernyms: [], hyponyms: [], similar: [] };

    (synset.SynsetRelation || []).forEach((relation) => {
      const relType = relation.$.relType;
      const targetSynset = relation.$.target;

      if (relType === "hypernym") {
        relations.hypernyms.push(targetSynset);
      } else if (relType === "hyponym") {
        relations.hyponyms.push(targetSynset);
      } else if (relType === "similar") {
        relations.similar.push(targetSynset);
      }
    });

    synsetRelations.set(synsetID, relations);
  });

  parentPort.postMessage({ status: "ready" });
}

function getWordsByTopic(topic) {
  const synsets = lemmaToSynsets.get(topic);
  if (!synsets || synsets.length === 0) {
    return [];
  }

  const words = [];
  const synset = getRandomElement(synsets);
  const relations = synsetRelations.get(synset);
  relations.hypernyms.forEach((id) => {
    const lemmas = synsetToLemmas.get(id);
    if (lemmas && lemmas.length > 0) {
      words.push(getRandomElement(lemmas));
    }
  });

  relations.hyponyms.forEach((id) => {
    const lemmas = synsetToLemmas.get(id);
    if (lemmas && lemmas.length > 0) {
      words.push(getRandomElement(lemmas));
    }
  });

  relations.similar.forEach((id) => {
    const lemmas = synsetToLemmas.get(id);
    if (lemmas && lemmas.length > 0) {
      words.push(getRandomElement(lemmas));
    }
  });

  return words;
}

function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

parentPort.on("message", (message) => {
  if (message.type === "load") {
    loadWordNet();
  } else if (message.type === "getWordsByTopic") {
    const words = getWordsByTopic(message.topic.toLowerCase());
    parentPort.postMessage({ type: "result", words });
  }
});
