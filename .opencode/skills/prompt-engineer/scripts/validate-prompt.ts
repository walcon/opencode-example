#!/usr/bin/env npx tsx

/**
 * Validate a prompt file for structure, content, and quality
 *
 * Usage:
 *   npx tsx scripts/validate-prompt.ts <path-to-prompt.md>
 *
 * Example:
 *   npx tsx scripts/validate-prompt.ts prompts/summarize-article.md
 *
 * Exit codes:
 *   0 - All checks passed
 *   1 - Errors found (must fix)
 *   2 - Warnings only (review recommended)
 */

import * as fs from "fs";
import * as path from "path";

// Type definitions
interface Frontmatter {
  name?: string;
  description?: string;
  version?: string;
  [key: string]: unknown;
}

interface ValidationResult {
  errors: string[];
  warnings: string[];
  info: string[];
}

// Simple token estimation
// Uses a basic approximation: ~4 characters per token for English text
// This is a fallback if js-tiktoken is not available
function estimateTokens(text: string): number {
  // More accurate estimation based on common tokenizer behavior:
  // - Words average ~1.3 tokens
  // - Punctuation and special chars are often separate tokens
  // - Whitespace is usually merged with adjacent tokens

  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const punctuation = (text.match(/[.,!?;:'"()\[\]{}]/g) || []).length;

  // Rough estimate: words * 1.3 + punctuation
  return Math.ceil(words.length * 1.3 + punctuation * 0.5);
}

// Try to use js-tiktoken for accurate token counting
async function countTokens(text: string): Promise<number> {
  try {
    // Dynamic import to handle missing dependency gracefully
    const { getEncoding } = await import("js-tiktoken");
    const enc = getEncoding("cl100k_base");
    const tokens = enc.encode(text);
    return tokens.length;
  } catch {
    // Fall back to estimation if js-tiktoken is not installed
    return estimateTokens(text);
  }
}

// Parse YAML frontmatter from markdown
function parseFrontmatter(content: string): {
  frontmatter: Frontmatter | null;
  body: string;
  error?: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: null,
      body: content,
      error: "No YAML frontmatter found. File should start with ---",
    };
  }

  const yamlContent = match[1];
  const body = match[2];

  try {
    // Simple YAML parser for basic key-value pairs
    const frontmatter: Frontmatter = {};
    const lines = yamlContent.split("\n");

    let currentKey: string | null = null;
    let multilineValue = "";

    for (const line of lines) {
      // Skip empty lines
      if (line.trim() === "") continue;

      // Check for multiline continuation (starts with whitespace)
      if (currentKey && /^\s+/.test(line)) {
        multilineValue += " " + line.trim();
        continue;
      }

      // Save previous multiline value
      if (currentKey && multilineValue) {
        frontmatter[currentKey] = multilineValue.trim();
        currentKey = null;
        multilineValue = "";
      }

      // Parse key: value
      const keyMatch = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
      if (keyMatch) {
        const [, key, value] = keyMatch;

        // Check for multiline indicator (> or |)
        if (value === ">" || value === "|") {
          currentKey = key;
          multilineValue = "";
        } else if (value) {
          frontmatter[key] = value.replace(/^['"]|['"]$/g, "");
        } else {
          currentKey = key;
          multilineValue = "";
        }
      }
    }

    // Handle final multiline value
    if (currentKey && multilineValue) {
      frontmatter[currentKey] = multilineValue.trim();
    }

    return { frontmatter, body };
  } catch (err) {
    return {
      frontmatter: null,
      body: content,
      error: `Failed to parse YAML frontmatter: ${err}`,
    };
  }
}

// Check for required sections in the prompt body
function checkRequiredSections(body: string): {
  found: string[];
  missing: string[];
} {
  const requiredPatterns = [
    { name: "role/identity", pattern: /<role>|^#\s*Role|^You are/im },
    {
      name: "instructions",
      pattern: /<instructions>|^#\s*Instructions|^##\s*Instructions/im,
    },
    { name: "output format", pattern: /<output>|^#\s*Output|^##\s*Output/im },
  ];

  const found: string[] = [];
  const missing: string[] = [];

  for (const { name, pattern } of requiredPatterns) {
    if (pattern.test(body)) {
      found.push(name);
    } else {
      missing.push(name);
    }
  }

  return { found, missing };
}

// Check for anti-patterns
function checkAntiPatterns(body: string): string[] {
  const warnings: string[] = [];

  // Vague instructions
  const vaguePatterns = [
    /make it good/i,
    /be helpful/i,
    /do your best/i,
    /as needed/i,
    /when appropriate/i,
    /if necessary/i,
  ];

  for (const pattern of vaguePatterns) {
    if (pattern.test(body)) {
      warnings.push(
        `Vague instruction detected: "${body.match(pattern)?.[0]}". Be more specific.`
      );
    }
  }

  // Passive voice in instructions
  const passivePatterns = [
    /should be \w+ed/i,
    /are to be/i,
    /needs to be/i,
    /must be \w+ed/i,
  ];

  for (const pattern of passivePatterns) {
    if (pattern.test(body)) {
      warnings.push(
        `Passive voice detected: "${body.match(pattern)?.[0]}". Use imperative voice.`
      );
    }
  }

  // Unclosed XML tags
  const xmlTags = body.match(/<(\w+)>/g) || [];
  for (const openTag of xmlTags) {
    const tagName = openTag.slice(1, -1);
    const closeTag = `</${tagName}>`;
    if (!body.includes(closeTag)) {
      warnings.push(`Unclosed XML tag: ${openTag}`);
    }
  }

  // Undocumented variables
  const variables = body.match(/\{\{[^}]+\}\}/g) || [];
  for (const variable of variables) {
    // Check if variable has nearby documentation (within 100 chars before or after)
    const varIndex = body.indexOf(variable);
    const context = body.slice(
      Math.max(0, varIndex - 100),
      Math.min(body.length, varIndex + variable.length + 100)
    );

    // Look for documentation patterns
    const hasDoc =
      /\([^)]*\)|:.*(?:format|type|contains|represents)/i.test(context);
    if (!hasDoc && !variables.includes(variable + " ")) {
      // Only warn once per unique variable
      if (!warnings.some((w) => w.includes(variable))) {
        warnings.push(
          `Variable ${variable} may be undocumented. Consider adding description.`
        );
      }
    }
  }

  return [...new Set(warnings)]; // Deduplicate
}

// Validate prompt name format
function validateName(name: string): string | null {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    return `Name "${name}" is not kebab-case. Use lowercase letters, numbers, and hyphens only.`;
  }
  if (name.length < 3) {
    return `Name "${name}" is too short. Use at least 3 characters.`;
  }
  if (name.length > 50) {
    return `Name "${name}" is too long. Keep under 50 characters.`;
  }
  return null;
}

// Main validation function
async function validatePrompt(filePath: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
    info: [],
  };

  // Check file exists
  if (!fs.existsSync(filePath)) {
    result.errors.push(`File not found: ${filePath}`);
    return result;
  }

  // Read file
  const content = fs.readFileSync(filePath, "utf-8");
  result.info.push(`File size: ${content.length} characters`);

  // Parse frontmatter
  const { frontmatter, body, error } = parseFrontmatter(content);

  if (error) {
    result.errors.push(error);
  }

  if (!frontmatter) {
    result.errors.push("Could not parse frontmatter");
    return result;
  }

  // Validate required frontmatter fields
  if (!frontmatter.name) {
    result.errors.push("Missing required field: name");
  } else {
    const nameError = validateName(frontmatter.name);
    if (nameError) {
      result.errors.push(nameError);
    }
  }

  if (!frontmatter.description) {
    result.errors.push("Missing required field: description");
  } else if (
    typeof frontmatter.description === "string" &&
    frontmatter.description.length < 20
  ) {
    result.warnings.push(
      `Description is short (${frontmatter.description.length} chars). Aim for 20+ characters.`
    );
  }

  // Check required sections
  const { found, missing } = checkRequiredSections(body);
  result.info.push(`Sections found: ${found.join(", ") || "none"}`);

  for (const section of missing) {
    result.warnings.push(
      `Missing recommended section: ${section}. Consider adding <${section.split("/")[0]}> block.`
    );
  }

  // Check for anti-patterns
  const antiPatternWarnings = checkAntiPatterns(body);
  result.warnings.push(...antiPatternWarnings);

  // Token count
  const tokenCount = await countTokens(content);
  result.info.push(`Estimated tokens: ${tokenCount}`);

  if (tokenCount > 6000) {
    result.warnings.push(
      `High token count (${tokenCount}). Consider splitting or simplifying. Recommended: <4000.`
    );
  } else if (tokenCount > 4000) {
    result.warnings.push(
      `Token count (${tokenCount}) exceeds recommended limit of 4000. Review for efficiency.`
    );
  }

  // Check for examples
  if (!/<example>|^###?\s*Example/im.test(body)) {
    result.warnings.push(
      "No examples found. Consider adding <examples> section for better results."
    );
  }

  // Check for guardrails/edge cases
  if (!/<guardrails>|^###?\s*Guardrails|^###?\s*Edge|^###?\s*Constraints/im.test(body)) {
    result.warnings.push(
      "No guardrails/edge case handling found. Consider adding <guardrails> section."
    );
  }

  return result;
}

// CLI output formatting
function printResult(result: ValidationResult, filePath: string): number {
  const fileName = path.basename(filePath);

  console.log("");
  console.log(`Validating: ${fileName}`);
  console.log("=".repeat(50));

  // Info
  if (result.info.length > 0) {
    console.log("\nInfo:");
    for (const info of result.info) {
      console.log(`  ${info}`);
    }
  }

  // Errors
  if (result.errors.length > 0) {
    console.log("\nErrors (must fix):");
    for (const error of result.errors) {
      console.log(`  [x] ${error}`);
    }
  }

  // Warnings
  if (result.warnings.length > 0) {
    console.log("\nWarnings (review recommended):");
    for (const warning of result.warnings) {
      console.log(`  [!] ${warning}`);
    }
  }

  // Summary
  console.log("");
  if (result.errors.length > 0) {
    console.log(
      `Result: FAILED (${result.errors.length} errors, ${result.warnings.length} warnings)`
    );
    return 1;
  } else if (result.warnings.length > 0) {
    console.log(`Result: PASSED with warnings (${result.warnings.length})`);
    return 2;
  } else {
    console.log("Result: PASSED");
    return 0;
  }
}

// Main entry point
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Usage:");
    console.log("  npx tsx scripts/validate-prompt.ts <path-to-prompt.md>");
    console.log("");
    console.log("Example:");
    console.log("  npx tsx scripts/validate-prompt.ts prompts/summarize.md");
    console.log("");
    console.log("Exit codes:");
    console.log("  0 - All checks passed");
    console.log("  1 - Errors found (must fix)");
    console.log("  2 - Warnings only (review recommended)");
    process.exit(1);
  }

  const filePath = args[0];
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  const result = await validatePrompt(absolutePath);
  const exitCode = printResult(result, absolutePath);
  process.exit(exitCode);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
