# Output Patterns

Patterns for producing consistent, high-quality output from skills.

---

## Template Pattern

Provide templates when output format matters. Match strictness to requirements.

### Strict Templates

Use for API responses, data formats, or anything where consistency is critical.

```markdown
## Report Structure

ALWAYS use this exact template structure:

# [Analysis Title]

## Executive Summary
[One-paragraph overview of key findings]

## Key Findings
- Finding 1 with supporting data
- Finding 2 with supporting data
- Finding 3 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation
```

**When to use:**
- API response formats
- Data export structures
- Compliance documents
- Configuration files

### Flexible Templates

Use when adaptation is useful and multiple valid approaches exist.

```markdown
## Report Structure

Here is a sensible default format, but adapt as needed:

# [Analysis Title]

## Executive Summary
[Overview]

## Key Findings
[Adapt sections based on what you discover]

## Recommendations
[Tailor to the specific context]

Adjust sections as needed for the specific analysis type.
```

**When to use:**
- Creative writing
- Analysis reports
- Documentation
- User-facing content

---

## Examples Pattern

For output quality that depends on style, provide input/output pairs.

### Why Examples Work

Examples communicate style, tone, and detail level more clearly than descriptions:

```markdown
<!-- BAD: Abstract description -->
Generate commit messages that are concise and follow best practices.

<!-- GOOD: Concrete examples -->
## Commit Message Format

Generate commit messages following these examples:

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**Example 2:**
Input: Fixed bug where dates displayed incorrectly in reports
Output:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

Follow this style: type(scope): brief description, then detailed explanation.
```

### Example Patterns

**Input/Output Tables:**

```markdown
## Date Formatting

| Input | Output |
|-------|--------|
| `2024-01-15` | `January 15, 2024` |
| `2024-12-25` | `December 25, 2024` |
| `2024-07-04` | `July 4, 2024` |
```

**Before/After Pairs:**

```markdown
## Code Review Comments

Before (vague):
> This could be better.

After (actionable):
> Consider extracting this into a separate function to improve testability. 
> The current implementation mixes data fetching with formatting logic.
```

**Multi-step Transformations:**

```markdown
## Data Pipeline

Raw input:
```json
{"name": "john doe", "email": "JOHN@EXAMPLE.COM"}
```

After normalization:
```json
{"name": "John Doe", "email": "john@example.com"}
```

After validation:
```json
{"name": "John Doe", "email": "john@example.com", "valid": true}
```
```

---

## Combining Patterns

Most skills benefit from combining template and example patterns:

```markdown
## API Error Responses

Use this structure for all error responses:

```json
{
  "error": {
    "code": "[ERROR_CODE]",
    "message": "[Human-readable message]",
    "details": "[Optional additional context]"
  }
}
```

**Examples:**

| Scenario | Response |
|----------|----------|
| Invalid input | `{"error": {"code": "INVALID_INPUT", "message": "Email format is invalid"}}` |
| Not found | `{"error": {"code": "NOT_FOUND", "message": "User with ID 123 not found"}}` |
| Rate limited | `{"error": {"code": "RATE_LIMITED", "message": "Too many requests", "details": "Retry after 60 seconds"}}` |
```

---

## Anti-Patterns

### Too Vague

```markdown
<!-- BAD -->
Format the output appropriately.
Make sure it looks professional.
```

### Too Rigid for Variable Content

```markdown
<!-- BAD: Over-specified for creative content -->
The summary must be exactly 3 sentences. 
The first sentence must start with "This document..."
Each bullet point must be 10-15 words.
```

### Examples Without Explanation

```markdown
<!-- BAD: No context for why this style -->
Example output: "feat: add login"

<!-- GOOD: Explains the pattern -->
Example output: "feat: add login"
Format: type: brief description (no period, lowercase, imperative mood)
```
