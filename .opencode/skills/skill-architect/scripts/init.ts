#!/usr/bin/env npx tsx

/**
 * Initialize a new skill
 *
 * Usage:
 *   npx tsx scripts/init.ts <name>
 *
 * Example:
 *   npx tsx scripts/init.ts my-tool
 */

import * as fs from "fs";
import * as path from "path";

const SKILL_TEMPLATE = `---
name: {{NAME}}
description: >
  [What this skill does]. Use when: (1) [First trigger scenario], 
  (2) [Second trigger scenario], (3) [Third trigger scenario].
---

# {{NAME}}

[One-sentence summary of what this skill does.]

## Quick Start

[Most common operation - get users productive immediately]

\`\`\`bash
npx tsx scripts/main.ts <args>
\`\`\`

## Workflow

**What are you trying to do?**

| Goal | Go to |
|------|-------|
| [First option] | Section A |
| [Second option] | Section B |

---

## Section A: [First Workflow]

### Steps

1. [First step]
2. [Second step]

---

## Section B: [Second Workflow]

### Steps

1. [First step]
2. [Second step]

---

## Scripts Reference

### main.ts

[What it does]

\`\`\`bash
npx tsx scripts/main.ts <required-arg>
\`\`\`
`;

function kebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("Usage:");
    console.log("  npx tsx scripts/init.ts <name>");
    console.log("");
    console.log("Example:");
    console.log("  npx tsx scripts/init.ts my-api-client");
    process.exit(1);
  }

  const name = args[0];
  const kebabName = kebabCase(name);
  const skillDir = path.join(process.cwd(), ".opencode", "skills", kebabName);

  if (fs.existsSync(skillDir)) {
    console.error(`Error: Skill directory already exists: ${skillDir}`);
    process.exit(1);
  }

  // Create directory structure
  fs.mkdirSync(path.join(skillDir, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(skillDir, "references"), { recursive: true });

  // Write SKILL.md
  const skillContent = SKILL_TEMPLATE.replace(/\{\{NAME\}\}/g, kebabName);
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), skillContent);

  // Write placeholder script
  const scriptContent = `#!/usr/bin/env npx tsx

/**
 * Main script for ${kebabName}
 *
 * Usage:
 *   npx tsx scripts/main.ts <args>
 */

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: npx tsx scripts/main.ts <args>");
  process.exit(1);
}

// TODO: Implement your script logic here
console.log("Arguments:", args);
`;
  fs.writeFileSync(path.join(skillDir, "scripts", "main.ts"), scriptContent);

  console.log(`Created skill: ${skillDir}`);
  console.log("");
  console.log("Next steps:");
  console.log(`  1. Edit ${path.join(skillDir, "SKILL.md")}`);
  console.log("     - Update the description with specific trigger scenarios");
  console.log("     - Fill in workflows and instructions");
  console.log("");
  console.log(`  2. Implement ${path.join(skillDir, "scripts", "main.ts")}`);
  console.log("");
  console.log(`  3. Validate: npx tsx scripts/validate.ts ${skillDir}`);
}

main();
