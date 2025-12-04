import { confluenceLegacyGet, exitWithError, output, parseJsonArg, getSiteUrl } from "./lib/atlassian.ts";

// ============================================================================
// Types
// ============================================================================

interface CreatePageInput {
  space: string;
  title: string;
  body: string;
  parentId?: string;
}

interface CreatePageResponse {
  id: string;
  title: string;
  type: string;
  _links: { webui: string };
}

interface SpaceResponse {
  id: string;
  key: string;
  name: string;
}

// ============================================================================
// Main
// ============================================================================

const jsonArg = process.argv[2];

if (!jsonArg) {
  console.log(`Usage: npx tsx confluence-create.ts '<JSON>'

Arguments:
  JSON    Page configuration as JSON

Required fields:
  space     Space key (e.g., "DEV")
  title     Page title
  body      Page content (HTML/storage format)

Optional fields:
  parentId  Parent page ID (for nested pages)

Examples:
  # Simple page
  npx tsx confluence-create.ts '{"space": "DEV", "title": "My Page", "body": "<p>Hello world</p>"}'

  # Nested under parent
  npx tsx confluence-create.ts '{"space": "DEV", "title": "Child Page", "body": "<p>Content</p>", "parentId": "123456"}'

  # Rich content
  npx tsx confluence-create.ts '{"space": "DEV", "title": "API Docs", "body": "<h1>API</h1><p>Documentation here</p><ul><li>Item 1</li><li>Item 2</li></ul>"}'`);
  process.exit(1);
}

async function getSpaceId(spaceKey: string): Promise<string> {
  const response = await confluenceLegacyGet<SpaceResponse>(`space/${spaceKey}`);

  if (!response.ok) {
    exitWithError(response.error || `Space "${spaceKey}" not found`);
  }

  return response.data!.id;
}

async function createPage(input: CreatePageInput) {
  // Validate required fields
  if (!input.space || !input.title || !input.body) {
    exitWithError("Missing required fields: space, title, body");
  }

  // Build request body for legacy API
  const body: Record<string, unknown> = {
    type: "page",
    title: input.title,
    space: { key: input.space },
    body: {
      storage: {
        value: input.body,
        representation: "storage",
      },
    },
  };

  if (input.parentId) {
    body.ancestors = [{ id: input.parentId }];
  }

  // Use legacy API for page creation
  const cfg = await import("./lib/atlassian.ts").then((m) => m.getConfig());
  const url = `https://${cfg.site}/wiki/rest/api/content`;

  const response = await fetch(url, {
    method: "POST",
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
    exitWithError(`Failed to create page: ${errorMessage}`);
  }

  const data = (await response.json()) as CreatePageResponse;
  const siteUrl = getSiteUrl();

  output({
    id: data.id,
    title: data.title,
    url: `${siteUrl}/wiki${data._links.webui}`,
    success: true,
  });
}

async function main() {
  const input = parseJsonArg<CreatePageInput>(jsonArg, "page config");
  await createPage(input);
}

main();
