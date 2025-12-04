# Instruction Patterns

How to write effective instructions for AI agents.

## Core Principles

### 1. Claude is Already Smart

Claude knows how to code, write, analyze, and reason. Don't waste tokens explaining basics.

**Focus on what Claude doesn't know:**
- Proprietary formats and schemas
- Business-specific logic and rules
- Required sequences and dependencies
- Project-specific conventions

**The token cost test**: For every sentence, ask: "Does this justify its token cost?" If Claude already knows it, delete it.

```markdown
<!-- BAD: Explaining the obvious -->
Python is a programming language that can execute scripts. 
To run a Python script, you use the python command.

<!-- GOOD: Just the unique information -->
Run: `python scripts/sync.py --env production`
```

### 2. Match Specificity to Fragility

Different operations need different levels of instruction detail:

| Fragility | Characteristics | Instruction Style |
|-----------|-----------------|-------------------|
| **Low** | Multiple valid approaches, context-dependent | Prose guidelines |
| **Medium** | Preferred pattern exists, some variation OK | Pseudocode, parameters |
| **High** | Must be exact, consistency critical | Exact scripts, strict templates |

**Examples:**

```markdown
<!-- LOW FRAGILITY: Writing a commit message -->
Write a concise commit message that explains the "why" not the "what".

<!-- MEDIUM FRAGILITY: Creating a config file -->
Create config.json with these fields:
- `apiUrl`: string, the API endpoint
- `timeout`: number, milliseconds (default: 5000)
- `retries`: number, max retry attempts (default: 3)

<!-- HIGH FRAGILITY: Database migration -->
Run exactly:
```bash
npx prisma migrate deploy --preview-feature
```
Do NOT run `prisma migrate dev` in production.
```

### 3. Show, Don't Tell

Concrete examples beat abstract descriptions every time.

```markdown
<!-- BAD: Abstract description -->
Format the output in a structured way that includes relevant metadata.

<!-- GOOD: Concrete example -->
Output format:
```json
{
  "status": "success",
  "data": { ... },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}
```
```

**Use input/output pairs:**

```markdown
## Date Formatting

| Input | Output |
|-------|--------|
| `2024-01-15` | `January 15, 2024` |
| `2024-12-25` | `December 25, 2024` |
```

### 4. Progressive Disclosure

Structure information in layers:

| Layer | Purpose | Token Cost |
|-------|---------|------------|
| SKILL.md | Entry point, decision tree, common workflows | Always loaded |
| references/ | Detailed docs, API specs, edge cases | Loaded on demand |
| scripts/ | Executed, not read | Zero tokens |

**Rules:**
- SKILL.md should be under 500 lines
- Move anything over 100 lines to references/
- Use clear "read this file" instructions for context loading

```markdown
## API Integration

For basic operations, see the examples below.

For the complete API reference including all endpoints and error codes,
read `references/api-docs.md` before proceeding.
```

---

## Instruction Patterns

### Pattern 1: Decision Tree

Use when the workflow has branches based on user intent.

```markdown
## Workflow

**What are you trying to do?**

| Goal | Action |
|------|--------|
| Create new | Go to Section A |
| Edit existing | Go to Section B |
| Delete | Go to Section C |
| Debug issues | Go to Section D |
```

**When to use:** Start of SKILL.md, choosing between workflows, error recovery paths.

### Pattern 2: Checklist

Use for quality gates and prerequisites.

```markdown
## Before Deploying

Verify all conditions are met:

- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Team notified in #deployments
```

**When to use:** Before critical operations, validation steps, review processes.

### Pattern 3: Conditional Loading

Use when different variants need different details.

```markdown
## Cloud Provider Setup

Load the appropriate reference for your provider:

- **AWS**: Read `references/aws-setup.md`
- **GCP**: Read `references/gcp-setup.md`  
- **Azure**: Read `references/azure-setup.md`

Then return here for common configuration.
```

**When to use:** Multi-variant workflows, platform-specific details, optional features.

### Pattern 4: Error Recovery

Use for fragile operations that commonly fail.

```markdown
## Error Recovery

### "Connection refused" error

1. Check that the service is running: `docker ps | grep api`
2. Verify the port is correct in `.env`
3. Try restarting: `docker-compose restart api`
4. If still failing, check logs: `docker logs api --tail 100`

### "Authentication failed" error

1. Verify API key is set: `echo $API_KEY`
2. Check key hasn't expired in dashboard
3. Regenerate key if needed
```

**When to use:** External API calls, deployment scripts, database operations.

### Pattern 5: Mandatory Reading Gate

Use when context is critical before proceeding.

```markdown
## Before You Begin

**MANDATORY**: Read `references/data-model.md` completely before proceeding.
This contains the schema definitions you'll need for all operations below.

Do not set line limits when reading - you need the full context.
```

**When to use:** Complex schemas, critical business rules, security requirements.

---

## Workflow Patterns

### Sequential Workflows

For complex multi-step tasks, provide a numbered overview at the start of SKILL.md. This helps Claude understand the full process before diving into details:

