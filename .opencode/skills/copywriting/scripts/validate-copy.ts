#!/usr/bin/env npx tsx
/**
 * Copy Validation Script
 *
 * Validates copy against quality criteria from the copywriting skill.
 *
 * Usage:
 *   npx tsx scripts/validate-copy.ts "Your headline or copy here"
 *   npx tsx scripts/validate-copy.ts --file path/to/copy.txt
 *
 * Output: JSON with scores, red flags, and recommendations
 */

import { readFileSync } from "fs";

// Red flag words and phrases that trigger automatic rewrite
const RED_FLAGS: { pattern: RegExp; word: string; suggestion: string }[] = [
  {
    pattern: /\binnovative\s+solution\b/gi,
    word: "innovative solution",
    suggestion: "What specifically is new? Replace with concrete proof.",
  },
  {
    pattern: /\bbest[\s-]in[\s-]class\b/gi,
    word: "best in class",
    suggestion: "Prove it with specifics. Who says so?",
  },
  {
    pattern: /\bseamless(\s+experience)?\b/gi,
    word: "seamless",
    suggestion: "What does the user actually see? Be concrete.",
  },
  {
    pattern: /\btransform\s+your\b/gi,
    word: "transform your",
    suggestion: "What changes concretely? Show the before/after.",
  },
  {
    pattern: /\bcutting[\s-]edge\b/gi,
    word: "cutting-edge",
    suggestion: "What technology specifically? Replace with proof.",
  },
  {
    pattern: /\bleverage\b/gi,
    word: "leverage",
    suggestion: 'Use "use" instead.',
  },
  {
    pattern: /\bsynergy\b/gi,
    word: "synergy",
    suggestion: "What's the actual benefit? Be specific.",
  },
  {
    pattern: /\brevolutionary\b/gi,
    word: "revolutionary",
    suggestion: "What's the specific innovation? Prove it.",
  },
  {
    pattern: /\bworld[\s-]class\b/gi,
    word: "world-class",
    suggestion: "Who says so? Add credentials or proof.",
  },
  {
    pattern: /\bend[\s-]to[\s-]end\b/gi,
    word: "end-to-end",
    suggestion: "List what's actually included.",
  },
  {
    pattern: /\binnovative\b/gi,
    word: "innovative",
    suggestion: "What's new? Replace with specific proof.",
  },
  {
    pattern: /\bstate[\s-]of[\s-]the[\s-]art\b/gi,
    word: "state-of-the-art",
    suggestion: "What technology? Be specific.",
  },
  {
    pattern: /\bgame[\s-]chang(er|ing)\b/gi,
    word: "game-changer",
    suggestion: "How does it change things? Show concrete impact.",
  },
  {
    pattern: /\bnext[\s-]generation\b/gi,
    word: "next-generation",
    suggestion: "What's different from current? Be specific.",
  },
];

// Patterns that indicate weak copy
const WEAK_PATTERNS: { pattern: RegExp; issue: string; suggestion: string }[] =
  [
    {
      pattern:
        /\b(very|really|extremely|highly|incredibly|absolutely)\s+\w+/gi,
      issue: "Weak intensifier",
      suggestion: "Remove the intensifier or use a stronger word.",
    },
    {
      pattern: /\band\b.*\band\b.*\band\b/gi,
      issue: "Too many 'and's (3+)",
      suggestion: "Break into separate points. Focus on one benefit.",
    },
  ];

