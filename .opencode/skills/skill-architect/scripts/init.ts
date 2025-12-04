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

function toTitleCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const SKILL_TEMPLATE = `---
name: {{NAME}}
description: >
  [TODO: Complete description of what this skill does and when to use it.
  Include specific trigger scenarios like: Use when: (1) [First scenario],
  (2) [Second scenario], (3) [Third scenario].]
---

# {{TITLE}}

## Overview

[TODO: 1-2 sentences explaining what this skill enables]

## Structuring This Skill

[TODO: Choose the structure pattern that best fits this skill's purpose.
Delete this entire section when done - it's guidance only.]

**Pattern 1: Workflow-Based** (best for sequential processes)
- Use when there are clear step-by-step procedures
- Structure: Overview → Decision Tree → Phase 1 → Phase 2 → Phase 3...
- Example: Deployment pipelines, document processing, data migrations

**Pattern 2: Task-Based** (best for tool collections)
- Use when the skill offers different independent operations
- Structure: Overview → Quick Reference → Task Category 1 → Task Category 2...
- Example: API clients, file converters, database utilities

**Pattern 3: Reference/Guidelines** (best for standards or specifications)
- Use when the skill defines rules rather than executing operations
- Structure: Overview → Core Principles → Specifications → Examples
- Example: Brand guidelines, coding standards, security policies

**Pattern 4: Integration** (best for external service connections)
- Use when connecting to APIs with authentication and structured operations
- Structure: Setup & Auth → Core Operations → Error Handling → Rate Limits
- Example: Stripe, Jira, AWS connectors

Most skills combine patterns. Start with the primary pattern and incorporate
elements from others as needed.

---

## Quick Start

[TODO: Show the most common operation to get users productive immediately]

\`\`\`bash
npx tsx scripts/main.ts <args>
\`\`\`

## Workflow

**What are you trying to do?**

| Goal | Go to |
|------|-------|
| [First option] | Section A |
| [Second option] | Section B |
| [Debug issues] | Troubleshooting |

---

## Section A: [First Workflow]

### Prerequisites

- [ ] [Required condition 1]
- [ ] [Required condition 2]

### Steps

1. [First step with details]
2. [Second step with details]

### Checkpoint

Before proceeding, verify:
- [Verification 1]
- [Verification 2]

---

## Section B: [Second Workflow]

### Steps

1. [First step]
2. [Second step]

---

## Troubleshooting

### [Common Error 1]

1. Check [likely cause]
2. Try [solution]
3. If still failing, [escalation path]

---

## Scripts Reference

### main.ts

[What it does and when to use it]

\`\`\`bash
npx tsx scripts/main.ts <required-arg> [optional-arg]
\`\`\`

**Arguments:**
- \`required-arg\` - [Description]
- \`optional-arg\` - [Description, default value]

---

## Resources

This skill includes resource directories for organizing bundled content:

### scripts/
Executable code that performs specific operations. Scripts execute without
loading into context (zero token cost).

**Appropriate for:** Automation, data processing, API calls, file operations.

### references/
Documentation loaded into context on demand. Use for content over 100 lines.

**Appropriate for:** API docs, schemas, detailed guides, comprehensive specs.

### assets/
Files used in output, not loaded into context.

**Appropriate for:** Templates, images, fonts, boilerplate code.

Delete any directories not needed for this skill.
`;

const SCRIPT_TEMPLATE = `#!/usr/bin/env npx tsx

/**
 * Main script for {{NAME}}
 *
 * This is a placeholder script. Replace with actual implementation.
 *
 * Usage:
 *   npx tsx scripts/main.ts <args>
 *
 * Examples from other skills:
 *   - API integration: fetch data, handle auth, manage rate limits
 *   - File processing: read, transform, write files
 *   - Automation: run commands, check status, report results
 */

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Usage: npx tsx scripts/main.ts <args>");
  console.log("");
  console.log("Examples:");
  console.log("  npx tsx scripts/main.ts --help");
  console.log("  npx tsx scripts/main.ts <input-file>");
  process.exit(1);
}

// TODO: Implement your script logic here
console.log("{{TITLE}} - Arguments:", args);
`;

const REFERENCE_TEMPLATE = `# Reference Documentation

[TODO: Add detailed reference content here. This file is loaded into context
only when Claude determines it's needed, keeping the main SKILL.md lean.]

## When to Use Reference Files

Reference files are ideal for:
- Comprehensive API documentation
- Detailed workflow guides
- Complex multi-step procedures
- Database schemas and data models
- Content too lengthy for main SKILL.md

## Structure Suggestions

### For API References
- Overview
- Authentication
- Endpoints with examples
- Error codes
- Rate limits

### For Workflow Guides
- Prerequisites
- Step-by-step instructions
- Common patterns
- Troubleshooting
- Best practices

Delete this file if not needed, or replace with actual reference content.
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
    console.log("Skill name requirements:");
    console.log("  - Kebab-case (lowercase letters, digits, hyphens)");
    console.log("  - Max 64 characters");
    console.log("  - No consecutive hyphens (--)");
    console.log("");
    console.log("Example:");
    console.log("  npx tsx scripts/init.ts my-api-client");
    process.exit(1);
  }

  const name = args[0];
  const kebabName = kebabCase(name);
  const titleName = toTitleCase(kebabName);
  const skillDir = path.join(process.cwd(), ".opencode", "skills", kebabName);

  if (fs.existsSync(skillDir)) {
    console.error(`Error: Skill directory already exists: ${skillDir}`);
    process.exit(1);
  }

  // Create directory structure
  fs.mkdirSync(path.join(skillDir, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(skillDir, "references"), { recursive: true });
  fs.mkdirSync(path.join(skillDir, "assets"), { recursive: true });

  // Write SKILL.md
  const skillContent = SKILL_TEMPLATE.replace(/\{\{NAME\}\}/g, kebabName).replace(
    /\{\{TITLE\}\}/g,
    titleName
  );
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), skillContent);
  console.log("  Created SKILL.md");

  // Write placeholder script
  const scriptContent = SCRIPT_TEMPLATE.replace(/\{\{NAME\}\}/g, kebabName).replace(
    /\{\{TITLE\}\}/g,
    titleName
  );
  fs.writeFileSync(path.join(skillDir, "scripts", "main.ts"), scriptContent);
  console.log("  Created scripts/main.ts");

  // Write placeholder reference
  const referenceContent = REFERENCE_TEMPLATE;
  fs.writeFileSync(
    path.join(skillDir, "references", "guide.md"),
    referenceContent
  );
  console.log("  Created references/guide.md");

  console.log("");
  console.log(`Created skill: ${skillDir}`);
  console.log("");
  console.log("Next steps:");
  console.log(`  1. Edit SKILL.md`);
  console.log("     - Update description with specific trigger scenarios");
  console.log("     - Choose a structure pattern and delete the guidance section");
  console.log("     - Fill in workflows and instructions");
  console.log("");
  console.log(`  2. Implement scripts/main.ts or delete if not needed`);
  console.log("");
  console.log(`  3. Add reference docs or delete references/guide.md`);
  console.log("");
  console.log(`  4. Validate: npx tsx .opencode/skills/skill-architect/scripts/validate.ts ${skillDir}`);
}

main();
