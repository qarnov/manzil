import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/tasbih")({ component: Tasbih });

type Preset = { id: string; name: string; custom?: boolean };

const PRESETS: Preset[] = [
  { id: "subhan", name: "SubhanAllah" },
  { id: "hamd", name: "Alhamdulillah" },
  { id: "akbar", name: "Allahu Akbar" },
];

const TOTAL = 99;
const ROUND = 33;

// soft wooden click — short base64 wav
const CLICK_SRC =
  "data:audio/wav;base64,UklGRpQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXADAACAgIB/f4CAgYB/f3+AgYGAf39/gICAgH9/f4CAgIB/f4CAgYCAf39/gICAgH9/gICBgIB/f3+AgIB/f3+AgIGAgH9/f4CAgIB/f4CAgYCAf39/gICAgH9/gICBgIB/f3+AgIGAf39/gICBgIB/f3+AgIGAf39/gIGBgH9/f4CAgYB/f3+AgIGAgH9/f4CAgYB/f3+AgIGAgH9/gICBgYB/f3+AgIGAf39/gICBgIB/f4CAgYGAf39/gICBgH9/f4CAgYCAf39/gIGBgH9/f4CAgYCAf39/gIGBgH9/f4CAgYGAf39/gICBgH9/f4CAgYCAf3+AgIGBgH9/f4CAgYCAf3+AgIGAgH9/gICBgYB/f3+AgIGAf3+AgIGBgH9/f4CAgYCAf3+AgIGBgH9/f4CAgYGAf3+AgIGBgH9/f4CAgYCAf3+AgIGBgH9/f4CAgIB/f3+AgIGAgH9/gICBgYB/f3+AgIGAgH9/gICBgYB/f3+AgIGAgH9/gICBgYB/f3+AgIGAgH9/gICBgYB/f3+AgIGBgH9/gICBgYB/f3+AgIGBgH9/gICBgYB/f3+AgIGBgH9/gICBgYB/f3+AgIGBgH9/gICBgYB/f3+AgIGBgH9/gICBgYB/f3+AgIGBgH9/gICBgYB/f3+AgIGBgH9/gICBgYB/f3+AgIGAgH9/gICBgYB/f3+AgIGBgH9/gICBgYB/f3+AgIGBgH9/gICBgYB/f3+AgIGBgICAgICBgYCAgICAgYGAgICAgIGBgICAgICBgYCAgICAgYGAgICAgIGBgICAgICBgYCAgICAgYGAgICAgIGBgICAgICBgYCA";

