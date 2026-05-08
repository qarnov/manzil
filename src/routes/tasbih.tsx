import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/tasbih")({ component: Tasbih });

type Phase = { name: string; target: number; custom?: boolean };

const presetPhases: Phase[] = [
  { name: "SubhanAllah", target: 33 },
  { name: "Alhamdulillah", target: 33 },
  { name: "AllahuAkbar", target: 33 },
];

function Tasbih() {
  const [count, setCount] = useState(0);
  const [phases, setPhases] = useState<Phase[]>(presetPhases);
  const [phase, setPhase] = useState(0);
  const [showCustom, setShowCustom] = useState(false);
  const [draft, setDraft] = useState("");

  const tap = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
    const next = count + 1;
    if (next >= phases[phase].target) {
      setCount(0);
      setPhase((p) => (p + 1) % phases.length);
    } else {
      setCount(next);
    }
  };

  const startCustom = () => {
    const text = draft.trim();
    if (!text) return;
    const customPhase: Phase = { name: text, target: 33, custom: true };
    const next = [...presetPhases, customPhase];
    setPhases(next);
    setPhase(next.length - 1);
    setCount(0);
    setShowCustom(false);
    setDraft("");
  };

  const current = phases[phase];

  return (
    <>
      <TopBar title="Tasbih Counter" back />
      <div style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ fontFamily: "var(--font-arabic)", fontSize: 72, color: "var(--ink)", lineHeight: 1 }}>
          {count}
        </div>
        <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
          {count} / {current.target}
        </div>
        <div style={{
          fontSize: 16, fontWeight: 700, color: "var(--ink)",
          textAlign: "center", maxWidth: 320, wordBreak: "break-word"
        }}>{current.name}</div>

        <button onClick={tap} style={{
          width: 160, height: 160, borderRadius: "50%",
          background: "var(--ink)", color: "var(--card)",
          fontFamily: "var(--font-arabic)", fontSize: 22,
          border: "3px solid var(--gold)",
          marginTop: 16
        }}>Tap</button>

        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {phases.map((p, i) => (
            <button key={i} onClick={() => { setPhase(i); setCount(0); }} style={{
              padding: "8px 12px", borderRadius: 20,
              background: phase === i ? "var(--ink)" : "var(--card)",
              color: phase === i ? "var(--card)" : "var(--ink)",
              border: "1px solid var(--border)", fontSize: 11, minHeight: 44,
              maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>{p.custom ? `${p.name.slice(0, 20)}${p.name.length > 20 ? "…" : ""}` : `${p.name} (${p.target})`}</button>
          ))}
          <button onClick={() => setShowCustom(true)} style={{
            padding: "8px 12px", borderRadius: 20,
            background: "var(--card)", color: "var(--ink)",
            border: "1px solid var(--border)", fontSize: 11, minHeight: 44,
          }}>Custom</button>
        </div>
        <button onClick={() => { setCount(0); setPhase(0); setPhases(presetPhases); }} className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 12, textDecoration: "underline" }}>
          RESET
        </button>
      </div>

      {showCustom && (
        <div
          onClick={() => setShowCustom(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 390, background: "var(--page-bg)",
              borderTopLeftRadius: 20, borderTopRightRadius: 20,
              padding: 20, display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>Custom Dhikr</div>
              <button onClick={() => setShowCustom(false)} style={{ fontSize: 18, color: "var(--muted)" }}>✕</button>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 1000))}
              placeholder="Enter your dhikr or phrase..."
              rows={4}
              style={{
                width: "100%", padding: 12, fontSize: 14,
                background: "var(--card)", color: "var(--ink)",
                border: "1px solid var(--border)", borderRadius: 10,
                fontFamily: "var(--font-body)", resize: "vertical",
              }}
            />
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textAlign: "right" }}>
              {draft.length} / 1000
            </div>
            <button onClick={startCustom} disabled={!draft.trim()} style={{
              padding: "12px 0", borderRadius: 20, minHeight: 48,
              background: "var(--ink)", color: "var(--card)",
              fontSize: 13, fontWeight: 600,
              opacity: draft.trim() ? 1 : 0.5, border: "none",
            }}>Start</button>
          </div>
        </div>
      )}
    </>
  );
}
