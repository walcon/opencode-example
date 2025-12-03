# OpenCode Examples

This project demonstrates OpenCode's extensibility features: agents, subagents, commands, and skills.

## Setup

The `opencode.json` enables the [opencode-skills](https://github.com/malhashemi/opencode-skills) plugin:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-skills"]
}
```

Restart OpenCode after cloning this repo to load everything.

## Agents vs Subagents vs Commands vs Skills

| Feature | What it is | How to use |
|---------|-----------|------------|
| **Primary Agent** | Main conversation handler with custom behavior | Press `Tab` to switch |
| **Subagent** | Delegated task handler, can run in parallel | Type `@name` or auto-invoked |
| **Command** | Reusable prompt template | Type `/name` |
| **Skill** | External tool with bundled scripts/resources | Auto-invoked as `skills_name` tool |

## Examples

### Primary Agent: ask

**Location:** `.opencode/agent/ask.md`

A read-only codebase explorer. Ask questions about the codebase without making changes.

**Usage:** Press `Tab` to switch to the ask agent, then ask anything about the codebase.

### Subagent: copywriter

**Location:** `.opencode/agent/copywriter.md`

Writes user-facing copy (headlines, descriptions, CTAs). Demonstrates how the primary agent can delegate tasks.

**Usage:** Type `@copywriter write a headline for our new feature` or let the primary agent spawn it for copy-related tasks.

### Command: /eli5

**Location:** `.opencode/command/eli5.md`

Explains concepts in simple terms, like you're explaining to a 5-year-old.

**Usage:** `/eli5 what is a database?`

### Skill: weather

**Location:** `.opencode/skills/weather/`

Fetches current weather using the Open-Meteo API. Demonstrates skills as executable external tools.

**Structure:**
```
weather/
├── SKILL.md              # Instructions
└── scripts/
    └── get-weather.ts    # Executable TypeScript
```

**Usage:** The agent can invoke `skills_weather` and run the script:
```bash
npx tsx .opencode/skills/weather/scripts/get-weather.ts "London"
```

## Documentation

### Local Docs (in this repo)

- [Agents](docs/agents.md) - Primary agents and subagents
- [Commands](docs/commands.md) - Custom slash commands
- [Skills](docs/skills.md) - External tools with the opencode-skills plugin
- [Config](docs/config.md) - Configuration options including `reasoningEffort`
- [Prompt Architecture](docs/prompt-architecture.md) - How OpenCode's layered prompting system works
- [Prompts](docs/prompts/) - Actual prompt files from OpenCode (anthropic.txt, codex.txt, plan.txt, etc.)

### Official Docs

- [OpenCode Docs](https://opencode.ai/docs/)
- [Agents](https://opencode.ai/docs/agents/)
- [Commands](https://opencode.ai/docs/commands/)
- [Config](https://opencode.ai/docs/config/)
- [Skills Plugin](https://github.com/malhashemi/opencode-skills)
- [Anthropic Skills Spec](https://github.com/anthropics/skills)

## Model Selection for Cost Efficiency

Each agent/command can use a different model to optimize quota usage:

| Component | Model | Rationale |
|-----------|-------|-----------|
| Default | `claude-opus-4.5` | Complex tasks need capability |
| `small_model` | `claude-haiku-4.5` | Title generation, lightweight tasks |
| ask agent | `claude-haiku-4.5` | Read-only analysis, lower cost |
| copywriter | `gpt-5` | Creative writing benefits from GPT |
| /eli5 command | `claude-haiku-4.5` | Simple explanations, fast & cheap |

Set models in frontmatter (`model: provider/model-name`) or in `opencode.json`.

## Reasoning Effort

For models that support extended thinking (like OpenAI's reasoning models), use `reasoningEffort`:

```json
{
  "agent": {
    "deep-thinker": {
      "description": "Uses high reasoning for complex problems",
      "model": "openai/gpt-5",
      "reasoningEffort": "high"
    }
  }
}
```

Values: `low`, `medium`, `high`

See [docs/config.md](docs/config.md) for more details on provider-specific options.

## Controlling Skill Access

By default, skills are disabled (`skills_*: false`) to prevent context pollution. Enable specific skills per-project or per-agent:

```json
{
  "tools": {
    "skills_*": false,
    "skills_weather": true
  }
}
```
