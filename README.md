# OpenCode Examples

This project demonstrates OpenCode's extensibility features: agents, subagents, commands, and skills.

## Setup

The `opencode.json` enables the [opencode-skills](https://github.com/malhashemi/opencode-skills) plugin:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-skills"],
  "tools": {
    "skills_*": false,
    "skills_weather": true,
    "skills_copywriting": true,
    "skills_prompt-engineer": true,
    "skills_agent-architect": true
  }
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

## Skills

### prompt-engineer

**Location:** `.opencode/skills/prompt-engineer/`

Create production-ready prompts using a systematic 5-phase methodology.

**Phases:**
1. Requirements Gathering (TASK, CONTEXT, OUTPUT, CONSTRAINTS, EDGE CASES)
2. Structure Design (pattern selection)
3. Prompt Construction (XML-tagged blocks)
4. Validation (automated checks)
5. Output Generation (save to `prompts/`)

**Structure:**
```
prompt-engineer/
├── SKILL.md                    # Core instructions
├── references/
│   ├── prompt-patterns.md      # PTF, COST, STAR, RRET, CoT, Few-Shot, ReAct, Constitutional
│   ├── anti-patterns.md        # What to avoid
│   └── evaluation-rubric.md    # Quality scoring
├── scripts/
│   └── validate-prompt.ts      # Validation with token counting
└── assets/
    └── prompt-template.md      # Ready-to-use template
```

**Usage:**
```bash
# Validate a prompt
npx tsx .opencode/skills/prompt-engineer/scripts/validate-prompt.ts prompts/my-prompt.md
```

### agent-architect

**Location:** `.opencode/skills/agent-architect/`

Design and generate OpenCode agents with proper configuration, permissions, and MCP integration.

**Features:**
- Primary vs subagent mode selection
- Tool permission patterns (read-only, git-scoped, package management)
- MCP tools configuration
- Integration with prompt-engineer for system prompts
- Quality metrics and validation

**Usage:**
```bash
# Create a new agent
npx tsx .opencode/skills/agent-architect/scripts/init.ts my-reviewer

# Validate an agent
npx tsx .opencode/skills/agent-architect/scripts/validate.ts .opencode/agent/my-reviewer.md
```

### copywriting

**Location:** `.opencode/skills/copywriting/`

A real-world skill for writing high-converting copy using proven marketing frameworks. This is a complete example of a production-ready skill with workflows, references, and validation.

**Frameworks included:**
- AIDA, PAS, BAB, FAB, 4Ps, SCQA, 4Cs (copywriting formulas)
- Schwartz's 5 Stages of Awareness
- Cialdini's 7 Principles of Persuasion
- StoryBrand SB7 Framework
- Harry Dry's Three Rules (Visualize, Falsify, Unique)
- 4U's Headline Scoring

**Structure:**
```
copywriting/
├── SKILL.md                    # Decision tree + workflows
├── references/
│   ├── formulas.md             # All 7 copywriting formulas
│   ├── awareness.md            # Schwartz's 5 stages
│   ├── persuasion.md           # Cialdini's principles
│   ├── positioning.md          # StoryBrand, Three Rules
│   └── validation.md           # 4U's, checklist, red flags
└── scripts/
    └── validate-copy.ts        # CLI quality validation
```

**Usage:**
```bash
# Validate copy quality
npx tsx .opencode/skills/copywriting/scripts/validate-copy.ts "Your headline here"

# Or invoke via the copywriter agent
@copywriter Write a headline for a project management tool
```

**Example output:**
```
Copy: "Replace stand-ups with a 1-page live plan."

Framework: PAS (Problem → Agitate → Solution)
Startup founders are problem-aware, so PAS names the pain quickly
and presents a concrete solution.

Validation: Score 3.3/4 — passed with no red flags.
```

### weather

**Location:** `.opencode/skills/weather/`

Fetches current weather using the Open-Meteo API. Demonstrates skills as executable external tools.

**Usage:**
```bash
npx tsx .opencode/skills/weather/scripts/get-weather.ts "London"
```

## Agents

### Primary Agent: ask

**Location:** `.opencode/agent/ask.md`

A read-only codebase explorer. Ask questions about the codebase without making changes.

**Usage:** Press `Tab` to switch to the ask agent.

### Subagent: copywriter

**Location:** `.opencode/agent/copywriter.md`

Writes user-facing copy using proven marketing frameworks. Works with the `copywriting` skill to apply formulas like AIDA, PAS, and StoryBrand, then validates output quality.

**Usage:** Type `@copywriter write a headline for our new feature`

**What it does:**
1. Loads the copywriting skill with frameworks
2. Assesses audience awareness level (for headlines/long-form)
3. Selects appropriate formula
4. Generates copy
5. Validates with the 4U's scoring
6. Explains which framework was used and why

## Commands

### /eli5

**Location:** `.opencode/command/eli5.md`

Explains concepts in simple terms.

**Usage:** `/eli5 what is a database?`

## Output Directories

| Directory | Purpose |
|-----------|---------|
| `prompts/` | Generated prompts from prompt-engineer skill |
| `.opencode/agent/` | Agent definitions |
| `.opencode/command/` | Command definitions |
| `.opencode/skills/` | Skill definitions |

## Documentation

### Local Docs

- [Agents](docs/agents.md) - Primary agents and subagents
- [Commands](docs/commands.md) - Custom slash commands
- [Skills](docs/skills.md) - External tools with the opencode-skills plugin
- [Config](docs/config.md) - Configuration options

### Official Docs

- [OpenCode Docs](https://opencode.ai/docs/)
- [Skills Plugin](https://github.com/malhashemi/opencode-skills)
- [Anthropic Skills Spec](https://github.com/anthropics/skills)

## Model Selection

Each agent/command can use a different model:

| Component | Model | Rationale |
|-----------|-------|-----------|
| Default | `claude-opus-4.5` | Complex tasks |
| `small_model` | `claude-haiku-4.5` | Lightweight tasks |
| ask agent | `claude-haiku-4.5` | Read-only, lower cost |
| copywriter | `gpt-5` | Creative writing |

Set models in frontmatter (`model: provider/model-name`) or in `opencode.json`.

## Controlling Skill Access

By default, skills are disabled (`skills_*: false`). Enable specific skills:

```json
{
  "tools": {
    "skills_*": false,
    "skills_weather": true,
    "skills_copywriting": true,
    "skills_prompt-engineer": true,
    "skills_agent-architect": true
  }
}
```
