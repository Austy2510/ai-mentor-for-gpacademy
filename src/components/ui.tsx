import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { errorKey } from "../ai/client";
import { useApp } from "../state";

type BtnVariant = "primary" | "ghost" | "soft" | "teal";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const styles: Record<BtnVariant, string> = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    teal: "bg-teal text-white hover:brightness-95",
    ghost: "border border-line text-ink hover:bg-surface",
    soft: "bg-brand/10 text-brand hover:bg-brand/15",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${styles[variant]} ${className}`}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-white p-4 ${className}`}>{children}</div>;
}

export function SectionHeader({ title, intro, right }: { title: string; intro?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-extrabold text-ink">{title}</h2>
        {intro && <p className="mt-1 text-sm text-ink-soft">{intro}</p>}
      </div>
      {right}
    </div>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "red" | "amber" | "green" | "blue" | "teal" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    red: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    teal: "bg-teal/10 text-teal",
  };
  return <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${inputCls} resize-y ${props.className ?? ""}`} />;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-soft" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
      {label}
    </span>
  );
}

export function ErrorBox({ error, onRetry, onOpenSettings }: { error: unknown; onRetry?: () => void; onOpenSettings?: () => void }) {
  const { t } = useApp();
  const key = errorKey(error);
  const needsSettings = key === "notConfigured" || key === "auth" || key === "network";
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">
      <p>{t(`err_${key}`)}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {needsSettings && onOpenSettings && (
          <Button variant="ghost" className="bg-white !py-1 text-xs" onClick={onOpenSettings}>
            {t("openSettings")}
          </Button>
        )}
        {onRetry && key !== "notConfigured" && (
          <Button variant="ghost" className="bg-white !py-1 text-xs" onClick={onRetry}>
            {t("retry")}
          </Button>
        )}
      </div>
    </div>
  );
}

export function StaleNotice({ onRegenerate, busy }: { onRegenerate: () => void; busy: boolean }) {
  const { t } = useApp();
  return (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <span>{t("staleResult")}</span>
      <button className="font-semibold underline disabled:opacity-50" onClick={onRegenerate} disabled={busy}>
        {t("regenerate")}
      </button>
    </div>
  );
}

export function ProfileGate({ onGoProfile }: { onGoProfile: () => void }) {
  const { t } = useApp();
  return (
    <Card className="bg-surface text-center">
      <p className="text-sm text-ink-soft">{t("profileFirst")}</p>
      <Button className="mt-3" onClick={onGoProfile}>
        {t("goToProfile")}
      </Button>
    </Card>
  );
}

export function ScoreRing({ value, size = 64, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const color = value >= 80 ? "#0f9e92" : value >= 60 ? "#0a6ebd" : value >= 40 ? "#f2a325" : "#e8427a";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e3e9f1" strokeWidth={6} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={6} fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-extrabold text-ink" aria-label={label ? `${label}: ${value}` : undefined}>
        {value}
      </span>
    </div>
  );
}

export function formatDate(iso: string, lang: string): string {
  try {
    return new Date(iso).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}
