import { useState } from "react";
import { MODEL, buildProxyUrl, getClient, getSavedSettings, saveSettings, type AiSettings } from "../ai/client";
import { useApp } from "../state";
import { Button, Card, ErrorBox, Field, Input, SectionHeader } from "./ui";

export default function SettingsTab() {
  const { t, resetAll } = useApp();
  const saved = getSavedSettings();
  const builtIn = buildProxyUrl();
  const [mode, setMode] = useState<AiSettings["mode"]>(saved?.mode ?? "proxy");
  const [proxyUrl, setProxyUrl] = useState(saved?.mode === "proxy" ? saved.proxyUrl : "");
  const [apiKey, setApiKey] = useState(saved?.mode === "key" ? saved.apiKey : "");
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "savedOnly">("idle");
  const [error, setError] = useState<unknown>(null);

  function persist() {
    if (mode === "proxy") saveSettings(proxyUrl.trim() ? { mode, proxyUrl: proxyUrl.trim() } : null);
    else saveSettings(apiKey.trim() ? { mode, apiKey: apiKey.trim() } : null);
  }

  async function test() {
    persist();
    setStatus("testing");
    setError(null);
    try {
      await getClient().messages.create({
        model: MODEL,
        max_tokens: 64,
        output_config: { effort: "low" },
        messages: [{ role: "user", content: "Reply with: ok" }],
      });
      setStatus("ok");
    } catch (e) {
      setError(e);
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader title={t("settingsTitle")} intro={t("settingsIntro")} />

      {builtIn && <p className="rounded-lg bg-teal/10 px-3 py-2 text-xs text-teal">{t("builtInProxy")}</p>}

      <Card className="space-y-3">
        {(["proxy", "key"] as const).map((m) => (
          <label key={m} className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${mode === m ? "border-brand bg-brand/5" : "border-line"}`}>
            <input type="radio" name="mode" className="mt-1 accent-brand" checked={mode === m} onChange={() => setMode(m)} />
            <span>
              <span className="block text-sm font-bold">{m === "proxy" ? t("modeProxy") : t("modeKey")}</span>
              <span className="text-xs text-ink-soft">{m === "proxy" ? t("modeProxyHint") : t("modeKeyHint")}</span>
            </span>
          </label>
        ))}

        {mode === "proxy" ? (
          <Field label={t("proxyUrl")}>
            <Input
              type="url"
              value={proxyUrl}
              placeholder={builtIn || "https://skillsheba-proxy.<you>.workers.dev"}
              onChange={(e) => setProxyUrl(e.target.value)}
            />
          </Field>
        ) : (
          <Field label={t("apiKey")}>
            <Input type="password" autoComplete="off" value={apiKey} placeholder="sk-ant-…" onChange={(e) => setApiKey(e.target.value)} />
          </Field>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              persist();
              setStatus("savedOnly");
            }}
          >
            {t("save")}
          </Button>
          <Button variant="ghost" onClick={test} disabled={status === "testing"}>
            {status === "testing" ? t("testing") : t("testConnection")}
          </Button>
          {saved && (
            <Button
              variant="ghost"
              onClick={() => {
                saveSettings(null);
                setProxyUrl("");
                setApiKey("");
                setStatus("idle");
              }}
            >
              {t("clearSettings")}
            </Button>
          )}
          {status === "ok" && <span className="text-sm font-semibold text-teal">{t("testOk")}</span>}
          {status === "savedOnly" && <span className="text-sm text-ink-soft">✓</span>}
        </div>
        {error != null && <ErrorBox error={error} />}
      </Card>

      <Card className="space-y-2">
        <h3 className="text-sm font-bold">{t("dataTitle")}</h3>
        <p className="text-xs text-ink-soft">{t("dataIntro")}</p>
        <Button
          variant="ghost"
          className="text-rose-700"
          onClick={() => {
            if (confirm(t("resetConfirm"))) resetAll();
          }}
        >
          {t("resetAll")}
        </Button>
      </Card>
    </div>
  );
}
