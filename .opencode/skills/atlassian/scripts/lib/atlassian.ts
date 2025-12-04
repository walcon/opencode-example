import { config } from "dotenv";
import { resolve } from "path";

// Load .env from project root
config({ path: resolve(process.cwd(), ".env") });

// ============================================================================
// Configuration
// ============================================================================

export interface AtlassianConfig {
  site: string;
  email: string;
  apiToken: string;
}

export function getConfig(): AtlassianConfig {
  const site = process.env.ATLASSIAN_SITE;
  const email = process.env.ATLASSIAN_EMAIL;
  const apiToken = process.env.ATLASSIAN_API_TOKEN;

  if (!site) {
    exitWithError(
      "ATLASSIAN_SITE not set. Add to .env: ATLASSIAN_SITE=yourcompany.atlassian.net"
    );
  }

  if (!email) {
    exitWithError(
      "ATLASSIAN_EMAIL not set. Add to .env: ATLASSIAN_EMAIL=you@example.com"
    );
  }

  if (!apiToken) {
    exitWithError(
      "ATLASSIAN_API_TOKEN not set. Generate at: https://id.atlassian.com/manage-profile/security/api-tokens"
    );
  }

  return { site, email, apiToken };
}

// ============================================================================
// HTTP Client
// ============================================================================

function getAuthHeader(cfg: AtlassianConfig): string {
  const credentials = Buffer.from(`${cfg.email}:${cfg.apiToken}`).toString(
    "base64"
  );
  return `Basic ${credentials}`;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
}

async function request<T>(
  url: string,
  cfg: AtlassianConfig,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: getAuthHeader(cfg),
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage =
          errorJson.errorMessages?.join(", ") ||
          errorJson.message ||
          errorJson.errorMessage ||
          errorText;
      } catch {
        errorMessage = errorText;
      }
      return {
        ok: false,
        error: `API error (${response.status}): ${errorMessage}`,
        status: response.status,
      };
    }

    if (response.status === 204) {
      return { ok: true };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: `Network error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// ============================================================================
// Jira API
// ============================================================================

export async function jiraGet<T>(
  endpoint: string,
  params?: Record<string, string | string[]>
): Promise<ApiResponse<T>> {
  const cfg = getConfig();
  let url = `https://${cfg.site}/rest/api/3/${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else {
        searchParams.append(key, value);
      }
    }
    url += `?${searchParams}`;
  }
  return request<T>(url, cfg);
}

export async function jiraPost<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  const cfg = getConfig();
  const url = `https://${cfg.site}/rest/api/3/${endpoint}`;
  return request<T>(url, cfg, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function jiraPut<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  const cfg = getConfig();
  const url = `https://${cfg.site}/rest/api/3/${endpoint}`;
  return request<T>(url, cfg, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ============================================================================
// Confluence API (v2)
// ============================================================================

export async function confluenceGet<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<ApiResponse<T>> {
  const cfg = getConfig();
  let url = `https://${cfg.site}/wiki/api/v2/${endpoint}`;
  if (params) {
    url += `?${new URLSearchParams(params)}`;
  }
  return request<T>(url, cfg);
}

export async function confluencePost<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  const cfg = getConfig();
  const url = `https://${cfg.site}/wiki/api/v2/${endpoint}`;
  return request<T>(url, cfg, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function confluencePut<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  const cfg = getConfig();
  const url = `https://${cfg.site}/wiki/api/v2/${endpoint}`;
  return request<T>(url, cfg, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// Confluence legacy API (v1) - needed for CQL search
export async function confluenceLegacyGet<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<ApiResponse<T>> {
  const cfg = getConfig();
  let url = `https://${cfg.site}/wiki/rest/api/${endpoint}`;
  if (params) {
    url += `?${new URLSearchParams(params)}`;
  }
  return request<T>(url, cfg);
}

// ============================================================================
// Utilities
// ============================================================================

export function exitWithError(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

export function output(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function parseJsonArg<T>(arg: string, name: string): T {
  try {
    return JSON.parse(arg) as T;
  } catch {
    exitWithError(`Invalid JSON for ${name}: ${arg}`);
  }
}

export function getSiteUrl(): string {
  return `https://${getConfig().site}`;
}
