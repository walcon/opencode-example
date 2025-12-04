# Prompt Anti-Patterns

Common mistakes to avoid when writing prompts.

---

## 1. Vague Instructions

### The Problem

Instructions that lack specificity lead to inconsistent or unusable outputs.

### Examples

| Bad | Good |
|-----|------|
| "Make it good" | "Use active voice, limit sentences to 20 words, include specific metrics" |
| "Be helpful" | "Answer the question directly, then provide one relevant follow-up suggestion" |
| "Improve this code" | "Refactor for readability: extract functions over 20 lines, add type hints, rename unclear variables" |
| "Summarize" | "Summarize in 3 bullet points, each 15-25 words, focusing on actionable insights" |

### How to Fix

- Replace adjectives with measurable criteria
- Specify quantities (word counts, number of items)
- Define what "good" means for this specific task

---

## 2. Conflicting Requirements

### The Problem

Contradictory instructions confuse the model and produce inconsistent results.

### Examples

| Bad | Why It's Bad |
|-----|--------------|
| "Be concise but cover everything in detail" | Impossible to satisfy both |
| "Be creative but follow the template exactly" | Creativity requires deviation |
| "Respond quickly but think carefully" | Speed vs. thoroughness conflict |
| "Use simple language to explain complex technical details" | May need technical terms |

### How to Fix

- Prioritize: "Prioritize conciseness. Only add detail when essential for understanding."
- Define scope: "Cover the 3 most important points in detail. Mention others briefly."
- Resolve conflicts explicitly: "Default to simplicity. Use technical terms only when no simple alternative exists, and define them."

---

## 3. Missing Output Format

### The Problem

Without format specification, outputs vary wildly and are hard to parse or use.

### Examples

| Bad | Good |
|-----|------|
| "Analyze this data" | "Return a JSON object with keys: `summary`, `key_findings`, `recommendations`" |
| "Review this code" | "Format: `## Summary` (1 line), `## Issues` (table with severity/location/fix), `## Verdict` (approve/reject)" |
| "List the problems" | "Return a numbered list. Each item: `[Severity: high/med/low] Description (file:line)`" |

### How to Fix

- Specify format type (JSON, markdown, prose, table)
- Show the exact structure expected
- Include an example of correct output

---

## 4. Instruction Overload

### The Problem

Too many rules overwhelm the model, causing it to miss important ones or produce confused output.

### Signs of Overload

- More than 20 rules in a single prompt
- Nested conditionals ("If X and Y but not Z, then...")
- Multi-page system prompts

### Examples

| Bad | Good |
|-----|------|
| 50 rules in the prompt | 5 core rules in prompt, rest in referenced document |
| Every edge case inline | Common cases in prompt, edge cases in `<guardrails>` |
| Long conditional chains | Decision tree or pattern matching |

### How to Fix

- Keep core rules to 5-10 maximum
- Move extended guidelines to reference files
- Use hierarchy: critical rules first, edge cases last
- Split complex agents into focused sub-agents

---

## 5. No Edge Case Handling

### The Problem

Prompts that assume perfect input fail unpredictably in production.

### Common Missing Handlers

| Edge Case | What Happens Without Handling |
|-----------|-------------------------------|
| Missing input | Model hallucinates data |
| Malformed input | Unpredictable parsing errors |
| Out-of-scope request | Model attempts anyway, poorly |
| Ambiguous request | Model guesses, often wrong |
| Empty input | Model invents content |

### Examples

| Bad | Good |
|-----|------|
| Assumes input exists | "If no document is provided, respond: 'Please provide a document to analyze.'" |
| No scope boundaries | "If asked about topics outside [domain], respond: 'I specialize in [domain]. For [other topic], please consult [alternative].'" |
| No clarification path | "If the request is ambiguous, ask one clarifying question before proceeding." |

### How to Fix

- Add explicit handlers for missing/malformed input
- Define scope boundaries and graceful declines
- Specify when to ask for clarification vs. make assumptions

---

## 6. Undocumented Variables

### The Problem

Using placeholders without explaining what they contain leads to incorrect usage.

### Examples

| Bad | Good |
|-----|------|
| `Analyze {{INPUT}}` | `Analyze {{USER_DOCUMENT}} (a text document, 100-5000 words, may be markdown or plain text)` |
| `Given {{CONTEXT}}` | `Given {{CONVERSATION_HISTORY}} (previous 5 messages in user/assistant format)` |

### How to Fix

- Name variables descriptively: `{{USER_QUERY}}` not `{{X}}`
- Document expected content, format, and constraints
- Use consistent naming throughout the prompt

---

## 7. Passive Voice Instructions

### The Problem

Passive voice weakens instructions and creates ambiguity about who acts.

### Examples

| Bad (Passive) | Good (Imperative) |
|---------------|-------------------|
| "The code should be analyzed" | "Analyze the code" |
| "Responses should be concise" | "Keep responses under 100 words" |
| "Errors are to be handled" | "Handle errors by returning `{error: description}`" |

### How to Fix

- Use imperative mood: "Do X" not "X should be done"
- Address the model directly: "You will..." or just "Analyze..."
- Be commanding, not suggestive

---

## 8. No Fallback Behavior

### The Problem

When the model can't complete a task, it either fails silently or makes things up.

### Examples

| Bad | Good |
|-----|------|
| No guidance on failure | "If you cannot complete the task, respond with `{status: 'incomplete', reason: '...'}` and explain what's missing." |
| Hopes for the best | "If the input is too long to process fully, summarize the first 2000 words and note: 'Partial analysis - document truncated.'" |

### How to Fix

- Define what "cannot complete" means
- Specify the failure response format
- Provide graceful degradation paths

---

## 9. Assuming Model Knowledge

### The Problem

Referring to concepts, tools, or context the model doesn't have access to.

### Examples

| Bad | Good |
|-----|------|
| "Use our standard template" | "Use this template: [include template]" |
| "Follow company guidelines" | "Follow these guidelines: [list guidelines]" |
| "Check the database" | Provide database content or access method |

### How to Fix

- Include all necessary context in the prompt
- Don't reference external resources without providing access
- Be explicit about available tools and data

---

## 10. Conversational Fluff

### The Problem

Unnecessary politeness or conversational elements waste tokens and can confuse.

### Examples

| Bad | Good |
|-----|------|
| "Hello! I'd really appreciate it if you could perhaps..." | "Analyze the following code:" |
| "Thank you so much for your help! Please..." | [Just state the task] |
| "I was wondering if you might be able to..." | "Extract key points from:" |

### How to Fix

- Remove greetings and pleasantries
- State tasks directly
- Save tokens for actual instructions

---

## Anti-Pattern Detection Checklist

Before finalizing a prompt, check:

- [ ] Are all instructions specific and measurable?
- [ ] Are there any conflicting requirements?
- [ ] Is the output format explicitly defined?
- [ ] Are there fewer than 20 core rules?
- [ ] Are edge cases handled?
- [ ] Are all variables documented?
- [ ] Are instructions in imperative voice?
- [ ] Is there a fallback for failures?
- [ ] Is all required context included?
- [ ] Is conversational fluff removed?

## Quick Reference

| Anti-Pattern | Fix |
|--------------|-----|
| Vague | Add measurable criteria |
| Conflicting | Prioritize and resolve |
| No format | Specify structure exactly |
| Overloaded | Split into core + reference |
| No edge cases | Add explicit handlers |
| Undocumented vars | Name and describe all |
| Passive voice | Use imperative |
| No fallback | Define failure behavior |
| Assumed knowledge | Include all context |
| Fluff | Remove, be direct |
