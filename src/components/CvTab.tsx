import { useCallback, useState } from "react";
import { generateCv, isStale, type CvResult } from "../ai/features";
import { courseById } from "../data/courses";
import { eventById } from "../data/events";
import type { Go } from "../nav";
import { hasMinimalProfile, useApp } from "../state";
import type { Profile } from "../types";
import { useAction } from "../useAction";
import { Button, Card, ErrorBox, Field, Input, ProfileGate, ScoreRing, SectionHeader, Spinner, StaleNotice, formatDate } from "./ui";
import type { T } from "../i18n";

export default function CvTab({ go }: { go: Go }) {
  const { t, lang, profile, gap, cv, setCv } = useApp();
  const [role, setRole] = useState(cv?.targetRole ?? gap?.career_targets[0]?.role ?? "");
  const { run, busy, error } = useAction(
    useCallback(async () => setCv(await generateCv(profile, role.trim(), lang)), [profile, role, lang, setCv]),
  );

  if (!hasMinimalProfile(profile)) {
    return (
      <>
        <SectionHeader title={t("cvTitle")} intro={t("cvIntro")} />
        <ProfileGate onGoProfile={() => go("profile")} />
      </>
    );
  }

  const stale = cv && isStale(cv, profile, lang);

  return (
    <div className="space-y-4">
      <SectionHeader title={t("cvTitle")} intro={t("cvIntro")} />

      <Card className="space-y-3">
        <Field label={t("targetRole")}>
          <Input value={role} placeholder={t("targetRolePh")} onChange={(e) => setRole(e.target.value)} />
        </Field>
        {gap && gap.career_targets.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {gap.career_targets.map((c) => (
              <button key={c.role} onClick={() => setRole(c.role)} className="rounded-full bg-surface px-2.5 py-1 text-xs hover:bg-brand/10">
                {c.role}
              </button>
            ))}
          </div>
        )}
        <Button className="w-full" onClick={() => run()} disabled={busy || !role.trim()}>
          {busy ? <Spinner label={t("working")} /> : `✨ ${cv ? t("regenerate") : t("generateCv")}`}
        </Button>
      </Card>

      {error != null && <ErrorBox error={error} onRetry={() => run()} onOpenSettings={() => go("settings")} />}

      {cv && (
        <>
          {stale && <StaleNotice onRegenerate={() => run()} busy={busy} />}

          <Card className="flex gap-4">
            <ScoreRing value={cv.score} label={t("cvScore")} />
            <div className="min-w-0 flex-1 space-y-2 text-sm">
              <p className="text-xs font-bold tracking-wide text-ink-soft uppercase">
                {t("cvScore")} · {cv.targetRole}
              </p>
              <div>
                <p className="text-xs font-semibold text-teal">{t("strengths")}</p>
                <ul className="list-disc pl-4 text-ink-soft">
                  {cv.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700">{t("improvements")}</p>
                <ul className="list-disc pl-4 text-ink-soft">
                  {cv.improvements.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-ink-soft">{t("printHint")}</span>
            <Button variant="teal" onClick={() => window.print()}>
              ⬇ {t("downloadPdf")}
            </Button>
          </div>

          <CvSheet cv={cv} profile={profile} t={t} lang={lang} />
        </>
      )}
    </div>
  );
}

function CvSheet({ cv, profile, t, lang }: { cv: CvResult; profile: Profile; t: T; lang: string }) {
  const courses = profile.completedCourseIds.map((id) => courseById.get(id)).filter((c) => c !== undefined);
  const events = profile.attendedEventIds.map((id) => eventById.get(id)).filter((e) => e !== undefined);
  const contact = [profile.email, profile.phone, profile.location].filter(Boolean);
  const yearLabel = { "1": t("year1"), "2": t("year2"), "3": t("year3"), "4": t("year4"), grad: t("yearGrad") }[profile.year];

  const H = ({ children }: { children: string }) => (
    <h3 className="mb-1.5 border-b-2 border-brand/20 pb-0.5 text-[11px] font-extrabold tracking-wider text-brand-dark uppercase">{children}</h3>
  );

  return (
    <article id="cv-sheet" className="rounded-xl border border-line bg-white p-6 text-[13px] leading-snug text-ink shadow-sm">
      <header className="flex items-center gap-4 border-b border-line pb-4">
        {profile.photo && <img src={profile.photo} alt="" className="h-20 w-20 rounded-full object-cover" />}
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold text-brand-dark">{profile.name || "—"}</h2>
          <p className="font-semibold text-teal">{cv.headline}</p>
          {contact.length > 0 && <p className="mt-1 text-xs text-ink-soft">{contact.join("  ·  ")}</p>}
        </div>
      </header>

      <section className="mt-4">
        <H>{t("cvSummary")}</H>
        <p>{cv.summary}</p>
      </section>

      <section className="mt-4">
        <H>{t("cvSkills")}</H>
        <p>{cv.skills.join("  •  ")}</p>
      </section>

      {cv.experience.length > 0 && (
        <section className="mt-4">
          <H>{t("cvExperience")}</H>
          <div className="space-y-3">
            {cv.experience.map((x, i) => (
              <div key={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-bold">
                    {x.title}
                    {x.organization && <span className="font-normal text-ink-soft"> · {x.organization}</span>}
                  </p>
                  {x.period && <p className="text-xs text-ink-soft">{x.period}</p>}
                </div>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {x.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-4">
        <H>{t("cvEducation")}</H>
        <p className="font-bold">{profile.university || "—"}</p>
        <p className="text-ink-soft">
          {[profile.department, yearLabel, profile.gpa && `${t("gpa")}: ${profile.gpa}`].filter(Boolean).join(" · ")}
        </p>
      </section>

      {courses.length > 0 && (
        <section className="mt-4">
          <H>{t("cvTraining")}</H>
          <ul className="list-disc pl-4">
            {courses.map((c) => (
              <li key={c.id}>
                {c.title} <span className="text-ink-soft">({c.provider})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {events.length > 0 && (
        <section className="mt-4">
          <H>{t("cvEvents")}</H>
          <ul className="list-disc pl-4">
            {events.map((e) => (
              <li key={e.id}>
                {e.title} <span className="text-ink-soft">({formatDate(e.date, lang)})</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
