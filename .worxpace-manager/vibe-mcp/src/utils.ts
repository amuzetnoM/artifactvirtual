/**
 * Utility functions for the Vibe Soundtrack MCP
 */

// Constants for audio generation
export const MAX_SNIPPET = 1200; // chars
export const DEFAULT_DURATION = 180; // seconds
export const DEFAULT_STEPS = 30; // generation steps

// Language detection patterns
const LANGUAGE_PATTERNS = {
  javascript:
    /\b(const|let|var|function|=>|async|await|import|export|class)\b|\.(js|jsx|ts|tsx)$/i,
  typescript:
    /\b(interface|type|namespace|enum|as|implements|readonly)\b|\.(ts|tsx)$/i,
  python:
    /\b(def|import|from|class|if __name__ == ['"]__main__['"]|lambda)\b|\.(py)$/i,
  java: /\b(public|private|protected|class|interface|extends|implements|void)\b|\.(java)$/i,
  csharp: /\b(namespace|using|class|void|string\[\]|Console\.Write)\b|\.(cs)$/i,
  ruby: /\b(def|end|module|require|include|attr_accessor)\b|\.(rb)$/i,
  go: /\b(func|package|import|go|chan|struct|interface)\b|\.(go)$/i,
  rust: /\b(fn|let|mut|struct|impl|trait|enum|match|pub)\b|\.(rs)$/i,
  php: /\b(\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*|function|echo|namespace|use)\b|\.(php)$/i,
  html: /\b(<html|<head|<body|<div|<span|<a|<script|<link|<meta)\b|\.(html|htm)$/i,
  css: /\b(@media|@keyframes|@import|:hover|:root|margin|padding|display|flex)\b|\.(css|scss|sass|less)$/i,
  sql: /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b|\.(sql)$/i,
  shell: /\b(#!\/bin\/|bash|echo|export|source|grep|awk|sed)\b|\.(sh|bash)$/i,
};

// Genre mapping based on language
const LANGUAGE_TO_GENRE: Record<string, string[]> = {
  javascript: ["lo-fi house", "chillhop", "trip hop"],
  typescript: ["synthwave", "ambient techno", "deep house"],
  python: ["ambient", "downtempo", "chillwave"],
  java: ["orchestral", "cinematic", "epic"],
  csharp: ["electronic", "IDM", "glitch"],
  ruby: ["jazz", "bossa nova", "smooth jazz"],
  go: ["minimal techno", "dub techno", "microhouse"],
  rust: ["industrial", "dark ambient", "techno"],
  php: ["vaporwave", "retrowave", "future funk"],
  html: ["pop", "indie pop", "electropop"],
  css: ["dream pop", "shoegaze", "ambient pop"],
  sql: ["acid jazz", "nu jazz", "broken beat"],
  shell: ["breakbeat", "drum and bass", "jungle"],
  unknown: ["lo-fi", "ambient", "electronic"],
};

// Mood mapping based on code characteristics
const CODE_CHARACTERISTICS_TO_MOOD: Record<string, string[]> = {
  complex: ["intense", "focused", "intricate", "mysterious"],
  simple: ["relaxed", "calm", "gentle", "peaceful"],
  dataHeavy: ["structured", "methodical", "precise", "calculated"],
  algorithmic: ["mathematical", "logical", "progressive", "evolving"],
  functional: ["elegant", "flowing", "smooth", "clean"],
  objectOriented: ["layered", "textured", "organized", "detailed"],
  declarative: ["dreamy", "atmospheric", "spacious", "floating"],
  imperative: ["driving", "direct", "forceful", "energetic"],
};

// BPM ranges based on code complexity and style
const COMPLEXITY_TO_BPM = {
  verySimple: [60, 80],
  simple: [80, 100],
  moderate: [100, 120],
  complex: [120, 140],
  veryComplex: [140, 160],
};

/**
 * Detects the programming language from code
 * @param code The code snippet to analyze
 * @returns The detected language or "unknown"
 */
export function detectLanguage(code: string): string {
  for (const [language, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (pattern.test(code)) {
      return language;
    }
  }
  return "unknown";
}

/**
 * Analyzes code complexity based on various metrics
 * @param code The code snippet to analyze
 * @returns A complexity score from 0 (very simple) to 1 (very complex)
 */
export function analyzeComplexity(code: string): number {
  // This is a simplified complexity analysis
  // In a real implementation, we would use more sophisticated metrics

  // Count nested blocks by tracking braces, indentation, etc.
  const braceNesting = (code.match(/\{/g) || []).length;
  const indentation =
    code.split("\n").reduce((max, line) => {
      const spaces = line.search(/\S|$/);
      return Math.max(max, spaces);
    }, 0) / 8; // Normalize by assuming 8 spaces is deep nesting

  // Count control structures
  const controlStructures = (
    code.match(/\b(if|for|while|switch|catch|try|else|do)\b/g) || []
  ).length;

  // Count function calls and definitions
  const functionCalls = (code.match(/\w+\s*\(/g) || []).length;
  const functionDefs = (
    code.match(/\b(function|def|func|method|class)\b/g) || []
  ).length;

  // Count operators
  const operators = (code.match(/[+\-*/%=&|^<>!?:]+/g) || []).length;

  // Normalize each metric to a 0-1 range and combine with weights
  const normalizedBraceNesting = Math.min(braceNesting / 20, 1);
  const normalizedControlStructures = Math.min(controlStructures / 15, 1);
  const normalizedFunctionCalls = Math.min(functionCalls / 30, 1);
  const normalizedFunctionDefs = Math.min(functionDefs / 10, 1);
  const normalizedOperators = Math.min(operators / 50, 1);

  // Combine metrics with weights
  const complexity =
    normalizedBraceNesting * 0.2 +
    normalizedControlStructures * 0.3 +
    normalizedFunctionCalls * 0.2 +
    normalizedFunctionDefs * 0.2 +
    normalizedOperators * 0.1 +
    indentation * 0.1;

  return Math.min(Math.max(complexity, 0), 1);
}

/**
 * Converts a string to its binary representation.
 * @param str The input string
 * @returns The binary string representation
 */
function stringToBinary(str: string): string {
  return str
    .split("")
    .map((char) => {
      return char.charCodeAt(0).toString(2).padStart(8, "0");
    })
    .join("");
}

/**
 * Calculates the Shannon entropy of a string.
 * Higher entropy indicates more randomness/complexity.
 * @param str The input string
 * @returns Entropy value (typically between 0-5 for code)
 */
export function calculateEntropy(str: string): number {
  if (!str || str.length === 0) return 0;

  // Count character frequencies
  const frequencies: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  // Calculate entropy using Shannon's formula: -sum(p_i * log2(p_i))
  let entropy = 0;
  const len = str.length;

  for (const char in frequencies) {
    const probability = frequencies[char] / len;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

/**
 * Analyzes the binary representation of code for mood characteristics.
 * This is a conceptual example using simple binary analysis.
 * @param code The code snippet to analyze
 * @returns An array of mood descriptors based on binary analysis
 */
export function analyzeCodeBinaryForMood(code: string): string[] {
  const binaryCode = stringToBinary(code);
  const moods: string[] = [];

  if (!binaryCode.length) {
    return moods;
  }

  // 1. Ratio of 0s to 1s
  const ones = (binaryCode.match(/1/g) || []).length;
  const zeros = binaryCode.length - ones;
  const oneRatio = ones / binaryCode.length;

  if (oneRatio > 0.6) {
    moods.push("dense", "intense");
  } else if (oneRatio < 0.4) {
    moods.push("sparse", "minimal");
  } else {
    moods.push("balanced");
  }

  // 2. Frequency of a simple pattern (e.g., '0101')
  const pattern = "0101";
  const patternCount = (binaryCode.match(/0101/g) || []).length;
  // Normalize frequency by potential occurrences
  const patternFrequency = patternCount / (binaryCode.length / pattern.length);

  if (patternFrequency > 0.1) {
    // Arbitrary threshold
    moods.push("rhythmic", "patterned");
  }

  // 3. Simple "Differential Equation" simulation: Rate of change of '1' density
  // We'll check density in chunks and see how much it changes.
  const chunkSize = Math.max(100, Math.floor(binaryCode.length / 10)); // Analyze in chunks
  let maxDensityChange = 0;
  let lastDensity = -1;

  for (let i = 0; i < binaryCode.length; i += chunkSize) {
    const chunk = binaryCode.substring(
      i,
      Math.min(i + chunkSize, binaryCode.length)
    );
    if (chunk.length === 0) continue;
    const chunkOnes = (chunk.match(/1/g) || []).length;
    const currentDensity = chunkOnes / chunk.length;

    if (lastDensity !== -1) {
      maxDensityChange = Math.max(
        maxDensityChange,
        Math.abs(currentDensity - lastDensity)
      );
    }
    lastDensity = currentDensity;
  }

  if (maxDensityChange > 0.3) {
    // Arbitrary threshold for significant change
    moods.push("dynamic", "volatile", "shifting");
  } else if (maxDensityChange < 0.05 && binaryCode.length > chunkSize * 2) {
    // Low change over multiple chunks
    moods.push("stable", "consistent", "steady");
  }

  // 4. Entropy-based moods
  const entropy = calculateEntropy(code);
  if (entropy > 4.5) {
    moods.push("complex", "chaotic", "unpredictable");
  } else if (entropy < 3.5) {
    moods.push("ordered", "structured", "predictable");
  }

  // Return unique moods derived from binary analysis
  return Array.from(new Set(moods));
}

/**
 * Simulates AST (Abstract Syntax Tree) analysis using regex patterns
 * to understand code structure at a deeper level.
 * @param code The code snippet to analyze
 * @returns An object with various structural metrics
 */
export function analyzeCodeStructure(code: string): Record<string, number> {
  const result: Record<string, number> = {
    // Node type densities
    functionDensity: 0,
    conditionalDensity: 0,
    loopDensity: 0,
    variableDensity: 0,
    commentDensity: 0,

    // Structural metrics
    nestingDepth: 0,
    branchingFactor: 0,
    cyclomaticDensity: 0,

    // Pattern metrics
    recursionScore: 0,
    asyncPatternScore: 0,
    functionalPatternScore: 0,

    // Information metrics
    entropy: 0,
    compressionRatio: 0,
  };

  // Calculate code length for density calculations
  const codeLength = code.length || 1; // Avoid division by zero
  const lines = code.split(/\r?\n/);
  const lineCount = lines.length || 1;

  // 1. Count various node types
  const functionMatches = code.match(/\bfunction\b|\s=>\s|\bclass\b/g) || [];
  const conditionalMatches =
    code.match(/\bif\b|\bswitch\b|\?.*:|\bcase\b/g) || [];
  const loopMatches = code.match(/\bfor\b|\bwhile\b|\bdo\b|\bforeach\b/g) || [];
  const variableMatches = code.match(/\bconst\b|\blet\b|\bvar\b/g) || [];
  const commentMatches = code.match(/\/\/.*$|\/\*[\s\S]*?\*\//gm) || [];

  // Calculate densities (occurrences per 1000 chars)
  result.functionDensity = (functionMatches.length / codeLength) * 1000;
  result.conditionalDensity = (conditionalMatches.length / codeLength) * 1000;
  result.loopDensity = (loopMatches.length / codeLength) * 1000;
  result.variableDensity = (variableMatches.length / codeLength) * 1000;
  result.commentDensity = (commentMatches.length / codeLength) * 1000;

  // 2. Analyze nesting depth
  let maxDepth = 0;
  let currentDepth = 0;

  for (const char of code) {
    if (char === "{" || char === "(" || char === "[") {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === "}" || char === ")" || char === "]") {
      currentDepth = Math.max(0, currentDepth - 1); // Prevent negative depth
    }
  }

  result.nestingDepth = maxDepth;

  // 3. Calculate branching factor (decision points per function)
  const functionCount = functionMatches.length || 1; // Avoid division by zero
  const decisionPoints = conditionalMatches.length + loopMatches.length;
  result.branchingFactor = decisionPoints / functionCount;

  // 4. Cyclomatic density (cyclomatic complexity per line of code)
  const cyclomatic = 1 + decisionPoints; // Base complexity + decision points
  result.cyclomaticDensity = cyclomatic / lineCount;

  // 5. Detect recursion patterns
  // Extract function names and check if they call themselves
  const functionNameRegex =
    /function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
  let match;
  let recursionCount = 0;

  while ((match = functionNameRegex.exec(code)) !== null) {
    const fnName = match[1] || match[2];
    if (fnName) {
      const callRegex = new RegExp(`\\b${fnName}\\s*\\(`, "g");
      // Count calls after the function definition
      const afterDefCode = code.slice(match.index + match[0].length);
      const calls = afterDefCode.match(callRegex) || [];
      recursionCount += calls.length;
    }
  }

  result.recursionScore = recursionCount / (functionCount || 1);

  // 6. Detect async patterns
  const asyncMatches =
    code.match(/\basync\b|\bawait\b|\bPromise\b|\b\.then\b/g) || [];
  result.asyncPatternScore = asyncMatches.length / (functionCount || 1);

  // 7. Detect functional programming patterns
  const functionalMatches =
    code.match(/\bmap\b|\bfilter\b|\breduce\b|\bcompose\b|\bcurry\b/g) || [];
  result.functionalPatternScore =
    functionalMatches.length / (functionCount || 1);

  // 8. Information theory metrics
  result.entropy = calculateEntropy(code);

  // Simulate compression ratio using character frequency as a simple approximation
  const charFreq: Record<string, number> = {};
  for (const char of code) {
    charFreq[char] = (charFreq[char] || 0) + 1;
  }

  const uniqueChars = Object.keys(charFreq).length;
  result.compressionRatio = uniqueChars / Math.sqrt(codeLength);

  return result;
}

/**
 * Analyzes code style and paradigm
 * @param code The code snippet to analyze
 * @returns An object with various style characteristics
 */
export function analyzeCodeStyle(code: string): Record<string, number> {
  const result: Record<string, number> = {
    functional: 0,
    objectOriented: 0,
    declarative: 0,
    imperative: 0,
    dataHeavy: 0,
    algorithmic: 0,
  };

  // Functional programming indicators
  const functionalPatterns = [
    /\b(map|filter|reduce|forEach|=>|\.then|\.catch|\.finally)\b/g,
    /\b(const|let)\s+\w+\s*=\s*\([^)]*\)\s*=>/g,
    /\b(pure|immutable|curry|compose|pipe|memoize)\b/g,
  ];

  // Object-oriented indicators
  const ooPatterns = [
    /\b(class|extends|implements|interface|new|this|super|constructor|prototype)\b/g,
    /\b(public|private|protected|static|readonly)\b/g,
  ];

  // Declarative indicators
  const declarativePatterns = [
    /\b(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b/g,
    /\b(html|jsx|tsx|xml|json|yaml|css)\b/g,
    /[<{][^>}]*[>}]/g,
  ];

  // Imperative indicators
  const imperativePatterns = [
    /\b(for|while|do|if|else|switch|case|break|continue|return|goto)\b/g,
    /\w+\s*=\s*\w+/g,
    /\+\+|--/g,
  ];

  // Data-heavy indicators
  const dataPatterns = [
    /\b(data|database|query|model|schema|entity|table|column|field|record|row)\b/g,
    /\b(Array|List|Map|Set|Dictionary|HashMap|Object|JSON)\b/g,
    /\[\s*\{[^}]*\}\s*\]/g,
  ];

  // Algorithmic indicators
  const algorithmicPatterns = [
    /\b(algorithm|sort|search|traverse|recursive|iteration|complexity|optimize)\b/g,
    /\b(O\([^)]+\))/g,
    /\b(binary|linear|graph|tree|heap|stack|queue)\b/g,
  ];

  // Count matches for each pattern group
  const countMatches = (patterns: RegExp[], code: string) => {
    return patterns.reduce((sum, pattern) => {
      const matches = code.match(pattern) || [];
      return sum + matches.length;
    }, 0);
  };

  // Calculate raw scores
  const functionalScore = countMatches(functionalPatterns, code);
  const ooScore = countMatches(ooPatterns, code);
  const declarativeScore = countMatches(declarativePatterns, code);
  const imperativeScore = countMatches(imperativePatterns, code);
  const dataScore = countMatches(dataPatterns, code);
  const algorithmicScore = countMatches(algorithmicPatterns, code);

  // Normalize scores to 0-1 range
  const total =
    functionalScore +
    ooScore +
    declarativeScore +
    imperativeScore +
    dataScore +
    algorithmicScore;
  if (total > 0) {
    result.functional = functionalScore / total;
    result.objectOriented = ooScore / total;
    result.declarative = declarativeScore / total;
    result.imperative = imperativeScore / total;
    result.dataHeavy = dataScore / total;
    result.algorithmic = algorithmicScore / total;
  }

  return result;
}

/**
 * Analyzes sentiment from code comments and strings
 * @param code The code snippet to analyze
 * @returns A sentiment score from -1 (negative) to 1 (positive)
 */
export function analyzeSentiment(code: string): number {
  // Extract comments and strings
  const commentRegex = /\/\/.*?$|\/\*[\s\S]*?\*\//gm;
  const stringRegex = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`/g;

  const comments = (code.match(commentRegex) || []).join(" ");
  const strings = (code.match(stringRegex) || []).join(" ");
  const text = comments + " " + strings;

  // Simple sentiment analysis based on keyword matching
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "awesome",
    "nice",
    "best",
    "better",
    "improve",
    "enhancement",
    "feature",
    "success",
    "working",
    "fixed",
    "resolved",
    "solution",
    "optimize",
    "efficient",
    "clean",
    "elegant",
    "simple",
    "clear",
  ];

  const negativeWords = [
    "bad",
    "worst",
    "terrible",
    "awful",
    "poor",
    "bug",
    "error",
    "issue",
    "problem",
    "fail",
    "failure",
    "crash",
    "broken",
    "wrong",
    "fix",
    "hack",
    "workaround",
    "complex",
    "complicated",
    "confusing",
    "messy",
    "slow",
    "inefficient",
  ];

  // Count positive and negative words
  const positiveCount = positiveWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    return count + (text.match(regex) || []).length;
  }, 0);

  const negativeCount = negativeWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    return count + (text.match(regex) || []).length;
  }, 0);

  // Calculate sentiment score
  if (positiveCount === 0 && negativeCount === 0) {
    return 0; // Neutral if no sentiment words found
  }

  return (positiveCount - negativeCount) / (positiveCount + negativeCount);
}

// Define genre characteristics for vector similarity matching
interface GenreCharacteristics {
  name: string;
  complexity: number; // 0-1 scale
  rhythm: number; // 0-1 scale (low = ambient, high = beat-driven)
  energy: number; // 0-1 scale
  experimentalness: number; // 0-1 scale
  structure: number; // 0-1 scale (low = free-form, high = structured)
  emotionality: number; // 0-1 scale (low = cerebral, high = emotional)
  density: number; // 0-1 scale (low = sparse, high = dense)
  tags: string[]; // Additional descriptive tags
}

// Expanded genre map with characteristics for vector similarity
const GENRE_CHARACTERISTICS: GenreCharacteristics[] = [
  // Electronic genres
  {
    name: "ambient",
    complexity: 0.3,
    rhythm: 0.2,
    energy: 0.2,
    experimentalness: 0.5,
    structure: 0.3,
    emotionality: 0.6,
    density: 0.3,
    tags: ["atmospheric", "spacious", "textural", "meditative"],
  },
  {
    name: "lo-fi house",
    complexity: 0.5,
    rhythm: 0.7,
    energy: 0.5,
    experimentalness: 0.4,
    structure: 0.6,
    emotionality: 0.5,
    density: 0.6,
    tags: ["dusty", "warm", "nostalgic", "groovy"],
  },
  {
    name: "synthwave",
    complexity: 0.6,
    rhythm: 0.7,
    energy: 0.6,
    experimentalness: 0.3,
    structure: 0.7,
    emotionality: 0.7,
    density: 0.7,
    tags: ["retro", "80s", "cinematic", "driving"],
  },
  {
    name: "IDM",
    complexity: 0.9,
    rhythm: 0.8,
    energy: 0.7,
    experimentalness: 0.9,
    structure: 0.5,
    emotionality: 0.5,
    density: 0.8,
    tags: ["glitchy", "complex", "cerebral", "intricate"],
  },
  {
    name: "techno",
    complexity: 0.6,
    rhythm: 0.9,
    energy: 0.8,
    experimentalness: 0.5,
    structure: 0.8,
    emotionality: 0.4,
    density: 0.7,
    tags: ["hypnotic", "driving", "mechanical", "repetitive"],
  },
  {
    name: "deep house",
    complexity: 0.5,
    rhythm: 0.8,
    energy: 0.6,
    experimentalness: 0.3,
    structure: 0.7,
    emotionality: 0.6,
    density: 0.6,
    tags: ["groovy", "soulful", "smooth", "melodic"],
  },
  {
    name: "drum and bass",
    complexity: 0.7,
    rhythm: 0.9,
    energy: 0.9,
    experimentalness: 0.6,
    structure: 0.7,
    emotionality: 0.5,
    density: 0.8,
    tags: ["fast", "energetic", "complex", "intense"],
  },
  {
    name: "vaporwave",
    complexity: 0.4,
    rhythm: 0.5,
    energy: 0.3,
    experimentalness: 0.7,
    structure: 0.4,
    emotionality: 0.6,
    density: 0.5,
    tags: ["nostalgic", "dreamy", "surreal", "retro"],
  },

  // Jazz-influenced genres
  {
    name: "jazz",
    complexity: 0.8,
    rhythm: 0.6,
    energy: 0.5,
    experimentalness: 0.6,
    structure: 0.4,
    emotionality: 0.7,
    density: 0.7,
    tags: ["improvisational", "sophisticated", "expressive", "dynamic"],
  },
  {
    name: "acid jazz",
    complexity: 0.7,
    rhythm: 0.7,
    energy: 0.6,
    experimentalness: 0.5,
    structure: 0.5,
    emotionality: 0.6,
    density: 0.7,
    tags: ["funky", "groovy", "eclectic", "soulful"],
  },

  // Orchestral/cinematic genres
  {
    name: "orchestral",
    complexity: 0.8,
    rhythm: 0.4,
    energy: 0.7,
    experimentalness: 0.3,
    structure: 0.8,
    emotionality: 0.9,
    density: 0.8,
    tags: ["dramatic", "emotional", "grand", "dynamic"],
  },
  {
    name: "cinematic",
    complexity: 0.7,
    rhythm: 0.5,
    energy: 0.7,
    experimentalness: 0.4,
    structure: 0.7,
    emotionality: 0.9,
    density: 0.7,
    tags: ["dramatic", "emotional", "atmospheric", "narrative"],
  },

  // Pop-influenced genres
  {
    name: "indie pop",
    complexity: 0.5,
    rhythm: 0.6,
    energy: 0.6,
    experimentalness: 0.4,
    structure: 0.8,
    emotionality: 0.7,
    density: 0.6,
    tags: ["catchy", "melodic", "accessible", "emotive"],
  },
  {
    name: "dream pop",
    complexity: 0.5,
    rhythm: 0.5,
    energy: 0.4,
    experimentalness: 0.5,
    structure: 0.6,
    emotionality: 0.8,
    density: 0.7,
    tags: ["ethereal", "dreamy", "hazy", "melodic"],
  },

  // Experimental genres
  {
    name: "glitch",
    complexity: 0.8,
    rhythm: 0.7,
    energy: 0.6,
    experimentalness: 0.9,
    structure: 0.3,
    emotionality: 0.4,
    density: 0.7,
    tags: ["broken", "experimental", "digital", "abstract"],
  },
  {
    name: "dark ambient",
    complexity: 0.5,
    rhythm: 0.2,
    energy: 0.3,
    experimentalness: 0.7,
    structure: 0.3,
    emotionality: 0.7,
    density: 0.6,
    tags: ["atmospheric", "ominous", "textural", "mysterious"],
  },
];

/**
 * Selects a genre based on deep code analysis using vector similarity
 * @param code The code snippet to analyze
 * @param language Optional override for the programming language
 * @returns A suitable music genre
 */
export function selectGenre(code: string, language?: string): string {
  // Get traditional metrics
  const detectedLanguage = detectLanguage(code);
  const finalLanguage = language || detectedLanguage;
  const complexity = analyzeComplexity(code);
  const style = analyzeCodeStyle(code);
  const sentiment = analyzeSentiment(code);
  const binaryMoods = analyzeCodeBinaryForMood(code);

  // Get deeper structural metrics
  const structure = analyzeCodeStructure(code);
  const entropy = calculateEntropy(code);

  // Create a feature vector for the code
  const codeVector = {
    // Complexity metrics
    complexity: complexity,
    nestingDepth: Math.min(structure.nestingDepth / 10, 1), // Normalize to 0-1
    cyclomaticDensity: Math.min(structure.cyclomaticDensity / 5, 1), // Normalize to 0-1

    // Rhythm/energy metrics
    rhythm: structure.loopDensity / 10 + structure.asyncPatternScore / 2, // Loops and async patterns suggest rhythm
    energy: Math.min(
      structure.conditionalDensity / 10 + structure.branchingFactor / 5,
      1
    ),

    // Experimentalness metrics
    experimentalness: Math.min(entropy / 5, 1), // Higher entropy = more experimental

    // Structure metrics
    structure: 1 - Math.min(entropy / 5, 1), // Lower entropy = more structured

    // Emotionality metrics
    emotionality: Math.max(0, sentiment + 0.5), // Convert -1 to 1 range to 0-1 range

    // Density metrics
    density: Math.min(
      (structure.functionDensity + structure.variableDensity) / 20,
      1
    ),
  };

  // Calculate similarity scores with each genre
  const genreScores = GENRE_CHARACTERISTICS.map((genre) => {
    // Calculate Euclidean distance (lower is more similar)
    const distance = Math.sqrt(
      Math.pow(codeVector.complexity - genre.complexity, 2) +
        Math.pow(codeVector.rhythm - genre.rhythm, 2) +
        Math.pow(codeVector.energy - genre.energy, 2) +
        Math.pow(codeVector.experimentalness - genre.experimentalness, 2) +
        Math.pow(codeVector.structure - genre.structure, 2) +
        Math.pow(codeVector.emotionality - genre.emotionality, 2) +
        Math.pow(codeVector.density - genre.density, 2)
    );

    // Convert distance to similarity score (higher is more similar)
    const similarity = 1 / (1 + distance);

    return {
      genre: genre.name,
      score: similarity,
    };
  });

  // Sort by similarity score (descending)
  genreScores.sort((a, b) => b.score - a.score);

  // If language is explicitly provided, prioritize genres associated with that language
  // Add debug logging
  console.log(
    `selectGenre called with language: ${language}, finalLanguage: ${finalLanguage}`
  );

  // Check if language is provided and is a non-empty string
  if (typeof language === "string" && language.trim() !== "") {
    // Convert to lowercase for case-insensitive comparison
    const lowerLanguage = language.toLowerCase();

    // Find the matching language key in LANGUAGE_TO_GENRE
    const languageKey = Object.keys(LANGUAGE_TO_GENRE).find(
      (key) => key.toLowerCase() === lowerLanguage
    );

    if (languageKey) {
      const genres = LANGUAGE_TO_GENRE[languageKey];
      console.log(`Found genres for ${languageKey}: ${genres.join(", ")}`);
      return genres[0]; // Return the first genre for this language
    }

    console.log(`No genres found for language: ${language}`);
  }

  // If no language is explicitly provided or no genres are associated with it,
  // fall back to the vector similarity approach
  const languageGenres =
    LANGUAGE_TO_GENRE[finalLanguage as keyof typeof LANGUAGE_TO_GENRE] ||
    LANGUAGE_TO_GENRE.unknown;

  // Find the highest scoring genre that's also in the language's traditional genres
  for (const langGenre of languageGenres) {
    const matchingGenre = genreScores.find(
      (g) =>
        g.genre === langGenre ||
        GENRE_CHARACTERISTICS.find((gc) => gc.name === g.genre)?.tags.includes(
          langGenre
        )
    );

    if (matchingGenre && matchingGenre.score > 0.7 * genreScores[0].score) {
      return matchingGenre.genre;
    }
  }

  // If no strong match with language genres, return the highest scoring genre
  return genreScores[0].genre;
}

/**
 * Selects a BPM based on code complexity
 * @param code The code snippet to analyze
 * @returns A suitable BPM value
 */
export function selectBPM(code: string): number {
  const complexity = analyzeComplexity(code);

  // Map complexity to BPM range
  let bpmRange;
  if (complexity < 0.2) {
    bpmRange = COMPLEXITY_TO_BPM.verySimple;
  } else if (complexity < 0.4) {
    bpmRange = COMPLEXITY_TO_BPM.simple;
  } else if (complexity < 0.6) {
    bpmRange = COMPLEXITY_TO_BPM.moderate;
  } else if (complexity < 0.8) {
    bpmRange = COMPLEXITY_TO_BPM.complex;
  } else {
    bpmRange = COMPLEXITY_TO_BPM.veryComplex;
  }

  // Calculate a specific BPM within the range
  const [min, max] = bpmRange;
  const range = max - min;
  const offset = Math.floor(Math.random() * range);
  return min + offset;
}

/**
 * Selects mood descriptors based on code analysis
 * @param code The code snippet to analyze
 * @returns An array of mood descriptors
 */
export function selectMood(code: string): string[] {
  const style = analyzeCodeStyle(code);
  const complexity = analyzeComplexity(code);
  const sentiment = analyzeSentiment(code);
  const binaryMoods = analyzeCodeBinaryForMood(code); // Analyze binary representation

  // Find dominant style characteristics
  const styleEntries = Object.entries(style).sort((a, b) => b[1] - a[1]);
  const dominantStyles = styleEntries.slice(0, 2).map((entry) => entry[0]);

  // Collect potential moods based on dominant styles and binary analysis
  const potentialMoods: string[] = [...binaryMoods]; // Start with moods from binary analysis
  dominantStyles.forEach((style) => {
    if (style in CODE_CHARACTERISTICS_TO_MOOD) {
      potentialMoods.push(
        ...CODE_CHARACTERISTICS_TO_MOOD[
          style as keyof typeof CODE_CHARACTERISTICS_TO_MOOD
        ]
      );
    }
  });

  // Add complexity-based moods
  if (complexity > 0.7) {
    potentialMoods.push(...CODE_CHARACTERISTICS_TO_MOOD.complex);
  } else if (complexity < 0.3) {
    potentialMoods.push(...CODE_CHARACTERISTICS_TO_MOOD.simple);
  }

  // Add sentiment-based moods
  if (sentiment > 0.3) {
    potentialMoods.push("uplifting", "optimistic", "bright", "cheerful");
  } else if (sentiment < -0.3) {
    potentialMoods.push("melancholic", "somber", "tense", "dark");
  } else {
    potentialMoods.push("balanced", "contemplative", "neutral");
  }

  // Ensure we have moods to choose from
  if (potentialMoods.length === 0) {
    return ["atmospheric", "electronic"];
  }

  // Select 2-3 unique moods
  const uniqueMoods = Array.from(new Set(potentialMoods));
  const numMoods = Math.min(
    uniqueMoods.length,
    2 + Math.floor(Math.random() * 2)
  );

  // Shuffle and take the first few
  return uniqueMoods.sort(() => Math.random() - 0.5).slice(0, numMoods);
}

export function suggestInstrumentation(code: string): string[] {
  // ---------- 1. quick metrics ----------
  const lines = code.split(/\r?\n/);
  const loc = lines.length;

  let commentChars = 0,
    branchPoints = 0,
    indentSum = 0;
  const fnNames = new Set<string>();

  const commentRE = /^\s*(\/\/|#|\/\*|\*)/;
  const branchRE =
    /\b(if|for|while|case|catch|else\s+if|switch|\?\s*|&&|\|\|)\b/;

  for (const ln of lines) {
    if (commentRE.test(ln)) commentChars += ln.length;
    if (branchRE.test(ln)) branchPoints += (ln.match(branchRE) || []).length;

    // crude indent depth (spaces only, tabs count as 4)
    const matchResult = ln.match(/^\s*/);
    const indent = matchResult
      ? matchResult[0].replace(/\t/g, "    ").length
      : 0;
    indentSum += indent;

    // capture function names for recursion detection
    const fn = ln.match(
      /\bfunction\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(/
    );
    if (fn) fnNames.add(fn[1] || fn[2]);
  }

  const avgIndent = indentSum / loc || 0;
  const commentsRatio = commentChars / (code.length || 1);

  // recursion flag
  let hasRecursion = false;
  for (const name of fnNames) {
    const calls = new RegExp(`\\b${name}\\s*\\(`);
    const defLine = new RegExp(`function\\s+${name}\\b|const\\s+${name}\\b`);
    let seenDef = false;
    for (const ln of lines) {
      if (!seenDef && defLine.test(ln)) {
        seenDef = true;
        continue;
      }
      if (seenDef && calls.test(ln)) {
        hasRecursion = true;
        break;
      }
    }
    if (hasRecursion) break;
  }

  // keyword presence
  const up = code.toUpperCase();
  const hasSQL = /\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b/.test(up);
  const hasAsync = /\basync\b|\bawait\b|\bPromise\b/.test(code);

  // crude cyclomatic ≈ branches + function count
  const cyclomatic = branchPoints + fnNames.size;

  // ---------- 2. map to instrumentation ----------
  const instruments = new Set<string>();

  // baseline drum track
  instruments.add("acoustic kick & snare");

  // SQL → lo-fi palette
  if (hasSQL) {
    instruments.add("lo-fi drum loop");
    instruments.add("dusty vinyl crackle");
    instruments.add("electric rhodes piano");
  }

  // async / concurrency → house-ish syncopation
  if (hasAsync) {
    instruments.add("four-on-the-floor house kit");
    instruments.add("side-chained saw pad");
    instruments.add("percussive hi-hat shuffle");
  }

  // recursion → arpeggiator
  if (hasRecursion) instruments.add("arpeggiated bell synth");

  // density from cyclomatic complexity
  if (cyclomatic > 15) instruments.add("poly synth chords");
  if (cyclomatic > 25) instruments.add("counter-melody pluck");

  // comment-heavy → vocal presence
  if (commentsRatio > 0.3) instruments.add("soft lead vocal ooohs");

  // deep indentation → jazz chords
  if (avgIndent > 8) instruments.add("extended jazz piano");

  // LOC-based ornamentation
  if (loc < 40) instruments.add("minimal sub-bass");
  else if (loc > 200) instruments.add("warm string pad");

  return Array.from(instruments);
}

/**
 * Builds a prompt for audio generation based on code context
 * @param code The code snippet to generate music for
 * @param genre Optional override for the music genre
 * @param language Optional override for the programming language
 * @returns A formatted prompt for audio generation
 */
export function buildPrompt(
  code: string,
  genre?: string,
  language?: string
): string {
  const trimmedCode = code.slice(0, MAX_SNIPPET);

  // Analyze code to determine musical characteristics
  console.log(`buildPrompt called with language: ${language}`);
  const detectedGenre = selectGenre(trimmedCode, language);
  console.log(`selectGenre returned: ${detectedGenre}`);
  const finalGenre = genre || detectedGenre;
  console.log(`Final genre selected: ${finalGenre}`);
  const bpm = selectBPM(trimmedCode);
  const mood = selectMood(trimmedCode).join(", ");
  const detectedLanguage = detectLanguage(trimmedCode);
  const finalLanguage = language || detectedLanguage;
  const complexity = analyzeComplexity(trimmedCode);
  const sentiment = analyzeSentiment(trimmedCode); // Get sentiment score
  const instrumentation = suggestInstrumentation(trimmedCode);

  // Describe sentiment
  let sentimentDescription = "neutral";
  if (sentiment > 0.3) {
    sentimentDescription = "positive";
  } else if (sentiment < -0.3) {
    sentimentDescription = "negative";
  }

  // Build a more detailed prompt
  return `Genre: ${finalGenre}
Mood: ${mood}
Tempo: ${bpm} BPM
Style: ${complexity > 0.6 ? "complex and intricate" : "smooth and flowing"}
Sentiment: ${sentimentDescription}
Inspiration: ${finalLanguage} code that is ${
    complexity > 0.5 ? "sophisticated and detailed" : "clean and elegant"
  }
Instrumentation: ${instrumentation.join(", ")}
The music should capture the essence of coding in ${finalLanguage}, with a ${mood} atmosphere.
CODE CONTEXT:
${trimmedCode}`;
}
