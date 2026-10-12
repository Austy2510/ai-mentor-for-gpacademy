/**
 * SkillSheba Claude API proxy (Cloudflare Worker).
 *
 * GitHub Pages can only serve static files, so the browser can't hold the
 * Anthropic API key safely. This Worker holds it as a secret and forwards
 * POST /v1/messages to api.anthropic.com, adding the key on the way.
 *
 * Guard rails: only allowed browser origins, only /v1/messages, only the
 * models the app uses, a max_tokens cap and a request size cap. Origin checks
 * stop other websites from using your key, not determined attackers with curl,
 * so also add a Cloudflare rate-limiting rule and set a spend limit in the
 * Anthropic Console (see README).
 */

interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGINS: string;
}

const UPSTREAM = "https://api.anthropic.com/v1/messages";
const ALLOWED_MODELS = new Set(["claude-opus-5-5"]);
const MAX_TOKENS_CAP = 64000;
const MAX_BODY_BYTES = 2_000_000;
const FORWARD_HEADERS = ["content-type", "anthropic-version", "anthropic-beta"];

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Expose-Headers": "request-id, retry-after, anthropic-ratelimit-requests-remaining",
    Vary: "Origin",
  };
}

function json(status: number, message: string, origin: string | null): Response {
  return new Response(JSON.stringify({ type: "error", error: { type: "proxy_error", message } }), {
    status,
    headers: { "content-type": "application/json", ...(origin ? corsHeaders(origin) : {}) },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const allowed = (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim().replace(/\/+$/, ""))
      .filter(Boolean);
    const originOk = origin !== null && allowed.includes(origin);

    if (request.method === "OPTIONS") {
      if (!originOk) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders(origin),
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") ?? "content-type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (!originOk) return json(403, "Origin not allowed", null);

    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname.replace(/\/+$/, "") !== "/v1/messages") {
      return json(404, "Only POST /v1/messages is proxied", origin);
    }
    if (!env.ANTHROPIC_API_KEY) return json(500, "ANTHROPIC_API_KEY secret is not set", origin);

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, "Request too large", origin);

    let body: { model?: unknown; max_tokens?: unknown };
    try {
      body = JSON.parse(raw);
    } catch {
      return json(400, "Invalid JSON", origin);
    }
    if (typeof body.model !== "string" || !ALLOWED_MODELS.has(body.model)) {
      return json(400, "Model not allowed by proxy", origin);
    }
    if (typeof body.max_tokens !== "number" || body.max_tokens > MAX_TOKENS_CAP) {
      return json(400, `max_tokens must be <= ${MAX_TOKENS_CAP}`, origin);
    }

    const headers = new Headers({ "x-api-key": env.ANTHROPIC_API_KEY });
    for (const h of FORWARD_HEADERS) {
      const v = request.headers.get(h);
      if (v) headers.set(h, v);
    }
    if (!headers.has("anthropic-version")) headers.set("anthropic-version", "2023-06-01");

    const upstream = await fetch(UPSTREAM, { method: "POST", headers, body: raw });

    // Stream the response straight through (works for both JSON and SSE).
    const out = new Headers(corsHeaders(origin));
    for (const h of ["content-type", "request-id", "retry-after", "anthropic-ratelimit-requests-remaining"]) {
      const v = upstream.headers.get(h);
      if (v) out.set(h, v);
    }
    return new Response(upstream.body, { status: upstream.status, headers: out });
  },
};
