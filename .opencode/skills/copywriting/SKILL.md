---
name: copywriting
description: >
  Write compelling copy using proven frameworks. Use when: (1) Creating headlines,
  ads, or CTAs, (2) Writing sales pages or emails, (3) Positioning products,
  (4) Validating copy quality.
---

# Copywriting

Write high-converting copy using proven marketing frameworks.

## Quick Start

| Content Type | Formula | Structure |
|--------------|---------|-----------|
| Short ad, cold audience | PAS | Problem → Agitate → Solution |
| Long sales page | AIDA | Attention → Interest → Desire → Action |
| Social media post | BAB | Before → After → Bridge |
| Product description | FAB | Features → Advantages → Benefits |
| B2B/LinkedIn | SCQA | Situation → Complication → Question → Answer |
| Brand positioning | StoryBrand | Hero → Problem → Guide → Plan → CTA → Stakes → Success |

## Workflow

**What are you creating?**

| Goal | Go to |
|------|-------|
| Headlines or short-form copy | Headline Workflow |
| Sales pages, emails, long-form | Long-Form Workflow |
| Brand messaging or positioning | Positioning Workflow |
| Check existing copy quality | Validation Workflow |

---

## Headline Workflow

### Step 1: Assess Audience Awareness

Determine where the audience is on Schwartz's 5 Stages:

| Stage | They know... | Headline approach |
|-------|--------------|-------------------|
| Unaware | Nothing about the problem | Lead with emotion/identity |
| Problem-Aware | The pain, not solutions | Agitate the problem |
| Solution-Aware | Solutions exist, not yours | Differentiate your approach |
| Product-Aware | Your product, need convincing | Features, benefits, comparisons |
| Most Aware | Ready to buy | Price, offer, urgency |

For detailed strategies, read `references/awareness.md`.

### Step 2: Select Formula

| Awareness Level | Best Formula |
|-----------------|--------------|
| Unaware | Story-led, soft PAS |
| Problem-Aware | PAS, BAB |
| Solution-Aware | FAB, 4Ps |
| Product-Aware | AIDA, FAB with comparisons |
| Most Aware | Direct CTA, offer-focused |

### Step 3: Apply Three Rules Validation

Before finalizing, every headline must pass:

| Rule | Test | Fail → Pass |
|------|------|-------------|
| **Visualize** | Can you see it? | "Transform workflow" → "From couch to 5K" |
| **Falsify** | Is it provable? | "High quality" → "Handstitched in Vermont since 1923" |
| **Unique** | Could a competitor say it? | "The better solution" → "1000 songs in your pocket" |

### Step 4: Score with 4U's

Rate 1-4 for each. Target: 3.5+ average.

| U | Question |
|---|----------|
| **Useful** | Does it show clear benefit? |
| **Urgent** | Is there time pressure? |
| **Unique** | Does it stand out? |
| **Ultra-specific** | Are there concrete details? |

### Step 5: Validate

```bash
npx tsx scripts/validate-copy.ts "Your headline here"
```

---

## Long-Form Workflow

### Step 1: Assess Audience Awareness

Same as Headline Workflow Step 1. Key insight: **Copy length increases as awareness decreases.**

- Most Aware → Short, direct offer
- Unaware → Long-form education required

### Step 2: Select Framework

| Scenario | Framework |
|----------|-----------|
| Standard sales page | AIDA |
| Webinar/infomercial style | 4Ps (Promise → Picture → Proof → Push) |
| Email sequence | AIDA spread across emails |
| Problem-heavy audience | PAS expanded |

### Step 3: Apply AIDA Structure

| Stage | Goal | Techniques |
|-------|------|------------|
| **Attention** | Stop the scroll | Bold headlines, questions, shocking stats |
| **Interest** | Build curiosity | Benefits, stories, "what's in it for me" |
| **Desire** | Create want | Social proof, transformation, FOMO |
| **Action** | Drive conversion | Clear CTA, urgency, risk reversal |

For full formula details, read `references/formulas.md`.

### Step 4: Layer in Persuasion

Apply Cialdini's principles where appropriate:

| Principle | Copy Element |
|-----------|--------------|
| Reciprocity | Lead magnets, free value |
| Social Proof | "Join 50,000+ users", testimonials |
| Authority | "Featured in Forbes", credentials |
| Scarcity | "Only 3 left", countdown timers |
| Unity | "For developers, by developers" |

