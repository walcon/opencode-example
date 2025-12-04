# Prompt Patterns

A library of proven prompt patterns for different use cases.

## Pattern 1: PTF (Persona + Task + Format)

**Best for:** Simple, single-step tasks. Works for ~80% of use cases.

### Structure

```
You are a [ROLE] with expertise in [DOMAIN].

Your task is to [SPECIFIC ACTION] based on the provided [INPUT TYPE].

Respond in [FORMAT] with the following structure:
[OUTPUT SPECIFICATION]
```

### Example

```markdown
You are a technical writer with expertise in API documentation.

Your task is to write a concise description for an API endpoint based on its code.

Respond in markdown with:
- One-line summary
- Parameters table
- Example request/response
```

### When to Use

- Quick transformations (summarize, translate, extract)
- Format conversions (JSON to YAML, code to docs)
- Simple classification tasks

---

## Pattern 2: COST (Context + Objective + Style + Tone)

**Best for:** Content generation requiring specific voice.

### Structure

```
<context>
[Background information and situation]
</context>

<objective>
[What needs to be accomplished]
</objective>

<style>
[Writing style: formal, casual, technical, conversational]
</style>

<tone>
[Emotional quality: enthusiastic, professional, empathetic, authoritative]
</tone>
```

### Example

```markdown
<context>
You are writing for a B2B SaaS company that sells project management software.
The audience is engineering managers at mid-size companies.
</context>

<objective>
Write a product announcement for a new Gantt chart feature.
</objective>

<style>
Professional but accessible. Avoid jargon. Use concrete examples.
</style>

<tone>
Confident and helpful, not salesy. Focus on solving problems.
</tone>
```

### When to Use

- Marketing copy and blog posts
- User-facing documentation
- Email templates
- Social media content

---

## Pattern 3: STAR (Situation + Task + Action + Result)

**Best for:** Complex multi-step reasoning and analysis tasks.

### Structure

```
<situation>
[Current state and background]
</situation>

<task>
[What needs to be analyzed or decided]
</task>

<action>
Think through this step by step:
1. [First consideration]
2. [Second consideration]
3. [Third consideration]
</action>

<result>
Provide your conclusion in this format:
[Output specification]
</result>
```

### Example

```markdown
<situation>
A user reports that their API calls are failing intermittently.
Error logs show 503 responses occurring 15% of the time.
The system uses a load balancer with 3 backend servers.
</situation>

<task>
Diagnose the most likely root cause and recommend a fix.
</task>

<action>
Think through this step by step:
1. What could cause intermittent 503 errors?
2. Why would it affect only 15% of requests?
3. What's the connection to the load balancer setup?
</action>

<result>
## Diagnosis
[Most likely cause with reasoning]

## Evidence
[What supports this diagnosis]

## Recommended Fix
[Specific action to take]
</result>
```

### When to Use

- Debugging and troubleshooting
- Technical analysis
- Decision support
- Root cause analysis

---

## Pattern 4: RRET (Role + Rules + Examples + Task)

**Best for:** Tasks requiring strict guideline adherence.

### Structure

```
<role>
You are a [ROLE] who [KEY RESPONSIBILITY].
</role>

<rules>
Follow these rules exactly:
1. [Rule 1 - be specific]
2. [Rule 2 - be specific]
3. [Rule 3 - be specific]

Never:
- [Prohibition 1]
- [Prohibition 2]
</rules>

<examples>
<example>
Input: [sample]
Output: [expected]
</example>
</examples>

<task>
[Current task to perform]
</task>
```

### Example

```markdown
<role>
You are a data validator who checks user submissions for compliance.
</role>

<rules>
Follow these rules exactly:
1. Email must contain @ and a valid domain
2. Phone must be 10 digits, formatted as (XXX) XXX-XXXX
3. Age must be between 18 and 120

Never:
- Accept partial data
- Make assumptions about missing fields
- Modify the original data
</rules>

<examples>
<example>
Input: {"email": "test@example.com", "phone": "5551234567", "age": 25}
Output: {"valid": true, "errors": []}
</example>
<example>
Input: {"email": "invalid", "phone": "123", "age": 15}
Output: {"valid": false, "errors": ["Invalid email format", "Phone must be 10 digits", "Age must be 18+"]}
</example>
</examples>

<task>
Validate: {"email": "user@domain.co", "phone": "9876543210", "age": 30}
</task>
```

### When to Use

- Data validation and formatting
- Compliance checking
- Structured data extraction
- Template-based generation

---

## Pattern 5: Chain of Thought (CoT)

**Best for:** Complex reasoning, math, logic problems.

### Structure

```
[Task description]

Think through this step by step:
1. First, [initial analysis]
2. Then, [build on previous step]
3. Finally, [reach conclusion]

Show your reasoning before giving the final answer.
```

