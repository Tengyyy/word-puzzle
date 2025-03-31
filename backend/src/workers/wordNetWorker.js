import {parentPort} from "worker_threads";
import {readFileSync} from "fs";
import {join} from "path";
import {Parser} from "xml2js";
import {Constants} from "../../../shared/Constants.js";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wordNets = new Map(); // language -> { lemmaToSynsets, synsetToLemmas, synsetRelations, trie }
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

    const relations = {
      hypernym: [],
      hyponym: [],
      similar: [],
      is_subevent_of: [],
      subevent: [],
      mero_part: [],
      mero_member: [],
      mero_location: [],
      mero_portion: [],
      holo_part: [],
      holo_member: [],
      causes: [],
      is_caused_by: [],
      state_of: [],
      role: [],
      involved: [],
      involved_agent: [],
      involved_instrument: [],
    };

    (synset.SynsetRelation || []).forEach((relation) => {
      const relType = relation.$.relType;
      const targetSynset = relation.$.target;

      if (Object.keys(relations).includes(relType)) {
        relations[relType].push(targetSynset);
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

  const trie = new Trie(
    Array.from(lemmaToSynsets.keys())
  );

  wordNets.set(lang, {
    lemmaToSynsets,
    synsetToLemmas,
    synsetRelations,
    synsetDefinitions,
    synsetToIli,
    trie,
  });
}

async function loadAllWordNets() {
  await loadWordNet(
    Constants.LANGUAGE.ESTONIAN.value,
    join(__dirname, "../data/et-wn.xml")
  );
  await loadWordNet(
    Constants.LANGUAGE.ENGLISH.value,
    join(__dirname, "../data/en-wn.xml")
  );
  await loadWordNet(
    Constants.LANGUAGE.GERMAN.value,
    join(__dirname, "../data/de-wn.xml")
  );
}

function getWords(
  topic,
  inputLanguage,
  outputLanguage,
  mode,
  width,
  height,
  nonAlphaAllowed
) {
  const inputWordNet = wordNets.get(inputLanguage);
  const outputWordNet = wordNets.get(outputLanguage);

  if (!inputWordNet || !outputWordNet) return { inputs: [], outputs: [] };

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
  let inputSet = new Set();
  let outputSet = new Set();
  let inputs = [];
  let outputs = [];
  let totalCharacters = 0;

  let availableSynsets = [...synsets];

  function collectWords(synsetID, depth = 0) {
    if (totalCharacters >= (maxCharacters - 5) || depth > 3) return; // maxCharacters - 5. character count does not need to be exactly equal to maxCharacters, this allows for faster short-circuiting
    if (collectedSynsets.has(synsetID)) return;

    collectedSynsets.add(synsetID);

    let input = null;
    let output = null;

    if (mode === Constants.MODE.HINTS.value) {
      input = synsetDefinitions.get(synsetID);
    }

    if (mode === Constants.MODE.WORDS.value || inputLanguage === outputLanguage) {
      const lemmas = synsetToLemmas.get(synsetID);
      if (lemmas) {
        for (const lemma of lemmas) {
          if (!nonAlphaAllowed && /\s/.test(lemma)) continue;
          if (lemma.length > maxWordLength) continue;
          if (inputSet.has(lemma)) continue;

          if (mode === Constants.MODE.WORDS.value) {
            input = lemma;
          }

          if (inputLanguage === outputLanguage) {
            output = lemma;
          }

          break;
        }
      }
    }

    if (outputLanguage !== inputLanguage) {
      output = null;
      const ili = synsetToIli.get(synsetID);
      if (ili) {
        const outputSynset = iliToSynsets.get(ili)[outputLanguage];
        if (outputSynset) {
          const outputLemmas = outputWordNet.synsetToLemmas.get(outputSynset);
          if (outputLemmas) {
            for (const lemma of outputLemmas) {
              if (!nonAlphaAllowed && /\s/.test(lemma)) continue;
              if (lemma.length > maxWordLength) continue;
              if (outputSet.has(lemma)) continue;

              output = lemma;
              break;
            }
          }
        }
      }
    }

    if (input && output && totalCharacters + output.length <= maxCharacters && !inputSet.has(input)) {
      inputs.push(input);
      outputs.push(output);
      inputSet.add(input);
      outputSet.add(output);
      totalCharacters += output.length;
    }

    if (totalCharacters >= maxCharacters - 5) return;

    // Explore related synsets dynamically based on depth
    const priorityRelations = depth < 2 ?
      ["hyponym", "subevent", "mero_part", "mero_member", "mero_location", "mero_portion", "similar"] :
      ["hypernym", "holo_part", "holo_member", "causes", "is_caused_by", "role", "involved", "involved_agent", "involved_instrument", "is_subevent_of", "state_of"];

    const relations = synsetRelations.get(synsetID);
    if (relations) {
      for (const relation of priorityRelations) {
        if (relations[relation]) {
          for (const relatedSynset of relations[relation]) {
            collectWords(relatedSynset, depth + 1);
            if (totalCharacters >= maxCharacters - 5) return;
          }
        }
      }
    }
  }

  //extend to different definitions of input word if we still can't reach the threshold
  while (totalCharacters < (maxCharacters - 5) && availableSynsets.length > 0) {
    const selectedSynset = getRandomElement(availableSynsets);
    collectWords(selectedSynset);
    availableSynsets = availableSynsets.filter((s) => !collectedSynsets.has(s));
  }

  function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return inputs.map((hint, index) => ({
    hint: hint,
    word: outputs[index],
  }));
}

function autocomplete(
  query,
  language
) {
  const wordnet = wordNets.get(language);
  if (!wordnet) return [];

  return wordnet.trie.searchPrefix(query, 10);
}

// Trie data-structure implementation for faster prefix-based lemma autocomplete search
class TrieNode {
  constructor() {
    this.children = {};
    this.isWord = false;
  }
}

class Trie {
  constructor(words) {
    this.root = new TrieNode();
    words.forEach((word) => this.insert(word.toLowerCase())); // Convert words to lowercase
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isWord = true;
  }

  searchPrefix(prefix, limit = 10) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) return []; // No matches
      node = node.children[char];
    }
    return this._collectWords(node, prefix, [], limit);
  }

  _collectWords(node, prefix, results, limit) {
    if (results.length >= limit) return results;
    if (node.isWord) results.push(prefix);
    for (const char in node.children) {
      this._collectWords(node.children[char], prefix + char, results, limit);
    }
    return results;
  }
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
      msg.nonAlphaAllowed
    );
    parentPort.postMessage({ type: "getWordsResult", result });
  } else if (msg.type === "autocomplete") {
    const result = autocomplete(msg.query, msg.language);
    parentPort.postMessage({ type: "autocompleteResult", result });
  }
});
