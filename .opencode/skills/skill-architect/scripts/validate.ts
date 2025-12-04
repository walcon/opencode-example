#!/usr/bin/env npx tsx

/**
 * Validate a skill against the Anthropic Skills Specification
 *
 * Usage:
 *   npx tsx scripts/validate.ts <path>
 *
 * Example:
 *   npx tsx scripts/validate.ts .opencode/skills/my-tool
 */

import * as fs from "fs";
import * as path from "path";

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

interface Frontmatter {
  name?: string;
  description?: string;
  license?: string;
  "allowed-tools"?: string[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Allowed top-level frontmatter properties per Anthropic spec
const ALLOWED_PROPERTIES = new Set([
  "name",
  "description",
  "license",
  "allowed-tools",
  "metadata",
]);

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

function validateSkill(skillPath: string): ValidationResult {
  const result: ValidationResult = { errors: [], warnings: [] };
  const skillMdPath = path.join(skillPath, "SKILL.md");

  if (!fs.existsSync(skillMdPath)) {
    result.errors.push("Missing SKILL.md file");
    return result;
  }

  const content = fs.readFileSync(skillMdPath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter) {
    result.errors.push("Missing YAML frontmatter (must start with ---)");
    return result;
  }

  if (!frontmatter.name) {
    result.errors.push("Missing required field: name");
  }
  if (!frontmatter.description) {
    result.errors.push("Missing required field: description");
  }

  if (frontmatter.name) {
    const dirName = path.basename(skillPath);
    if (frontmatter.name !== dirName) {
      result.errors.push(
        `Name "${frontmatter.name}" doesn't match directory "${dirName}"`
      );
    }
    if (!/^[a-z0-9-]+$/.test(frontmatter.name)) {
      result.errors.push(
        `Name must be kebab-case (lowercase letters, numbers, hyphens only)`
      );
    }
    // Check for consecutive hyphens
    if (frontmatter.name.includes("--")) {
      result.errors.push(`Name cannot contain consecutive hyphens (--)`);
    }
    // Check for leading/trailing hyphens
    if (frontmatter.name.startsWith("-") || frontmatter.name.endsWith("-")) {
      result.errors.push(`Name cannot start or end with a hyphen`);
    }
    // Check max length (per Anthropic spec)
    if (frontmatter.name.length > 64) {
      result.errors.push(
        `Name too long (${frontmatter.name.length} chars, max 64)`
      );
    }
  }

  if (frontmatter.description) {
    const desc = String(frontmatter.description);
    if (desc.length < 20) {
      result.errors.push(
        `Description too short (${desc.length} chars, minimum 20)`
      );
    }
    if (desc.length > 1024) {
      result.errors.push(
        `Description too long (${desc.length} chars, max 1024)`
      );
    }
    // Angle brackets are an error per Anthropic spec
    if (desc.includes("<") || desc.includes(">")) {
      result.errors.push(
        "Description cannot contain angle brackets (< or >)"
      );
    }
    if (!/\(\d\)/.test(desc)) {
      result.warnings.push(
        'Description missing numbered trigger scenarios (e.g., "(1) Creating..., (2) Editing...")'
      );
    }
  }

  // Check for unexpected frontmatter properties
  for (const key of Object.keys(frontmatter)) {
    if (!ALLOWED_PROPERTIES.has(key)) {
      result.errors.push(
        `Unexpected frontmatter property: "${key}". Allowed: ${[...ALLOWED_PROPERTIES].join(", ")}`
      );
    }
  }

  const lineCount = content.split("\n").length;
  if (lineCount > 500) {
    result.warnings.push(
      `SKILL.md is ${lineCount} lines (recommended < 500). Consider moving content to references/`
    );
  }

  // Check for referenced files in body
  const refPattern = /`references\/[^`]+`/g;
  const matches = body.match(refPattern) || [];
  for (const ref of matches) {
    const refPath = ref.replace(/`/g, "");
    const fullPath = path.join(skillPath, refPath);
    if (!fs.existsSync(fullPath)) {
      result.warnings.push(`Referenced file not found: ${refPath}`);
    }
  }

  const scriptsDir = path.join(skillPath, "scripts");
  const referencesDir = path.join(skillPath, "references");

  if (fs.existsSync(scriptsDir)) {
    const scripts = fs.readdirSync(scriptsDir);
    if (scripts.length === 0) {
      result.warnings.push("scripts/ directory is empty");
    }
  }

  if (fs.existsSync(referencesDir)) {
    const refs = fs.readdirSync(referencesDir).filter(f => !fs.statSync(path.join(referencesDir, f)).isDirectory());
    if (refs.length === 0) {
      result.warnings.push("references/ directory is empty (excluding subdirs)");
    }
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
    console.log("  npx tsx scripts/validate.ts .opencode/skills/my-tool");
    process.exit(1);
  }

  const targetPath = args[0];
  const result = validateSkill(targetPath);

  console.log(`Validating skill: ${targetPath}`);
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
