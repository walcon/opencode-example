---
description: Ask a question about the codebase without making changes
model: github-copilot/claude-haiku-4.5
subtask: true
permission:
  edit: deny
  bash: ask
---

$ARGUMENTS

## Instructions

1. Search for relevant files and read them to understand the implementation
2. Trace connections between components if needed
3. Provide file paths with line numbers when referencing code

## Response Format

- **Answer**: Direct response in 1-2 sentences
- **Details**: Key files, functions, and how they work together
- **Code references**: Use `file:line` format (e.g., `src/auth.ts:42`)

Do not make any changes. Only analyze and answer.
