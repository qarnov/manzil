import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const languages = [
  { code: "en", label: "English", sub: "Continue in English" },
  { code: "kn", label: "ಕನ್ನಡ", sub: "Kannada" },
  { code: "ml", label: "മലയാളം", sub: "Malayalam" },
];

function Onboarding() {
  const [selected, setSelected] = useState<string>("en");
  const navigate = useNavigate();

  const onContinue = () => {
    try {
      localStorage.setItem("manzil_language", selected);
      localStorage.setItem("manzil_onboarded", "true");
    } catch {}
    navigate({ to: "/" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--page-bg)",
      color: "var(--ink)",
      padding: "48px 24px 32px",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-arabic)", fontSize: 44, fontWeight: 700 }}>مَنْزِل</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 18, marginTop: 8 }}>Manzil</div>
        <div className="mono" style={{ fontSize: 10, color: "var(--gold)", marginTop: 6, letterSpacing: 1.5 }}>
          YOUR PEACEFUL HOME
        </div>
      </div>

      <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textAlign: "center", marginBottom: 16, letterSpacing: 1.5 }}>
        CHOOSE YOUR LANGUAGE
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {languages.map((l) => {
          const active = selected === l.code;
          return (
            <button
              key={l.code}
              onClick={() => setSelected(l.code)}
              style={{
                background: active ? "var(--ink)" : "var(--card)",
                color: active ? "var(--card)" : "var(--ink)",
                border: `2px solid ${active ? "var(--ink)" : "var(--border)"}`,
                borderRadius: 14,
                padding: "18px 20px",
                textAlign: "left",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontFamily: "var(--font-body)",
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{l.label}</div>
                <div className="mono" style={{ fontSize: 10, marginTop: 4, color: active ? "var(--gold)" : "var(--muted)" }}>
                  {l.sub.toUpperCase()}
                </div>
              </div>
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                border: `2px solid ${active ? "var(--gold)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {active && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--gold)" }} />}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        style={{
          marginTop: 24,
          background: "var(--ink)",
          color: "var(--card)",
          padding: "16px 0",
          borderRadius: 14,
          fontSize: 16,
          fontWeight: 600,
          fontFamily: "var(--font-body)",
        }}
      >
        Continue
      </button>
      <div className="mono" style={{ fontSize: 9, color: "var(--muted)", textAlign: "center", marginTop: 12 }}>
        APP CONTENT WILL DISPLAY IN ENGLISH
      </div>
    </div>
  );
}
