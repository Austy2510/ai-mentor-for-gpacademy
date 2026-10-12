import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { loadJSON, saveJSON } from "../storage";

export const MODEL = "claude-opus-5-5";

// Server-side refusal fallback: if a safety classifier declines a request, the
// API re-runs it on a suitable fallback model inside the same call.
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

/**
 * How the browser reaches Claude. GitHub Pages is static, so there are two options:
 *  - "proxy": a small Cloudflare Worker (see /worker) holds the API key and
 *    forwards requests. Recommended: the key never reaches the browser.
 *  - "key": the user pastes their own API key, which is kept in this browser's
 *    localStorage and sent straight to api.anthropic.com. Handy for a local demo.
 */
export type AiSettings =
  | { mode: "proxy"; proxyUrl: string }
  | { mode: "key"; apiKey: string };

const SETTINGS_KEY = "skillsheba.ai";
const BUILD_PROXY_URL = (import.meta.env.VITE_AI_PROXY_URL as string | undefined)?.trim() || "";

export function getSavedSettings(): AiSettings | null {
  return loadJSON<AiSettings | null>(SETTINGS_KEY, null);
}

export function saveSettings(s: AiSettings | null): void {
  saveJSON(SETTINGS_KEY, s);
  cachedClient = null;
}

/** Settings saved in this browser win; otherwise use the proxy baked in at build time. */
export function getSettings(): AiSettings | null {
  const saved = getSavedSettings();
  if (saved && (saved.mode === "proxy" ? saved.proxyUrl : saved.apiKey)) return saved;
  if (BUILD_PROXY_URL) return { mode: "proxy", proxyUrl: BUILD_PROXY_URL };
  return null;
}

export function buildProxyUrl(): string {
  return BUILD_PROXY_URL;
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI is not configured");
  }
}

export class AiRefusalError extends Error {
  constructor() {
    super("The request was declined");
  }
}

export class AiIncompleteError extends Error {
  constructor() {
    super("The response was cut off or could not be parsed");
  }
}

let cachedClient: Anthropic | null = null;

export function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const s = getSettings();
  if (!s) throw new AiNotConfiguredError();
  cachedClient =
    s.mode === "proxy"
      ? new Anthropic({
          // The Worker swaps in the real key; the SDK just needs a non-empty value.
          apiKey: "via-proxy",
          baseURL: s.proxyUrl.replace(/\/+$/, ""),
          dangerouslyAllowBrowser: true,
        })
      : new Anthropic({ apiKey: s.apiKey, dangerouslyAllowBrowser: true });
  return cachedClient;
}

/**
 * One structured call: Claude must return JSON matching `schema`.
 * Used for skill-gap analysis, CV copy and employer matching.
 */
export async function structuredCall<S extends z.ZodType>(opts: {
  schema: S;
  system: string;
  user: string;
  effort?: "low" | "medium" | "high";
}): Promise<z.infer<S>> {
  const res = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: [FALLBACK_BETA],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: {
      effort: opts.effort ?? "medium",
      format: betaZodOutputFormat(opts.schema),
    },
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });
  if (res.stop_reason === "refusal") throw new AiRefusalError();
  if (res.stop_reason === "max_tokens" || !res.parsed_output) throw new AiIncompleteError();
  return res.parsed_output as z.infer<S>;
}

export type ChatHistory = Anthropic.Beta.BetaMessageParam[];

const CHAT_BETAS = [FALLBACK_BETA, "thinking-binding-controls-2026-08-01"];

/**
 * Streams one mentor-chat turn. `history` must already end with the new user
 * message (and any appended context system message). Returns the assistant
 * message content to append to the history, unchanged, for the next turn.
 */
export async function streamChat(opts: {
  system: string;
  history: ChatHistory;
  onText: (delta: string) => void;
  signal?: AbortSignal;
}): Promise<{ content: Anthropic.Beta.BetaContentBlock[]; refused: boolean }> {
  const stream = getClient().beta.messages.stream(
    {
      model: MODEL,
      max_tokens: 64000,
      betas: CHAT_BETAS,
      fallbacks: "default",
      // History is append-only, so thinking blocks stay valid; if anything ever
      // invalidates them (e.g. edited localStorage), degrade instead of failing.
      thinking: { type: "adaptive", block_binding: { prefix_mismatch_behavior: "drop_block" } },
      output_config: { effort: "low" },
      // Caches the frozen system prompt + catalog and the growing history.
      cache_control: { type: "ephemeral" },
      system: opts.system,
      messages: opts.history,
    },
    { signal: opts.signal },
  );
  stream.on("text", opts.onText);
  const final = await stream.finalMessage();
  return { content: final.content, refused: final.stop_reason === "refusal" };
}

/** Maps any error to a short, user-facing message key. */
export function errorKey(err: unknown): "notConfigured" | "auth" | "rateLimit" | "refusal" | "incomplete" | "network" | "generic" {
  if (err instanceof AiNotConfiguredError) return "notConfigured";
  if (err instanceof AiRefusalError) return "refusal";
  if (err instanceof AiIncompleteError) return "incomplete";
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) return "auth";
  if (err instanceof Anthropic.RateLimitError) return "rateLimit";
  if (err instanceof Anthropic.APIConnectionError) return "network";
  return "generic";
}
