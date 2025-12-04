#!/usr/bin/env npx tsx

/**
 * Initialize a new agent
 *
 * Usage:
 *   npx tsx scripts/init.ts <name>
 *
 * Example:
 *   npx tsx scripts/init.ts code-reviewer
 */

import * as fs from "fs";
import * as path from "path";

const AGENT_TEMPLATE = `---
description: >
  [What this agent does]. Use when: [specific trigger scenarios].
mode: subagent
tools:
  write: false
  edit: false
  bash: false
---

# Role

You are a [specific role] specialized in [domain].

# Expertise

You have deep knowledge of:
- [Area 1]
- [Area 2]
- [Area 3]

# Behavior

When given a task:

1. [First action to take]
2. [Second action to take]
3. [Third action to take]

# Output Format

## Summary
[One-line finding]

## Details
[Structured findings]

## Recommendations
- [Actionable item 1]
- [Actionable item 2]

# Constraints

- [What NOT to do]
- [Limitation to respect]
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
    console.log("  npx tsx scripts/init.ts code-reviewer");
    process.exit(1);
  }

  const name = args[0];
  const kebabName = kebabCase(name);
  const agentDir = path.join(process.cwd(), ".opencode", "agent");
  const agentFile = path.join(agentDir, `${kebabName}.md`);

  if (!fs.existsSync(agentDir)) {
    fs.mkdirSync(agentDir, { recursive: true });
  }

  if (fs.existsSync(agentFile)) {
    console.error(`Error: Agent already exists: ${agentFile}`);
    process.exit(1);
  }

  fs.writeFileSync(agentFile, AGENT_TEMPLATE);

  console.log(`Created agent: ${agentFile}`);
  console.log("");
  console.log("Next steps:");
  console.log(`  1. Edit ${agentFile}`);
  console.log("     - Update the description with trigger scenarios");
  console.log("     - Define the role and expertise");
  console.log("     - Set appropriate tool permissions");
  console.log("     - Specify the output format");
  console.log("");
  console.log(`  2. Validate: npx tsx scripts/validate.ts ${agentFile}`);
  console.log("");
  console.log(`  3. Invoke with: @${kebabName} <task>`);
}

main();
