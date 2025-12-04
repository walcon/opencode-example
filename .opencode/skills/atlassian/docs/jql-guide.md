# JQL (Jira Query Language) Reference

JQL is used to search for Jira issues. Use this guide to construct valid queries.

## Basic Syntax

```
field operator value [AND/OR field operator value ...]
```

## Fields

### Common Fields

| Field | Description | Example Values |
|-------|-------------|----------------|
| `project` | Project key or name | `PROJ`, `"My Project"` |
| `type` | Issue type | `Bug`, `Story`, `Task`, `Epic`, `"Sub-task"` |
| `status` | Issue status | `"To Do"`, `"In Progress"`, `Done`, `Closed` |
| `priority` | Priority level | `Highest`, `High`, `Medium`, `Low`, `Lowest` |
| `assignee` | Assigned user | `currentUser()`, `"john@example.com"`, `EMPTY` |
| `reporter` | Issue creator | `currentUser()`, `"jane@example.com"` |
| `resolution` | Resolution status | `Unresolved`, `Fixed`, `"Won't Do"`, `Duplicate` |
| `labels` | Issue labels | `backend`, `urgent`, `"needs-review"` |
| `component` | Project component | `API`, `Frontend`, `"User Auth"` |
| `sprint` | Sprint name | `"Sprint 1"`, `openSprints()`, `futureSprints()` |
| `epic` | Epic link | `PROJ-100` |
| `parent` | Parent issue (subtasks) | `PROJ-50` |

### Date Fields

| Field | Description |
|-------|-------------|
| `created` | When issue was created |
| `updated` | When issue was last updated |
| `duedate` | Due date |
| `resolved` | When issue was resolved |
| `lastViewed` | When you last viewed it |

### Text Fields

| Field | Description |
|-------|-------------|
| `summary` | Issue title |
| `description` | Issue description |
| `comment` | Comment text |
| `text` | Searches summary, description, environment, comments |

## Operators

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equals | `status = Done` |
| `!=` | Not equals | `status != Done` |
| `>` | Greater than | `priority > Medium` |
| `>=` | Greater or equal | `created >= -7d` |
| `<` | Less than | `duedate < endOfWeek()` |
| `<=` | Less or equal | `updated <= -30d` |

### Text Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `~` | Contains (fuzzy) | `summary ~ "login bug"` |
| `!~` | Does not contain | `summary !~ test` |

### List Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `IN` | In list | `status IN ("To Do", "In Progress")` |
| `NOT IN` | Not in list | `type NOT IN (Epic, "Sub-task")` |

### Special Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `IS` | Is empty/null | `assignee IS EMPTY` |
| `IS NOT` | Is not empty/null | `duedate IS NOT EMPTY` |
| `WAS` | Previously was | `status WAS "In Progress"` |
| `WAS IN` | Previously was in | `status WAS IN (Open, Reopened)` |
| `WAS NOT` | Previously was not | `assignee WAS NOT currentUser()` |
| `CHANGED` | Value changed | `status CHANGED` |

## Functions

### User Functions

| Function | Description |
|----------|-------------|
| `currentUser()` | The logged-in user |
| `membersOf("group")` | Members of a group |

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
- `duedate <= 2w` (next 2 weeks)
- `updated >= -1M` (last month)

Units: `m` (minutes), `h` (hours), `d` (days), `w` (weeks), `M` (months), `y` (years)

### Sprint Functions

| Function | Description |
|----------|-------------|
| `openSprints()` | Currently active sprints |
| `closedSprints()` | Completed sprints |
| `futureSprints()` | Upcoming sprints |

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
ORDER BY field [ASC|DESC] [, field [ASC|DESC]]
```

Examples:
- `ORDER BY created DESC`
- `ORDER BY priority DESC, created ASC`

## Common Query Examples

### My Work

```jql
# My open issues
assignee = currentUser() AND resolution = Unresolved

# My issues updated today
assignee = currentUser() AND updated >= startOfDay()

# Issues I reported
reporter = currentUser()
```

### By Status

```jql
# All open issues in project
project = PROJ AND status != Done

# In progress work
status = "In Progress"

# Blocked or stuck issues
status IN (Blocked, "On Hold")
```

### By Type

```jql
# All bugs
type = Bug

# High priority bugs
type = Bug AND priority IN (Highest, High)

# Stories in current sprint
type = Story AND sprint IN openSprints()
```

### By Date

```jql
# Created this week
created >= startOfWeek()

# Due this week
duedate >= startOfWeek() AND duedate <= endOfWeek()

# Overdue
duedate < now() AND resolution = Unresolved

# Not updated in 30 days
updated <= -30d AND resolution = Unresolved

# Created in last 7 days
created >= -7d
```

### Text Search

```jql
# Summary contains text
summary ~ "login"

# Description contains text
description ~ "authentication error"

# Any text field contains
text ~ "API timeout"
```

### Complex Queries

```jql
# High priority bugs in my project, unresolved
project = PROJ AND type = Bug AND priority >= High AND resolution = Unresolved

# My team's work in current sprint
assignee IN membersOf("dev-team") AND sprint IN openSprints()

# Recently resolved by me
resolution IS NOT EMPTY AND resolved >= -7d AND assignee = currentUser()

# Epics with unfinished work
type = Epic AND "Epic Status" != Done

# Issues without estimates
"Story Points" IS EMPTY AND type IN (Story, Bug)
```

### Using CHANGED

```jql
# Status changed today
status CHANGED AFTER startOfDay()

# Assignee changed in last week
assignee CHANGED DURING (-7d, now())

# Priority was increased
priority CHANGED FROM Low TO High
```

## Tips

1. **Quote strings with spaces**: `status = "In Progress"` not `status = In Progress`
2. **Use parentheses for complex logic**: `(type = Bug OR type = Task) AND status = Open`
3. **EMPTY for null values**: `assignee IS EMPTY` not `assignee = null`
4. **Case insensitive**: `status = done` same as `status = Done`
5. **Escape quotes**: Use `\\\"` for literal quotes in strings
