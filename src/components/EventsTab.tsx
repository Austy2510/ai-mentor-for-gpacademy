import { useState } from "react";
import { EVENTS, isUpcoming } from "../data/events";
import { toggleIn, useApp } from "../state";
import type { AcademyEvent } from "../types";
import { Badge, Card, SectionHeader, formatDate } from "./ui";

export default function EventsTab() {
  const { t, lang, gap, profile, setProfile, registeredEvents, setRegisteredEvents } = useApp();
  const [view, setView] = useState<"upcoming" | "past">("upcoming");

  const recommended = new Set(gap?.skill_gaps.flatMap((g) => g.event_ids) ?? []);
  const upcoming = EVENTS.filter((e) => isUpcoming(e)).sort((a, b) => {
    // Recommended first, then by date.
    const r = Number(recommended.has(b.id)) - Number(recommended.has(a.id));
    return r || a.date.localeCompare(b.date);
  });
  const past = EVENTS.filter((e) => !isUpcoming(e)).sort((a, b) => b.date.localeCompare(a.date));
  const attendedCount = profile.attendedEventIds.length;

  return (
    <div className="space-y-4">
      <SectionHeader title={t("evTitle")} right={<Badge tone="amber">{t("demoData")}</Badge>} />

      <div className="flex rounded-lg bg-surface p-1 text-sm font-semibold" role="tablist">
        {(["upcoming", "past"] as const).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`flex-1 rounded-md py-1.5 ${view === v ? "bg-white text-brand shadow-sm" : "text-ink-soft"}`}
          >
            {v === "upcoming" ? `${t("upcoming")} (${upcoming.length})` : `${t("participated")} (${attendedCount})`}
          </button>
        ))}
      </div>

      {view === "upcoming" &&
        upcoming.map((e) => {
          const reg = registeredEvents.includes(e.id);
          return (
            <EventCard key={e.id} e={e} lang={lang} badge={recommended.has(e.id) ? <Badge tone="teal">★ {t("recommended")}</Badge> : null}>
              <button
                onClick={() => setRegisteredEvents((r) => toggleIn(r, e.id))}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${reg ? "bg-brand text-white" : "bg-brand/10 text-brand"}`}
                aria-pressed={reg}
              >
                {reg ? `✓ ${t("registered")}` : t("register")}
              </button>
            </EventCard>
          );
        })}

      {view === "past" && (
        <>
          <p className="text-xs text-ink-soft">{t("noAttended")}</p>
          {past.map((e) => {
            const attended = profile.attendedEventIds.includes(e.id);
            return (
              <EventCard key={e.id} e={e} lang={lang}>
                <button
                  onClick={() => setProfile((p) => ({ ...p, attendedEventIds: toggleIn(p.attendedEventIds, e.id) }))}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${attended ? "bg-teal text-white" : "border border-line"}`}
                  aria-pressed={attended}
                >
                  {attended ? t("attendedDone") : t("attended")}
                </button>
              </EventCard>
            );
          })}
        </>
      )}
    </div>
  );
}

function EventCard({ e, lang, badge, children }: { e: AcademyEvent; lang: string; badge?: React.ReactNode; children: React.ReactNode }) {
  const d = new Date(e.date);
  return (
    <Card className="flex gap-3">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-dark text-white">
        <span className="text-lg leading-none font-extrabold">{d.getUTCDate()}</span>
        <span className="text-[10px] uppercase">{d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { month: "short", timeZone: "UTC" })}</span>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        {badge}
        <h3 className="text-sm leading-snug font-bold">{e.title}</h3>
        <p className="text-xs text-ink-soft">
          {e.kind} · {e.mode} · {e.provider} · {formatDate(e.date, lang)}
        </p>
        <div className="flex flex-wrap gap-1">
          {e.skills.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
        <div className="pt-1">{children}</div>
      </div>
    </Card>
  );
}
