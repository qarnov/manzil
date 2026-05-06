import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/tasbih")({ component: Tasbih });

const phases = [
  { name: "SubhanAllah", target: 33 },
  { name: "Alhamdulillah", target: 33 },
  { name: "AllahuAkbar", target: 33 },
];

function Tasbih() {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState(0);

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

  return (
    <>
      <TopBar title="Tasbih Counter" back />
      <div style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ fontFamily: "var(--font-arabic)", fontSize: 72, color: "var(--ink)", lineHeight: 1 }}>
          {count}
        </div>
        <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
          {count} / {phases[phase].target}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{phases[phase].name}</div>

        <button onClick={tap} style={{
          width: 160, height: 160, borderRadius: "50%",
          background: "var(--ink)", color: "var(--card)",
          fontFamily: "var(--font-arabic)", fontSize: 22,
          border: "3px solid var(--gold)",
          marginTop: 16
        }}>Tap</button>

        <div style={{ display: "flex", gap: 8, marginTop: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {phases.map((p, i) => (
            <button key={p.name} onClick={() => { setPhase(i); setCount(0); }} style={{
              padding: "8px 12px", borderRadius: 20,
              background: phase === i ? "var(--ink)" : "var(--card)",
              color: phase === i ? "var(--card)" : "var(--ink)",
              border: "1px solid var(--border)", fontSize: 11, minHeight: 44
            }}>{p.name} ({p.target})</button>
          ))}
        </div>
        <button onClick={() => { setCount(0); setPhase(0); }} className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 12, textDecoration: "underline" }}>
          RESET
        </button>
      </div>
    </>
  );
}