For full list, read `references/persuasion.md`.

### Step 5: Validate

Run copy review checklist:

- [ ] One Mississippi test (understood in <2 seconds?)
- [ ] Every line visualizable?
- [ ] Every claim falsifiable?
- [ ] Competitor couldn't sign it?
- [ ] No paragraph >2 lines?
- [ ] No red flag words?

```bash
npx tsx scripts/validate-copy.ts "Your copy here"
```

---

## Positioning Workflow

### Step 1: Fill Positioning Canvas

```
FOR: [Target customer]
WHO: [Has this problem/need]
WE ARE: [Category/frame]
THAT: [Key benefit/difference]
UNLIKE: [Competitor/old way]
WE: [Proof point/unique capability]
```

### Step 2: Apply StoryBrand SB7

Position customer as hero, brand as guide:

| Element | Role | Question |
|---------|------|----------|
| 1. Character | Hero (customer) | What do they want? |
| 2. Problem | External, Internal, Philosophical | What's blocking them? |
| 3. Guide | Your brand | Why can you help? |
| 4. Plan | 3-step process | How do they succeed? |
| 5. Call to Action | Direct + Transitional | What should they do? |
| 6. Failure | Stakes | What if they don't act? |
| 7. Success | Transformation | What does winning look like? |

Core principle: **"If you confuse, you lose."**

### Step 3: Generate One-Liner

Formula: `[Problem] + [Solution] + [Result]`

Example:
> "Most businesses struggle to explain what they do. We help you clarify your message. So customers actually listen."

### Step 4: Apply Three Rules

Same as Headline Workflow Step 3. Every positioning statement must:
- Visualize (concrete, not abstract)
- Falsify (provable, not adjective soup)
- Be Unique (competitor couldn't say it)

### Step 5: Run Tests

- **T-shirt test**: Would you print this on a shirt?
- **One Mississippi**: Understood in under 2 seconds?
- **Competitor test**: Could they sign this ad?

For detailed frameworks, read `references/positioning.md`.

---

## Validation Workflow

### Quick Validation

```bash
npx tsx scripts/validate-copy.ts "Your copy here"
```

### Red Flag Words (Automatic rewrite)

| Red Flag | Problem |
|----------|---------|
| "Innovative solution" | Abstract, unfalsifiable |
| "Best in class" | Generic, competitor could say it |
| "Seamless experience" | Can't visualize |
| "Transform your..." | Abstract verb |
| "Cutting-edge" | Meaningless buzzword |
| Multiple adjectives | Hiding weak nouns |
| "And" 3+ times | Scope creep |

### Full Checklist

For comprehensive validation, read `references/validation.md`.

---

## Core Formulas Reference

### PAS (Problem → Agitate → Solution)

The go-to for short-form copy.

| Stage | Goal | Example |
|-------|------|---------|
| **Problem** | Name the pain | "Spending hours on copy that doesn't convert?" |
| **Agitate** | Amplify emotion | "Every failed campaign costs leads and credibility." |
| **Solution** | Present cure | "Our AI writes high-converting copy in seconds." |

### AIDA (Attention → Interest → Desire → Action)

The foundation for long-form sales.

| Stage | Goal |
|-------|------|
| **Attention** | Stop the scroll with bold hook |
| **Interest** | Build curiosity with benefits |
| **Desire** | Create want with proof and emotion |
| **Action** | Clear CTA with urgency |

### BAB (Before → After → Bridge)

Best for transformation stories.

| Stage | Goal |
|-------|------|
| **Before** | Paint the problem world |
| **After** | Show transformed outcome |
| **Bridge** | Your solution connects them |

For all 7 formulas with full examples, read `references/formulas.md`.

---

## Output Format

Always return copy with explanation:

```
**Copy:**
[The generated copy]

**Framework:** [Name]
[1-2 sentences: why this framework fits the use case]

**Validation:**
- Score: [X/4]
- [Any red flags or recommendations]
```

---

## References

| File | When to read |
|------|--------------|
| `references/formulas.md` | Need full formula details or examples |
| `references/awareness.md` | Assessing audience awareness level |
| `references/persuasion.md` | Layering in psychological triggers |
| `references/positioning.md` | Brand messaging, StoryBrand, Three Rules |
| `references/validation.md` | Full quality checklist, 4U's scoring |
