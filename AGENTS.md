# Agent Guidelines

## Commands
- Build: `npm run build` or `make build`
- Lint: `npm run lint` or `make lint`
- Test: `npm test` (all tests) or `npm test -- --testNamePattern="test-name"` (single test)
- Type check: `npm run typecheck` or `tsc --noEmit`

## Code Style
- Use existing imports and libraries from the codebase
- Follow existing naming conventions (camelCase for variables, PascalCase for classes)
- Add types for all function parameters and return values
- Handle errors with try/catch blocks, avoid silent failures
- Use meaningful variable and function names
- Keep functions small and focused on single responsibility
- Add comments only when explaining complex logic

## Testing
- Write tests for new features and bug fixes
- Use the existing test framework and patterns
- Test both happy path and error cases
- Run tests before committing changes

## Security
- Never commit secrets, API keys, or sensitive data
- Follow security best practices for the language/framework
- Validate all user inputs and external data

## Skills Plugin

This project uses [opencode-skills](https://github.com/malhashemi/opencode-skills) plugin.
**Do not search opencode.ai for skills docs** - see `docs/skills.md` instead.

- Skills are tools named `skills_<name>` (e.g., `skills_weather`)
- Skill definitions: `.opencode/skills/<name>/SKILL.md`
- `skill-architect` - Create new skills (use `@skill-analyzer` for deep analysis)
- `agent-architect` - Create new agents/subagents