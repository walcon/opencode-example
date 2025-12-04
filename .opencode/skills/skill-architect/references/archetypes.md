# Skill Archetypes

Four common patterns for organizing skills. Choose based on your use case.

---

## 1. Workflow Skill

**Use when:** Multi-step processes with clear sequence and decision points.

**Characteristics:**
- Decision tree at the top
- Ordered steps within each workflow
- Checkpoints and validation between steps
- Error recovery for each phase

**Examples:** Deployment pipelines, document processing, data migrations

### Structure

```
workflow-skill/
├── SKILL.md
│   ├── Quick Start (most common path)
│   ├── Workflow Decision Tree
│   ├── Workflow A (steps 1-N)
│   ├── Workflow B (steps 1-N)
│   ├── Workflow C (steps 1-N)
│   └── Error Recovery
├── scripts/
│   ├── pre-check.ts
│   ├── execute.ts
│   └── rollback.ts
└── references/
    └── troubleshooting.md
```

### SKILL.md Template

```markdown
---
name: my-workflow
description: >
  [Process description]. Use when: (1) [Starting the process],
  (2) [Resuming after failure], (3) [Checking status].
---

# My Workflow

[One-line summary]

## Quick Start

For the standard workflow:
1. Run pre-checks: `npx tsx scripts/pre-check.ts`
2. Execute: `npx tsx scripts/execute.ts`
3. Verify: [verification step]

## Workflow

**What's your situation?**

| Situation | Go to |
|-----------|-------|
| Starting fresh | Phase 1 |
| Resuming after error | Error Recovery |
| Need to rollback | Rollback Procedure |

---

## Phase 1: Preparation

### Prerequisites
- [ ] [Condition 1]
- [ ] [Condition 2]

### Steps
1. [Step with details]
2. [Step with details]

### Checkpoint
Before proceeding, verify:
- [Verification 1]
- [Verification 2]

---

## Phase 2: Execution
[Similar structure]

---

## Error Recovery

### [Error Type 1]
[Diagnosis and fix]

### [Error Type 2]
[Diagnosis and fix]
```

---

## 2. Tool Collection Skill

**Use when:** Related operations with no fixed order, user picks what they need.

**Characteristics:**
- Quick reference at the top
- Operations grouped by category
- Each operation is independent
- Shared setup/authentication section

**Examples:** API clients, file converters, database utilities

### Structure

```
tool-collection/
├── SKILL.md
│   ├── Quick Reference (table of operations)
│   ├── Setup/Authentication
│   ├── Category A Operations
│   ├── Category B Operations
│   └── Common Options
├── scripts/
│   ├── operation-a.ts
│   ├── operation-b.ts
│   └── operation-c.ts
└── references/
    ├── api-reference.md
    └── examples.md
```

### SKILL.md Template

```markdown
---
name: my-tools
description: >
  [Tool collection description]. Use when: (1) [Operation type 1],
  (2) [Operation type 2], (3) [Operation type 3].
---

# My Tools

[One-line summary]

## Quick Reference

| Operation | Command | Description |
|-----------|---------|-------------|
| List | `npx tsx scripts/list.ts` | List all items |
| Get | `npx tsx scripts/get.ts <id>` | Get item details |
| Create | `npx tsx scripts/create.ts <json>` | Create new item |
| Update | `npx tsx scripts/update.ts <id> <json>` | Update item |
| Delete | `npx tsx scripts/delete.ts <id>` | Delete item |

## Setup

### Authentication

Required environment variables:
- `API_KEY` - Your API key from [dashboard]
- `API_URL` - API endpoint (default: https://api.example.com)

### Verification

Test your setup:
```bash
npx tsx scripts/list.ts --limit 1
```

---

## Read Operations

### List Items
[Details and examples]

### Get Item
[Details and examples]

### Search
[Details and examples]

---

## Write Operations

### Create Item
[Details and examples]

### Update Item
[Details and examples]

### Delete Item
[Details and examples]

---

## Common Options

All scripts support:
- `--format json|table` - Output format
- `--verbose` - Show detailed output
- `--dry-run` - Preview without executing
```

---

## 3. Guidelines Skill

**Use when:** Standards, policies, or rules that guide behavior rather than execute operations.

**Characteristics:**
- Principles/rules at the top
- Detailed specifications
- Good/bad examples
- No scripts (knowledge only)

