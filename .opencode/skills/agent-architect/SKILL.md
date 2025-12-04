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

## Permission Patterns

OpenCode supports granular bash command permissions. Use these patterns for fine-grained control.

### Permission Levels

| Level | Behavior |
|-------|----------|
| `allow` | Execute without approval |
| `ask` | Prompt for approval |
| `deny` | Block the command entirely |

### Read-Only Agent

```yaml
---
description: Code analyzer that never modifies files
mode: subagent
tools:
  write: false
  edit: false
  bash: false
---
```

### Git-Allowed Agent

Allow git read commands, require approval for writes:

```yaml
---
description: Git operations specialist
mode: subagent
permission:
  bash:
    "git status": allow
    "git diff": allow
    "git log*": allow
    "git show*": allow
    "git branch*": ask
    "git checkout*": ask
    "git push*": ask
    "git commit*": ask
    "*": deny
---
```

### Package Management Agent

```yaml
---
description: Dependency analyzer
mode: subagent
permission:
  bash:
    "npm list*": allow
    "npm outdated*": allow
    "npm audit*": allow
    "npm install*": ask
    "npm update*": ask
    "*": deny
---
```

### Security-Conscious Agent

Maximum restrictions for audit tasks:

```yaml
---
description: Security auditor with minimal permissions
mode: subagent
tools:
  write: false
  edit: false
  bash: false
  webfetch: false
permission:
  edit: deny
  bash: deny
---
```

---

## MCP Tools Configuration

When MCP servers are configured, agents can access external services.

### Enabling MCP Tools

```yaml
---
description: GitHub integration specialist
mode: subagent
tools:
  mymcp_github_create_issue: true
  mymcp_github_list_prs: true
  mymcp_slack_post_message: false
---
```

### Common MCP Patterns

| MCP Server | Tools | Use Case |
|------------|-------|----------|
| github | `mymcp_github_*` | Issue/PR management |
| slack | `mymcp_slack_*` | Notifications |
| notion | `mymcp_notion_*` | Documentation |
| linear | `mymcp_linear_*` | Project tracking |

### Per-Agent MCP Access

In `opencode.json`, configure MCP access per agent:

```json
{
  "agent": {
    "github-helper": {
      "tools": {
        "mymcp_github_create_issue": true,
        "mymcp_github_create_pr": true
      }
    }
  }
}
```

---

## Integration with prompt-engineer

For complex agents requiring high-quality system prompts, use the `prompt-engineer` skill.

### Workflow

```
1. Invoke agent-architect for agent creation
2. agent-architect invokes prompt-engineer for system prompt
3. prompt-engineer runs 5-phase methodology:
   - Requirements gathering
   - Structure design  
   - Prompt construction
   - Validation
   - Output generation
4. prompt-engineer returns optimized prompt body
5. agent-architect wraps with agent frontmatter
6. Final agent.md created
```

### When to Use prompt-engineer

| Agent Complexity | Approach |
|------------------|----------|
| Simple agent | Use template directly |
| Standard agent | Follow Step 5 guidelines |
| Complex/critical agent | Invoke `prompt-engineer` skill |

### Invoking prompt-engineer

When you need a high-quality system prompt:

```
Use the prompt-engineer skill to create a system prompt for this agent.

Requirements:
- Task: [what the agent does]
- Input: [what it receives]
- Output: [expected format]
- Constraints: [limitations]
```

---

## Agent Quality Metrics

Evaluate agents against these criteria:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Single Responsibility | 25% | Does one thing well |
| Minimal Permissions | 25% | Only necessary tool access |
| Clear Triggers | 20% | Description enables auto-invocation |
| Documented Scope | 15% | Boundaries clearly defined |
| Structured Output | 15% | Consistent, parseable responses |

### Quality Checklist

Before deploying an agent:

- [ ] Description clearly states when to use
- [ ] Tools are minimal for the task
- [ ] Output format is specified
- [ ] Edge cases are handled
- [ ] Constraints are explicit
- [ ] No conflicting instructions

---

## Examples

See `references/examples/` for annotated agents:
- **code-reviewer.md** - Read-only analysis agent
- **researcher.md** - Research with web access

See `references/patterns.md` for additional archetypes:
- **Orchestrator** - Coordinates multiple agents
- **Permission patterns** - Granular bash control
- **MCP integration** - External service access
