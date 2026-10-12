export type Lang = "en" | "bn";

export type StudyYear = "1" | "2" | "3" | "4" | "grad";

export interface Profile {
  name: string;
  email: string;
  phone: string;
  location: string;
  university: string;
  department: string;
  year: StudyYear;
  gpa: string;
  skills: string; // comma-separated, in the student's own words
  interests: string;
  dream: string; // long-term goal, free text
  experience: string; // projects, internships, clubs: free text
  photo: string; // data URL, resized client-side
  completedCourseIds: string[];
  attendedEventIds: string[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  provider: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  skills: string[];
  free: boolean;
  /** "gp" = GP Academy catalog, "external" = free resource elsewhere. */
  source: "gp" | "external";
  url?: string;
}

export interface AcademyEvent {
  id: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  kind: "Masterclass" | "Workshop" | "Bootcamp" | "Quiz" | "Webinar" | "Career Fair";
  mode: "Online" | "Dhaka" | "Chattogram" | "Hybrid";
  provider: string;
  skills: string[];
}

export interface EmployerRole {
  title: string;
  type: "Internship" | "Full-time" | "Part-time" | "Freelance";
  skills: string[];
}

export interface Employer {
  id: string;
  name: string;
  industry: string;
  location: string;
  about: string;
  roles: EmployerRole[];
}

export interface HostContext {
  title: string;
  path: string;
  heading: string;
}
