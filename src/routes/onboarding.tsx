import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const languages = [
  { code: "en", label: "English", sub: "Continue in English" },
  { code: "kn", label: "ಕನ್ನಡ", sub: "Kannada" },
  { code: "ml", label: "മലയാളം", sub: "Malayalam" },
];

function Onboarding() {
  const [step, setStep] = useState<"lang" | "location">("lang");
  const [selected, setSelected] = useState<string>("en");
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

  const finish = (to: "/" | "/select-masjid") => {
    try {
      localStorage.setItem("manzil_language", selected);
      localStorage.setItem("manzil_onboarded", "true");
    } catch {}
    navigate({ to });
  };

  const requestLocation = async () => {
    setLocating(true);
    try {
      if (Capacitor.isNativePlatform()) {
        await Geolocation.requestPermissions();
        await Geolocation.getCurrentPosition({ timeout: 10000 });
      } else if (navigator.geolocation) {
        await new Promise<void>((resolve) =>
          navigator.geolocation.getCurrentPosition(
            () => resolve(),
            () => resolve(),
            { timeout: 10000 }
          )
        );
      }
    } catch {
      /* denied — proceed anyway; they can browse masjids manually */
    } finally {
      setLocating(false);
      finish("/select-masjid");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--page-bg)",
        color: "var(--ink)",
        padding: "48px 24px 32px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-arabic)", fontSize: 44, fontWeight: 700 }}>مَنْزِل</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 18, marginTop: 8 }}>Manzil</div>
        <div className="mono" style={{ fontSize: 10, color: "var(--gold)", marginTop: 6, letterSpacing: 1.5 }}>
          YOUR PEACEFUL HOME
        </div>
      </div>

      {step === "lang" ? (
        <>
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{l.label}</div>
                    <div className="mono" style={{ fontSize: 10, marginTop: 4, color: active ? "var(--gold)" : "var(--muted)" }}>
                      {l.sub.toUpperCase()}
                    </div>
                  </div>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: `2px solid ${active ? "var(--gold)" : "var(--border)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {active && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--gold)" }} />}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStep("location")}
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
        </>
      ) : (
        <>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
            <div style={{ fontSize: 56 }}>📍</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>Find masjids near you</div>
            <div style={{ fontSize: 14, color: "var(--quote)", marginTop: 12, lineHeight: 1.6, padding: "0 8px" }}>
              Allow location so Manzil can show masjids in your area and load their azaan &amp;
              iqamah times. Your location is only used on your device.
            </div>
          </div>

          <button
            onClick={requestLocation}
            disabled={locating}
            style={{
              background: "var(--ink)",
              color: "var(--card)",
              padding: "16px 0",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: "var(--font-body)",
            }}
          >
            {locating ? "Getting your location…" : "Allow location"}
          </button>
          <button
            onClick={() => finish("/")}
            className="mono"
            style={{ marginTop: 12, fontSize: 11, color: "var(--muted)", padding: "8px 0" }}
          >
            Skip for now
          </button>
        </>
      )}
    </div>
  );
}