**Examples:** Brand guidelines, coding standards, security policies

### Structure

```
guidelines-skill/
├── SKILL.md
│   ├── Core Principles
│   ├── Specification Category A
│   ├── Specification Category B
│   └── Examples (good/bad)
├── references/
│   ├── detailed-specs.md
│   └── exceptions.md
└── assets/
    ├── approved-examples/
    └── templates/
```

### SKILL.md Template

```markdown
---
name: my-guidelines
description: >
  [Guidelines description]. Use when: (1) [Creating content type],
  (2) [Reviewing content type], (3) [Checking compliance].
---

# My Guidelines

[One-line summary of what these guidelines ensure]

## Core Principles

1. **[Principle 1]** - [Brief explanation]
2. **[Principle 2]** - [Brief explanation]
3. **[Principle 3]** - [Brief explanation]

---

## [Category A] Specifications

### Rule 1: [Rule Name]

[Explanation]

| Do | Don't |
|----|-------|
| [Good example] | [Bad example] |
| [Good example] | [Bad example] |

### Rule 2: [Rule Name]

[Explanation with examples]

---

## [Category B] Specifications

[Similar structure]

---

## Examples

### Good Examples

#### [Example 1 Name]
```
[Example content]
```
**Why it works:** [Explanation]

#### [Example 2 Name]
```
[Example content]
```
**Why it works:** [Explanation]

### Bad Examples

#### [Anti-example 1]
```
[Bad content]
```
**Problem:** [What's wrong]
**Fix:** [How to correct]

---

## Exceptions

For edge cases and exceptions, see `references/exceptions.md`.
```

---

## 4. Integration Skill

**Use when:** Connecting to external APIs or services with authentication and structured operations.

**Characteristics:**
- Authentication setup is prominent
- Operations map to API endpoints
- Error handling for network/API failures
- Rate limiting considerations

**Examples:** Stripe, Jira, AWS, database connectors

### Structure

```
integration-skill/
├── SKILL.md
│   ├── Setup & Authentication
│   ├── Core Operations
│   ├── Error Handling
│   └── Rate Limits
├── scripts/
│   ├── lib/
│   │   └── client.ts (shared API client)
│   ├── operation-a.ts
│   └── operation-b.ts
└── references/
    ├── api-reference.md
    └── error-codes.md
```

### SKILL.md Template

```markdown
---
name: my-integration
description: >
  Integrate with [Service Name]. Use when: (1) [Operation 1],
  (2) [Operation 2], (3) [Operation 3], (4) [Debugging issues].
---

# My Integration

Connect to [Service] via REST API.

## Setup

### Prerequisites

- [Service] account with API access
- API credentials from [where to get them]

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SERVICE_API_KEY` | Yes | API key from dashboard |
| `SERVICE_URL` | No | API URL (default: https://api.service.com) |

### Verification

```bash
npx tsx scripts/health-check.ts
```

Expected output: `Connected to [Service] (version X.X)`

---

## Core Operations

### [Operation 1]

```bash
npx tsx scripts/operation.ts <args>
```

**Arguments:**
- `arg1` - [Description]

**Example:**
```bash
npx tsx scripts/operation.ts "example-value"
```

**Response:**
```json
{
  "id": "...",
  "status": "success"
}
```

### [Operation 2]

[Similar structure]

---

## Error Handling

### Authentication Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid API key | Check `SERVICE_API_KEY` is set correctly |
| `403 Forbidden` | Insufficient permissions | Upgrade plan or request access |

### API Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `429 Too Many Requests` | Rate limited | Wait and retry (see Rate Limits) |
| `500 Internal Server Error` | Service issue | Retry after 30 seconds |

---

## Rate Limits

- **Standard tier:** 100 requests/minute
- **Pro tier:** 1000 requests/minute

The scripts automatically retry with exponential backoff on 429 errors.

For batch operations, use `--batch-size 10 --delay 1000` to stay under limits.
```

---

## Choosing an Archetype

| If you need... | Use |
|----------------|-----|
| Sequential steps with checkpoints | Workflow |
| Independent operations, pick-and-choose | Tool Collection |
| Rules and standards (no execution) | Guidelines |
| External service connection | Integration |

Many skills combine aspects of multiple archetypes. Start with the primary pattern and incorporate elements from others as needed.
