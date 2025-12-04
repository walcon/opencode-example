# Agent Patterns

Patterns for designing effective OpenCode agents.

## Core Principles

### 1. Subagents Have Isolated Context

When you invoke a subagent with `@agent-name`, it runs in its own context window. This means:

- It doesn't see your conversation history
- It doesn't bloat your main context
- It returns only its final response
- Multiple subagents can run in parallel

**Use subagents for**: Deep analysis, research, content generation, validation

**Use main context for**: Quick questions, simple edits, conversational tasks

### 2. Principle of Least Privilege

Grant only the tools an agent needs:

```yaml
# Read-only agent
tools:
  write: false
  edit: false
  bash: false

# Write-capable agent (explicit about what's allowed)
tools:
  bash: false  # Still no shell access
```

### 3. Structured Output

Always specify output format in the agent prompt. Subagents return to an orchestrator that needs to parse results:

```markdown
# Output Format

Return results as:

## Summary
[One-line finding]

## Details
[Structured information]

## Recommendations
- [Actionable item 1]
- [Actionable item 2]
```

### 4. Clear Triggers

The `description` field determines when auto-delegation happens. Write it as "when to use":

```yaml
# BAD - vague
description: Helps with reviews

# GOOD - specific triggers
description: >
  Security-focused code review. Use PROACTIVELY after changes to 
  authentication, authorization, input validation, or data handling.
```

---

## Agent Archetypes

### Reviewer Agent

**Purpose**: Analyze without modifying

```yaml
---
description: >
  Code quality reviewer. Use after completing a feature to check 
  for best practices, potential bugs, and maintainability issues.
mode: subagent
tools:
  write: false
  edit: false
  bash: false
---

You are a senior code reviewer.

When given code to review:
1. Check for correctness and edge cases
2. Evaluate readability and maintainability
3. Identify potential performance issues
4. Suggest improvements

# Output Format

## Summary
[Overall assessment in one line]

## Issues Found
| Severity | Location | Issue | Suggestion |
|----------|----------|-------|------------|
| high/med/low | file:line | description | fix |

## Recommendations
- [Improvement 1]
- [Improvement 2]
```

### Researcher Agent

**Purpose**: Gather information from codebase or web

```yaml
---
description: >
  Technical researcher. Use when exploring unfamiliar codebases,
  understanding system architecture, or finding implementation patterns.
mode: subagent
tools:
  write: false
  edit: false
  bash: false
---

You are a technical researcher.

When given a research task:
1. Search broadly first to understand scope
2. Dive deep into relevant areas
3. Synthesize findings concisely
4. Cite specific files and line numbers

# Output Format

## Summary
[Key finding in one line]

## Findings
[Detailed discoveries with file references]

## Related Areas
- [Related topic 1]: [brief note]
- [Related topic 2]: [brief note]
```

### Writer Agent

**Purpose**: Generate content with specific voice/style

```yaml
---
description: >
  Technical writer. Use for documentation, README files, 
  API docs, and developer-facing content.
mode: subagent
model: anthropic/claude-sonnet-4-5
temperature: 0.4
tools:
  bash: false
---

You are a technical writer.

Write clear, concise documentation that:
- Leads with the most important information
- Uses concrete examples
- Avoids jargon unless necessary
- Includes code samples where helpful

# Output Format

Return the requested content directly, formatted in Markdown.
No preamble or explanation unless asked.
```

### Executor Agent

**Purpose**: Perform actions with full tool access

```yaml
---
description: >
  Build and test runner. Use to execute builds, run tests,
  and perform automated checks.
mode: subagent
---

You are a build/test executor.

When given a task:
1. Verify prerequisites
2. Execute the requested commands
3. Report results clearly
4. Suggest fixes for failures

# Output Format

## Status
[pass/fail]

## Output
[Command output, truncated if long]

## Issues
[Any failures with suggested fixes]
```

---

## Multi-Agent Workflows

### Sequential Handoff

```
User → @researcher (find relevant code)
     → @architect (design solution)  
     → main agent (implement)
     → @reviewer (check quality)
```

### Parallel Analysis

```
User → @security-checker  ─┬→ aggregate findings
     → @performance-checker─┤
     → @style-checker ─────┘
```

### Specialist Consultation

```
Main agent working on feature
  → @copywriter (write user-facing text)
  → continue implementation
```

---

## Anti-Patterns

### ❌ Over-broad Agent

```yaml
# BAD
description: General helper agent
```

An agent that does everything provides no specialization benefit.

### ❌ Too Many Tools

```yaml
# BAD - grants everything
tools: {}
```

Subagents should have minimal tools for their task.

### ❌ Vague Output

```markdown
# BAD
Review the code and tell me what you find.
```

Without structured output, results are hard to act on.

### ❌ Conversational Style

```markdown
# BAD
You're a friendly helper who loves to chat about code!
```

Subagents should be focused and return structured results.

### ❌ Nested Delegation

Subagents cannot spawn sub-subagents. Design flat orchestration from the main thread.
