import { jiraGet, jiraPut, jiraPost, exitWithError, output, parseJsonArg } from "./lib/atlassian.ts";

// ============================================================================
// Types
// ============================================================================

interface UpdateInput {
  summary?: string;
  description?: string;
  priority?: string;
  assignee?: string;
  labels?: string[];
  duedate?: string;
  status?: string; // Requires transition
}

interface Transition {
  id: string;
  name: string;
  to: { name: string };
}

interface TransitionsResponse {
  transitions: Transition[];
}

// ============================================================================
// Main
// ============================================================================

const issueKey = process.argv[2];
const jsonArg = process.argv[3];

if (!issueKey || !jsonArg) {
  console.log(`Usage: npx tsx jira-update.ts <issueKey> '<JSON>'

Arguments:
  issueKey    The Jira issue key (e.g., PROJ-123)
  JSON        Updates as JSON object

Updatable fields:
  summary       New issue title
  description   New description
  priority      Priority name (e.g., "High")
  assignee      Assignee account ID or email
  labels        Array of labels (replaces existing)
  duedate       Due date (YYYY-MM-DD) or null to clear
  status        Transition to status (e.g., "Done", "In Progress")

Examples:
  # Update summary
  npx tsx jira-update.ts PROJ-123 '{"summary": "New title"}'

  # Change status
  npx tsx jira-update.ts PROJ-123 '{"status": "Done"}'

  # Multiple updates
  npx tsx jira-update.ts PROJ-123 '{"priority": "High", "labels": ["urgent", "bug"]}'`);
  process.exit(1);
}

async function transitionIssue(issueKey: string, targetStatus: string): Promise<void> {
  // Get available transitions
  const response = await jiraGet<TransitionsResponse>(
    `issue/${encodeURIComponent(issueKey)}/transitions`
  );

  if (!response.ok) {
    exitWithError(response.error || "Failed to get available transitions");
  }

  const transition = response.data!.transitions.find(
    (t) => t.name.toLowerCase() === targetStatus.toLowerCase() ||
           t.to.name.toLowerCase() === targetStatus.toLowerCase()
  );

  if (!transition) {
    const available = response.data!.transitions.map((t) => t.name).join(", ");
    exitWithError(`Cannot transition to "${targetStatus}". Available: ${available}`);
  }

  // Perform transition
  const transitionResponse = await jiraPost(
    `issue/${encodeURIComponent(issueKey)}/transitions`,
    { transition: { id: transition.id } }
  );

  if (!transitionResponse.ok) {
    exitWithError(transitionResponse.error || "Transition failed");
  }
}

async function main() {
  const updates = parseJsonArg<UpdateInput>(jsonArg, "updates");

  // Handle status transition separately
  if (updates.status) {
    await transitionIssue(issueKey, updates.status);
  }

  // Build fields update
  const fields: Record<string, unknown> = {};

  if (updates.summary !== undefined) {
    fields.summary = updates.summary;
  }

  if (updates.description !== undefined) {
    fields.description = updates.description
      ? {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: updates.description }],
            },
          ],
        }
      : null;
  }

  if (updates.priority !== undefined) {
    fields.priority = { name: updates.priority };
  }

  if (updates.assignee !== undefined) {
    fields.assignee = updates.assignee ? { id: updates.assignee } : null;
  }

  if (updates.labels !== undefined) {
    fields.labels = updates.labels;
  }

  if (updates.duedate !== undefined) {
    fields.duedate = updates.duedate;
  }

  // Update fields if any
  if (Object.keys(fields).length > 0) {
    const response = await jiraPut(`issue/${encodeURIComponent(issueKey)}`, { fields });

    if (!response.ok) {
      exitWithError(response.error || "Update failed");
    }
  }

  output({
    key: issueKey,
    updated: true,
    fields: Object.keys(fields).length > 0 ? Object.keys(fields) : undefined,
    transitioned: updates.status ? updates.status : undefined,
  });
}

main();
