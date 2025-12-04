import { jiraGet, jiraPost, exitWithError, output, parseJsonArg, getSiteUrl } from "./lib/atlassian.ts";

// ============================================================================
// Types
// ============================================================================

interface CreateIssueInput {
  project: string;
  type: string;
  summary: string;
  description?: string;
  priority?: string;
  assignee?: string;
  labels?: string[];
  components?: string[];
  duedate?: string;
  parent?: string; // For subtasks
}

interface CreateIssueResponse {
  id: string;
  key: string;
  self: string;
}

interface Project {
  id: string;
  key: string;
  name: string;
}

interface IssueType {
  id: string;
  name: string;
  subtask: boolean;
}

// ============================================================================
// Main
// ============================================================================

const jsonArg = process.argv[2];

if (!jsonArg) {
  console.log(`Usage: npx tsx jira-create.ts '<JSON>'

Arguments:
  JSON    Issue configuration as JSON (single object or array for bulk)

Required fields:
  project     Project key (e.g., "PROJ")
  type        Issue type (e.g., "Bug", "Story", "Task")
  summary     Issue title

Optional fields:
  description Issue description
  priority    Priority name (e.g., "High", "Medium", "Low")
  assignee    Assignee email or account ID
  labels      Array of labels
  components  Array of component names
  duedate     Due date (YYYY-MM-DD format)
  parent      Parent issue key (for subtasks)

Examples:
  # Single issue
  npx tsx jira-create.ts '{"project": "PROJ", "type": "Bug", "summary": "Login fails"}'

  # With all fields
  npx tsx jira-create.ts '{"project": "PROJ", "type": "Story", "summary": "Add feature", "description": "Details here", "priority": "High", "labels": ["urgent"]}'

  # Bulk create
  npx tsx jira-create.ts '[{"project": "PROJ", "type": "Task", "summary": "Task 1"}, {"project": "PROJ", "type": "Task", "summary": "Task 2"}]'`);
  process.exit(1);
}

async function getProjectId(projectKey: string): Promise<string> {
  const response = await jiraGet<{ values: Project[] }>("project/search", {
    keys: projectKey,
  });

  if (!response.ok || !response.data?.values?.length) {
    exitWithError(`Project "${projectKey}" not found`);
  }

  return response.data.values[0].id;
}

async function getIssueTypeId(projectId: string, typeName: string): Promise<string> {
  const response = await jiraGet<IssueType[]>(`project/${projectId}/statuses`);
  
  // Try alternative endpoint
  const altResponse = await jiraGet<{ issueTypes: IssueType[] }>(`project/${projectId}`);
  
  if (!altResponse.ok || !altResponse.data?.issueTypes) {
    exitWithError(`Failed to get issue types for project`);
  }

  const issueType = altResponse.data.issueTypes.find(
    (it) => it.name.toLowerCase() === typeName.toLowerCase()
  );

  if (!issueType) {
    const available = altResponse.data.issueTypes.map((it) => it.name).join(", ");
    exitWithError(`Issue type "${typeName}" not found. Available: ${available}`);
  }

  return issueType.id;
}

async function createSingleIssue(input: CreateIssueInput): Promise<{ key: string; url: string }> {
  // Validate required fields
  if (!input.project || !input.type || !input.summary) {
    exitWithError("Missing required fields: project, type, summary");
  }

  // Get project and issue type IDs
  const projectId = await getProjectId(input.project);
  const issueTypeId = await getIssueTypeId(projectId, input.type);

  // Build the request body
  const fields: Record<string, unknown> = {
    project: { id: projectId },
    issuetype: { id: issueTypeId },
    summary: input.summary,
  };

  if (input.description) {
    // Atlassian Document Format for description
    fields.description = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: input.description }],
        },
      ],
    };
  }

  if (input.priority) {
    fields.priority = { name: input.priority };
  }

  if (input.assignee) {
    fields.assignee = { id: input.assignee };
  }

  if (input.labels?.length) {
    fields.labels = input.labels;
  }

  if (input.components?.length) {
    fields.components = input.components.map((name) => ({ name }));
  }

  if (input.duedate) {
    fields.duedate = input.duedate;
  }

  if (input.parent) {
    fields.parent = { key: input.parent };
  }

  const response = await jiraPost<CreateIssueResponse>("issue", { fields });

  if (!response.ok) {
    exitWithError(response.error || "Failed to create issue");
  }

  const siteUrl = getSiteUrl();
  return {
    key: response.data!.key,
    url: `${siteUrl}/browse/${response.data!.key}`,
  };
}

async function main() {
  const input = parseJsonArg<CreateIssueInput | CreateIssueInput[]>(jsonArg, "issue config");

  // Handle bulk create
  if (Array.isArray(input)) {
    const results: Array<{ key: string; url: string } | { error: string }> = [];

    for (const item of input) {
      try {
        const result = await createSingleIssue(item);
        results.push(result);
      } catch (error) {
        results.push({
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    output({
      created: results.filter((r) => "key" in r).length,
      failed: results.filter((r) => "error" in r).length,
      results,
    });
  } else {
    const result = await createSingleIssue(input);
    output(result);
  }
}

main();
