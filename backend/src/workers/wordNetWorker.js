import { parentPort } from "worker_threads";
import { readFileSync } from "fs";
import { join } from "path";
import { Parser } from "xml2js";

const wordNets = new Map(); // language -> { lemmaToSynsets, synsetToLemmas, synsetRelations }
const iliToSynsets = new Map(); // ili ID -> { lang: synsetID, ... }

// Function to load and process a WordNet for a specific language
async function loadWordNet(lang, filePath) {
  const xmlData = readFileSync(filePath, "utf8");
  const parser = new Parser();
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
  await loadWordNet("et", join(__dirname, "../data/et-wn.xml"));
  await loadWordNet("en", join(__dirname, "../data/en-wn.xml"));
  await loadWordNet("de", join(__dirname, "../data/de-wn.xml"));
}

function getWords(
  topic,
  inputLanguage,
  outputLanguage,
  mode,
  width,
  height,
  spacesAllowed
) {
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

  const maxWordLength = Math.max(width, height);

  // used as threshold for when to stop searhing for related words
  // assume no overlap (width * height is the number of characters on the grid. In case of perfect fit, all characters are used and every cell in the grid is filled with words. Multiply by 0.8 to leave room for imperfect word placements. )
  const maxCharacters = width * height * 0.8;

  let collectedSynsets = new Set();
  let availableSynsets = synsets.slice();
  let inputs = [];
  let outputs = [];
  let totalCharacters = 0;

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
    return availableSynsets.filter((el) => !collectedSynsets.has(el));
  }

  function collectWords(synsetID) {
    if (totalCharacters >= maxCharacters) return;

    const relations = synsetRelations.get(synsetID);
    if (!relations) return;

    ["hypernyms", "hyponyms", "similar"].forEach((relation) => {
      relations[relation].forEach((relatedSynset) => {
        if (!collectedSynsets.has(relatedSynset)) {
          collectedSynsets.add(relatedSynset);

          let input, output;
          if (mode === "hints") {
            if (!synsetDefinitions.get(relatedSynset)) return;
            input = synsetDefinitions.get(relatedSynset);
          }

          if (mode === "words" || inputLanguage === outputLanguage) {
            const lemmas = synsetToLemmas.get(relatedSynset);
            if (!lemmas || lemmas.length === 0) return;

            let word;
            for (const lemma of lemmas) {
              if (!spacesAllowed && /\s/.test(lemma)) continue; // Skip multi-word phrases if spaces are not allowed
              if (lemma.length > maxWordLength) continue;
              if (inputs.includes(lemma)) continue;

              word = lemma;
              break;
            }

            if (!word) return;
            if (mode === "words") {
              input = word;
            }
            if (inputLanguage === outputLanguage) {
              output = word;
            }
          }

          if (outputLanguage !== inputLanguage) {
            const ili = synsetToIli.get(relatedSynset);
            if (!ili) return;

            const outputSynset = iliToSynsets.get(ili)[outputLanguage];
            if (!outputSynset) return; // No ili-mapping available to output language, have to skip this synset

            const outputLemmas = outputWordNet.synsetToLemmas.get(outputSynset);
            if (!outputLemmas || outputLemmas.length === 0) return;

            for (const lemma of outputLemmas) {
              if (!spacesAllowed && /\s/.test(lemma)) continue;
              if (lemma.length > maxWordLength) continue;
              if (outputs.includes(lemma)) continue;

              output = lemma;
              break;
            }
            if (!output) return;
          }

          if (!input || !output) return;

          if (totalCharacters + output.length > maxCharacters) return;

          inputs.push(input);
          outputs.push(output);
          totalCharacters += output.length;
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
      msg.mode,
      msg.width,
      msg.height,
      msg.spacesAllowed
    );
    parentPort.postMessage({ type: "result", result });
  }
});
