import { confluenceLegacyGet, exitWithError, output, parseJsonArg, getSiteUrl, getConfig } from "./lib/atlassian.ts";

// ============================================================================
// Types
// ============================================================================

interface UpdateInput {
  title?: string;
  body?: string;
}

interface PageResponse {
  id: string;
  title: string;
  type: string;
  version: { number: number };
  _links: { webui: string };
}

// ============================================================================
// Main
// ============================================================================

const pageId = process.argv[2];
const jsonArg = process.argv[3];

if (!pageId || !jsonArg) {
  console.log(`Usage: npx tsx confluence-update.ts <pageId> '<JSON>'

Arguments:
  pageId    The Confluence page ID (numeric)
  JSON      Updates as JSON object

Updatable fields:
  title     New page title
  body      New page content (HTML/storage format)

Examples:
  # Update title
  npx tsx confluence-update.ts 123456 '{"title": "New Title"}'

  # Update content
  npx tsx confluence-update.ts 123456 '{"body": "<p>Updated content</p>"}'

  # Update both
  npx tsx confluence-update.ts 123456 '{"title": "New Title", "body": "<p>New content</p>"}'`);
  process.exit(1);
}

async function updatePage(pageId: string, updates: UpdateInput) {
  if (!updates.title && !updates.body) {
    exitWithError("At least one of title or body must be provided");
  }

  // Get current page version
  const currentResponse = await confluenceLegacyGet<PageResponse>(`content/${pageId}`, {
    expand: "version",
  });

  if (!currentResponse.ok) {
    exitWithError(currentResponse.error || `Failed to get page ${pageId}`);
  }

  const current = currentResponse.data!;
  const nextVersion = current.version.number + 1;

  // Build update body
  const body: Record<string, unknown> = {
    id: pageId,
    type: current.type,
    title: updates.title || current.title,
    version: { number: nextVersion },
  };

  if (updates.body) {
    body.body = {
      storage: {
        value: updates.body,
        representation: "storage",
      },
    };
  }

  // Use legacy API for page update
  const cfg = getConfig();
  const url = `https://${cfg.site}/wiki/rest/api/content/${pageId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${Buffer.from(`${cfg.email}:${cfg.apiToken}`).toString("base64")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorText;
    } catch {
      errorMessage = errorText;
    }
    exitWithError(`Failed to update page: ${errorMessage}`);
  }

  const data = (await response.json()) as PageResponse;
  const siteUrl = getSiteUrl();

  output({
    id: data.id,
    title: data.title,
    version: data.version.number,
    url: `${siteUrl}/wiki${data._links.webui}`,
    success: true,
  });
}

async function main() {
  const updates = parseJsonArg<UpdateInput>(jsonArg, "updates");
  await updatePage(pageId, updates);
}

main();