### Variants

**Zero-shot CoT:**
```
[Task]

Let's think step by step.
```

**Few-shot CoT:**
```
Example:
Q: [Question]
A: Let me think through this...
   Step 1: [reasoning]
   Step 2: [reasoning]
   Therefore: [answer]

Now solve:
Q: [New question]
```

### When to Use

- Mathematical calculations
- Logic puzzles
- Multi-step reasoning
- Cause-effect analysis

---

## Pattern 6: Few-Shot

**Best for:** Format-specific outputs, classification, style matching.

### Structure

```
[Task description]

Examples:

Input: [example 1 input]
Output: [example 1 output]

Input: [example 2 input]
Output: [example 2 output]

Input: [example 3 input]
Output: [example 3 output]

Now process:
Input: [actual input]
Output:
```

### Guidelines

| Examples | Use Case |
|----------|----------|
| 1-2 | Simple format matching |
| 3-5 | Complex patterns, edge cases |
| 5+ | Highly nuanced classification |

### Example

```markdown
Classify the sentiment of customer reviews.

Examples:

Input: "This product exceeded my expectations! Will buy again."
Output: {"sentiment": "positive", "confidence": 0.95}

Input: "It's okay, nothing special but does the job."
Output: {"sentiment": "neutral", "confidence": 0.75}

Input: "Broke after one week. Complete waste of money."
Output: {"sentiment": "negative", "confidence": 0.90}

Now classify:
Input: "Decent quality for the price, though shipping was slow."
Output:
```

### When to Use

- Classification tasks
- Format standardization
- Style imitation
- Pattern recognition

---

## Pattern 7: ReAct (Reason + Act)

**Best for:** Tool-using agents, research tasks, multi-step workflows.

### Structure

```
You have access to these tools:
- [Tool 1]: [description]
- [Tool 2]: [description]

For each step, use this format:

Thought: [reasoning about what to do next]
Action: [tool name]
Action Input: [input to the tool]
Observation: [result from the tool]

Repeat until you have enough information, then:

Thought: I now have enough information to answer.
Final Answer: [your response]
```

### Example

```markdown
You have access to these tools:
- Search: Search the web for information
- Calculator: Perform mathematical calculations
- Lookup: Look up specific facts in a database

Question: What is the population density of Tokyo in people per square mile?

Thought: I need to find Tokyo's population and area, then calculate density.
Action: Search
Action Input: "Tokyo population 2024"
Observation: Tokyo's population is approximately 13.96 million.

Thought: Now I need Tokyo's area in square miles.
Action: Search
Action Input: "Tokyo area square miles"
Observation: Tokyo covers approximately 847 square miles.

Thought: Now I can calculate population density.
Action: Calculator
Action Input: 13960000 / 847
Observation: 16,481.7

Thought: I now have enough information to answer.
Final Answer: Tokyo's population density is approximately 16,482 people per square mile.
```

### When to Use

- Research and information gathering
- Multi-tool workflows
- Autonomous agent tasks
- Complex problem solving

---

## Pattern 8: Constitutional

**Best for:** Tasks requiring value alignment, content moderation, safety.

### Structure

```
<principles>
1. [Principle 1 - what to uphold]
2. [Principle 2 - what to uphold]
3. [Principle 3 - what to uphold]
</principles>

<task>
[What to do]
</task>

<self-check>
Before responding, verify:
- Does this response align with principle 1?
- Does this response align with principle 2?
- Does this response align with principle 3?

If any check fails, revise your response.
</self-check>
```

### Example

```markdown
<principles>
1. Accuracy: Only state facts that can be verified
2. Fairness: Present multiple perspectives on controversial topics
3. Safety: Never provide information that could cause harm
</principles>

<task>
Answer the user's question about {{TOPIC}}.
</task>

<self-check>
Before responding, verify:
- Have I only stated verifiable facts?
- Have I presented this fairly without bias?
- Could this response cause harm if misused?

If any check fails, revise your response accordingly.
</self-check>
```

### When to Use

- Content moderation
- Sensitive topic handling
- High-stakes decisions
- Ethical reasoning tasks

---

## Pattern Selection Matrix

| Requirement | Recommended Pattern |
|-------------|---------------------|
| Simple transformation | PTF |
| Specific voice/tone | COST |
| Complex analysis | STAR |
| Strict rules | RRET |
| Mathematical reasoning | Chain of Thought |
| Format matching | Few-Shot |
| Tool usage | ReAct |
| Value alignment | Constitutional |

## Combining Patterns

Patterns can be combined for complex prompts:

**RRET + Few-Shot:** Strict rules with format examples
**STAR + CoT:** Analysis with explicit reasoning
**Constitutional + Any:** Add value checks to any pattern
