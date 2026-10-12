import { useCallback } from "react";
import { analyzeSkillGap, isStale } from "../ai/features";
import { courseById } from "../data/courses";
import { eventById } from "../data/events";
import type { Go } from "../nav";
import { hasMinimalProfile, toggleIn, useApp } from "../state";
import { useAction } from "../useAction";
import { Badge, Button, Card, ErrorBox, ProfileGate, SectionHeader, Spinner, StaleNotice, formatDate } from "./ui";

export default function GapTab({ go }: { go: Go }) {
  const { t, lang, profile, setProfile, gap, setGap, registeredEvents, setRegisteredEvents } = useApp();
  const { run, busy, error } = useAction(
    useCallback(async () => setGap(await analyzeSkillGap(profile, lang)), [profile, lang, setGap]),
  );

  if (!hasMinimalProfile(profile)) {
    return (
      <>
        <SectionHeader title={t("gapTitle")} intro={t("gapIntro")} />
        <ProfileGate onGoProfile={() => go("profile")} />
      </>
    );
  }

  const stale = gap && isStale(gap, profile, lang);
  const priorityTone = { high: "red", medium: "amber", low: "slate" } as const;

  return (
    <div className="space-y-4">
      <SectionHeader title={t("gapTitle")} intro={t("gapIntro")} />

      {!gap && (
        <Button className="w-full" onClick={() => run()} disabled={busy}>
          {busy ? <Spinner label={t("working")} /> : `🎯 ${t("analyze")}`}
        </Button>
      )}
      {error != null && <ErrorBox error={error} onRetry={() => run()} onOpenSettings={() => go("settings")} />}

      {gap && (
        <>
          {stale && <StaleNotice onRegenerate={() => run()} busy={busy} />}
          {busy && <Spinner label={t("working")} />}

          <Card className="bg-gradient-to-br from-brand/5 to-teal/5">
            <p className="text-sm leading-relaxed">{gap.summary}</p>
            <h3 className="mt-3 mb-2 text-xs font-bold tracking-wide text-ink-soft uppercase">{t("careerTargets")}</h3>
            <ul className="space-y-2">
              {gap.career_targets.map((c) => (
                <li key={c.role} className="text-sm">
                  <span className="font-bold text-brand-dark">{c.role}</span>
                  <span className="text-ink-soft"> · {c.why}</span>
                </li>
              ))}
            </ul>
          </Card>

          <h3 className="text-sm font-extrabold">{t("yourGaps")}</h3>
          {gap.skill_gaps.map((g) => (
            <Card key={g.skill} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold">{g.skill}</h4>
                <Badge tone={priorityTone[g.priority]}>{t(`priority_${g.priority}`)}</Badge>
              </div>
              <p className="text-sm text-ink-soft">{g.reason}</p>

              <div>
                <p className="mb-1.5 text-xs font-semibold">{t("recommendedCourses")}</p>
                {g.course_ids.length === 0 && <p className="text-xs text-ink-soft">{t("noPicks")}</p>}
                <ul className="space-y-2">
                  {g.course_ids.map((id) => {
                    const c = courseById.get(id)!;
                    const done = profile.completedCourseIds.includes(id);
                    return (
                      <li key={id} className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2">
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${done ? "text-ink-soft line-through" : ""}`}>{c.title}</p>
                          <p className="text-xs text-ink-soft">
                            {c.provider} · {c.duration} {c.source === "external" && <Badge tone="blue">{t("freeResource")}</Badge>}
                          </p>
                        </div>
                        {c.source === "external" ? (
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-semibold text-brand underline">
                            {t("open")} ↗
                          </a>
                        ) : (
                          <button
                            onClick={() => setProfile((p) => ({ ...p, completedCourseIds: toggleIn(p.completedCourseIds, id) }))}
                            className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${done ? "bg-teal text-white" : "border border-line bg-white"}`}
                            aria-pressed={done}
                          >
                            {done ? `✓ ${t("done")}` : t("markDone")}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {g.event_ids.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold">{t("recommendedEvents")}</p>
                  <ul className="space-y-2">
                    {g.event_ids.map((id) => {
                      const e = eventById.get(id)!;
                      const reg = registeredEvents.includes(id);
                      return (
                        <li key={id} className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{e.title}</p>
                            <p className="text-xs text-ink-soft">
                              {formatDate(e.date, lang)} · {e.mode}
                            </p>
                          </div>
                          <button
                            onClick={() => setRegisteredEvents((r) => toggleIn(r, id))}
                            className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${reg ? "bg-brand text-white" : "bg-brand/10 text-brand"}`}
                            aria-pressed={reg}
                          >
                            {reg ? `✓ ${t("registered")}` : t("register")}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </Card>
          ))}

          <Card className="border-teal/40 bg-teal/5">
            <p className="text-xs font-bold tracking-wide text-teal uppercase">{t("nextStep")}</p>
            <p className="mt-1 text-sm">{gap.next_step}</p>
          </Card>

          <div className="flex items-center justify-between pb-2 text-xs text-ink-soft">
            <span>
              {t("generatedOn")} {formatDate(gap.generatedAt, lang)}
            </span>
            <Button variant="ghost" className="!py-1 text-xs" onClick={() => run()} disabled={busy}>
              ↻ {t("regenerate")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
