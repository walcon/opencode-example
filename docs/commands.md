# Commands

Custom commands let you specify a prompt you want to run when that command is executed in the TUI.

```
/my-command
```

Custom commands are in addition to the built-in commands like `/init`, `/undo`, `/redo`, `/share`, `/help`.

## Create Command Files

Create markdown files in the `command/` directory to define custom commands.

Example `.opencode/command/test.md`:

```markdown
---
description: Run tests with coverage
agent: build
model: anthropic/claude-3-5-sonnet-20241022
---

Run the full test suite with coverage report and show any failures.
Focus on the failing tests and suggest fixes.
```

Use the command by typing `/test` in the TUI.

## Configure

Commands can be configured in two ways:

### JSON Configuration

Configure in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "command": {
    "test": {
      "template": "Run the full test suite with coverage report and show any failures.\nFocus on the failing tests and suggest fixes.",
      "description": "Run tests with coverage",
      "agent": "build",
      "model": "anthropic/claude-3-5-sonnet-20241022"
    }
  }
}
```

### Markdown Files

Place markdown files in:
- **Global**: `~/.config/opencode/command/`
- **Per-project**: `.opencode/command/`

The filename becomes the command name (e.g., `test.md` → `/test`).

## Prompt Configuration

### Arguments

Pass arguments using `$ARGUMENTS` or positional parameters:

```markdown
---
description: Create a new component
---

Create a new React component named $ARGUMENTS with TypeScript support.
```

Usage: `/component Button`

Positional parameters:
- `$1` - First argument
- `$2` - Second argument
- `$3` - Third argument

Example with positional:

```markdown
---
description: Create a new file with content
---

Create a file named $1 in the directory $2 with content: $3
```

Usage: `/create-file config.json src "{ \"key\": \"value\" }"`

### Shell Output

Use `` !`command` `` to inject bash command output:

```markdown
---
description: Analyze test coverage
---

Here are the current test results:
!`npm test`

Based on these results, suggest improvements.
```

### File References

Include files using `@` followed by the filename:

```markdown
---
description: Review component
---

Review the component in @src/components/Button.tsx.
Check for performance issues.
```

## Options

| Option | Required | Description |
|--------|----------|-------------|
| `template` | Yes (JSON only) | The prompt sent to the LLM |
| `description` | No | Shown in the TUI command list |
| `agent` | No | Which agent executes the command |
| `subtask` | No | Force subagent invocation (boolean) |
| `model` | No | Override the default model |

### Agent Option

Specify which agent should execute the command:

```json
{
  "command": {
    "review": {
      "agent": "plan"
    }
  }
}
```

### Subtask Option

Force the command to run as a subagent (doesn't pollute primary context):

```json
{
  "command": {
    "analyze": {
      "subtask": true
    }
  }
}
```

### Model Option

Override the model for cost optimization:

```json
{
  "command": {
    "quick-check": {
      "model": "anthropic/claude-haiku-4-5"
    }
  }
}
```

## Built-in Commands

OpenCode includes several built-in commands:

| Command | Description |
|---------|-------------|
| `/init` | Initialize OpenCode for a project |
| `/undo` | Undo the last change |
| `/redo` | Redo an undone change |
| `/share` | Share the current conversation |
| `/help` | Show help information |
| `/connect` | Configure provider API keys |

**Note**: Custom commands can override built-in commands.

## Example in This Project

### /ask Command

Location: `.opencode/command/ask.md`

A read-only command for asking questions about the codebase:
- Uses `claude-haiku-4.5` for cost efficiency
- Runs as a subtask to avoid polluting main context
- Denies edit permissions, asks for bash approval
- Provides structured response format

## Reference

- [Official Commands Documentation](https://opencode.ai/docs/commands/)
