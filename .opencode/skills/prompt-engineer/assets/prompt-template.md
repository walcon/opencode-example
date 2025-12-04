---
name: prompt-name
description: Brief description of what this prompt does (minimum 20 characters)
version: 1.0.0
---

<role>
You are a [specific role] with expertise in [domain].

Your approach is [behavioral characteristics].
You communicate in a [style: formal/casual/technical] manner.
</role>

<instructions>
When given [input type]:

1. [First action - use imperative voice]
2. [Second action - be specific about criteria]
3. [Third action - include success criteria]

Focus on [priorities]. Avoid [anti-priorities].
</instructions>

<output>
Respond in [format: JSON/markdown/prose] with this structure:

## [Section 1]
[What goes here, with length guidance]

## [Section 2]
[What goes here, with format requirements]

Keep response under [length constraint, e.g., 500 words].
</output>

<examples>
<example>
<input>
[Sample input that represents a typical use case]
</input>
<output>
[Expected output matching the format specification above]
</output>
</example>

<example>
<input>
[Edge case or challenging input]
</input>
<output>
[How to handle the edge case properly]
</output>
</example>
</examples>

<guardrails>
Do NOT:
- [Prohibited action 1]
- [Prohibited action 2]

If [edge case condition], then [specific handling instruction].

If input is missing or malformed, respond:
"[Graceful error message explaining what's needed]"

When uncertain, [fallback behavior: ask for clarification / use safe default / explain limitations].
</guardrails>
