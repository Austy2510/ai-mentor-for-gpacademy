import { z } from "zod";
import { COURSES, courseById } from "../data/courses";
import { EMPLOYERS, employerById } from "../data/employers";
import { EVENTS, eventById, isUpcoming } from "../data/events";
import type { Lang, Profile } from "../types";
import { structuredCall } from "./client";

// Every prompt hands Claude the exact catalog to choose from and asks it to cite
// IDs; anything it returns that isn't in our data is dropped before display.

const YEAR_LABEL: Record<Profile["year"], string> = {
  "1": "1st year undergraduate",
  "2": "2nd year undergraduate",
  "3": "3rd year undergraduate",
  "4": "4th year undergraduate",
  grad: "Graduated in the last 0-2 years",
};

function languageRule(lang: Lang): string {
  return lang === "bn"
    ? "Write every human-readable string in Bangla (বাংলা). Keep course titles, employer names, IDs and technical skill names exactly as given."
    : "Write every human-readable string in clear, simple English.";
}

export function profileText(p: Profile): string {
  const completed = p.completedCourseIds.map((id) => courseById.get(id)?.title).filter(Boolean);
  const attended = p.attendedEventIds.map((id) => eventById.get(id)?.title).filter(Boolean);
  return [
    `Name: ${p.name || "(not given)"}`,
    `University: ${p.university || "(not given)"}`,
    `Department / subject: ${p.department || "(not given)"}`,
    `Stage: ${YEAR_LABEL[p.year]}`,
    `CGPA: ${p.gpa || "(not given)"}`,
    `Current skills (self-reported): ${p.skills || "(none listed)"}`,
    `Interests: ${p.interests || "(not given)"}`,
    `Dream / long-term goal, in the student's own words: ${p.dream || "(not given)"}`,
    `Projects, internships, clubs, experience: ${p.experience || "(none listed)"}`,
    `Completed GP Academy courses: ${completed.length ? completed.join("; ") : "none yet"}`,
    `Events attended: ${attended.length ? attended.join("; ") : "none yet"}`,
  ].join("\n");
}

/** True when a saved result no longer matches the profile or the interface language. */
export function isStale(r: { profileSig: string; lang?: Lang }, p: Profile, lang: Lang): boolean {
  return r.profileSig !== profileSignature(p) || (r.lang ?? "en") !== lang;
}

/** Short fingerprint so the UI can tell when a saved result is out of date. */
export function profileSignature(p: Profile): string {
  const { photo: _photo, ...rest } = p;
  const s = JSON.stringify(rest);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return String(h);
}

// ---------------------------------------------------------------- Skill gap

const SkillGapSchema = z.object({
  career_targets: z.array(
    z.object({
      role: z.string().describe("A concrete job title the student could target in Bangladesh"),
      why: z.string().describe("One sentence tying this role to the student's subject, interests and dream"),
    }),
  ),
  summary: z.string().describe("2-3 sentence personal summary of where the student stands today"),
  skill_gaps: z.array(
    z.object({
      skill: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      reason: z.string().describe("One line explaining why this gap matters for the student's stated goal"),
      course_ids: z.array(z.string()).describe("IDs from the provided course list only"),
      event_ids: z.array(z.string()).describe("IDs from the provided upcoming events list only"),
    }),
  ),
  next_step: z.string().describe("The single most useful thing to do this week"),
});

export type SkillGapResult = z.infer<typeof SkillGapSchema> & { generatedAt: string; profileSig: string; lang: Lang };

export async function analyzeSkillGap(p: Profile, lang: Lang): Promise<SkillGapResult> {
  const courses = COURSES.filter((c) => !p.completedCourseIds.includes(c.id)).map((c) => ({
    id: c.id,
    title: c.title,
    provider: c.provider,
    level: c.level,
    duration: c.duration,
    skills: c.skills,
    source: c.source === "gp" ? "GP Academy" : "Free external resource",
  }));
  const events = EVENTS.filter((e) => isUpcoming(e)).map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    kind: e.kind,
    mode: e.mode,
    skills: e.skills,
  }));

  const result = await structuredCall({
    schema: SkillGapSchema,
    system: [
      "You are SkillSheba, an AI career mentor for Bangladeshi university students, built into GP Academy.",
      "You compare a student's profile with what the Bangladeshi job market asks for and recommend specific next steps.",
      "Rules:",
      "- Turn the student's free-text dream into 1-3 concrete, realistic career targets. If the dream is vague, infer from their subject and interests, and say so.",
      "- Identify 2-3 skill gaps between where they are and those targets, ranked by priority. Do not list skills they already have.",
      "- For each gap, pick up to 3 courses and up to 2 events ONLY from the lists provided, by ID. Never invent courses, events or IDs. Prefer GP Academy courses; use free external resources to fill gaps GP Academy doesn't cover. An empty list is fine when nothing fits.",
      "- Be honest and encouraging. No generic advice like 'work hard'.",
      languageRule(lang),
    ].join("\n"),
    user: [
      "<student_profile>",
      profileText(p),
      "</student_profile>",
      "<available_courses>",
      JSON.stringify(courses),
      "</available_courses>",
      "<upcoming_events>",
      JSON.stringify(events),
      "</upcoming_events>",
    ].join("\n"),
  });

  // Drop anything that isn't in our catalog.
  for (const gap of result.skill_gaps) {
    gap.course_ids = gap.course_ids.filter((id) => courseById.has(id));
    gap.event_ids = gap.event_ids.filter((id) => eventById.has(id));
  }
  return { ...result, generatedAt: new Date().toISOString(), profileSig: profileSignature(p), lang };
}

