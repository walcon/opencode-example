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

---

## Orchestrator Agent

**Purpose**: Coordinate multiple agents for complex workflows

Unlike other subagents, orchestrators manage tasks rather than perform them directly.

```yaml
---
description: >
  Workflow coordinator. Use for complex multi-step tasks that require
  multiple specialized agents working in sequence or parallel.
mode: subagent
---

You are a workflow orchestrator.

When given a complex task:

1. **Decompose** - Break into discrete subtasks
2. **Delegate** - Assign each subtask to the appropriate agent
3. **Coordinate** - Run independent tasks in parallel when possible
4. **Synthesize** - Combine results into a coherent response

# Available Agents

Use these agents for specific tasks:
- `@researcher` - Find information in codebase
- `@code-reviewer` - Analyze code quality
- `@copywriter` - Write user-facing content
- `@explore` - Quick codebase exploration

# Delegation Syntax

Invoke agents with:
```
@agent-name [specific task description]
```

For parallel execution, invoke multiple agents in the same request.

# Output Format

## Task Breakdown
[List of subtasks and assigned agents]

## Results
[Synthesized findings from all agents]

## Recommendations
[Actionable next steps]
```

### When to Use Orchestrators

| Scenario | Without Orchestrator | With Orchestrator |
|----------|---------------------|-------------------|
| Feature implementation | Manual agent invocation | Automatic decomposition |
| Code review + security | Two separate invocations | Single coordinated analysis |
| Research + documentation | Sequential manual work | Parallel automated workflow |

---

## Permission Pattern Examples

OpenCode uses a permission system with glob patterns for bash commands.

### Read-Only Analyst

```yaml
---
description: Code analyzer that never modifies anything
mode: subagent
tools:
  write: false
  edit: false
  bash: false
permission:
  edit: deny
  bash: deny
  webfetch: deny
---
```

### Git Operations Specialist

Allow read commands, require approval for writes:

```yaml
---
description: Git operations with controlled write access
mode: subagent
permission:
  bash:
    "git status": allow
    "git diff*": allow
    "git log*": allow
    "git show*": allow
    "git blame*": allow
    "git branch": allow
    "git branch -a": allow
    "git checkout*": ask
    "git commit*": ask
    "git push*": ask
    "git merge*": ask
    "git rebase*": ask
    "*": deny
---
```

### Build & Test Runner

Allow specific build commands:

```yaml
---
description: Build and test executor
mode: subagent
permission:
  bash:
    "npm run build": allow
    "npm run test*": allow
    "npm run lint*": allow
    "make build": allow
    "make test": allow
    "npm install*": ask
    "*": ask
---
```

### Deny-by-Default Pattern

Maximum security with explicit allowlist:

```yaml
---
description: High-security analyzer
mode: subagent
permission:
  bash:
    "*": deny
    "pwd": allow
    "ls": allow
    "cat package.json": allow
---
```

---

## MCP-Enhanced Agents

When MCP servers are configured, agents can interact with external services.

### GitHub Integration Agent

```yaml
---
description: >
  GitHub operations specialist. Use for creating issues,
  managing PRs, and interacting with GitHub repositories.
mode: subagent
tools:
  mymcp_github_create_issue: true
  mymcp_github_list_issues: true
  mymcp_github_create_pr: true
  mymcp_github_list_prs: true
  mymcp_github_add_comment: true
---

You are a GitHub operations specialist.

When given a task:
1. Determine which GitHub operation is needed
2. Gather required information (repo, title, body, etc.)
3. Execute the operation
4. Report the result with links

# Output Format

## Action Taken
[What was done]

## Result
[Link or confirmation]

## Next Steps
[Any follow-up actions needed]
```

### Slack Notifier Agent

```yaml
---
description: >
  Slack notification agent. Use to post updates and
  notifications to configured Slack channels.
mode: subagent
tools:
  mymcp_slack_post_message: true
  mymcp_slack_list_channels: true
---

You are a Slack notification agent.

When given a message to send:
1. Confirm the target channel
2. Format the message appropriately
3. Post the message
4. Confirm delivery

Keep messages concise and actionable.
```

### Multi-Service Agent

```yaml
---
description: >
  DevOps coordinator. Use for tasks spanning GitHub,
  Slack, and project management tools.
mode: subagent
tools:
  mymcp_github_create_issue: true
  mymcp_github_create_pr: true
  mymcp_slack_post_message: true
  mymcp_linear_create_issue: true
---
```

---

## Agent Composition Patterns

### Fan-Out Pattern

Dispatch to multiple agents, aggregate results:

```
        ┌── @security-reviewer ──┐
User ───┼── @perf-reviewer ──────┼── Aggregate
        └── @style-reviewer ─────┘
```

### Pipeline Pattern

Chain agents in sequence:

```
User → @researcher → @architect → @implementer → @reviewer
```

### Specialist Consultation

Main agent consults specialists as needed:

```
Main Agent ──┬── @copywriter (when user-facing text needed)
             ├── @security-reviewer (when auth code changes)
             └── @explore (when finding related code)
```

### Supervisor Pattern

Orchestrator manages worker agents:

```
@orchestrator
     │
     ├── Assigns tasks to workers
     ├── Monitors progress
     └── Aggregates results

Workers: @agent-1, @agent-2, @agent-3
```