```markdown
## Overview

Processing a document involves these steps:

1. Validate the input file (run validate.ts)
2. Extract content (run extract.ts)
3. Transform data (edit config, run transform.ts)
4. Generate output (run generate.ts)
5. Verify results (run verify.ts)

Each step must complete successfully before proceeding to the next.
```

**Benefits:**
- Claude sees the big picture before executing
- Users understand what to expect
- Makes it easy to resume after interruption

### Conditional Workflows

For tasks with branching logic, guide Claude through decision points explicitly:

```markdown
## Workflow

1. Determine the operation type:

   **Creating new content?** → Follow "Creation Workflow" below
   **Editing existing content?** → Follow "Editing Workflow" below
   **Deleting content?** → Follow "Deletion Workflow" below

2. After completing the appropriate workflow, proceed to "Verification" section.

---

## Creation Workflow

[Steps for creation...]

---

## Editing Workflow

[Steps for editing...]
```

**When to use:**
- Multiple valid paths through the skill
- User intent determines the approach
- Different operations share some common steps

### Checkpoint Pattern

For long-running or risky workflows, add explicit checkpoints:

```markdown
## Phase 1: Preparation

### Steps
1. [Step details...]
2. [Step details...]

### Checkpoint

Before proceeding to Phase 2, verify:
- [ ] All files backed up
- [ ] Test environment configured
- [ ] Dependencies installed

If any check fails, stop and resolve before continuing.

---

## Phase 2: Execution

[Only proceed after Phase 1 checkpoint passes...]
```

**When to use:**
- Deployments and migrations
- Destructive operations
- Multi-phase processes where early failure saves time

---

## Anti-Patterns

### 1. Explaining the Obvious

**Problem:** Wasting tokens on things Claude already knows.

```markdown
<!-- BAD -->
JSON is a data format that uses key-value pairs. It's commonly used 
for configuration files and API responses. You can parse JSON in 
JavaScript using JSON.parse().

<!-- GOOD -->
[Just show the JSON structure you need]
```

### 2. Vague Instructions

**Problem:** Ambiguous instructions lead to unpredictable behavior.

```markdown
<!-- BAD -->
Handle errors appropriately.
Make sure the output is formatted correctly.
Validate the input before processing.

<!-- GOOD -->
If FileNotFoundError: log the attempted path, suggest checking uploads/ directory.
Output as JSON with `status`, `data`, and `error` fields.
Validate: `email` matches /^[^@]+@[^@]+$/, `age` is integer 0-150.
```

### 3. Redundant Context

**Problem:** Same information in multiple places leads to inconsistency.

```markdown
<!-- BAD -->
# SKILL.md
The API uses OAuth2 with refresh tokens...

# references/api.md  
Authentication is done via OAuth2 refresh tokens...

<!-- GOOD -->
# SKILL.md
For authentication details, see `references/api.md#authentication`.

# references/api.md
[Single source of truth for auth]
```

### 4. Over-Constraining

**Problem:** Specifying unnecessary details limits Claude's adaptability.

```markdown
<!-- BAD -->
Create a variable called `userData` of type `interface UserData`. 
Then create a function called `processUserData` that takes `userData` 
as its first parameter and returns a `ProcessedUser` object.

<!-- GOOD -->
Parse the user input and return processed data with these fields:
- `id`: string
- `name`: string (normalized)
- `email`: string (lowercase)
```

### 5. Under-Constraining

**Problem:** Too little detail for fragile operations.

```markdown
<!-- BAD -->
Generate a Kubernetes deployment manifest.

<!-- GOOD -->
Generate a Kubernetes deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{service-name}}
  namespace: {{namespace}}
spec:
  replicas: {{replicas}}
  selector:
    matchLabels:
      app: {{service-name}}
  template:
    metadata:
      labels:
        app: {{service-name}}
    spec:
      containers:
      - name: {{service-name}}
        image: {{image}}
        ports:
        - containerPort: {{port}}
```
```

### 6. Wall of Text

**Problem:** Long explanations that could be summarized or moved to references.

```markdown
<!-- BAD -->
[500 words explaining OAuth2 flow]

<!-- GOOD -->
We use OAuth2 with refresh tokens. The flow:
1. User authenticates → receives access + refresh tokens
2. Access token expires after 1 hour
3. Use refresh token to get new access token

For implementation details, see `references/auth-flow.md`.
```

---

## Writing Descriptions

The `description` field is the only trigger mechanism. Make it count.

### Formula

```
[What it does] + [When to use with specific triggers]
```

### Checklist

- [ ] Mentions specific file types/formats if applicable
- [ ] Lists 2-3 numbered trigger scenarios
- [ ] Uses action verbs (creating, editing, analyzing, deploying)
- [ ] Under 1024 characters
- [ ] No angle brackets (< or >)

### Examples

```yaml
# WEAK
description: Helps with deployments

# STRONG  
description: >
  Deploy applications to AWS ECS. Use when: (1) Deploying new versions
  to staging or production, (2) Rolling back failed deployments,
  (3) Scaling services up or down, (4) Checking deployment status.

# WEAK
description: Works with documents

# STRONG
description: >
  Create and edit Word documents (.docx). Use when: (1) Creating new 
  documents from templates, (2) Modifying existing document content,
  (3) Extracting text from documents, (4) Converting document formats.
```
