import { confluenceGet, confluenceLegacyGet, exitWithError, output, getSiteUrl } from "./lib/atlassian.ts";

// ============================================================================
// Types
// ============================================================================

interface PageV2 {
  id: string;
  title: string;
  status: string;
  spaceId: string;
  parentId?: string;
  authorId: string;
  createdAt: string;
  version: { number: number; createdAt: string };
  body?: { storage?: { value: string } };
}

interface PageLegacy {
  id: string;
  title: string;
  type: string;
  status: string;
  space: { key: string; name: string };
  version: { number: number; when: string; by: { displayName: string } };
  body: { storage: { value: string } };
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

const pageIdOrTitle = process.argv[2];
const spaceKeyArg = process.argv[3];

if (!pageIdOrTitle) {
  console.log(`Usage: npx tsx confluence-get.ts <pageId|title> [spaceKey]

Arguments:
  pageId      Numeric page ID (e.g., 123456)
  title       Page title (requires spaceKey)
  spaceKey    Space key (required when using title)

Examples:
  # By page ID
  npx tsx confluence-get.ts 123456

  # By title and space
  npx tsx confluence-get.ts "API Documentation" DEV`);
  process.exit(1);
}

async function getPageById(pageId: string) {
  // Use legacy API for richer response with body
  const response = await confluenceLegacyGet<PageLegacy>(`content/${pageId}`, {
    expand: "space,version,body.storage",
  });

  if (!response.ok) {
    exitWithError(response.error || `Failed to get page ${pageId}`);
  }

  const page = response.data!;
  const siteUrl = getSiteUrl();

  output({
    id: page.id,
    title: page.title,
    type: page.type,
    status: page.status,
    space: {
      key: page.space.key,
      name: page.space.name,
    },
    version: page.version.number,
    lastModified: page.version.when,
    lastModifiedBy: page.version.by.displayName,
    url: `${siteUrl}/wiki${page._links.webui}`,
    body: page.body.storage.value,
  });
}

async function getPageByTitle(title: string, spaceKey: string) {
  // Search for page by title in space
  const cql = `title = "${title.replace(/"/g, '\\"')}" AND space = "${spaceKey}" AND type = page`;
  
  const response = await confluenceLegacyGet<{ results: PageLegacy[] }>("content/search", {
    cql,
    limit: "1",
    expand: "space,version,body.storage",
  });

  if (!response.ok) {
    exitWithError(response.error || "Search failed");
  }

  if (!response.data?.results.length) {
    exitWithError(`Page "${title}" not found in space ${spaceKey}`);
  }

  const page = response.data.results[0];
  const siteUrl = getSiteUrl();

  output({
    id: page.id,
    title: page.title,
    type: page.type,
    status: page.status,
    space: {
      key: page.space.key,
      name: page.space.name,
    },
    version: page.version.number,
    lastModified: page.version.when,
    lastModifiedBy: page.version.by.displayName,
    url: `${siteUrl}/wiki${page._links.webui}`,
    body: page.body.storage.value,
  });
}

async function main() {
  // Check if first arg is a number (page ID) or string (title)
  if (/^\d+$/.test(pageIdOrTitle)) {
    await getPageById(pageIdOrTitle);
  } else {
    if (!spaceKeyArg) {
      exitWithError("Space key is required when searching by title");
    }
    await getPageByTitle(pageIdOrTitle, spaceKeyArg);
  }
}

main();
