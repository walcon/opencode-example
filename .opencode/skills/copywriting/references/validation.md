# Copy Validation

Quality checks, scoring frameworks, and red flags for copy.

---

## The 4U's Headline Formula

Developed by Michael Masterson (AWAI). Score each headline 1-4 on each dimension.

### The 4 U's

| U | Definition | Question |
|---|------------|----------|
| **Useful** | Shows clear benefit | Does it help the reader? |
| **Urgent** | Creates time pressure | Is there a reason to act now? |
| **Unique** | Differentiates | Could a competitor say this? |
| **Ultra-specific** | Provides details | Are there concrete numbers or facts? |

### Scoring Guide

| Score | Meaning |
|-------|---------|
| 1 | Not present |
| 2 | Weak/implied |
| 3 | Present and clear |
| 4 | Strong and compelling |

**Target:** 3.5+ average across all 4 U's.

### Examples

| Headline | U | Ur | Un | Us | Avg | Verdict |
|----------|---|----|----|----|----|---------|
| "Improve your marketing" | 2 | 1 | 1 | 1 | 1.25 | Weak |
| "Get more leads" | 2 | 1 | 1 | 1 | 1.25 | Weak |
| "Double your email opens in 7 days" | 4 | 3 | 2 | 4 | 3.25 | Good |
| "The counterintuitive way to 3x sales before Friday" | 4 | 4 | 3 | 4 | 3.75 | Strong |

---

## Copy Review Checklist

Run through before shipping any copy:

### Must Pass

- [ ] **One Mississippi test** — Understood in <2 seconds?
- [ ] **Every line visualizable** — Concrete, not abstract?
- [ ] **Every claim falsifiable** — Provable, not adjective soup?
- [ ] **Competitor couldn't sign it** — Unique angle?

### Should Pass

- [ ] **Kaplan's Law applied** — Every word earns its place?
- [ ] **No paragraph >2 lines** — Scannable?
- [ ] **First line hooks to second** — Curiosity → payoff?
- [ ] **Reviewed in context** — Mocked up where it lives?

### Track

- [ ] **Word count reduced** — Started ___ → Ended ___

---

## Red Flag Words

These trigger an automatic rewrite. They're vague, generic, or meaningless.

| Red Flag | Problem | Fix |
|----------|---------|-----|
| "Innovative solution" | Abstract, unfalsifiable | What specifically is new? |
| "Best in class" | Generic, competitor could say it | Prove it with specifics |
| "Seamless experience" | Can't visualize | What does the user actually see? |
| "Transform your..." | Abstract verb | What changes concretely? |
| "Cutting-edge" | Meaningless buzzword | What technology specifically? |
| "Leverage" | Corporate jargon | Use "use" instead |
| "Synergy" | Empty business-speak | What's the actual benefit? |
| "Revolutionary" | Overused, unfalsifiable | What's the specific innovation? |
| "World-class" | Unverifiable claim | Who says so? Prove it |
| "End-to-end" | Vague scope | List what's actually included |

### Pattern Red Flags

| Pattern | Problem | Example |
|---------|---------|---------|
| Multiple adjectives | Hiding weak nouns | "Amazing, innovative, powerful tool" |
| "And" 3+ times | Scope creep, unfocused | "Fast and easy and powerful and..." |
| Superlatives without proof | Unverifiable | "The best," "The fastest," "The only" |

---

## Word-Level Fixes

### Weak → Strong Verbs

| Weak | Strong |
|------|--------|
| Utilize | Use |
| Implement | Build, Create |
| Facilitate | Help, Enable |
| Leverage | Use |
| Optimize | Improve, Speed up |
| Enhance | Boost, Strengthen |

### Vague → Specific

| Vague | Specific |
|-------|----------|
| "Many customers" | "10,000+ customers" |
| "Fast results" | "Results in 7 days" |
| "Save time" | "Save 4 hours/week" |
| "Affordable" | "Starting at $9/month" |
| "Easy to use" | "Set up in 3 clicks" |

---

## Paragraph Rules

### Length

- **Headlines:** 5-12 words optimal
- **Subheads:** 8-15 words
- **Body paragraphs:** Max 2 lines (40-50 words)
- **Sentences:** 15-20 words average, vary length

### Structure

Every paragraph should:
1. Lead with the key point
2. Support with one detail
3. End with forward momentum

---

## Validation Script

Use the CLI tool for automated checking:

```bash
npx tsx scripts/validate-copy.ts "Your copy here"
```

### What It Checks

| Check | What It Does |
|-------|--------------|
| Red flags | Scans for known weak words |
| 4U's score | Heuristic scoring on each dimension |
| Word count | Total words, avg per sentence |
| Reading time | Estimates "One Mississippi" test |
| Line length | Flags long paragraphs |

### Interpreting Results

| Score | Meaning |
|-------|---------|
| 3.5+ | Ready to ship |
| 2.5-3.4 | Needs improvement |
| <2.5 | Major rewrite needed |

---

## Quick Validation Flow

1. **Run script:** `npx tsx scripts/validate-copy.ts "..."`
2. **Check red flags:** Replace any flagged words
3. **Check 4U's:** Strengthen any dimension below 3
4. **Read aloud:** Does it flow? Any stumbles?
5. **One Mississippi:** Can you say it in 2 seconds?
6. **Competitor test:** Could they use this?
7. **Ship or iterate**

---

## Common Failure Modes

### 1. Feature-focused instead of benefit-focused

**Wrong:** "Built with React and Node.js"
**Right:** "Loads in 0.3 seconds"

### 2. Abstract instead of concrete

**Wrong:** "Improve your workflow"
**Right:** "Cut report time from 2 hours to 10 minutes"

### 3. Generic instead of specific

**Wrong:** "Used by many companies"
**Right:** "Used by 500+ companies including Stripe and Notion"

### 4. Telling instead of showing

**Wrong:** "We're the best at customer service"
**Right:** "Average response time: 47 seconds"

---

## Final Check

Before publishing, answer these three questions:

1. **Would I click this?** — Be honest
2. **Would I share this?** — Is it remarkable?
3. **Would I remember this?** — Is it sticky?

If any answer is "no," keep iterating.
