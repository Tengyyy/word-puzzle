import {parentPort} from "worker_threads";
import {readFileSync} from "fs";
import {join} from "path";
import {Parser} from "xml2js";
import {Constants} from "../../../shared/Constants.js";
import path from "path";
import {fileURLToPath} from "url";
import {isOnlyLetters} from "../../../shared/Utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wordNets = new Map(); // language -> { lemmaToSynsets, synsetToLemmas, synsetRelations, trie }
const iliToSynsets = new Map(); // ili ID -> { lang: synsetID, ... }


// Relations where A is a more general concept than B, for example A is a hypernym of B
// Consider the word for the target wordlist and all its subrelations (recursively)
const more_general_concepts_recursive = [
  "hypernym", "instance_hypernym",         // broader category
  "holonym", "holo_member", "holo_part", "holo_substance", "holo_location", "holo_portion",  // A contains B
  "domain_topic", "domain_region",         // domain of B (e.g., "math" → "calculus")
  "is_exemplified_by",                     // A is general concept, B is example
  "classifies",                            // A classifies B → A is general
  "causes",                                // A causes B (A is higher-level event)
  "attribute",                             // B has attribute A (A is general property)
  "is_subevent_of"                         // A is subevent of B → B is broader
];

// Consider the word itself but don't use in recursion
const more_general_concepts_non_recursive = [
  "has_diminutive", "has_feminine", "has_masculine", "has_young",
  "augmentative",                          // morphological
  "co_instrument_result",                  // peripheral context
  "co_instrument_agent", "co_instrument_patient",
  "domain",                                // vague / unclear usage
];


// Relations where A is a more narrow concept than B, for example A is a hyponym of B
const more_narrow_concepts_recursive = [
  "hyponym", "instance_hyponym",           // more specific terms
  "meronym", "mero_member", "mero_part", "mero_substance", "mero_location", "mero_portion", // part-of
  "has_domain_topic", "has_domain_region", // topic or field belongs to input
  "exemplifies",                           // A is an example of B
  "subevent",                              // A is part of B
  "classified_by",                         // B classified by A → A more specific
  "be_in_state",                           // B is qualified by A → A more specific
  "diminutive", "feminine", "masculine", "young",
  "is_caused_by",                          // effect → cause is more general
  "constitutive", "derivation",            // derived from
  "participle", "result", "involved_result",
  "role", "state_of"
];

const more_narrow_concepts_non_recursive = [
  "co_agent_instrument", "co_agent_patient", "co_agent_result", // narrow usage roles
  "co_result_agent", "co_result_instrument",
  "co_patient_agent", "co_patient_instrument",
];

