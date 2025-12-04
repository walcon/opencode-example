# Prompt Evaluation Rubric

Criteria for assessing prompt quality.

---

## Overall Scoring

| Score | Rating | Description |
|-------|--------|-------------|
| 90-100 | Excellent | Production-ready, handles edge cases, well-tested |
| 75-89 | Good | Functional with minor improvements needed |
| 60-74 | Adequate | Works for basic cases, needs edge case handling |
| 40-59 | Needs Work | Missing key elements, inconsistent outputs |
| 0-39 | Poor | Fundamental issues, unusable as-is |

---

## Criteria Breakdown

### 1. Clarity (30%)

**Definition:** Instructions are unambiguous and easy to follow.

| Score | Criteria |
|-------|----------|
| 25-30 | All instructions are specific and measurable. No room for misinterpretation. |
| 18-24 | Most instructions clear, 1-2 could be more specific. |
| 10-17 | Several vague instructions. Some ambiguity in expectations. |
| 0-9 | Instructions are unclear. High risk of misinterpretation. |

**Evaluation Questions:**
- Could someone misunderstand these instructions?
- Are quantities and formats explicitly specified?
- Is every adjective backed by measurable criteria?

---

### 2. Completeness (25%)

**Definition:** All requirements are addressed with appropriate detail.

| Score | Criteria |
|-------|----------|
| 22-25 | All task requirements covered. Edge cases addressed. Examples provided. |
| 15-21 | Main requirements covered. Some edge cases or examples missing. |
| 8-14 | Basic requirements present. Significant gaps in coverage. |
| 0-7 | Major requirements missing. Incomplete specification. |

**Evaluation Questions:**
- Are all five phases of requirements gathering addressed?
- Is there handling for missing/malformed input?
- Are scope boundaries defined?
- Is fallback behavior specified?

---

### 3. Structure (20%)

**Definition:** Proper use of sections, XML tags, and logical organization.

| Score | Criteria |
|-------|----------|
| 18-20 | Clear hierarchy. Proper XML tags. Logical flow from role to output. |
| 12-17 | Good structure. Minor organization issues. |
| 6-11 | Basic structure present. Disorganized or missing key sections. |
| 0-5 | No clear structure. Information scattered or missing. |

**Evaluation Questions:**
- Are XML tags properly opened and closed?
- Does the prompt follow the Role → Instructions → Output hierarchy?
- Are sections logically organized?
- Is the prompt scannable?

---

### 4. Testability (15%)

**Definition:** Easy to validate with concrete examples and expected outputs.

| Score | Criteria |
|-------|----------|
| 13-15 | Includes test cases. Output format allows validation. Clear success criteria. |
| 9-12 | Some examples provided. Output mostly verifiable. |
| 4-8 | Few or no examples. Hard to verify correctness. |
| 0-3 | No examples. Output too vague to validate. |

**Evaluation Questions:**
- Can you test this prompt with sample inputs?
- Are expected outputs clearly defined?
- Is success/failure easy to determine?
- Are edge case examples provided?

---

### 5. Efficiency (10%)

**Definition:** Minimal token usage while maintaining effectiveness.

| Score | Criteria |
|-------|----------|
| 9-10 | Under 2000 tokens. No redundancy. Every word serves a purpose. |
| 6-8 | 2000-4000 tokens. Minor redundancy. Could be tightened. |
| 3-5 | 4000-6000 tokens. Significant redundancy. Needs pruning. |
| 0-2 | Over 6000 tokens. Excessive fluff or duplication. |

**Evaluation Questions:**
- Can any instructions be consolidated?
- Is there redundant information?
- Are examples concise but sufficient?
- Is conversational fluff removed?

---

## Validation Checklists

### Structural Validation

- [ ] Has clear role/identity definition
- [ ] Instructions use imperative voice
- [ ] Output format is explicitly specified
- [ ] Variables use consistent naming (`{{VAR_NAME}}`)
- [ ] XML tags are properly closed
- [ ] Sections follow logical order

### Content Validation

- [ ] No ambiguous instructions
- [ ] Edge cases are addressed
- [ ] Examples match output specification
- [ ] No conflicting requirements
- [ ] All required context is included
- [ ] Scope boundaries are defined

### Safety Validation

- [ ] No harmful capabilities enabled
- [ ] Appropriate refusal patterns included
- [ ] Privacy considerations addressed
- [ ] No prompt injection vulnerabilities
- [ ] Sensitive data handling specified

### Anti-Pattern Check

- [ ] No vague instructions ("make it good")
- [ ] No conflicting requirements
- [ ] Output format is specified
- [ ] Rule count under 20
- [ ] Edge cases handled
- [ ] All variables documented
- [ ] Imperative voice used
- [ ] Fallback behavior defined

---

## Scoring Worksheet

Use this worksheet to score a prompt:

```
Prompt: _______________
Evaluator: _______________
Date: _______________

CLARITY (30%)
- Specific instructions: ___/10
- Measurable criteria: ___/10
- No ambiguity: ___/10
Subtotal: ___/30

COMPLETENESS (25%)
- Requirements coverage: ___/10
- Edge case handling: ___/10
- Examples provided: ___/5
Subtotal: ___/25

STRUCTURE (20%)
- XML tag usage: ___/7
- Logical hierarchy: ___/7
- Scannability: ___/6
Subtotal: ___/20

TESTABILITY (15%)
- Test cases included: ___/5
- Verifiable output: ___/5
- Success criteria: ___/5
Subtotal: ___/15

EFFICIENCY (10%)
- Token count appropriate: ___/5
- No redundancy: ___/5
Subtotal: ___/10

TOTAL: ___/100
RATING: _______________
```

---

## Token Count Guidelines

| Prompt Type | Recommended Max |
|-------------|-----------------|
| Simple task | 500-1000 tokens |
| Standard task | 1000-2000 tokens |
| Complex task | 2000-4000 tokens |
| System prompt | 3000-5000 tokens |
| Multi-example | 4000-6000 tokens |

**Warning thresholds:**
- 4000+ tokens: Review for efficiency
- 6000+ tokens: Consider splitting or simplifying
- 8000+ tokens: Likely too complex for single prompt

---

## Quality Gates

### Gate 1: Minimum Viability

Must pass to proceed:
- [ ] Has role definition
- [ ] Has clear instructions
- [ ] Has output format
- [ ] Under 8000 tokens

### Gate 2: Production Readiness

Should pass for production use:
- [ ] All structural validation items pass
- [ ] All content validation items pass
- [ ] At least 2 examples provided
- [ ] Score >= 75

### Gate 3: Excellence

For critical or high-volume prompts:
- [ ] All safety validation items pass
- [ ] All anti-pattern checks pass
- [ ] Score >= 90
- [ ] Tested with 5+ real inputs

---

## Common Improvement Actions

| Issue | Score Impact | Fix |
|-------|--------------|-----|
| Missing output format | -15 | Add `<output>` section with exact structure |
| No examples | -10 | Add 2-3 input/output examples |
| Vague instructions | -10 | Replace adjectives with measurable criteria |
| No edge case handling | -10 | Add `<guardrails>` section |
| Over 4000 tokens | -5 | Remove redundancy, consolidate rules |
| Passive voice | -5 | Convert to imperative |
| Undocumented variables | -5 | Add inline documentation |
