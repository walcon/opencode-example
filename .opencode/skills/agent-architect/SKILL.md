---
name: agent-architect
description: >
  Expert guide for creating OpenCode agents and subagents. Use when:
  (1) Creating specialized agents, (2) Designing multi-agent workflows,
  (3) Optimizing context with subagent delegation, (4) Setting tool permissions.
---

# Agent Architect

Create specialized OpenCode agents and subagents.

## Quick Start

| Goal | Action |
|------|--------|
| Create a new agent | `npx tsx scripts/init.ts <name>` |
| Validate existing agent | `npx tsx scripts/validate.ts <path>` |

## What is an Agent?

Agents are specialized AI personas with custom prompts, models, and tool access:

```markdown
---
description: What this agent does and when to use it
mode: subagent
tools:
  write: false
  bash: false
---

You are a [role] specialized in [domain]...
```

**Location:** `.opencode/agent/<name>.md`

### Primary vs Subagent

| Aspect | Primary Agent | Subagent |
|--------|---------------|----------|
| **Mode** | `mode: primary` | `mode: subagent` |
| **Invocation** | Tab to switch | `@agent-name` or auto-delegation |
| **Context** | Main conversation | Own isolated context |
| **Use case** | Main workflows | Delegated tasks |

---

## Why Subagents Matter

Subagents run in **isolated context windows**. This means:

1. **Context efficiency** - Heavy analysis doesn't bloat main conversation
2. **Focused expertise** - Specialized prompts for specific tasks
3. **Parallel execution** - Multiple subagents can run concurrently
4. **Clean results** - Returns only summary to orchestrator

### When to Use Subagents

| Task | Main Context | Subagent |
|------|--------------|----------|
| Quick question | ✓ | |
| Deep code analysis | | ✓ |
| Multi-file research | | ✓ |
| Content generation | | ✓ |
| Validation/review | | ✓ |
| Simple edits | ✓ | |

---

## Creating an Agent

### Step 1: Define Purpose

What specialized task will this agent perform? Be specific:
- "Review code for security vulnerabilities"
- "Write user-facing copy in brand voice"
- "Research technical topics without making changes"

### Step 2: Choose Mode

```yaml
mode: primary    # Tab-switchable main agent
mode: subagent   # Invoked via @name or delegation
```

Omit `mode` to make agent available as both.

### Step 3: Select Tools

Grant only necessary tools (principle of least privilege):

| Agent Type | Tools | Rationale |
|------------|-------|-----------|
| Reviewer | read, grep, glob | Analyze without modifying |
| Researcher | read, grep, glob, webfetch | Gather information |
| Writer | read, write, edit | Create content |
| Executor | read, write, edit, bash | Full access |

```yaml
tools:
  write: false
  edit: false
  bash: false
```

### Step 4: Configure Model (Optional)

```yaml
model: anthropic/claude-haiku-4-5    # Fast, cheap
model: anthropic/claude-sonnet-4-5   # Balanced
model: anthropic/claude-opus-4-5     # Complex reasoning
temperature: 0.3                      # Lower = consistent
```

### Step 5: Write the Prompt

The markdown body becomes the system prompt:

```markdown
# Role
You are a [specific role] specialized in [domain].

# Behavior
When given a task:
1. [First action]
2. [Second action]

# Output Format
Return results as:
- Summary: [one line]
- Details: [findings]
- Recommendations: [actions]

# Constraints
- [What NOT to do]
```

### Step 6: Scaffold

```bash
npx tsx scripts/init.ts <name>
```

### Step 7: Validate

```bash
npx tsx scripts/validate.ts .opencode/agent/<name>.md
```

---

## Agent Patterns

### Pattern 1: Specialist Team

Multiple focused agents orchestrated by main thread:

- `@code-reviewer` - Quality and security review
- `@architect` - Design decisions
- `@tester` - Test creation and validation

### Pattern 2: Research Delegation

Offload context-heavy research:

```
@explore Find all authentication-related files in the codebase
```

Subagent searches extensively; returns only relevant paths.

### Pattern 3: Content Generation

Delegate writing to specialized voice:

```
@copywriter Write a product description for the new feature
```

### Pattern 4: Parallel Analysis

Fan out for independent checks:

```
Run @security-checker and @style-checker in parallel
```

Each returns findings; main thread aggregates.

---

## Output Format

Always specify structured output in agent prompts:

```markdown
# Output Format

Return results as:

## Summary
[One-line finding]

## Issues
- [Issue 1]
- [Issue 2]

## Recommendations
- [Action 1]
- [Action 2]
```

This ensures the orchestrator receives minimal, actionable data.

---

## Common Mistakes

### Over-broad Agents

```yaml
# BAD
description: Helps with code

# GOOD
description: >
  Reviews code for security vulnerabilities. Use PROACTIVELY 
  after code changes to check for injection, auth, and data exposure.
```

### Too Many Tools

```yaml
# BAD - grants everything "just in case"
tools: {}

# GOOD - minimal for the task
tools:
  write: false
  edit: false
  bash: false
```

### Missing Output Format

```markdown
# BAD - returns unstructured prose
You are a code reviewer. Review the code.

# GOOD - structured response
You are a code reviewer.

Return findings as:
- Summary: [one line]
- Issues: [list with severity]
- Suggested fixes: [actionable items]
```

### Vague Description

```yaml
# BAD - won't auto-delegate correctly
description: Reviews things

# GOOD - clear triggers
description: >
  Security-focused code review. Use PROACTIVELY after changes
  to authentication, authorization, or data handling code.
```

---

## Scripts Reference

### init.ts

```bash
npx tsx scripts/init.ts code-reviewer
```

Creates `.opencode/agent/code-reviewer.md` with template.

### validate.ts

```bash
npx tsx scripts/validate.ts .opencode/agent/code-reviewer.md
```

**Errors**: Missing description, invalid frontmatter
**Warnings**: Weak description, missing output format

---

## Examples

See `references/examples/` for annotated agents:
- **code-reviewer.md** - Read-only analysis agent
- **researcher.md** - Research with web access