// Not clear which concept is more general and which is more narrow, depends on context
const other_concepts = [
  "entails", "is_entailed_by",             // bidirectional logic; don't recurse
  "similar", "also",                       // "see also" or similarity
  "antonym", "anto_converse", "anto_gradable", "anto_simple",
  "eq_synonym", "ir_synonym",              // synonyms (flatten)
  "agent", "instrument", "involved", "involved_agent", "involved_instrument",
  "involved_location", "involved_patient", "involved_direction",
  "target_direction", "involved_target_direction", "involved_source_direction",
  "direction", "location",                 // not always meaningful recursively
  "in_manner", "manner_of",                // style or form
  "other", "patient", "pertainym",         // relations exist but weak semantically
  "restricts", "restricted_by",
  "secondary_aspect_ip", "secondary_aspect_pi",
  "simple_aspect_ip", "simple_aspect_pi",
  "source_direction"
];

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

    const relations = {};

    (synset.SynsetRelation || []).forEach((relation) => {
      const relType = relation.$.relType;
      const targetSynset = relation.$.target;

      if (
        more_general_concepts_recursive.includes(relType)
        || more_general_concepts_non_recursive.includes(relType)
        || more_narrow_concepts_recursive.includes(relType)
        || more_narrow_concepts_non_recursive.includes(relType)
        || other_concepts.includes(relType)
      ) {
        if (!Object.keys(relations).includes(relType)) {
          relations[relType] = [];
        }

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

  const lemmaScores = new Map();
  const acceptedLemmas = [];
  for (const [lemma, synsetIds] of lemmaToSynsets.entries()) {
    let score = 0;
    let valid = false;

    for (const synsetId of synsetIds) {
      const relations = synsetRelations.get(synsetId);
      if (!relations) continue;

      for (const relType of more_narrow_concepts_recursive) {
        const typeRelations = relations[relType];
        if (typeRelations && typeRelations.length > 0) {
          score+= typeRelations.length;
          valid = true;
        }
      }
    }

    if (valid) {
      lemmaScores.set(lemma, score);
      acceptedLemmas.push(lemma);
    }
  }

  const trie = new Trie(acceptedLemmas, lemmaScores);

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
  const maxCharacters = width * height * 3; // select words until we can roughly fill 3 word-search grids to get a decent randomized selection later
  const maxDepth = 3; // max depth for looking at narrowing concepts, after this we expand to more general concepts and then to other relations

  const collectedSynsets = new Set();
  const collectedSynsetsRecursive = new Set(); // synsets that we are allowed to expand from

  const inputSet = new Set();
  const outputSet = new Set();
  const selectedItems = [];
  let totalCharacters = 0;

  const queue = []
  synsets.forEach((synsetID) => {
    if (!collectedSynsets.has(synsetID)) {
      collectedSynsets.add(synsetID);
      collectedSynsetsRecursive.add(synsetID);
      queue.push({ synsetID, depth: 0, recurse: true })
    }
  })

  function addWord(synset, depth) {
    let input = null;
    let output = null;

    if (mode === Constants.MODE.HINTS.value) {
      input = synsetDefinitions.get(synset);
    }

    if (mode === Constants.MODE.WORDS.value || inputLanguage === outputLanguage) {
      const lemmas = synsetToLemmas.get(synset);
      if (lemmas) {
        for (const lemma of lemmas) {
          if (!nonAlphaAllowed && !isOnlyLetters(lemma)) continue;
          if (lemma.length > maxWordLength || lemma.length < 2) continue;
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
      const ili = synsetToIli.get(synset);
      if (ili) {
        const outputSynset = iliToSynsets.get(ili)[outputLanguage];
        if (outputSynset) {
          const outputLemmas = outputWordNet.synsetToLemmas.get(outputSynset);
          if (outputLemmas) {
            for (const lemma of outputLemmas) {
              if (!nonAlphaAllowed && !isOnlyLetters(lemma)) continue;
              if (lemma.length > maxWordLength || lemma.length < 2) continue;
              if (outputSet.has(lemma)) continue;

              output = lemma;
              break;
            }
          }
        }
      }
    }

    if (input && output && totalCharacters + output.length <= maxCharacters && !inputSet.has(input)) {
      const weight = maxDepth + 3 - depth;
      selectedItems.push({ hint: input, word: output, weight: weight * weight })
      inputSet.add(input);
      outputSet.add(output);
      totalCharacters += output.length;
    }
  }

  while (queue.length > 0) {

    if (totalCharacters >= maxCharacters) break;

    const { synsetID, depth, recurse } = queue.shift();

    if (depth > 0) {
      addWord(synsetID, depth);
      if (totalCharacters >= maxCharacters) break;
    }

    if (recurse && depth < maxDepth) {
      const relations = synsetRelations.get(synsetID);
      if (relations) {
        for (const relType of more_narrow_concepts_recursive) {
          if (relations[relType]) {
            for (const relatedSynset of relations[relType]) {
              if (!collectedSynsets.has(relatedSynset)) {
                collectedSynsets.add(relatedSynset);
                collectedSynsetsRecursive.add(relatedSynset);
                queue.push({ synsetID: relatedSynset, depth: depth + 1, recurse: true });
              }
            }
          }
        }

        for (const relType of more_narrow_concepts_non_recursive) {
          if (relations[relType]) {
            for (const relatedSynset of relations[relType]) {
              if (!collectedSynsets.has(relatedSynset)) {
                collectedSynsets.add(relatedSynset);
                queue.push({ synsetID: relatedSynset, depth: depth + 1, recurse: false });
              }
            }
          }
        }
      }
    }
  }

  if (totalCharacters >= maxCharacters) {
    return selectedItems;
  }

  // expand search to more general concepts
  for (const synsetID of collectedSynsetsRecursive) {
    const relations = synsetRelations.get(synsetID);
    if (relations) {
      for (const relType of more_general_concepts_recursive) {
        if (relations[relType]) {
          for (const relatedSynset of relations[relType]) {
            if (!collectedSynsets.has(relatedSynset)) {
              collectedSynsets.add(relatedSynset);
              collectedSynsetsRecursive.add(relatedSynset);
              addWord(relatedSynset, 4);
              if (totalCharacters >= maxCharacters) break;
            }
          }
        }
        if (totalCharacters >= maxCharacters) break;
      }

      for (const relType of more_general_concepts_non_recursive) {
        if (relations[relType]) {
          for (const relatedSynset of relations[relType]) {
            if (!collectedSynsets.has(relatedSynset)) {
              collectedSynsets.add(relatedSynset);
              addWord(relatedSynset, 4);
              if (totalCharacters >= maxCharacters) break;
            }
          }
        }
        if (totalCharacters >= maxCharacters) break;
      }
    }
    if (totalCharacters >= maxCharacters) break;
  }

  if (totalCharacters >= maxCharacters) {
    return selectedItems;
  }

  //expand search to other relations
  for (const synsetID of collectedSynsetsRecursive) {
    const relations = synsetRelations.get(synsetID);
    if (relations) {
      for (const relType of other_concepts) {
        if (relations[relType]) {
          for (const relatedSynset of relations[relType]) {
            if (!collectedSynsets.has(relatedSynset)) {
              collectedSynsets.add(relatedSynset);
              addWord(relatedSynset, 5);
              if (totalCharacters >= maxCharacters) break;
            }
          }
        }
        if (totalCharacters >= maxCharacters) break;
      }
    }
    if (totalCharacters >= maxCharacters) break;
  }

  return selectedItems;
}

function autocomplete(
  query,
  language
) {
  const wordnet = wordNets.get(language);
  if (!wordnet) return [];

  return wordnet.trie.searchPrefix(query, 10);
}

// Prefix-tree data-structure implementation for faster prefix-based lemma autocomplete search
class TrieNode {
  constructor() {
    this.children = {};
    this.words = new Set();
  }
}

class Trie {
  constructor(words, lemmaScores) {
    this.root = new TrieNode();
    this.lemmaScores = lemmaScores;
    words.forEach((word) => this.insert(word.toLowerCase())); // Convert words to lowercase
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
      node.words.add(word);
    }
  }

  searchPrefix(prefix, limit = 10) {
    // Traverse prefix tree to the end of the prefix
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) return []; // No matches
      node = node.children[char];
    }

    const allMatches = [...node.words];
    const exactMatch = allMatches.includes(prefix);

    const sorted = allMatches
      .filter(word => word !== prefix)
      .sort((a, b) => (this.lemmaScores.get(b) ?? 0) - (this.lemmaScores.get(a) ?? 0));

    if (exactMatch) {
      sorted.unshift(prefix);
    }

    return sorted.slice(0, limit);
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
    parentPort.postMessage({ id: msg.id, type: "getWordsResult", result });
  } else if (msg.type === "autocomplete") {
    const result = autocomplete(msg.query, msg.language);
    parentPort.postMessage({ id: msg.id, type: "autocompleteResult", result });
  }
});
