import type { AcademyEvent } from "../types";

// Seeded demo events. Past ones (from the GP Academy landing page) can be marked
// as attended; future ones are "upcoming". The split is computed from today's date.
export const EVENTS: AcademyEvent[] = [
  // Past, seen on the GP Academy landing page
  { id: "ev-english-daily", title: "English for Daily Use (with IDP Education)", date: "2026-02-17", kind: "Workshop", mode: "Dhaka", provider: "GP Academy × IDP Education", skills: ["Business English", "Communication"] },
  { id: "ev-ai-ux-journey", title: "AI-Powered UX Learning Journey", date: "2026-03-08", kind: "Bootcamp", mode: "Online", provider: "GP Academy", skills: ["UX design", "AI tools", "Figma"] },
  { id: "ev-ai-safety", title: "\"AI, Safety and My Future\" Discussion", date: "2026-07-21", kind: "Webinar", mode: "Online", provider: "GP Academy", skills: ["AI literacy", "Critical thinking"] },
  { id: "ev-branding-quiz", title: "Personal Branding in AI Era Quiz", date: "2026-07-23", kind: "Quiz", mode: "Online", provider: "GP Academy", skills: ["Personal branding", "LinkedIn"] },
  { id: "ev-data-masterclass", title: "Masterclass Series on Data Analytics", date: "2026-08-20", kind: "Masterclass", mode: "Hybrid", provider: "GP Academy", skills: ["Data analysis", "Power BI", "SQL"] },

  // Upcoming (demo)
  { id: "ev-cv-clinic", title: "Live CV Clinic: Get Your CV Reviewed", date: "2026-10-24", kind: "Workshop", mode: "Online", provider: "GP Academy", skills: ["CV writing", "ATS optimization"] },
  { id: "ev-figma-bootcamp", title: "3-Day Figma UI/UX Bootcamp", date: "2026-11-05", kind: "Bootcamp", mode: "Dhaka", provider: "GP Academy", skills: ["Figma", "UI design", "Prototyping"] },
  { id: "ev-cyber-day", title: "Cybersecurity Awareness Day", date: "2026-11-12", kind: "Webinar", mode: "Online", provider: "Cisco Networking Academy", skills: ["Cybersecurity", "Network security"] },
  { id: "ev-freelance-meetup", title: "Freelancers Meetup: Winning Your First Client", date: "2026-11-20", kind: "Workshop", mode: "Chattogram", provider: "CodersTrust", skills: ["Freelancing", "Client communication", "Pricing"] },
  { id: "ev-python-data", title: "Python for Data Analysis Bootcamp", date: "2026-12-03", kind: "Bootcamp", mode: "Hybrid", provider: "Amar iSchool", skills: ["Python", "Data analysis", "pandas"] },
  { id: "ev-career-fair", title: "Youth Career Fair 2026", date: "2026-12-12", kind: "Career Fair", mode: "Dhaka", provider: "GP Academy", skills: ["Networking", "Interview skills"] },
  { id: "ev-interview-mock", title: "Mock Interview Marathon", date: "2027-01-16", kind: "Workshop", mode: "Online", provider: "GP Academy", skills: ["Interview skills", "Communication"] },
  { id: "ev-marketing-masterclass", title: "Digital Marketing Masterclass", date: "2027-01-28", kind: "Masterclass", mode: "Online", provider: "LEAD Academy", skills: ["Digital marketing", "Facebook ads", "Analytics"] },
];

export const eventById = new Map(EVENTS.map((e) => [e.id, e]));

export function isUpcoming(e: AcademyEvent, today = new Date()): boolean {
  const todayIso = today.toISOString().slice(0, 10);
  return e.date >= todayIso;
}
