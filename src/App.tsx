import { useEffect, useRef, useState } from "react";
import ChatTab from "./components/ChatTab";
import CvTab from "./components/CvTab";
import EmployersTab from "./components/EmployersTab";
import EventsTab from "./components/EventsTab";
import GapTab from "./components/GapTab";
import ProfileTab from "./components/ProfileTab";
import SettingsTab from "./components/SettingsTab";
import type { StringKey } from "./i18n";
import type { Tab } from "./nav";
import { useApp } from "./state";

const TABS: { id: Exclude<Tab, "settings">; label: StringKey; icon: string }[] = [
  { id: "chat", label: "tabChat", icon: "💬" },
  { id: "profile", label: "tabProfile", icon: "👤" },
  { id: "gap", label: "tabGap", icon: "🎯" },
  { id: "cv", label: "tabCv", icon: "📄" },
  { id: "employers", label: "tabEmployers", icon: "🏢" },
  { id: "events", label: "tabEvents", icon: "📅" },
];

const inIframe = window.parent !== window;

export default function App() {
  const { t, lang, setLang, setHost } = useApp();
  const [tab, setTab] = useState<Tab>("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Context from the host page (sent by skillsheba-widget.js).
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== window.parent || !e.data || e.data.type !== "skillsheba:context") return;
      const { title, path, heading } = e.data as Record<string, unknown>;
      setHost({ title: String(title ?? ""), path: String(path ?? ""), heading: String(heading ?? "").slice(0, 200) });
    }
    window.addEventListener("message", onMessage);
    if (inIframe) window.parent.postMessage({ type: "skillsheba:ready" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, [setHost]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function go(next: Tab) {
    setTab(next);
    scrollRef.current?.scrollTo({ top: 0 });
  }

  return (
    <div className={`print-scroll-reset flex h-full flex-col bg-white ${inIframe ? "" : "mx-auto max-w-3xl border-x border-line"}`}>
      <header className="flex items-center gap-3 bg-gradient-to-r from-teal to-brand px-4 py-3 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-lg font-extrabold" aria-hidden>
          স
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base leading-tight font-extrabold">{t("appName")}</h1>
          <p className="truncate text-xs text-white/85">{t("tagline")}</p>
        </div>
        <div className="flex rounded-lg bg-white/15 p-0.5 text-xs font-semibold" role="group" aria-label="Language">
          {(["en", "bn"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`rounded-md px-2 py-1 ${lang === l ? "bg-white text-brand-dark" : "text-white"}`}
            >
              {l === "en" ? "EN" : "বাং"}
            </button>
          ))}
        </div>
        <button
          onClick={() => go(tab === "settings" ? "chat" : "settings")}
          className={`rounded-lg p-1.5 hover:bg-white/15 ${tab === "settings" ? "bg-white/20" : ""}`}
          aria-label={t("settings")}
          title={t("settings")}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        {inIframe && (
          <button
            onClick={() => window.parent.postMessage({ type: "skillsheba:close" }, "*")}
            className="rounded-lg p-1.5 hover:bg-white/15"
            aria-label={t("close")}
            title={t("close")}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </header>

      <nav className="grid shrink-0 grid-cols-6 gap-0.5 border-b border-line px-1.5 py-1.5" aria-label="Sections">
        {TABS.map((x) => (
          <button
            key={x.id}
            onClick={() => go(x.id)}
            aria-current={tab === x.id ? "page" : undefined}
            className={`flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] leading-tight font-semibold transition ${
              tab === x.id ? "bg-brand/10 text-brand" : "text-ink-soft hover:bg-surface"
            }`}
          >
            <span aria-hidden className="text-base leading-none">{x.icon}</span>
            <span className="w-full truncate text-center">{t(x.label)}</span>
          </button>
        ))}
      </nav>

      {tab === "chat" ? (
        <ChatTab go={go} />
      ) : (
        <main ref={scrollRef} className="print-scroll-reset min-h-0 flex-1 overflow-y-auto p-4">
          {tab === "profile" && <ProfileTab go={go} />}
          {tab === "gap" && <GapTab go={go} />}
          {tab === "cv" && <CvTab go={go} />}
          {tab === "employers" && <EmployersTab go={go} />}
          {tab === "events" && <EventsTab />}
          {tab === "settings" && <SettingsTab />}
        </main>
      )}
    </div>
  );
}
