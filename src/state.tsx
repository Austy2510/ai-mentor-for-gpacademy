import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ChatHistory } from "./ai/client";
import type { CvResult, MatchResult, SkillGapResult } from "./ai/features";
import { makeT, type T } from "./i18n";
import { loadJSON, saveJSON } from "./storage";
import type { HostContext, Lang, Profile } from "./types";

export const EMPTY_PROFILE: Profile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  university: "",
  department: "",
  year: "3",
  gpa: "",
  skills: "",
  interests: "",
  dream: "",
  experience: "",
  photo: "",
  completedCourseIds: [],
  attendedEventIds: [],
};

export interface ChatState {
  history: ChatHistory;
  /** The last student-context snapshot sent, so we only append it when it changes. */
  lastContext: string;
}

const EMPTY_CHAT: ChatState = { history: [], lastContext: "" };

interface PersistedState {
  lang: Lang;
  profile: Profile;
  gap: SkillGapResult | null;
  cv: CvResult | null;
  matches: MatchResult | null;
  interestedEmployers: string[];
  registeredEvents: string[];
  chat: ChatState;
}

const KEYS: { [K in keyof PersistedState]: string } = {
  lang: "skillsheba.lang",
  profile: "skillsheba.profile",
  gap: "skillsheba.gap",
  cv: "skillsheba.cv",
  matches: "skillsheba.matches",
  interestedEmployers: "skillsheba.interested",
  registeredEvents: "skillsheba.registered",
  chat: "skillsheba.chat",
};

function defaultLang(): Lang {
  return navigator.language?.toLowerCase().startsWith("bn") ? "bn" : "en";
}

function usePersisted<K extends keyof PersistedState>(key: K, fallback: PersistedState[K]) {
  const [value, setValue] = useState<PersistedState[K]>(() => loadJSON(KEYS[key], fallback));
  useEffect(() => {
    saveJSON(KEYS[key], value);
  }, [key, value]);
  return [value, setValue] as const;
}

function useAppState() {
  const [lang, setLang] = usePersisted("lang", defaultLang());
  const [profile, setProfile] = usePersisted("profile", EMPTY_PROFILE);
  const [gap, setGap] = usePersisted("gap", null);
  const [cv, setCv] = usePersisted("cv", null);
  const [matches, setMatches] = usePersisted("matches", null);
  const [interestedEmployers, setInterestedEmployers] = usePersisted("interestedEmployers", []);
  const [registeredEvents, setRegisteredEvents] = usePersisted("registeredEvents", []);
  const [chat, setChat] = usePersisted("chat", EMPTY_CHAT);
  const [host, setHost] = useState<HostContext | null>(null);

  const t: T = useMemo(() => makeT(lang), [lang]);

  // Older saves may miss fields added later.
  const fullProfile = useMemo(() => ({ ...EMPTY_PROFILE, ...profile }), [profile]);

  function resetAll() {
    setProfile(EMPTY_PROFILE);
    setGap(null);
    setCv(null);
    setMatches(null);
    setInterestedEmployers([]);
    setRegisteredEvents([]);
    setChat(EMPTY_CHAT);
  }

  return {
    lang, setLang, t,
    profile: fullProfile, setProfile,
    gap, setGap,
    cv, setCv,
    matches, setMatches,
    interestedEmployers, setInterestedEmployers,
    registeredEvents, setRegisteredEvents,
    chat, setChat,
    host, setHost,
    resetAll,
  };
}

export type AppState = ReturnType<typeof useAppState>;

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const state = useAppState();
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}

/** Share of the key profile fields that are filled in (a PRD success metric). */
export function profileCompletion(p: Profile): number {
  const fields: (keyof Profile)[] = ["name", "university", "department", "gpa", "skills", "interests", "dream", "experience", "email"];
  const filled = fields.filter((f) => String(p[f]).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

export function hasMinimalProfile(p: Profile): boolean {
  return p.department.trim() !== "" && (p.dream.trim() !== "" || p.interests.trim() !== "");
}

export function toggleIn(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
