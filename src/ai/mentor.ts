import { COURSES, courseById } from "../data/courses";
import { EMPLOYERS, employerById } from "../data/employers";
import { EVENTS } from "../data/events";
import type { HostContext, Lang, Profile } from "../types";
import type { CvResult, MatchResult, SkillGapResult } from "./features";
import { profileText } from "./features";

// The system prompt is frozen for the whole session (it also holds the catalog,
// so it caches well). Everything that changes - the student's profile, results,
// the page they're on - is appended to the conversation as a system message
// whenever it changes, which keeps the history append-only.
export const MENTOR_SYSTEM = [
  "You are SkillSheba (দক্ষতা + সেবা), the always-on AI career mentor inside GP Academy (Grameenphone Academy), shown as a chat widget on every page.",
  "You help Bangladeshi university students and fresh graduates turn 'I don't know what to do' into a concrete next step: which skills to build, which GP Academy courses and events to take, whether their CV is ready, and which employers fit them.",
  "",
  "How to answer:",
  "- You always receive the student's latest profile and saved results in a <student_context> system message. Use it; never ask for something it already contains.",
  "- Be specific and personal. Name exact courses, events and employers from the catalog below, and say why they fit this student.",
  "- Recommend ONLY courses, events and employers that appear in the catalog below. If nothing fits, say so and suggest a general direction instead. Never invent listings, links, salaries or statistics.",
  "- Keep replies short for a chat widget: usually 2-6 sentences or a short bulleted list. Use **bold** sparingly.",
  "- Reply in the language the student writes in (Bangla, English or Banglish). If unclear, use the interface language given in the context.",
  "- When the student would benefit from a tool in the widget, point them to the tab: Profile, Skill Gap, CV, Employers or Events.",
  "- You are a mentor, not a therapist or lawyer; for serious personal crises, gently suggest talking to someone they trust or a professional.",
  "",
  "<catalog_courses>",
  COURSES.map((c) => `- [${c.id}] ${c.title} | ${c.provider} | ${c.category} | ${c.level} | ${c.duration} | skills: ${c.skills.join(", ")}${c.source === "external" ? " | free external resource" : ""}`).join("\n"),
  "</catalog_courses>",
  "<catalog_events>",
  EVENTS.map((e) => `- [${e.id}] ${e.date} | ${e.title} | ${e.kind} | ${e.mode} | ${e.provider} | skills: ${e.skills.join(", ")}`).join("\n"),
  "</catalog_events>",
  "<catalog_employers>",
  EMPLOYERS.map((e) => `- [${e.id}] ${e.name} | ${e.industry} | ${e.location} | roles: ${e.roles.map((r) => `${r.title} (${r.type}; ${r.skills.join(", ")})`).join("; ")}`).join("\n"),
  "</catalog_employers>",
].join("\n");

export function studentContext(opts: {
  profile: Profile;
  gap: SkillGapResult | null;
  cv: CvResult | null;
  matches: MatchResult | null;
  host: HostContext | null;
  lang: Lang;
  today: string;
}): string {
  const { profile, gap, cv, matches, host, lang, today } = opts;
  const lines = [
    "<student_context>",
    `Today: ${today}`,
    `Interface language: ${lang === "bn" ? "Bangla" : "English"}`,
    host ? `Page the student is viewing on GP Academy: "${host.title}"${host.heading ? ` (main heading: "${host.heading}")` : ""}` : "",
    "",
    "Profile:",
    profileText(profile),
    "",
  ];
  if (gap) {
    lines.push(
      `Saved skill-gap analysis (${gap.generatedAt.slice(0, 10)}):`,
      `Career targets: ${gap.career_targets.map((t) => t.role).join(", ")}`,
      ...gap.skill_gaps.map(
        (g) => `- Gap: ${g.skill} (${g.priority}) - recommended: ${g.course_ids.map((id) => courseById.get(id)?.title).filter(Boolean).join(", ") || "none"}`,
      ),
      `Suggested next step: ${gap.next_step}`,
      "",
    );
  } else lines.push("Skill-gap analysis: not run yet.", "");
  if (cv) {
    lines.push(
      `Generated CV for "${cv.targetRole}" (${cv.generatedAt.slice(0, 10)}): readiness score ${cv.score}/100.`,
      `Improvements suggested: ${cv.improvements.join(" | ")}`,
      "",
    );
  } else lines.push("CV: not generated yet.", "");
  if (matches && matches.matches.length) {
    lines.push(
      "Employer matches:",
      ...matches.matches.map((m) => `- ${employerById.get(m.employer_id)?.name} - ${m.role_title} (fit ${m.fit_score}/100)`),
    );
  } else lines.push("Employer matches: not run yet.");
  lines.push("</student_context>");
  return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n");
}
