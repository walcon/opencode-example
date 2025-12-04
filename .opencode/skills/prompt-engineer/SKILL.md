---
name: prompt-engineer
description: >
  Create production-ready prompts using systematic methodology. Use when:
  (1) Building new prompts for Claude, (2) Improving existing prompts,
  (3) Creating prompt templates, (4) Designing system prompts for agents.
---

# Prompt Engineer

Create high-quality, production-ready prompts using a systematic 5-phase methodology.

## Quick Start

| Goal | Action |
|------|--------|
| Create a new prompt | Follow the 5-phase methodology below |
| Validate a prompt | `npx tsx scripts/validate-prompt.ts <path>` |
| View patterns | Read `references/prompt-patterns.md` |
| Check anti-patterns | Read `references/anti-patterns.md` |

## Output Location

Save all prompts to: `prompts/<prompt-name>.md`

Use kebab-case for prompt names (e.g., `summarize-legal-docs.md`).

---

## Phase 1: Requirements Gathering

Before writing any prompt, gather requirements by asking these 5 questions:

### 1. TASK - What specific task should the prompt accomplish?

Be precise about the action:

| Vague | Specific |
|-------|----------|
| "Summarize documents" | "Summarize legal contracts into 3-bullet executive summaries" |
| "Help with code" | "Review Python code for security vulnerabilities and suggest fixes" |
| "Write content" | "Write product descriptions in casual tone, 50-100 words each" |

### 2. CONTEXT - What information will be available at runtime?

Identify all inputs:

- **Input data**: What format? (JSON, markdown, plain text, code)
- **User context**: Who is the user? What do they know?
- **System context**: What tools or actions are available?
- **History**: Is conversation history relevant?

### 3. OUTPUT - What should the output look like?

Specify the deliverable:

- **Format**: JSON, markdown, prose, code, structured data
- **Length**: Word/token limits, section counts
- **Structure**: Required sections, fields, or schema
- **Examples**: What does "good" look like?

### 4. CONSTRAINTS - What rules must be followed?

Define boundaries:

- **Tone/style**: Formal, casual, technical, friendly
- **Safety**: What topics to avoid? What guardrails needed?
- **Domain rules**: Industry-specific requirements
- **Quality bar**: Accuracy vs speed tradeoffs

### 5. EDGE CASES - What could go wrong?

Plan for failure modes:

- **Missing input**: What if required data is absent?
- **Malformed input**: How to handle bad data?
- **Ambiguous requests**: When to ask for clarification?
- **Out-of-scope**: How to decline gracefully?

---

## Phase 2: Structure Design

Based on requirements, select the appropriate prompt pattern.

### Pattern Selection Guide

| Pattern | Best For | Key Feature |
|---------|----------|-------------|
| **Direct (PTF)** | Simple, single-step tasks | Persona + Task + Format |
| **Chain of Thought** | Reasoning, analysis, math | "Think step by step" |
| **Few-Shot** | Format-specific outputs, classification | Input/output examples |
| **ReAct** | Tool-using agents, research | Thought/Action/Observation loop |
| **Constitutional** | Value alignment, moderation | Self-check against principles |

### Pattern Details

See `references/prompt-patterns.md` for full pattern documentation including:
- PTF (Persona + Task + Format)
- COST (Context + Objective + Style + Tone)
- STAR (Situation + Task + Action + Result)
- RRET (Role + Rules + Examples + Task)

### Decision Tree

```
Is this a simple, single-step task?
├── Yes → Use Direct (PTF) pattern
└── No
    ├── Does it require reasoning/analysis?
    │   └── Yes → Use Chain of Thought
    ├── Does it need specific output format?
    │   └── Yes → Use Few-Shot with examples
    ├── Does it use tools/actions?
    │   └── Yes → Use ReAct pattern
    └── Does it need value alignment?
        └── Yes → Use Constitutional pattern
```

---

## Phase 3: Prompt Construction

Build the prompt following this hierarchy. Use XML tags for clear structure.

### Required Blocks

#### 1. Role Block

Define WHO the AI is:

```xml
<role>
You are a [specific role] with expertise in [domain].

Your approach is [behavioral characteristics].
You communicate in a [style] manner.
</role>
```

**Guidelines:**
- Be specific: "senior security engineer" not "helpful assistant"
- Include relevant expertise areas
- Set communication style expectations

#### 2. Instructions Block

Specify HOW to perform the task:

```xml
<instructions>
When given [input type]:

1. [First action - imperative voice]
2. [Second action - be specific]
3. [Third action - include criteria]

Focus on [priorities]. Avoid [anti-priorities].
</instructions>
```

**Guidelines:**
- Use imperative voice: "Analyze..." not "You should analyze..."
- Number steps for complex procedures
- Use bullets for guidelines/principles
- State priorities explicitly

#### 3. Output Block

Define the expected deliverable:

```xml
<output>
Respond in [format] with this structure:

## [Section 1]
[What goes here]

## [Section 2]
[What goes here]

Keep response under [length constraint].
</output>
```

**Guidelines:**
- Specify format (JSON schema, markdown structure, prose)
- Include length guidance
- Distinguish required vs optional fields
- Show the exact structure expected

### Optional Blocks

#### 4. Context Block (If applicable)

Provide runtime information:

```xml
<context>
{{USER_INPUT}}

Additional context:
- [Relevant background]
- [System state]
</context>
```

**Guidelines:**
- Use clear variable naming: `{{DOCUMENT}}`, `{{USER_QUERY}}`
- Document what each variable contains
- Keep context focused and relevant

#### 5. Examples Block (Recommended)

Show concrete input/output pairs:

```xml
<examples>
<example>
<input>
[Sample input]
</input>
<output>
[Expected output]
</output>
</example>

<example>
<input>
[Edge case input]
</input>
<output>
[Edge case handling]
</output>
</example>
</examples>
```

