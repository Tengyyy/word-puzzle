const { parentPort } = require("worker_threads");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const wordNets = new Map(); // language -> { lemmaToSynsets, synsetToLemmas, synsetRelations }
const iliToSynsets = new Map(); // ili ID -> { lang: synsetID, ... }

// Function to load and process a WordNet for a specific language
async function loadWordNet(lang, filePath) {
  const xmlData = fs.readFileSync(filePath, "utf8");
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlData);

  const lexicalEntries = result.LexicalResource.Lexicon[0].LexicalEntry || [];
  const synsets = result.LexicalResource.Lexicon[0].Synset || [];

  const lemmaToSynsets = new Map();
  const synsetToLemmas = new Map();
  const synsetRelations = new Map();
  const synsetDefinitions = new Map();
  const synsetToIli = new Map();

  // Process lexical entries
  lexicalEntries.forEach((entry) => {
    const lemma = entry.Lemma[0].$.writtenForm;
    if (!entry.Sense) return; // Skip entries without senses

    if (!lemmaToSynsets.has(lemma)) {
      lemmaToSynsets.set(lemma, []);
    }

    entry.Sense.forEach((sense) => {
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
    const iliID = synset.$.ili;

    if (!synsetID) return; // Invalid entry

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

    //Store definition
    const iliDefinition = synset.ILIDefinition;
    const definition = synset.Definition;

    if (iliDefinition && iliDefinition[0]) {
      synsetDefinitions.set(synsetID, iliDefinition[0]);
    } else if (definition && definition[0]) {
      const def = definition[0];
      if (typeof def === "string") {
        synsetDefinitions.set(synsetID, def);
      } else if (typeof def === "object") {
        if (def._ && def.$ && def.$.language && def.language === lang) {
          synsetDefinitions.set(synsetID, def._);
        }
      }
    }

    // Store inter-lingual index
    if (iliID) {
      synsetToIli.set(synsetID, iliID);
      if (!iliToSynsets.has(iliID)) {
        iliToSynsets.set(iliID, {});
      }
      iliToSynsets.get(iliID)[lang] = synsetID;
    }
  });

  wordNets.set(lang, {
    lemmaToSynsets,
    synsetToLemmas,
    synsetRelations,
    synsetDefinitions,
    synsetToIli,
  });
}

async function loadAllWordNets() {
  await loadWordNet("et", path.join(__dirname, "../data/et-wn.xml"));
  await loadWordNet("en", path.join(__dirname, "../data/en-wn.xml"));
}

function getWords(topic, inputLanguage, outputLanguage, mode) {
  const inputWordNet = wordNets.get(inputLanguage);
  const outputWordNet = wordNets.get(outputLanguage);

  if (!inputWordNet || !outputWordNet) {
    return { inputs: [], outputs: [] };
  }

  const {
    lemmaToSynsets,
    synsetToLemmas,
    synsetRelations,
    synsetDefinitions,
    synsetToIli,
  } = inputWordNet;

  const synsets = lemmaToSynsets.get(topic);
  if (!synsets || synsets.length === 0) return { inputs: [], outputs: [] };

  let collectedSynsets = new Set();
  let availableSynsets = synsets.slice();
  let inputs = [];
  let outputs = [];

  while (inputs.length < 10 && availableSynsets.length > 0) {
    const selectedSynset = getRandomElement(availableSynsets);
    collectedSynsets.add(selectedSynset);
    collectWords(selectedSynset);
    availableSynsets = diff();
  }

  function getRandomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  function diff() {
    let diff = [];
    for (let i = 0; i < availableSynsets.length; i++) {
      const el = availableSynsets[i];
      if (!collectedSynsets.has(el)) {
        diff.push(el);
      }
    }

    return diff;
  }

  function collectWords(synsetID) {
    const relations = synsetRelations.get(synsetID);
    if (!relations) return;

    ["hypernyms", "hyponyms", "similar"].forEach((relation) => {
      relations[relation].forEach((relatedSynset) => {
        if (!collectedSynsets.has(relatedSynset)) {
          collectedSynsets.add(relatedSynset);
          if (mode === "hints" && !synsetDefinitions.get(relatedSynset)) {
            return;
          }

          let input, output;
          if (mode === "hints") {
            input = synsetDefinitions.get(relatedSynset);
          }
          if (mode === "words" || inputLanguage === outputLanguage) {
            const lemmas = synsetToLemmas.get(relatedSynset);
            if (!lemmas || lemmas.length === 0) return;

            const randElement = getRandomElement(lemmas);
            if (mode === "words") {
              input = randElement;
            }
            if (inputLanguage === outputLanguage) {
              output = randElement;
            }
          }

          if (outputLanguage !== inputLanguage) {
            const ili = synsetToIli.get(relatedSynset);
            if (!ili) {
              return;
            }

            const outputSynset = iliToSynsets.get(ili)[outputLanguage];

            if (!outputSynset) {
              // No ili-mapping available to output language, have to skip this synset
              return;
            }

            const outputLemmas = outputWordNet.synsetToLemmas.get(outputSynset);

            if (!outputLemmas || outputLemmas.length === 0) {
              return;
            }

            output = getRandomElement(outputLemmas);
          }

          if (inputs.includes(input) || outputs.includes(output)) {
            return;
          }

          inputs.push(input);
          outputs.push(output);
        }
      });
    });
  }

  return {
    inputs: inputs,
    outputs: outputs,
  };
}

parentPort.on("message", async (msg) => {
  if (msg.type === "load") {
    await loadAllWordNets();
    parentPort.postMessage({ status: "ready" });
  } else if (msg.type === "getWords") {
    const result = getWords(
      msg.topic,
      msg.inputLanguage,
      msg.outputLanguage,
      msg.mode
    );
    parentPort.postMessage({ type: "result", result });
  }
});
