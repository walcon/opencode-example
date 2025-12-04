import { jiraGet, jiraPost, exitWithError, output } from "./lib/atlassian.ts";

// ============================================================================
// Types
// ============================================================================

interface Comment {
  id: string;
  author: { displayName: string; emailAddress?: string };
  body: unknown;
  created: string;
  updated: string;
}

interface CommentsResponse {
  comments: Comment[];
  total: number;
  startAt: number;
  maxResults: number;
}

interface AddCommentResponse {
  id: string;
  created: string;
}

// ============================================================================
// Main
// ============================================================================

const issueKey = process.argv[2];
const action = process.argv[3];
const content = process.argv[4];

if (!issueKey || !action) {
  console.log(`Usage: npx tsx jira-comment.ts <issueKey> <action> [content]

Arguments:
  issueKey    The Jira issue key (e.g., PROJ-123)
  action      "get" to list comments, "add" to add a comment
  content     Comment text (required for "add")

Examples:
  # Get all comments
  npx tsx jira-comment.ts PROJ-123 get

  # Add a comment
  npx tsx jira-comment.ts PROJ-123 add "This is my comment"`);
  process.exit(1);
}

async function getComments() {
  const response = await jiraGet<CommentsResponse>(
    `issue/${encodeURIComponent(issueKey)}/comment`,
    { orderBy: "-created" }
  );

  if (!response.ok) {
    exitWithError(response.error || "Failed to get comments");
  }

  const data = response.data!;
  
  output({
    issueKey,
    total: data.total,
    comments: data.comments.map((c) => ({
      id: c.id,
      author: c.author.displayName,
      body: c.body,
      created: c.created,
      updated: c.updated,
    })),
  });
}

async function addComment() {
  if (!content) {
    exitWithError("Comment text is required");
  }

  const response = await jiraPost<AddCommentResponse>(
    `issue/${encodeURIComponent(issueKey)}/comment`,
    {
      body: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: content }],
          },
        ],
      },
    }
  );

  if (!response.ok) {
    exitWithError(response.error || "Failed to add comment");
  }

  output({
    issueKey,
    commentId: response.data!.id,
    created: response.data!.created,
    success: true,
  });
}

async function main() {
  switch (action.toLowerCase()) {
    case "get":
    case "list":
      await getComments();
      break;
    case "add":
    case "create":
      await addComment();
      break;
    default:
      exitWithError(`Unknown action: ${action}. Use "get" or "add"`);
  }
}

main();
