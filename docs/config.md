# Configuration

OpenCode is configured using a JSON config file. This document covers the key configuration options, with special focus on model options like `reasoningEffort`.

## Config File Locations

Configuration files are **merged together** (later configs override earlier ones):

1. **Global**: `~/.config/opencode/opencode.json`
2. **Per-project**: `./opencode.json` (in project root)
3. **Custom path**: `OPENCODE_CONFIG=/path/to/config.json`

## Basic Configuration

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "theme": "opencode",
  "autoupdate": true
}
```

## Models

### Primary Model

```json
{
  "model": "anthropic/claude-sonnet-4-5"
}
```

### Small Model

Used for lightweight tasks like title generation:

```json
{
  "small_model": "anthropic/claude-haiku-4-5"
}
```

## Reasoning Effort

For models that support extended thinking (like OpenAI's reasoning models), you can control the reasoning effort using the `reasoningEffort` option.

### Values

| Value | Description |
|-------|-------------|
| `low` | Minimal reasoning, fastest responses |
| `medium` | Balanced reasoning and speed |
| `high` | Maximum reasoning effort, best for complex problems |

### Global Configuration

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "openai/gpt-5",
  "reasoningEffort": "high"
}
```

### Per-Agent Configuration

More commonly, you'll want different reasoning levels for different agents:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "openai/gpt-5",
  "agent": {
    "deep-thinker": {
      "description": "Uses high reasoning for complex problems",
      "model": "openai/gpt-5",
      "reasoningEffort": "high"
    },
    "quick-helper": {
      "description": "Fast responses for simple tasks",
      "model": "openai/gpt-5",
      "reasoningEffort": "low"
    }
  }
}
```

### In Markdown Agents

You can also set `reasoningEffort` in agent markdown files. Any option not explicitly defined in the schema is passed through to the provider:

```markdown
---
description: Deep analysis agent for complex problems
mode: primary
model: openai/gpt-5
reasoningEffort: high
---

You are a deep-thinking analyst. Take your time to thoroughly analyze problems.
```

## Provider-Specific Options (Passthrough)

Any configuration option not explicitly defined in OpenCode's schema is **passed through directly** to the model provider. This allows you to use provider-specific features.

### Examples

```json
{
  "agent": {
    "creative-writer": {
      "model": "openai/gpt-5",
      "reasoningEffort": "medium",
      "textVerbosity": "low"
    }
  }
}
```

Check your provider's documentation for available parameters.

## Tools Configuration

Control which tools are available:

```json
{
  "tools": {
    "write": true,
    "bash": true,
    "skills_*": false,
    "skills_weather": true
  }
}
```

### Wildcards

Use `*` to match multiple tools:
- `skills_*` - All skills
- `mymcp_*` - All tools from an MCP server

## Permissions

Configure approval requirements:

```json
{
  "permission": {
    "edit": "ask",
    "bash": "ask",
    "webfetch": "allow"
  }
}
```

Values:
- `allow` - No approval needed
- `ask` - Prompt for approval
- `deny` - Disable the tool

### Bash Command Patterns

```json
{
  "permission": {
    "bash": {
      "git status": "allow",
      "git push*": "ask",
      "*": "ask"
    }
  }
}
```

## Plugins

Enable plugins like opencode-skills:

```json
{
  "plugin": ["opencode-skills"]
}
```

Pin to specific version:

```json
{
  "plugin": ["opencode-skills@0.1.1"]
}
```

## Variables

### Environment Variables

```json
{
  "model": "{env:OPENCODE_MODEL}",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

### File Contents

```json
{
  "provider": {
    "openai": {
      "options": {
        "apiKey": "{file:~/.secrets/openai-key}"
      }
    }
  }
}
```

## Instructions (Rules)

Include instruction files for the model:

```json
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md"
  ]
}
```

## Sharing

Control conversation sharing:

```json
{
  "share": "manual"
}
```

Values:
- `manual` - Share via `/share` command (default)
- `auto` - Automatically share new conversations
- `disabled` - Disable sharing

## TUI Settings

```json
{
  "tui": {
    "scroll_speed": 3,
    "scroll_acceleration": {
      "enabled": true
    }
  }
}
```

## Example: This Project's Config

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-skills"],
  "model": "github-copilot/claude-opus-4.5",
  "small_model": "github-copilot/claude-haiku-4.5",
  "tools": {
    "skills_*": false,
    "skills_weather": true
  }
}
```

This configuration:
- Enables the opencode-skills plugin
- Uses Claude Opus 4.5 as the main model via GitHub Copilot
- Uses Claude Haiku 4.5 for lightweight tasks
- Disables all skills by default, enables only weather

## Reference

- [Official Config Documentation](https://opencode.ai/docs/config/)
- [Models Documentation](https://opencode.ai/docs/models/)
- [Tools Documentation](https://opencode.ai/docs/tools/)
- [Permissions Documentation](https://opencode.ai/docs/permissions/)
