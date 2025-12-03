# Agents

Agents are specialized AI assistants that can be configured for specific tasks and workflows. They allow you to create focused tools with custom prompts, models, and tool access.

## Types

There are two types of agents in OpenCode:

### Primary Agents

Primary agents are the main assistants you interact with directly. You can cycle through them using the **Tab** key. These agents handle your main conversation and can access all configured tools.

OpenCode comes with two built-in primary agents:
- **Build** - Default agent with all tools enabled for development work
- **Plan** - Restricted agent for planning and analysis without making changes

### Subagents

Subagents are specialized assistants that primary agents can invoke for specific tasks. You can also manually invoke them by **@ mentioning** them in your messages.

OpenCode comes with two built-in subagents:
- **General** - General-purpose agent for researching and multi-step tasks
- **Explore** - Fast agent specialized for exploring codebases

## Usage

1. **Switch primary agents**: Press **Tab** to cycle through primary agents
2. **Invoke subagents**: Type `@agent-name` in your message, e.g., `@copywriter write a headline`
3. **Navigate sessions**: Use `<Leader>+Right/Left` to navigate between parent and child sessions

## Configure

Agents can be configured in two ways:

### JSON Configuration

Configure in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "code-reviewer": {
      "description": "Reviews code for best practices",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-20250514",
      "prompt": "You are a code reviewer. Focus on security, performance, and maintainability.",
      "tools": {
        "write": false,
        "edit": false
      }
    }
  }
}
```

### Markdown Files

Place markdown files in:
- **Global**: `~/.config/opencode/agent/`
- **Per-project**: `.opencode/agent/`

Example `.opencode/agent/review.md`:

```markdown
---
description: Reviews code for quality and best practices
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
---

You are in code review mode. Focus on:

- Code quality and best practices
- Potential bugs and edge cases
- Performance implications
- Security considerations

Provide constructive feedback without making direct changes.
```

## Options

### Required Options

| Option | Description |
|--------|-------------|
| `description` | Brief description of what the agent does |

### Optional Options

| Option | Description |
|--------|-------------|
| `mode` | Agent mode: `primary`, `subagent`, or `all` (default) |
| `model` | Override the default model for this agent |
| `temperature` | Control randomness (0.0-1.0, lower = more focused) |
| `prompt` | Custom system prompt or file reference |
| `tools` | Enable/disable specific tools |
| `permission` | Set permissions for edit, bash, webfetch |
| `disable` | Set to `true` to disable the agent |

### Temperature Guidelines

- **0.0-0.2**: Very focused, ideal for code analysis
- **0.3-0.5**: Balanced, good for general development
- **0.6-1.0**: More creative, useful for brainstorming

### Permissions

Configure what actions an agent can take:

```yaml
permission:
  edit: deny      # deny, ask, or allow
  bash:
    "git diff": allow
    "git log*": allow
    "*": ask
  webfetch: deny
```

### Provider-Specific Options (Passthrough)

Any additional options are passed directly to the provider. For example, with reasoning models:

```json
{
  "agent": {
    "deep-thinker": {
      "description": "Uses high reasoning effort for complex problems",
      "model": "openai/gpt-5",
      "reasoningEffort": "high"
    }
  }
}
```

## Examples in This Project

### eli5 (Primary Agent)

Location: `.opencode/agent/eli5.md`

A "Explain Like I'm 5" agent that simplifies complex concepts:
- Uses `claude-haiku-4.5` for fast, cheap responses
- Low temperature (0.3) for consistent explanations
- Read-only (no bash, write, or edit tools)

### copywriter (Subagent)

Location: `.opencode/agent/copywriter.md`

A copywriting agent for user-facing content:
- Uses `gpt-5` for creative writing
- Higher temperature (0.6) for variety
- Invoked via `@copywriter` or automatically by primary agent

## Reference

- [Official Agents Documentation](https://opencode.ai/docs/agents/)
