import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { AiRefusalError, streamChat, type ChatHistory } from "../ai/client";
import { MENTOR_SYSTEM, studentContext } from "../ai/mentor";
import type { StringKey } from "../i18n";
import type { Go } from "../nav";
import { hasMinimalProfile, useApp } from "../state";
import { ErrorBox } from "./ui";

const SUGGESTIONS: StringKey[] = ["suggest1", "suggest2", "suggest3", "suggest4"];

/** Tiny, safe markdown: paragraphs, bullet/numbered lists and **bold**. */
function Markdown({ text }: { text: string }) {
  const inline = (s: string): ReactNode[] =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
    );
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={blocks.length} className={`${list.ordered ? "list-decimal" : "list-disc"} space-y-0.5 pl-5`}>
        {list.items.map((it, i) => (
          <li key={i}>{inline(it)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const num = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || num) {
      const ordered = !!num;
      if (list && list.ordered !== ordered) flush();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? num)![1]);
    } else if (line.trim() === "") {
      flush();
    } else {
      flush();
      const heading = line.match(/^#{1,4}\s+(.*)$/);
      blocks.push(
        <p key={blocks.length} className={heading ? "font-bold" : ""}>
          {inline(heading ? heading[1] : line)}
        </p>,
      );
    }
  }
  flush();
  return <div className="space-y-2">{blocks}</div>;
}

function messageText(m: ChatHistory[number]): string {
  if (typeof m.content === "string") return m.content;
  return m.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: ReactNode }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          role === "user" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-surface text-ink"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ChatTab({ go }: { go: Go }) {
  const app = useApp();
  const { t, chat, setChat, profile } = app;
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<{ question: string; answer: string } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [chat.history.length, pending?.answer, error]);

  async function send(question: string) {
    const q = question.trim();
    if (!q || pending) return;
    setInput("");
    setError(null);

    // Append-only history: the new question, then a fresh context snapshot
    // only if something changed since the last one we sent.
    const ctx = studentContext({
      profile,
      gap: app.gap,
      cv: app.cv,
      matches: app.matches,
      host: app.host,
      lang: app.lang,
      today: new Date().toISOString().slice(0, 10),
    });
    const history: ChatHistory = [...chat.history, { role: "user", content: q }];
    if (ctx !== chat.lastContext) history.push({ role: "system", content: ctx });

    const controller = new AbortController();
    abortRef.current = controller;
    setPending({ question: q, answer: "" });
    try {
      const { content, refused } = await streamChat({
        system: MENTOR_SYSTEM,
        history,
        signal: controller.signal,
        onText: (d) => setPending((p) => (p ? { ...p, answer: p.answer + d } : p)),
      });
      if (refused || !content.some((b) => b.type === "text" && b.text.trim())) {
        throw new AiRefusalError();
      }
      setChat({ history: [...history, { role: "assistant", content }], lastContext: ctx });
    } catch (e) {
      if (!controller.signal.aborted) {
        console.error(e);
        setError(e);
      }
      setInput(q); // let them retry or edit
    } finally {
      setPending(null);
      abortRef.current = null;
    }
  }

  const visible = chat.history.filter((m) => m.role === "user" || m.role === "assistant");
  const firstName = profile.name.trim().split(/\s+/)[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <Bubble role="assistant">
          <p>{t("chatWelcome", { name: firstName ? ` ${firstName}` : "" })}</p>
          {!hasMinimalProfile(profile) && (
            <button onClick={() => go("profile")} className="mt-2 text-xs font-semibold text-brand underline">
              {t("profileFirst")} →
            </button>
          )}
        </Bubble>

        {visible.map((m, i) => (
          <Bubble key={i} role={m.role as "user" | "assistant"}>
            {m.role === "assistant" ? <Markdown text={messageText(m)} /> : <p className="whitespace-pre-wrap">{messageText(m)}</p>}
          </Bubble>
        ))}

        {pending && (
          <>
            <Bubble role="user">
              <p className="whitespace-pre-wrap">{pending.question}</p>
            </Bubble>
            <Bubble role="assistant">
              {pending.answer ? (
                <Markdown text={pending.answer} />
              ) : (
                <span className="inline-flex gap-1" aria-label={t("working")}>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-ink-soft/60" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-ink-soft/60 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-ink-soft/60 [animation-delay:300ms]" />
                </span>
              )}
            </Bubble>
          </>
        )}

        {error != null && <ErrorBox error={error} onRetry={() => send(input)} onOpenSettings={() => go("settings")} />}

        {visible.length === 0 && !pending && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((k) => (
              <button
                key={k}
                onClick={() => send(t(k))}
                className="rounded-full border border-brand/30 bg-white px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/5"
              >
                {t(k)}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        {visible.length > 0 && !pending && (
          <button
            type="button"
            onClick={() => {
              setChat({ history: [], lastContext: "" });
              setError(null);
            }}
            className="shrink-0 rounded-lg p-2 text-ink-soft hover:bg-surface"
            title={t("newChat")}
            aria-label={t("newChat")}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder={t("chatPlaceholder")}
          aria-label={t("chatPlaceholder")}
          className="max-h-32 min-h-[40px] flex-1 resize-none rounded-xl border border-line px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        {pending ? (
          <button type="button" onClick={() => abortRef.current?.abort()} className="shrink-0 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white">
            {t("stop")}
          </button>
        ) : (
          <button type="submit" disabled={!input.trim()} className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
            {t("send")}
          </button>
        )}
      </form>
    </div>
  );
}
