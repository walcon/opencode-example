# Skills

Skills are external tools with bundled scripts and resources that extend OpenCode's capabilities. They follow [Anthropic's Agent Skills Specification](https://github.com/anthropics/skills) and are enabled via the [opencode-skills plugin](https://github.com/malhashemi/opencode-skills).

## Features

- **Auto-discovery** - Scans project, home, and config directories for skills
- **Spec compliance** - Validates against Anthropic's Skills Specification v1.0
- **Dynamic tools** - Each skill becomes a `skills_{{name}}` tool
- **Path resolution** - Base directory context for relative file paths
- **Nested skills** - Supports hierarchical skill organization
- **Graceful errors** - Invalid skills skipped with helpful messages

## Requirements

- **OpenCode SDK >= 1.0.126** - Required for agent context preservation

## Installation

Add the plugin to your `opencode.json` or `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["opencode-skills"]
}
```

OpenCode auto-installs plugins on startup.

### Version Pinning

Pin to a specific version:

```json
{
  "plugin": ["opencode-skills@0.1.1"]
}
```

### Force Update

```bash
# Check installed version
cat ~/.cache/opencode/node_modules/opencode-skills/package.json | grep version

# Force update
rm -rf ~/.cache/opencode
# Then restart OpenCode
```

## Skill Discovery

The plugin scans three locations (lowest to highest priority):

1. `~/.config/opencode/skills/` - XDG config location
2. `~/.opencode/skills/` - Global skills (all projects)
3. `.opencode/skills/` - Project-local skills (**overrides global**)

All locations are merged. Duplicate skill names: project-local takes precedence.

## Creating a Skill

### 1. Create Directory Structure

```bash
mkdir -p .opencode/skills/my-skill
```

### 2. Create SKILL.md

Every skill must have a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: my-skill
description: A custom skill that helps with specific tasks (min 20 chars)
license: MIT
allowed-tools:
  - read
  - write
metadata:
  version: "1.0"
---

# My Custom Skill

This skill helps you accomplish specific tasks.

## Instructions

1. First, do this
2. Then, do that
3. Finally, verify the results

You can reference supporting files like `scripts/helper.py`.
```

### 3. Add Supporting Files (Optional)

```
my-skill/
├── SKILL.md              # Required
├── scripts/              # Executable code
│   └── helper.py
├── references/           # Documentation
│   └── api-docs.md
└── assets/               # Output files
    └── template.html
```

### 4. Restart OpenCode

Skills are discovered at startup.

### 5. Use the Skill

The agent can invoke `skills_my_skill` and the skill content + base directory is provided.

## Skill Naming

| Directory | Frontmatter Name | Tool Name |
|-----------|-----------------|-----------|
| `brand-guidelines/` | `brand-guidelines` | `skills_brand_guidelines` |
| `tools/analyzer/` | `analyzer` | `skills_tools_analyzer` |

**Rules:**
- Directory name: lowercase with hyphens (`[a-z0-9-]+`)
- Frontmatter `name`: must match directory name exactly
- Description: minimum 20 characters

## Controlling Skill Access

By default, all discovered skills are available. Use tool configuration to control access.

### Disable All, Enable Specific

```json
{
  "$schema": "https://opencode.ai/config.json",
  "tools": {
    "skills_*": false,
    "skills_my_skill": true
  }
}
```

### Per-Agent Access

```json
{
  "$schema": "https://opencode.ai/config.json",
  "tools": {
    "skills_*": false
  },
  "agent": {
    "build": {
      "tools": {
        "skills_document_skills_docx": true,
        "skills_document_skills_xlsx": true
      }
    }
  }
}
```

### Subagent Access (via Frontmatter)

```yaml
mode: subagent
description: Content creator agent
tools:
  skills_brand_guidelines: true
  skills_writing_style: true
```

## How It Works

The plugin uses Anthropic's **message insertion pattern**:

1. **Skill loading message** - Announces skill activation
2. **Skill content message** - Delivers instructions with base directory context
3. **Tool confirmation** - Returns `"Launching skill: {name}"`

Both messages use `noReply: true`, so skill content persists throughout conversations.

### Path Resolution

Skills reference files with relative paths:

```markdown
Read `references/api.md` and run `scripts/deploy.sh`
```

The agent receives base directory context and resolves paths automatically.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Skills not discovered | Verify `SKILL.md` exists, check console for messages |
| Tool not appearing | Ensure `name` matches directory, restart OpenCode |
| Paths not resolving | Check base directory in output, use relative paths |
| Invalid skill errors | Name must be lowercase+hyphens, description >= 20 chars |
| Plugin not updating | Clear cache: `rm -rf ~/.cache/opencode` |

## Example in This Project

### Weather Skill

Location: `.opencode/skills/weather/`

A skill that fetches weather data using Open-Meteo API:

```
weather/
├── SKILL.md              # Skill instructions
└── scripts/
    └── get-weather.ts    # Executable TypeScript
```

Usage:
```bash
npx tsx .opencode/skills/weather/scripts/get-weather.ts "London"
npx tsx .opencode/skills/weather/scripts/get-weather.ts "Paris" "2025-01-15"
```

The skill is enabled in `opencode.json`:
```json
{
  "tools": {
    "skills_*": false,
    "skills_weather": true
  }
}
```

## Reference

- [opencode-skills Plugin](https://github.com/malhashemi/opencode-skills)
- [Anthropic Skills Specification](https://github.com/anthropics/skills)