function Tasbih() {
  const [count, setCount] = useState(0);
  const [round, setRound] = useState(1);
  const [activePreset, setActivePreset] = useState<Preset>(PRESETS[0]);
  const [customName, setCustomName] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [draft, setDraft] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [pulse, setPulse] = useState<"none" | "checkpoint" | "complete">("none");
  const [lastBead, setLastBead] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(CLICK_SRC);
    audioRef.current.volume = 0.35;
  }, []);

  const dhikrName = activePreset.custom ? customName ?? "Custom" : activePreset.name;

  const beadPositions = useMemo(() => {
    // oval/circular rosary positions
    const positions: { x: number; y: number; angle: number }[] = [];
    const cx = 50, cy = 50;
    const rx = 42, ry = 44;
    for (let i = 0; i < TOTAL; i++) {
      // start at top (angle = -PI/2) and go clockwise; leave a small gap at top for the divider bead
      const t = (i + 1) / TOTAL; // 0..1, skip exact top
      const angle = -Math.PI / 2 + t * Math.PI * 2;
      positions.push({
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
        angle,
      });
    }
    return positions;
  }, []);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // ignore taps on interactive controls
    const target = e.target as HTMLElement;
    if (target.closest("[data-no-tap]")) return;

    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(20);
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } catch {}
    }

    setCount((c) => {
      const next = c + 1;
      setLastBead(c); // index of the bead just filled
      if (next >= TOTAL) {
        setPulse("complete");
        setTimeout(() => setPulse("none"), 900);
        setRound((r) => r + 1);
        setTimeout(() => setCount(0), 700);
        return next;
      }
      if (next % ROUND === 0) {
        setPulse("checkpoint");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([20, 40, 30]);
        setTimeout(() => setPulse("none"), 600);
      }
      return next;
    });
  };

  const selectPreset = (p: Preset) => {
    setActivePreset(p);
    setCount(0);
    setRound(1);
    setLastBead(null);
  };

  const startCustom = () => {
    const text = draft.trim();
    if (!text) return;
    setCustomName(text);
    setActivePreset({ id: "custom", name: text, custom: true });
    setCount(0);
    setRound(1);
    setLastBead(null);
    setShowCustom(false);
    setDraft("");
  };

  const doReset = () => {
    setCount(0);
    setRound(1);
    setLastBead(null);
    setConfirmReset(false);
  };

  const displayCount = count >= TOTAL ? TOTAL : count;
  const checkpoint = Math.floor(displayCount / ROUND) + (displayCount % ROUND === 0 && displayCount > 0 ? 0 : 1);
  const checkpointLabel = displayCount === 0 ? `Round ${round}` : `Round ${round} · ${Math.min(checkpoint, 3)} of 3`;

  return (
    <>
      <TopBar title="Tasbih" back />
      <div
        onClick={handleTap}
        style={{
          minHeight: "calc(100vh - 130px)",
          padding: "16px 12px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          userSelect: "none",
          cursor: "pointer",
        }}
      >
        {/* Misbaha */}
        <div style={{ position: "relative", width: "100%", maxWidth: 340, aspectRatio: "1 / 1", marginTop: 8 }}>
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            {/* string */}
            <ellipse
              cx="50" cy="50" rx="42" ry="44"
              fill="none" stroke="#9C7A5A" strokeWidth="0.4" strokeDasharray="0.8 0.6"
              opacity="0.7"
            />
            {/* glow ring on checkpoints */}
            {pulse !== "none" && (
              <ellipse
                cx="50" cy="50" rx="46" ry="48"
                fill="none" stroke="#B89A72" strokeWidth="1.2"
                style={{
                  filter: "drop-shadow(0 0 4px #B89A72)",
                  animation: `manzilGlow ${pulse === "complete" ? "900ms" : "600ms"} ease-out`,
                }}
              />
            )}

            {/* divider/tassel bead at top */}
            <g>
              <ellipse cx="50" cy="4" rx="3.4" ry="4.2" fill="#6B4C35" stroke="#3D2B1F" strokeWidth="0.4" />
              <line x1="50" y1="8" x2="50" y2="14" stroke="#9C7A5A" strokeWidth="0.5" />
              <path d="M 47.5 14 L 50 20 L 52.5 14 Z" fill="#B89A72" />
            </g>

            {/* beads */}
            {beadPositions.map((p, i) => {
              const filled = i < count;
              const justFilled = i === lastBead;
              return (
                <ellipse
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  rx="1.9"
                  ry="2.6"
                  fill={filled ? "#B89A72" : "#D4BFA0"}
                  fillOpacity={filled ? 1 : 0.45}
                  stroke={filled ? "#9C7A5A" : "#B89A72"}
                  strokeWidth="0.25"
                  strokeOpacity={filled ? 0.8 : 0.4}
                  transform={`rotate(${(p.angle * 180) / Math.PI + 90} ${p.x} ${p.y})`}
                  style={{
                    transformOrigin: `${p.x}px ${p.y}px`,
                    transition: "fill 200ms ease, fill-opacity 200ms ease, stroke 200ms ease",
                    animation: justFilled ? "manzilBeadPop 280ms ease" : undefined,
                  }}
                />
              );
            })}
          </svg>

          {/* center readout */}
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              pointerEvents: "none", textAlign: "center", padding: 24,
            }}
          >
            <div style={{
              fontFamily: "var(--font-body)", fontWeight: 700,
              fontSize: 56, lineHeight: 1, color: "var(--ink)",
            }}>{displayCount}</div>
            <div style={{
              fontFamily: "var(--font-body)", fontStyle: "italic",
              fontSize: 15, color: "var(--quote)", marginTop: 8,
              maxWidth: 160, wordBreak: "break-word",
            }}>{dhikrName}</div>
            <div className="mono" style={{
              fontSize: 9, color: "var(--muted)", marginTop: 6, letterSpacing: 1,
            }}>{checkpointLabel.toUpperCase()}</div>
          </div>
        </div>

        <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 18, letterSpacing: 1 }}>
          TAP ANYWHERE TO COUNT
        </div>

        {/* preset row */}
        <div data-no-tap style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", padding: "0 8px" }}>
          {PRESETS.map((p) => {
            const active = !activePreset.custom && activePreset.id === p.id;
            return (
              <button
                key={p.id}
                onClick={(e) => { e.stopPropagation(); selectPreset(p); }}
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
            onClick={(e) => { e.stopPropagation(); setShowCustom(true); }}
            style={{
              padding: "10px 14px", borderRadius: 22, minHeight: 44,
              background: activePreset.custom ? "var(--ink)" : "var(--card)",
              color: activePreset.custom ? "var(--card)" : "var(--ink)",
              border: "1px solid var(--border)",
              fontSize: 12, fontWeight: 600,
            }}
          >{activePreset.custom && customName ? `${customName.slice(0, 14)}${customName.length > 14 ? "…" : ""}` : "Custom"}</button>
        </div>

        {/* reset */}
        <div data-no-tap style={{ marginTop: 16 }}>
          {!confirmReset ? (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmReset(true); }}
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
                onClick={(e) => { e.stopPropagation(); doReset(); }}
                style={{
                  padding: "8px 14px", borderRadius: 18, minHeight: 36,
                  background: "var(--ink)", color: "var(--card)", fontSize: 11, fontWeight: 600,
                }}
              >Yes</button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmReset(false); }}
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

      {/* custom dhikr sheet */}
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
            data-no-tap
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

      <style>{`
        @keyframes manzilBeadPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.6); }
          100% { transform: scale(1); }
        }
        @keyframes manzilGlow {
          0% { opacity: 0; stroke-width: 0.4; }
          40% { opacity: 1; stroke-width: 1.6; }
          100% { opacity: 0; stroke-width: 0.4; }
        }
      `}</style>
    </>
  );
}