**Guidelines:**
- Include 2-3 examples for few-shot
- Cover normal case and edge cases
- Match output format exactly
- Show reasoning if Chain of Thought

#### 6. Guardrails Block (If needed)

Set boundaries:

```xml
<guardrails>
Do NOT:
- [Prohibited action 1]
- [Prohibited action 2]

If [edge case], then [specific handling].

When uncertain, [fallback behavior].
</guardrails>
```

**Guidelines:**
- Be explicit about what NOT to do
- Specify edge case handling
- Define fallback behaviors
- Include safety considerations

---

## Phase 4: Validation

Before finalizing, run through these quality checks.

### Structural Validation

- [ ] Has clear role/identity definition
- [ ] Instructions use imperative voice
- [ ] Output format is explicitly specified
- [ ] Variables are consistently named (`{{VAR_NAME}}` format)
- [ ] XML tags are properly closed

### Content Validation

- [ ] No ambiguous instructions (test: could someone misinterpret this?)
- [ ] Edge cases are addressed
- [ ] Examples match the output specification
- [ ] Length is appropriate (under 4000 tokens recommended)
- [ ] No conflicting requirements

### Safety Validation

- [ ] No harmful capabilities enabled
- [ ] Appropriate refusal patterns for out-of-scope requests
- [ ] Privacy considerations addressed
- [ ] No prompt injection vulnerabilities

### Anti-Pattern Check

Review against `references/anti-patterns.md`:

- [ ] No vague instructions ("make it good")
- [ ] No conflicting requirements
- [ ] Output format is specified
- [ ] Not overloaded with rules (< 20 guidelines)
- [ ] Edge cases handled

### Automated Validation

```bash
npx tsx scripts/validate-prompt.ts prompts/my-prompt.md
```

This checks:
- YAML frontmatter validity
- Required sections present
- Token count (warns if > 4000)
- Common anti-patterns

---

## Phase 5: Output Generation

Create the final prompt file.

### File Format

All prompts use Markdown with YAML frontmatter:

```markdown
---
name: prompt-name
description: Brief description of what this prompt does
version: 1.0.0
author: [optional]
tags: [optional list]
---

<role>
[Role definition]
</role>

<instructions>
[Task instructions]
</instructions>

<output>
[Output specification]
</output>

<examples>
[Optional examples]
</examples>

<guardrails>
[Optional boundaries]
</guardrails>
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | kebab-case identifier |
| `description` | Yes | What the prompt does (min 20 chars) |
| `version` | No | Semantic version (default: 1.0.0) |
| `author` | No | Creator name |
| `tags` | No | Categorization tags |

### Save Location

Save to: `prompts/<name>.md`

Example: `prompts/summarize-legal-docs.md`

### Deliverables Checklist

After creating a prompt, provide:

1. **The prompt file** - Saved to `prompts/` directory
2. **Usage guide** - When to use, how to customize
3. **Test inputs** - Sample inputs for validation

---

## Integration with agent-architect

When creating agents that need high-quality system prompts:

1. The `agent-architect` skill may invoke `prompt-engineer`
2. Use this skill to design the agent's system prompt
3. Return the prompt body (without frontmatter) to agent-architect
4. agent-architect wraps it with agent-specific frontmatter

### Workflow

```
agent-architect: "I need a system prompt for a code review agent"
         ↓
prompt-engineer: Runs 5-phase methodology
         ↓
prompt-engineer: Returns optimized prompt body
         ↓
agent-architect: Creates agent.md with frontmatter + prompt
```

---

## Scripts Reference

### validate-prompt.ts

Validate a prompt file:

```bash
npx tsx scripts/validate-prompt.ts prompts/my-prompt.md
```

**Checks performed:**
- YAML frontmatter is valid
- Required fields present (`name`, `description`)
- Required sections exist (role/instructions/output)
- Token count estimation (warns > 4000)
- Anti-pattern detection

**Exit codes:**
- `0` - All checks passed
- `1` - Errors found (must fix)
- `2` - Warnings only (review recommended)

---

## Examples

### Simple Task Prompt

```markdown
---
name: summarize-article
description: Summarize news articles into 3-bullet executive summaries
version: 1.0.0
---

<role>
You are a news editor who creates concise executive summaries.
</role>

<instructions>
Given an article:
1. Identify the main topic and key conclusion
2. Extract 2-3 supporting points
3. Summarize in exactly 3 bullet points
</instructions>

<output>
Return exactly 3 bullet points:
- [Main finding/conclusion]
- [Key supporting point]
- [Additional context or implication]

Each bullet: 15-25 words. No headers or preamble.
</output>

<guardrails>
If the article is too short (< 100 words), respond:
"Article too brief for meaningful summary. Please provide more content."
</guardrails>
```

### Chain of Thought Prompt

```markdown
---
name: debug-code
description: Analyze code bugs with step-by-step reasoning
version: 1.0.0
---

<role>
You are a senior software engineer debugging code issues.
</role>

<instructions>
When given buggy code:

1. Read the code completely before analyzing
2. Think step by step about what each part does
3. Identify where behavior diverges from intent
4. Trace the bug to its root cause
5. Propose a fix with explanation
</instructions>

<output>
## Analysis

[Step-by-step reasoning about the code]

## Bug Location

File: [path]
Line: [number]
Issue: [description]

## Root Cause

[Why this bug occurs]

## Fix

```[language]
[Corrected code]
```

[Explanation of the fix]
</output>
```

---

## Reference Files

- `references/prompt-patterns.md` - Full pattern library
- `references/anti-patterns.md` - What to avoid
- `references/evaluation-rubric.md` - Quality scoring
- `assets/prompt-template.md` - Blank template
