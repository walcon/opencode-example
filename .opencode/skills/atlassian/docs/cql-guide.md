# CQL (Confluence Query Language) Reference

CQL is used to search for Confluence content. Use this guide to construct valid queries.

## Basic Syntax

```
field operator value [AND/OR field operator value ...]
```

## Fields

### Content Fields

| Field | Description | Example Values |
|-------|-------------|----------------|
| `type` | Content type | `page`, `blogpost`, `attachment`, `comment` |
| `title` | Page/blog title | `"API Documentation"` |
| `text` | Content body text | `"installation guide"` |
| `space` | Space key | `DEV`, `TEAM`, `"Engineering"` |
| `label` | Content labels | `documentation`, `draft`, `archived` |
| `id` | Content ID | `123456` |

### User Fields

| Field | Description | Example Values |
|-------|-------------|----------------|
| `creator` | Who created it | `currentUser()`, `"john@example.com"` |
| `contributor` | Who edited it | `currentUser()`, `"jane@example.com"` |
| `mention` | Mentioned user | `currentUser()` |
| `watcher` | Watching user | `currentUser()` |
| `favourite` | Favorited by | `currentUser()` |

### Date Fields

| Field | Description |
|-------|-------------|
| `created` | When content was created |
| `lastmodified` | When content was last modified |

### Parent/Ancestor Fields

| Field | Description |
|-------|-------------|
| `parent` | Direct parent page |
| `ancestor` | Any ancestor page |
| `container` | Container (space or parent) |

## Operators

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equals | `space = DEV` |
| `!=` | Not equals | `type != comment` |
| `>` | Greater than (dates) | `created > 2024-01-01` |
| `>=` | Greater or equal | `lastmodified >= -7d` |
| `<` | Less than | `created < now()` |
| `<=` | Less or equal | `lastmodified <= -30d` |

### Text Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `~` | Contains (fuzzy match) | `title ~ "roadmap"` |
| `!~` | Does not contain | `title !~ draft` |

### List Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `IN` | In list | `space IN (DEV, TEAM)` |
| `NOT IN` | Not in list | `type NOT IN (comment, attachment)` |

### Null Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `IS NULL` | Is empty/null | `label IS NULL` |
| `IS NOT NULL` | Has value | `label IS NOT NULL` |

## Functions

### User Functions

| Function | Description |
|----------|-------------|
| `currentUser()` | The logged-in user |

### Date Functions

| Function | Description |
|----------|-------------|
| `now()` | Current datetime |
| `startOfDay()` | Start of today |
| `endOfDay()` | End of today |
| `startOfWeek()` | Start of current week |
| `endOfWeek()` | End of current week |
| `startOfMonth()` | Start of current month |
| `endOfMonth()` | End of current month |
| `startOfYear()` | Start of current year |
| `endOfYear()` | End of current year |

### Relative Dates

Use `-` or `+` with time units:
- `created >= -7d` (last 7 days)
- `lastmodified >= -1M` (last month)

Units: `m` (minutes), `h` (hours), `d` (days), `w` (weeks), `M` (months), `y` (years)

## Logical Operators

| Operator | Description |
|----------|-------------|
| `AND` | Both conditions must match |
| `OR` | Either condition matches |
| `NOT` | Negates condition |
| `()` | Grouping for precedence |

## ORDER BY

Sort results:
```
ORDER BY field [ASC|DESC]
```

Examples:
- `ORDER BY lastmodified DESC`
- `ORDER BY title ASC`
- `ORDER BY created DESC`

## Common Query Examples

### By Type

```cql
# All pages
type = page

# All blog posts
type = blogpost

# Pages and blogs only (no comments/attachments)
type IN (page, blogpost)
```

### By Space

```cql
# All content in a space
space = DEV

# Multiple spaces
space IN (DEV, TEAM, DOCS)

# Exclude a space
space != ARCHIVE
```

### By Title

```cql
# Exact title match
title = "API Documentation"

# Title contains text
title ~ roadmap

# Title contains phrase
title ~ "Q4 planning"
```

### By Content

```cql
# Content contains text
text ~ "installation"

# Content contains phrase
text ~ "how to configure"

# Title or content contains
title ~ kubernetes OR text ~ kubernetes
```

### By Label

```cql
# Has specific label
label = documentation

# Multiple labels (any)
label IN (draft, review)

# Has no labels
label IS NULL
```

### By Date

```cql
# Created today
created >= startOfDay()

# Modified this week
lastmodified >= startOfWeek()

# Created in last 30 days
created >= -30d

# Not modified in 90 days (stale content)
lastmodified <= -90d

# Created this year
created >= startOfYear()
```

### By User

```cql
# Created by me
creator = currentUser()

# Modified by me
contributor = currentUser()

# My favorites
favourite = currentUser()

# Pages I'm watching
watcher = currentUser()

# Pages that mention me
mention = currentUser()
```

### By Hierarchy

```cql
# Child pages of a specific page
parent = 123456

# All descendants of a page
ancestor = 123456
```

### Complex Queries

```cql
# Documentation pages in DEV space
space = DEV AND type = page AND label = documentation

# Recently updated pages I created
creator = currentUser() AND lastmodified >= -7d AND type = page

# Stale documentation (not updated in 6 months)
label = documentation AND lastmodified <= -6M AND type = page

# Active project pages
space = PROJ AND type = page AND label != archived AND lastmodified >= -30d

# Meeting notes from this month
title ~ "Meeting Notes" AND created >= startOfMonth()

# Pages with TODO items
text ~ "TODO" AND type = page
```

### Search with Sorting

```cql
# Recently modified pages
type = page ORDER BY lastmodified DESC

# Alphabetical page list in space
space = DEV AND type = page ORDER BY title ASC

# Newest content first
space = TEAM ORDER BY created DESC
```

## Tips

1. **Quote strings with spaces**: `title ~ "API Guide"` not `title ~ API Guide`
2. **Space keys are uppercase**: `space = DEV` not `space = dev`
3. **Use parentheses for complex logic**: `(label = draft OR label = review) AND space = DEV`
4. **Text search is fuzzy**: `text ~ install` matches "installation", "installing", etc.
5. **Combine with ORDER BY**: Always add sorting for consistent results
6. **Labels are case-sensitive**: `label = Documentation` vs `label = documentation`

## Common Search Patterns

### Find Documentation
```cql
type = page AND (label = documentation OR title ~ docs) AND space = DEV
```

### Find Meeting Notes
```cql
type = page AND title ~ "meeting" ORDER BY created DESC
```

### Find Drafts
```cql
type = page AND label = draft AND creator = currentUser()
```

### Find Stale Content
```cql
type = page AND lastmodified <= -90d AND label != archived
```

### Find by Topic
```cql
(title ~ "kubernetes" OR text ~ "kubernetes") AND type = page
```