// ---------------------------------------------------------------- CV

const CvSchema = z.object({
  headline: z.string().describe("Professional headline under the name, max ~10 words"),
  summary: z.string().describe("3-4 sentence professional summary in first person implied (no 'I')"),
  skills: z.array(z.string()).describe("6-12 skills, most relevant to the target role first"),
  experience: z.array(
    z.object({
      title: z.string().describe("Project, internship, club role or similar"),
      organization: z.string().describe("Organization, course or context; empty string if none"),
      period: z.string().describe("Time period if known, else empty string"),
      bullets: z.array(z.string()).describe("3-5 achievement-focused bullets starting with a strong verb"),
    }),
  ),
  score: z.number().describe("CV readiness score for the target role, 0-100"),
  strengths: z.array(z.string()).describe("2-3 things that are already strong"),
  improvements: z.array(z.string()).describe("2-4 specific, actionable improvements"),
});

export type CvResult = z.infer<typeof CvSchema> & { targetRole: string; generatedAt: string; profileSig: string; lang: Lang };

export async function generateCv(p: Profile, targetRole: string, lang: Lang): Promise<CvResult> {
  const completed = p.completedCourseIds
    .map((id) => courseById.get(id))
    .filter((c) => c !== undefined)
    .map((c) => `${c.title} (${c.provider}): ${c.skills.join(", ")}`);

  const result = await structuredCall({
    schema: CvSchema,
    system: [
      "You are SkillSheba's CV writer. You write concise, ATS-friendly CV copy for Bangladeshi students and fresh graduates.",
      "Rules:",
      "- Use only facts from the profile and completed courses. Never invent employers, dates, numbers, awards or results. Where impact is unknown, describe the work and skills concretely instead of making up metrics.",
      "- Keep the student's own register: polished, but not inflated.",
      "- If the profile has no projects or experience, turn completed courses and attended events into 1-2 'Training & Projects' entries, and say in improvements that real projects would strengthen the CV.",
      "- Score honestly against the target role: 80+ means ready to apply.",
      languageRule(lang),
    ].join("\n"),
    user: [
      `<target_role>${targetRole}</target_role>`,
      "<student_profile>",
      profileText(p),
      "</student_profile>",
      "<completed_courses_with_skills>",
      completed.length ? completed.join("\n") : "none",
      "</completed_courses_with_skills>",
    ].join("\n"),
  });
  result.score = Math.max(0, Math.min(100, Math.round(result.score)));
  return { ...result, targetRole, generatedAt: new Date().toISOString(), profileSig: profileSignature(p), lang };
}

// ---------------------------------------------------------------- Employer match

const MatchSchema = z.object({
  matches: z.array(
    z.object({
      employer_id: z.string().describe("ID from the provided employer list only"),
      role_title: z.string().describe("Exact role title from that employer's roles"),
      fit_score: z.number().describe("0-100"),
      reason: z.string().describe("One sentence explaining the fit for this student"),
      missing_skills: z.array(z.string()).describe("Skills the role asks for that the student lacks; empty if none"),
    }),
  ),
});

export type MatchResult = z.infer<typeof MatchSchema> & { generatedAt: string; profileSig: string; lang: Lang };

export async function matchEmployers(p: Profile, lang: Lang): Promise<MatchResult> {
  const result = await structuredCall({
    schema: MatchSchema,
    system: [
      "You are SkillSheba's employer-matching engine.",
      "Rank the provided employer roles for this student and return the best 3-5 matches, best first.",
      "Rules:",
      "- Use ONLY employer IDs and role titles from the provided list. Never invent employers or roles.",
      "- Consider skills, subject, stage (internship vs full-time fit), interests and location.",
      "- The reason must be specific to this student, not a description of the company.",
      "- Be honest with the fit score; a stretch role can still be listed if it's a good next target.",
      languageRule(lang),
    ].join("\n"),
    user: [
      "<student_profile>",
      profileText(p),
      "</student_profile>",
      "<employers>",
      JSON.stringify(EMPLOYERS.map(({ id, name, industry, location, roles }) => ({ id, name, industry, location, roles }))),
      "</employers>",
    ].join("\n"),
  });

  result.matches = result.matches
    .filter((m) => employerById.get(m.employer_id)?.roles.some((r) => r.title === m.role_title))
    .map((m) => ({ ...m, fit_score: Math.max(0, Math.min(100, Math.round(m.fit_score))) }));
  return { ...result, generatedAt: new Date().toISOString(), profileSig: profileSignature(p), lang };
}
