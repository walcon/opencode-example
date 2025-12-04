import { jiraGet, exitWithError, output, getSiteUrl } from "./lib/atlassian.ts";

// ============================================================================
// Types
// ============================================================================

interface JiraIssue {
  key: string;
  id: string;
  fields: {
    summary: string;
    status: { name: string };
    issuetype: { name: string };
    priority?: { name: string };
    assignee?: { displayName: string; emailAddress: string };
    reporter?: { displayName: string };
    created: string;
    updated: string;
    duedate?: string;
    labels?: string[];
  };
}

interface SearchResponse {
  issues: JiraIssue[];
  nextPageToken?: string;
  isLast?: boolean;
}

// ============================================================================
// Main
// ============================================================================

const jql = process.argv[2];
const maxResults = process.argv[3] || "50";
const nextPageToken = process.argv[4] || undefined;

if (!jql) {
  console.log(`Usage: npx tsx jira-search.ts <JQL> [maxResults] [nextPageToken]

Arguments:
  JQL            Jira Query Language query string
  maxResults     Maximum results to return (default: 50, max: 100)
  nextPageToken  Token for pagination (from previous response)

Examples:
  npx tsx jira-search.ts "assignee = currentUser() AND status != Done"
  npx tsx jira-search.ts "project = PROJ AND type = Bug" 100
  npx tsx jira-search.ts "project = PROJ" 50 "token123..."

See docs/jql-guide.md for JQL syntax reference.`);
  process.exit(1);
}

async function search() {
  const params: Record<string, string | string[]> = {
    jql,
    maxResults,
    fields: [
      "summary",
      "status",
      "issuetype",
      "priority",
      "assignee",
      "reporter",
      "created",
      "updated",
      "duedate",
      "labels",
    ],
  };

  if (nextPageToken) {
    params.nextPageToken = nextPageToken;
  }

  const response = await jiraGet<SearchResponse>("search/jql", params);

  if (!response.ok) {
    exitWithError(response.error || "Search failed");
  }

  const data = response.data!;
  const siteUrl = getSiteUrl();

  const issues = data.issues.map((issue) => ({
    key: issue.key,
    url: `${siteUrl}/browse/${issue.key}`,
    summary: issue.fields.summary,
    type: issue.fields.issuetype.name,
    status: issue.fields.status.name,
    priority: issue.fields.priority?.name || "None",
    assignee: issue.fields.assignee?.displayName || "Unassigned",
    reporter: issue.fields.reporter?.displayName || "Unknown",
    created: issue.fields.created,
    updated: issue.fields.updated,
    duedate: issue.fields.duedate || null,
    labels: issue.fields.labels || [],
  }));

  output({
    returned: issues.length,
    isLast: data.isLast ?? true,
    nextPageToken: data.nextPageToken || null,
    issues,
  });
}

search();