interface ValidationResult {
  score: number;
  maxScore: number;
  pass: boolean;
  redFlags: { word: string; suggestion: string }[];
  weakPatterns: { issue: string; suggestion: string }[];
  metrics: {
    wordCount: number;
    sentenceCount: number;
    avgWordsPerSentence: number;
    readingTimeSeconds: number;
    paragraphCount: number;
    longestParagraphWords: number;
  };
  fourUs: {
    useful: number;
    urgent: number;
    unique: number;
    ultraSpecific: number;
  };
  recommendations: string[];
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

function countSentences(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  return Math.max(sentences.length, 1);
}

function countParagraphs(text: string): { count: number; longestWords: number } {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const count = Math.max(paragraphs.length, 1);
  const longestWords = Math.max(...paragraphs.map((p) => countWords(p)));
  return { count, longestWords };
}

function detectRedFlags(text: string): { word: string; suggestion: string }[] {
  const found: { word: string; suggestion: string }[] = [];

  for (const flag of RED_FLAGS) {
    if (flag.pattern.test(text)) {
      found.push({ word: flag.word, suggestion: flag.suggestion });
    }
  }

  return found;
}

function detectWeakPatterns(
  text: string
): { issue: string; suggestion: string }[] {
  const found: { issue: string; suggestion: string }[] = [];

  for (const pattern of WEAK_PATTERNS) {
    if (pattern.pattern.test(text)) {
      found.push({ issue: pattern.issue, suggestion: pattern.suggestion });
    }
  }

  // Check for multiple adjectives before a noun (simple heuristic)
  const multipleAdjectives =
    /\b(amazing|incredible|powerful|innovative|revolutionary|cutting-edge|seamless|robust)\s+(amazing|incredible|powerful|innovative|revolutionary|cutting-edge|seamless|robust)\b/gi;
  if (multipleAdjectives.test(text)) {
    found.push({
      issue: "Multiple adjectives",
      suggestion: "Hiding weak nouns. Pick one strong descriptor or use proof.",
    });
  }

  return found;
}

function score4Us(text: string): {
  useful: number;
  urgent: number;
  unique: number;
  ultraSpecific: number;
} {
  // Heuristic scoring - this is a rough approximation
  let useful = 2; // Default: some implied benefit
  let urgent = 1; // Default: no urgency
  let unique = 2; // Default: somewhat generic
  let ultraSpecific = 1; // Default: not specific

  // Useful: Check for benefit-oriented words
  const benefitWords =
    /\b(save|get|learn|discover|achieve|earn|grow|improve|boost|increase|double|triple|cut|reduce|free|bonus)\b/gi;
  const benefitMatches = text.match(benefitWords);
  if (benefitMatches && benefitMatches.length >= 2) useful = 4;
  else if (benefitMatches && benefitMatches.length >= 1) useful = 3;

  // Urgent: Check for time-pressure words
  const urgencyWords =
    /\b(now|today|tonight|tomorrow|this week|limited|hurry|fast|quick|instant|deadline|ends?|last chance|before|only \d+)\b/gi;
  const urgencyMatches = text.match(urgencyWords);
  if (urgencyMatches && urgencyMatches.length >= 2) urgent = 4;
  else if (urgencyMatches && urgencyMatches.length >= 1) urgent = 3;

  // Unique: Penalize generic phrases, reward specific ones
  const genericPhrases =
    /\b(best|leading|top|premier|quality|professional|trusted|reliable)\b/gi;
  const genericMatches = text.match(genericPhrases);
  if (genericMatches && genericMatches.length >= 2) unique = 1;
  else if (!genericMatches) unique = 3;

  // Ultra-specific: Check for numbers, percentages, timeframes
  const specificPatterns =
    /\b(\d+%|\d+x|\$\d+|\d+ (days?|hours?|minutes?|seconds?|weeks?|months?)|\d{1,3}(,\d{3})*\+?)\b/gi;
  const specificMatches = text.match(specificPatterns);
  if (specificMatches && specificMatches.length >= 2) ultraSpecific = 4;
  else if (specificMatches && specificMatches.length >= 1) ultraSpecific = 3;

  return { useful, urgent, unique, ultraSpecific };
}

function generateRecommendations(
  fourUs: { useful: number; urgent: number; unique: number; ultraSpecific: number },
  redFlags: { word: string; suggestion: string }[],
  weakPatterns: { issue: string; suggestion: string }[],
  metrics: { avgWordsPerSentence: number; longestParagraphWords: number }
): string[] {
  const recommendations: string[] = [];

  // 4U's recommendations
  if (fourUs.useful < 3) {
    recommendations.push("Add clear benefit. What does the reader get?");
  }
  if (fourUs.urgent < 2) {
    recommendations.push(
      "Add urgency. Why should they act now? (deadline, limited spots, etc.)"
    );
  }
  if (fourUs.unique < 3) {
    recommendations.push(
      "Make it unique. Could a competitor say this? Find your specific angle."
    );
  }
  if (fourUs.ultraSpecific < 3) {
    recommendations.push(
      "Add specifics. Include numbers, timeframes, or concrete details."
    );
  }

  // Red flag recommendations
  for (const flag of redFlags.slice(0, 3)) {
    recommendations.push(`Replace "${flag.word}": ${flag.suggestion}`);
  }

  // Weak pattern recommendations
  for (const pattern of weakPatterns.slice(0, 2)) {
    recommendations.push(`${pattern.issue}: ${pattern.suggestion}`);
  }

  // Metrics recommendations
  if (metrics.avgWordsPerSentence > 25) {
    recommendations.push(
      "Sentences too long. Break up for readability (aim for 15-20 words avg)."
    );
  }
  if (metrics.longestParagraphWords > 50) {
    recommendations.push(
      "Paragraphs too long. Keep under 2 lines (~40-50 words) for scannability."
    );
  }

  return recommendations.slice(0, 5); // Top 5 recommendations
}

function validateCopy(text: string): ValidationResult {
  const wordCount = countWords(text);
  const sentenceCount = countSentences(text);
  const avgWordsPerSentence =
    sentenceCount > 0 ? wordCount / sentenceCount : wordCount;
  const { count: paragraphCount, longestWords: longestParagraphWords } =
    countParagraphs(text);

  // Reading time: ~200 words per minute, convert to seconds
  const readingTimeSeconds = (wordCount / 200) * 60;

  const redFlags = detectRedFlags(text);
  const weakPatterns = detectWeakPatterns(text);
  const fourUs = score4Us(text);

  // Calculate overall score (average of 4U's, penalized by red flags)
  const fourUsAvg =
    (fourUs.useful + fourUs.urgent + fourUs.unique + fourUs.ultraSpecific) / 4;
  const redFlagPenalty = Math.min(redFlags.length * 0.25, 1); // Max 1 point penalty
  const score = Math.max(fourUsAvg - redFlagPenalty, 1);

  const metrics = {
    wordCount,
    sentenceCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    readingTimeSeconds: Math.round(readingTimeSeconds * 10) / 10,
    paragraphCount,
    longestParagraphWords,
  };

  const recommendations = generateRecommendations(
    fourUs,
    redFlags,
    weakPatterns,
    metrics
  );

  return {
    score: Math.round(score * 10) / 10,
    maxScore: 4,
    pass: score >= 2.5 && redFlags.length === 0,
    redFlags,
    weakPatterns,
    metrics,
    fourUs,
    recommendations,
  };
}

// CLI
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage:");
    console.error('  npx tsx validate-copy.ts "Your copy here"');
    console.error("  npx tsx validate-copy.ts --file path/to/copy.txt");
    process.exit(1);
  }

  let text: string;

  if (args[0] === "--file") {
    if (!args[1]) {
      console.error("Error: --file requires a path argument");
      process.exit(1);
    }
    try {
      text = readFileSync(args[1], "utf-8");
    } catch (e) {
      console.error(`Error reading file: ${args[1]}`);
      process.exit(1);
    }
  } else {
    text = args.join(" ");
  }

  const result = validateCopy(text);
  console.log(JSON.stringify(result, null, 2));

  // Exit with appropriate code
  process.exit(result.pass ? 0 : 1);
}

main();
