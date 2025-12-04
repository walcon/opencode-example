import { jiraGet, exitWithError, output, getSiteUrl } from "./lib/atlassian.ts";

// ============================================================================
// Types
// ============================================================================

interface JiraIssue {
  key: string;
  id: string;
  fields: {
    summary: string;
    description?: unknown;
    status: { name: string };
    issuetype: { name: string };
    priority?: { name: string };
    assignee?: { displayName: string; emailAddress: string };
    reporter?: { displayName: string; emailAddress: string };
    created: string;
    updated: string;
    duedate?: string;
    labels?: string[];
    components?: Array<{ name: string }>;
    fixVersions?: Array<{ name: string }>;
    parent?: { key: string; fields: { summary: string } };
    subtasks?: Array<{ key: string; fields: { summary: string; status: { name: string } } }>;
    comment?: { comments: Array<{ author: { displayName: string }; body: unknown; created: string }> };
  };
}

// ============================================================================
// Main
// ============================================================================

const issueKey = process.argv[2];

if (!issueKey) {
  console.log(`Usage: npx tsx jira-get.ts <issueKey>

Arguments:
  issueKey    The Jira issue key (e.g., PROJ-123)

Examples:
  npx tsx jira-get.ts PROJ-123
  npx tsx jira-get.ts BUG-456`);
  process.exit(1);
}

async function getIssue() {
  const response = await jiraGet<JiraIssue>(`issue/${encodeURIComponent(issueKey)}`, {
    fields: "summary,description,status,issuetype,priority,assignee,reporter,created,updated,duedate,labels,components,fixVersions,parent,subtasks,comment",
    expand: "renderedFields",
  });

  if (!response.ok) {
    exitWithError(response.error || `Failed to get issue ${issueKey}`);
  }

  const issue = response.data!;
  const siteUrl = getSiteUrl();

  output({
    key: issue.key,
    id: issue.id,
    url: `${siteUrl}/browse/${issue.key}`,
    summary: issue.fields.summary,
    description: issue.fields.description,
    type: issue.fields.issuetype.name,
    status: issue.fields.status.name,
    priority: issue.fields.priority?.name || "None",
    assignee: issue.fields.assignee
      ? {
          name: issue.fields.assignee.displayName,
          email: issue.fields.assignee.emailAddress,
        }
      : null,
    reporter: issue.fields.reporter
      ? {
          name: issue.fields.reporter.displayName,
          email: issue.fields.reporter.emailAddress,
        }
      : null,
    created: issue.fields.created,
    updated: issue.fields.updated,
    duedate: issue.fields.duedate || null,
    labels: issue.fields.labels || [],
    components: (issue.fields.components || []).map((c) => c.name),
    fixVersions: (issue.fields.fixVersions || []).map((v) => v.name),
    parent: issue.fields.parent
      ? {
          key: issue.fields.parent.key,
          summary: issue.fields.parent.fields.summary,
        }
      : null,
    subtasks: (issue.fields.subtasks || []).map((s) => ({
      key: s.key,
      summary: s.fields.summary,
      status: s.fields.status.name,
    })),
    recentComments: (issue.fields.comment?.comments || []).slice(-5).map((c) => ({
      author: c.author.displayName,
      body: c.body,
      created: c.created,
    })),
  });
}

getIssue();
