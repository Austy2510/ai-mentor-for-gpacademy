// Bridge between the Career Quest front end (public/app.js, plain JS) and Claude.
// app.js owns the UI and the student's quest data; this module owns the Claude
// calls and the conversation history, and exposes a small API on window.

import Anthropic from "@anthropic-ai/sdk";
import {
  AiNotConfiguredError,
  AiRefusalError,
  buildProxyUrl,
  errorKey,
  getSavedSettings,
  getSettings,
  saveSettings,
  streamChat,
  type AiSettings,
  type ChatHistory,
} from "./ai/client";

const PERSONA = [
  "You are Virus, the friendly AI career buddy inside GP Academy's Career Quest (Grameenphone Academy, Bangladesh).",
  "You help Bangladeshi university students and fresh graduates turn a dream career into concrete next steps: what to learn, which GP Academy courses and events to use, how to build a portfolio project, how to prepare a CV and interviews.",
  "",
  "How to answer:",
  "- A <student_context> system message holds the student's latest quest data (goal, skills, progress, CV). Use it; never ask for something it already contains.",
  "- Be warm, encouraging and specific to this student. Use their goal and missing skills.",
  "- Recommend courses, events and jobs ONLY from the catalog below, by their exact titles. If nothing fits, say so and suggest a general direction. Never invent listings, links, salaries or statistics. Jobs and events in the catalog are samples; say so if the student wants to apply.",
  "- Never encourage inventing experience on a CV.",
  "- Plain text only: no markdown symbols like ** or #. Short paragraphs; simple numbered or dashed lines are fine. Usually 2-8 sentences.",
  "- Reply in the language the student writes in (English, Bangla or Banglish).",
  "- Point to Career Quest pages when helpful: My Career Quest, Explore Courses, My Skills, CV Studio, Job Match, Events, My Profile.",
  "- You are a career mentor, not a therapist; for serious personal crises, gently suggest talking to someone they trust or a professional.",
].join("\n");

let history: ChatHistory = [];
let lastContext = "";
let system: string | null = null; // frozen for the session once the first message is sent

const MESSAGES: Record<ReturnType<typeof errorKey>, string> = {
  notConfigured: "AI isn't connected yet. Use “Connect AI” to add a proxy URL or your API key.",
  auth: "The API key or proxy was rejected. Check “Connect AI”.",
  rateLimit: "Too many requests right now. Please wait a minute and try again.",
  refusal: "I couldn't help with that one. Try asking another way.",
  incomplete: "My answer got cut off. Please try again.",
  network: "I couldn't reach the AI service. Check your connection or the proxy URL.",
  generic: "Something went wrong. Please try again.",
};

const api = {
  isConfigured: (): boolean => getSettings() !== null,
  getSavedSettings,
  saveSettings: (s: AiSettings | null) => saveSettings(s),
  buildProxyUrl,

  /**
   * Sends one question and streams the answer. `catalog` (courses, events, jobs)
   * is fixed, so it goes into the cached system prompt; `context` is the
   * student's current quest data and is appended only when it changes, which
   * keeps the conversation append-only.
   */
  async chat(opts: {
    question: string;
    catalog: string;
    context: string;
    onText: (delta: string) => void;
    signal?: AbortSignal;
  }): Promise<string> {
    if (!getSettings()) throw new AiNotConfiguredError();
    system ??= `${PERSONA}\n\n<catalog>\n${opts.catalog}\n</catalog>`;
    const next: ChatHistory = [...history, { role: "user", content: opts.question }];
    const ctx = `<student_context>\nToday: ${new Date().toISOString().slice(0, 10)}\n${opts.context}\n</student_context>`;
    if (ctx !== lastContext) next.push({ role: "system", content: ctx });

    const { content, refused } = await streamChat({ system, history: next, onText: opts.onText, signal: opts.signal });
    const text = content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    if (refused || !text) throw new AiRefusalError();
    history = [...next, { role: "assistant", content }];
    lastContext = ctx;
    return text;
  },

  /** Starts a fresh conversation. */
  reset(): void {
    history = [];
    lastContext = "";
    system = null;
  },

  errorMessage: (err: unknown): string => MESSAGES[errorKey(err)],
  isNotConfigured: (err: unknown): boolean => errorKey(err) === "notConfigured",
};

declare global {
  interface Window {
    SkillShebaAI?: typeof api;
  }
}

window.SkillShebaAI = api;
window.dispatchEvent(new Event("skillsheba-ai-ready"));
