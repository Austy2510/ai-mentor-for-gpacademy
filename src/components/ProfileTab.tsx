import { useRef, useState } from "react";
import { COURSES } from "../data/courses";
import type { Go } from "../nav";
import { profileCompletion, toggleIn, useApp } from "../state";
import type { Profile, StudyYear } from "../types";
import { Button, Card, Field, Input, SectionHeader, TextArea } from "./ui";

/** Resizes an image file to a small square-ish JPEG data URL so it fits in localStorage. */
async function resizePhoto(file: File, max = 320): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ProfileTab({ go }: { go: Go }) {
  const { t, profile, setProfile } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showCourses, setShowCourses] = useState(profile.completedCourseIds.length > 0);
  const pct = profileCompletion(profile);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  const text = (key: "name" | "email" | "phone" | "location" | "university" | "department" | "gpa" | "skills" | "interests", ph?: string, type = "text") => (
    <Field label={t(key)}>
      <Input type={type} value={profile[key]} placeholder={ph} onChange={(e) => set(key, e.target.value)} />
    </Field>
  );

  const years: [StudyYear, Parameters<typeof t>[0]][] = [
    ["1", "year1"],
    ["2", "year2"],
    ["3", "year3"],
    ["4", "year4"],
    ["grad", "yearGrad"],
  ];

  return (
    <div className="space-y-4">
      <SectionHeader title={t("profileTitle")} intro={t("profileIntro")} />

      <div>
        <div className="mb-1 flex justify-between text-xs font-semibold">
          <span>{t("profileComplete")}</span>
          <span className="text-teal">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-line">
            {profile.photo ? (
              <img src={profile.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl text-slate-300" aria-hidden>
                👤
              </div>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold">{t("photo")}</p>
            <div className="flex gap-2">
              <Button variant="soft" className="!py-1.5 text-xs" onClick={() => fileRef.current?.click()}>
                {t("uploadPhoto")}
              </Button>
              {profile.photo && (
                <Button variant="ghost" className="!py-1.5 text-xs" onClick={() => set("photo", "")}>
                  {t("removePhoto")}
                </Button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) set("photo", await resizePhoto(f));
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {text("name")}
          {text("email", "", "email")}
          {text("phone", "01XXXXXXXXX", "tel")}
          {text("location", "Dhaka")}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {text("university")}
          {text("department", t("departmentPh"))}
          <Field label={t("year")}>
            <select
              value={profile.year}
              onChange={(e) => set("year", e.target.value as StudyYear)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {years.map(([v, k]) => (
                <option key={v} value={v}>
                  {t(k)}
                </option>
              ))}
            </select>
          </Field>
          {text("gpa", "3.45")}
        </div>
        {text("skills", t("skillsPh"))}
        {text("interests", t("interestsPh"))}
        <Field label={t("dream")}>
          <TextArea value={profile.dream} placeholder={t("dreamPh")} onChange={(e) => set("dream", e.target.value)} />
        </Field>
        <Field label={t("experience")}>
          <TextArea value={profile.experience} placeholder={t("experiencePh")} onChange={(e) => set("experience", e.target.value)} />
        </Field>
      </Card>

      <Card>
        <button className="flex w-full items-center justify-between text-left" onClick={() => setShowCourses((s) => !s)} aria-expanded={showCourses}>
          <span>
            <span className="block text-sm font-bold">{t("completedCourses")}</span>
            <span className="text-xs text-ink-soft">{t("completedHint")}</span>
          </span>
          <span className="text-ink-soft">{showCourses ? "▴" : "▾"} {profile.completedCourseIds.length}</span>
        </button>
        {showCourses && (
          <ul className="mt-3 space-y-1">
            {COURSES.filter((c) => c.source === "gp").map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 text-sm hover:bg-surface">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-teal"
                    checked={profile.completedCourseIds.includes(c.id)}
                    onChange={() => set("completedCourseIds", toggleIn(profile.completedCourseIds, c.id))}
                  />
                  <span>
                    {c.title} <span className="text-xs text-ink-soft">· {c.provider}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex items-center justify-between gap-3 pb-2">
        <span className="text-xs text-ink-soft">✓ {t("saved")}</span>
        <Button onClick={() => go("gap")}>{t("analyze")} →</Button>
      </div>
    </div>
  );
}
