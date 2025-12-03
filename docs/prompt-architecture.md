# OpenCode Prompt Architecture

OpenCode uses a sophisticated **layered prompting system** that adapts based on the model, provider, and operational mode. This document explains how it works.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Final System Prompt                       │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Custom Instructions                                │
│  (AGENTS.md, CLAUDE.md, config.instructions)                │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Environment Context                                │
│  (working directory, git status, file tree)                 │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Mode-Specific Prompts                              │
│  (plan.txt, plan-reminder-anthropic.txt, build-switch.txt)  │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Provider/Model Base Prompt                         │
│  (anthropic.txt, codex.txt, beast.txt, gemini.txt, etc.)    │
├─────────────────────────────────────────────────────────────┤
│  Layer 0: Header (Anthropic only)                            │
│  (anthropic_spoof.txt)                                       │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: Provider-Specific Base Prompts

The base prompt is selected based on the model ID. See `system.ts` for the logic:

```typescript
export function provider(modelID: string) {
  if (modelID.includes("gpt-5")) return [PROMPT_CODEX]
  if (modelID.includes("gpt-") || modelID.includes("o1") || modelID.includes("o3")) return [PROMPT_BEAST]
  if (modelID.includes("gemini-")) return [PROMPT_GEMINI]
  if (modelID.includes("claude")) return [PROMPT_ANTHROPIC]
  if (modelID.includes("polaris-alpha")) return [PROMPT_POLARIS]
  return [PROMPT_ANTHROPIC_WITHOUT_TODO]
}
```

### Prompt Files

| File | Used For | Size | Key Characteristics |
|------|----------|------|---------------------|
| [anthropic.txt](prompts/anthropic.txt) | Claude models | ~8KB | Standard OpenCode prompt, TodoWrite integration |
| [codex.txt](prompts/codex.txt) | GPT-5 | ~24KB | Most detailed, structured workflow, sandbox system |
| [beast.txt](prompts/beast.txt) | GPT-4, o1, o3 | ~11KB | Autonomous agent, extensive web research |
| [gemini.txt](prompts/gemini.txt) | Gemini models | ~15KB | Similar to Claude with Gemini adaptations |
| [polaris.txt](prompts/polaris.txt) | Polaris Alpha | ~8KB | Slightly different wording from anthropic |
| [qwen.txt](prompts/qwen.txt) | Qwen, fallback | ~10KB | Anthropic-style without TodoWrite |
| [copilot-gpt-5.txt](prompts/copilot-gpt-5.txt) | GitHub Copilot GPT-5 | ~14KB | Copilot-specific adaptations |

## Layer 2: Mode-Specific Prompts

OpenCode has two primary modes: **Build** and **Plan**.

### Plan Mode

When in Plan mode, additional prompts are injected:

| File | Purpose |
|------|---------|
| [plan.txt](prompts/plan.txt) | Basic plan mode instructions |
| [plan-reminder-anthropic.txt](prompts/plan-reminder-anthropic.txt) | Enhanced workflow with question-asking pattern |

**Key Pattern: Ask Questions and Present Options**

From `plan-reminder-anthropic.txt`:

```
Ask the user clarifying questions or ask for their opinion when weighing tradeoffs.

**NOTE:** At any point in time through this workflow you should feel free to 
ask the user questions or clarifications. Don't make large assumptions about 
user intent. The goal is to present a well researched plan to the user, and 
tie any loose ends before implementation begins.
```

### Plan Mode Workflow (from plan-reminder-anthropic.txt)

1. **Phase 1: Initial Understanding**
   - Launch up to 3 Explore agents in parallel
   - Use `AskUserQuestion` tool to clarify ambiguities

2. **Phase 2: Planning**
   - Launch a Plan subagent with background context
   - Request a detailed plan

3. **Phase 3: Synthesis**
   - Collect agent responses
   - Use `AskUserQuestion` to ask about tradeoffs

4. **Phase 4: Final Plan**
   - Write synthesized plan to plan file

5. **Phase 5: Exit**
   - Call `ExitPlanMode` when done

### Build Mode Switch

When switching from Plan to Build mode, [build-switch.txt](prompts/build-switch.txt) is injected:

```
Your operational mode has changed from plan to build.
You are no longer in read-only mode.
You are permitted to make file changes, run shell commands, and utilize your arsenal of tools as needed.
```

## Layer 3: Environment Context

Automatically injected context about the current environment:

```xml
<env>
  Working directory: /path/to/project
  Is directory a git repo: yes
  Platform: linux
  Today's date: Wed Dec 03 2025
</env>
<files>
  (file tree, up to 200 files)
</files>
```

## Layer 4: Custom Instructions

Loaded from multiple sources (in order of precedence):

### Local Files (searched up to git root)
1. `AGENTS.md`
2. `CLAUDE.md`
3. `CONTEXT.md` (deprecated)

### Global Files
1. `~/.config/opencode/AGENTS.md`
2. `~/.claude/CLAUDE.md`

### Config-Specified Files
From `opencode.json`:
```json
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md"
  ]
}
```

## Utility Prompts

Additional prompts for specific tasks:

| File | Purpose |
|------|---------|
| [title.txt](prompts/title.txt) | Generate conversation titles |
| [summarize.txt](prompts/summarize.txt) | Summarize conversations |
| [compaction.txt](prompts/compaction.txt) | Compact long conversations |

## Key Differences Between Prompts

### anthropic.txt vs codex.txt

| Aspect | anthropic.txt | codex.txt |
|--------|---------------|-----------|
| Length | ~8KB | ~24KB |
| Structure | Moderate | Highly structured |
| Sandbox | Not mentioned | Detailed sandbox/approval system |
| Planning | TodoWrite tool | Detailed plan workflow |
| Final Output | Brief guidelines | Extensive formatting rules |

### anthropic.txt vs beast.txt

| Aspect | anthropic.txt | beast.txt |
|--------|---------------|-----------|
| Autonomy | Moderate | High ("keep going until solved") |
| Web Research | Standard | Aggressive ("MUST use Google") |
| Iteration | Standard | Explicit iteration loops |
| Memory | Not mentioned | Has memory file system |

## Teaching Points

1. **Layered Architecture**: Prompts build on each other, allowing customization at each layer

2. **Model-Specific Optimization**: Different models get different prompts optimized for their strengths

3. **Mode Separation**: Plan mode is read-only with question-asking; Build mode has full permissions

4. **The "Ask Questions" Pattern**: Only in Plan mode - demonstrates structured user collaboration

5. **TodoWrite Integration**: Most prompts include task management for visibility

6. **Professional Objectivity**: All prompts emphasize truth over validation

## Source

These prompts are from the [OpenCode repository](https://github.com/sst/opencode):
- Path: `packages/opencode/src/session/prompt/`
- System loader: `packages/opencode/src/session/system.ts`

Last updated: December 2025
