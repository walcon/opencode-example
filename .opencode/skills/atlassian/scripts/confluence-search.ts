import { confluenceLegacyGet, exitWithError, output, getSiteUrl } from "./lib/atlassian.ts";

// ============================================================================
// Types
// ============================================================================

interface ConfluencePage {
  id: string;
  type: string;
  title: string;
  status: string;
  space: { key: string; name: string };
  version: { number: number; when: string };
  _links: { webui: string };
}

interface SearchResponse {
  results: ConfluencePage[];
  start: number;
  limit: number;
  size: number;
  totalSize?: number;
  _links?: { next?: string };
}

// ============================================================================
// Main
// ============================================================================

const cql = process.argv[2];
const limit = process.argv[3] || "25";
const start = process.argv[4] || "0";

if (!cql) {
  console.log(`Usage: npx tsx confluence-search.ts <CQL> [limit] [start]

Arguments:
  CQL      Confluence Query Language query string
  limit    Maximum results to return (default: 25, max: 100)
  start    Offset for pagination (default: 0)

Examples:
  npx tsx confluence-search.ts "type = page AND space = DEV"
  npx tsx confluence-search.ts "title ~ 'roadmap'" 50
  npx tsx confluence-search.ts "text ~ 'API documentation'" 25 50

See docs/cql-guide.md for CQL syntax reference.`);
  process.exit(1);
}

async function search() {
  // Use legacy API for CQL search (v2 API has different search mechanism)
  const response = await confluenceLegacyGet<SearchResponse>("content/search", {
    cql,
    limit,
    start,
    expand: "space,version",
  });

  if (!response.ok) {
    exitWithError(response.error || "Search failed");
  }

  const data = response.data!;
  const siteUrl = getSiteUrl();

  const pages = data.results.map((page) => ({
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
    url: `${siteUrl}/wiki${page._links.webui}`,
  }));

  output({
    total: data.totalSize || data.size,
    returned: pages.length,
    start: data.start,
    hasMore: !!data._links?.next,
    pages,
  });
}

search();
