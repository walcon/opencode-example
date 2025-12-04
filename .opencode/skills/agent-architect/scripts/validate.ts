#!/usr/bin/env npx tsx

/**
 * Validate an agent
 *
 * Usage:
 *   npx tsx scripts/validate.ts <path>
 *
 * Example:
 *   npx tsx scripts/validate.ts .opencode/agent/reviewer.md
 */

import * as fs from "fs";
import * as path from "path";

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

interface Frontmatter {
  description?: string;
  mode?: string;
  tools?: Record<string, boolean>;
  [key: string]: unknown;
}

function parseFrontmatter(content: string): {
  frontmatter: Frontmatter | null;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, body: content };
  }

  const yamlContent = match[1];
  const body = match[2];

  const frontmatter: Frontmatter = {};
  let currentKey = "";
  let multilineValue = "";
  let inMultiline = false;

  for (const line of yamlContent.split("\n")) {
    if (inMultiline) {
      if (line.startsWith("  ")) {
        multilineValue += line.trim() + " ";
      } else {
        frontmatter[currentKey] = multilineValue.trim();
        inMultiline = false;
      }
    }

    if (!inMultiline) {
      const keyMatch = line.match(/^(\w+):\s*(.*)$/);
      if (keyMatch) {
        const [, key, value] = keyMatch;
        if (value === ">" || value === "|") {
          currentKey = key;
          multilineValue = "";
          inMultiline = true;
        } else if (value === "") {
          frontmatter[key] = {};
        } else {
          let parsedValue: string | boolean = value;
          if (value === "true") parsedValue = true;
          else if (value === "false") parsedValue = false;
          else if (value.startsWith('"') && value.endsWith('"')) {
            parsedValue = value.slice(1, -1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            parsedValue = value.slice(1, -1);
          }
          frontmatter[key] = parsedValue;
        }
      }
    }
  }

  if (inMultiline) {
    frontmatter[currentKey] = multilineValue.trim();
  }

  return { frontmatter, body };
}

function validateAgent(agentPath: string): ValidationResult {
  const result: ValidationResult = { errors: [], warnings: [] };

  if (!fs.existsSync(agentPath)) {
    result.errors.push(`Agent file not found: ${agentPath}`);
    return result;
  }

  const content = fs.readFileSync(agentPath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter) {
    result.errors.push("Missing YAML frontmatter (must start with ---)");
    return result;
  }

  // Required field
  if (!frontmatter.description) {
    result.errors.push("Missing required field: description");
  }

  // Validate description
  if (frontmatter.description) {
    const desc = String(frontmatter.description);
    if (desc.length < 20) {
      result.errors.push(
        `Description too short (${desc.length} chars, minimum 20)`
      );
    }
    // Check for trigger language
    if (!desc.toLowerCase().includes("use when") && !desc.toLowerCase().includes("use for")) {
      result.warnings.push(
        'Description should include trigger scenarios (e.g., "Use when...")'
      );
    }
  }

  // Check filename format
  const fileName = path.basename(agentPath, ".md");
  if (!/^[a-z0-9-]+$/.test(fileName)) {
    result.warnings.push(
      `Filename should be kebab-case: ${fileName}.md`
    );
  }

  // Check for output format in body
  if (!body.toLowerCase().includes("output format") && 
      !body.toLowerCase().includes("# output") &&
      !body.toLowerCase().includes("## output")) {
    result.warnings.push(
      "Agent prompt should specify output format for structured results"
    );
  }

  // Check for constraints
  if (!body.toLowerCase().includes("constraint") && 
      !body.toLowerCase().includes("do not") &&
      !body.toLowerCase().includes("don't")) {
    result.warnings.push(
      "Consider adding constraints to prevent unwanted behaviors"
    );
  }

  // Check for role definition
  if (!body.toLowerCase().includes("you are")) {
    result.warnings.push(
      'Agent prompt should define role (e.g., "You are a...")'
    );
  }

  return result;
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Usage:");
    console.log("  npx tsx scripts/validate.ts <path>");
    console.log("");
    console.log("Example:");
    console.log("  npx tsx scripts/validate.ts .opencode/agent/reviewer.md");
    process.exit(1);
  }

  const targetPath = args[0];
  const result = validateAgent(targetPath);

  console.log(`Validating agent: ${targetPath}`);
  console.log("");

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log("✓ All checks passed");
    process.exit(0);
  }

  if (result.errors.length > 0) {
    console.log("ERRORS (must fix):");
    for (const error of result.errors) {
      console.log(`  ✗ ${error}`);
    }
    console.log("");
  }

  if (result.warnings.length > 0) {
    console.log("WARNINGS (should fix):");
    for (const warning of result.warnings) {
      console.log(`  ! ${warning}`);
    }
    console.log("");
  }

  if (result.errors.length > 0) {
    console.log(`Found ${result.errors.length} error(s)`);
    process.exit(1);
  } else {
    console.log(`Found ${result.warnings.length} warning(s), no errors`);
    process.exit(0);
  }
}

main();
