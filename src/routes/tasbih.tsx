import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/tasbih")({ component: Tasbih });

type Preset = { id: string; name: string; custom?: boolean };

const PRESETS: Preset[] = [
  { id: "subhan", name: "SubhanAllah" },
  { id: "hamd", name: "Alhamdulillah" },
  { id: "akbar", name: "Allahu Akbar" },
];

const TOTAL = 99;
const STEP = 360 / TOTAL;
const SEPARATOR_INDEX = 49;

function Tasbih() {
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [customName, setCustomName] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [draft, setDraft] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const dhikrName = activePreset.custom ? customName ?? "Custom" : activePreset.name;

  const beads = useMemo(() => {
    const arr: { x: number; y: number; i: number }[] = [];
    for (let i = 0; i < TOTAL; i++) {
      const angle = (i * 2 * Math.PI) / TOTAL - Math.PI / 2;
      arr.push({
        x: 200 + 155 * Math.cos(angle),
        y: 200 + 155 * Math.sin(angle),
        i,
      });
    }
    return arr;
  }, []);

  const handleTap = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
    setCount((c) => {
      const next = c + 1;
      if (next >= TOTAL) {
        setRounds((r) => r + 1);
        return 0;
      }
      return next;
    });
  };

  const selectPreset = (p: Preset) => {
    setActivePreset(p);
    setCount(0);
    setRounds(0);
  };

  const startCustom = () => {
    const text = draft.trim();
    if (!text) return;
    setCustomName(text);
    setActivePreset({ id: "custom", name: text, custom: true });
    setCount(0);
    setRounds(0);
    setShowCustom(false);
    setDraft("");
  };

  const doReset = () => {
    setCount(0);
    setRounds(0);
    setConfirmReset(false);
  };

  const totalCount = rounds * TOTAL + count;
  const rotation = count * STEP;

  return (
    <>
      <TopBar title="Tasbih" back />
      <div
        style={{
          minHeight: "calc(100vh - 130px)",
          padding: "12px 12px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          userSelect: "none",
        }}
      >
        <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
          <svg
            viewBox="0 0 400 400"
            width="100%"
            height="auto"
            onClick={handleTap}
            style={{ display: "block", cursor: "pointer", overflow: "visible" }}
          >
            <defs>
              <radialGradient id="woodBead" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#C4956A" />
                <stop offset="60%" stopColor="#8B5E3C" />
                <stop offset="100%" stopColor="#4A2E1A" />
              </radialGradient>
              <radialGradient id="imamaBead" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#E8D4A8" />
                <stop offset="60%" stopColor="#C4A882" />
                <stop offset="100%" stopColor="#7A5E3A" />
              </radialGradient>
              <filter id="beadGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* string */}
            <circle
              cx="200"
              cy="200"
              r="155"
              fill="none"
              stroke="#8B5E3C"
              strokeWidth="2"
              opacity="0.4"
            />

            {/* rotating bead ring */}
            <g
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "200px 200px",
                transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
              {beads.map((b) => {
                if (b.i === SEPARATOR_INDEX) {
                  const angleDeg = (b.i * 360) / TOTAL - 90 + 90;
                  return (
                    <ellipse
                      key={b.i}
                      cx={b.x}
                      cy={b.y}
                      rx={5}
                      ry={12}
                      fill="url(#imamaBead)"
                      transform={`rotate(${angleDeg} ${b.x} ${b.y})`}
                    />
                  );
                }
                if (b.i === 0) {
                  return (
                    <circle
                      key={b.i}
                      cx={b.x}
                      cy={b.y}
                      r={10}
                      fill="url(#woodBead)"
                      filter="url(#beadGlow)"
                    />
                  );
                }
                return (
                  <circle key={b.i} cx={b.x} cy={b.y} r={7} fill="url(#woodBead)" />
                );
              })}
            </g>

            {/* subtle center tap target */}
            <circle cx="200" cy="200" r="110" fill="#EDE4D3" opacity="0.6" />

            {/* counter readout */}
            <text
              x="200"
              y="190"
              textAnchor="middle"
              style={{
                fontFamily: "DM Mono, monospace",
                fontSize: 56,
                fontWeight: 700,
                fill: "#3D2B1F",
              }}
            >
              {count}
            </text>
            <text
              x="200"
              y="215"
              textAnchor="middle"
              style={{
                fontFamily: "DM Mono, monospace",
                fontSize: 14,
                fill: "#3D2B1F",
                opacity: 0.6,
              }}
            >
              / {TOTAL}
            </text>
            <text
              x="200"
              y="240"
              textAnchor="middle"
              style={{
                fontFamily: "DM Mono, monospace",
                fontSize: 11,
                fill: "#3D2B1F",
                opacity: 0.7,
                letterSpacing: 1,
              }}
            >
              ROUND {rounds + 1}
            </text>
            <text
              x="200"
              y="262"
              textAnchor="middle"
              style={{
                fontFamily: "var(--font-body), serif",
                fontStyle: "italic",
                fontSize: 12,
                fill: "#3D2B1F",
                opacity: 0.7,
              }}
            >
              {dhikrName.length > 22 ? dhikrName.slice(0, 22) + "…" : dhikrName}
            </text>
            <text
              x="200"
              y="282"
              textAnchor="middle"
              style={{
                fontFamily: "DM Mono, monospace",
                fontSize: 9,
                fill: "#3D2B1F",
                opacity: 0.45,
                letterSpacing: 1,
              }}
            >
              TOTAL {totalCount}
            </text>
          </svg>
        </div>

        <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 12, letterSpacing: 1 }}>
          TAP THE RING TO COUNT
        </div>

        {/* preset row */}
        <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", padding: "0 8px" }}>
          {PRESETS.map((p) => {
            const active = !activePreset.custom && activePreset.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => selectPreset(p)}
                style={{
                  padding: "10px 14px", borderRadius: 22, minHeight: 44,
                  background: active ? "var(--ink)" : "var(--card)",
                  color: active ? "var(--card)" : "var(--ink)",
                  border: "1px solid var(--border)",
                  fontSize: 12, fontWeight: 600,
                }}
              >{p.name}</button>
            );
          })}
          <button
            onClick={() => setShowCustom(true)}
            style={{
              padding: "10px 14px", borderRadius: 22, minHeight: 44,
              background: activePreset.custom ? "var(--ink)" : "var(--card)",
              color: activePreset.custom ? "var(--card)" : "var(--ink)",
              border: "1px solid var(--border)",
              fontSize: 12, fontWeight: 600,
            }}
          >
            {activePreset.custom && customName
              ? `${customName.slice(0, 14)}${customName.length > 14 ? "…" : ""}`
              : "Custom"}
          </button>
        </div>

        {/* reset */}
        <div style={{ marginTop: 16 }}>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              aria-label="Reset count"
              style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "var(--card)", border: "1px solid var(--border)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                color: "var(--muted)", fontSize: 18,
              }}
            >↻</button>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink)" }}>Reset count?</span>
              <button
                onClick={doReset}
                style={{
                  padding: "8px 14px", borderRadius: 18, minHeight: 36,
                  background: "var(--ink)", color: "var(--card)", fontSize: 11, fontWeight: 600,
                }}
              >Yes</button>
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  padding: "8px 14px", borderRadius: 18, minHeight: 36,
                  background: "var(--card)", color: "var(--ink)",
                  border: "1px solid var(--border)", fontSize: 11, fontWeight: 600,
                }}
              >Cancel</button>
            </div>
          )}
        </div>
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
              width: "100%", maxWidth: 390, background: "var(--page-bg, #EDE4D3)",
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
            <button
              onClick={startCustom}
              disabled={!draft.trim()}
              style={{
                padding: "12px 0", borderRadius: 20, minHeight: 48,
                background: "var(--ink)", color: "var(--card)",
                fontSize: 13, fontWeight: 600,
                opacity: draft.trim() ? 1 : 0.5, border: "none",
              }}
            >Start</button>
          </div>
        </div>
      )}
    </>
  );
}
