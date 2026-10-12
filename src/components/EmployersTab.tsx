import { useCallback } from "react";
import { matchEmployers, isStale } from "../ai/features";
import { employerById } from "../data/employers";
import type { Go } from "../nav";
import { hasMinimalProfile, toggleIn, useApp } from "../state";
import { useAction } from "../useAction";
import { Badge, Button, Card, ErrorBox, ProfileGate, SectionHeader, Spinner, StaleNotice, formatDate } from "./ui";

export default function EmployersTab({ go }: { go: Go }) {
  const { t, lang, profile, matches, setMatches, interestedEmployers, setInterestedEmployers } = useApp();
  const { run, busy, error } = useAction(
    useCallback(async () => setMatches(await matchEmployers(profile, lang)), [profile, lang, setMatches]),
  );

  const header = <SectionHeader title={t("empTitle")} intro={t("empIntro")} right={<Badge tone="amber">{t("demoData")}</Badge>} />;

  if (!hasMinimalProfile(profile)) {
    return (
      <>
        {header}
        <ProfileGate onGoProfile={() => go("profile")} />
      </>
    );
  }

  const stale = matches && isStale(matches, profile, lang);

  return (
    <div className="space-y-4">
      {header}
      <p className="rounded-lg bg-surface px-3 py-2 text-xs text-ink-soft">{t("empDemoNote")}</p>

      {!matches && (
        <Button className="w-full" onClick={() => run()} disabled={busy}>
          {busy ? <Spinner label={t("working")} /> : `🤝 ${t("findMatches")}`}
        </Button>
      )}
      {error != null && <ErrorBox error={error} onRetry={() => run()} onOpenSettings={() => go("settings")} />}

      {matches && (
        <>
          {stale && <StaleNotice onRegenerate={() => run()} busy={busy} />}
          {busy && <Spinner label={t("working")} />}
          {matches.matches.map((m) => {
            const emp = employerById.get(m.employer_id)!;
            const role = emp.roles.find((r) => r.title === m.role_title)!;
            const key = `${m.employer_id}::${m.role_title}`;
            const interested = interestedEmployers.includes(key);
            return (
              <Card key={key} className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-ink-soft">
                      {emp.name} · {emp.industry}
                    </p>
                    <h3 className="font-bold">{m.role_title}</h3>
                    <p className="text-xs text-ink-soft">
                      {role.type} · 📍 {emp.location}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-extrabold text-teal">{m.fit_score}%</p>
                    <p className="text-[10px] text-ink-soft uppercase">{t("fit")}</p>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal to-brand" style={{ width: `${m.fit_score}%` }} />
                </div>
                <p className="text-sm">{m.reason}</p>
                {m.missing_skills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-ink-soft">{t("missing")}:</span>
                    {m.missing_skills.map((s) => (
                      <Badge key={s} tone="amber">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button
                  variant={interested ? "teal" : "soft"}
                  className="!py-1.5 text-xs"
                  onClick={() => setInterestedEmployers((l) => toggleIn(l, key))}
                  aria-pressed={interested}
                >
                  {interested ? `✓ ${t("interestedDone")}` : t("interested")}
                </Button>
              </Card>
            );
          })}
          <div className="flex items-center justify-between pb-2 text-xs text-ink-soft">
            <span>
              {t("generatedOn")} {formatDate(matches.generatedAt, lang)}
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
