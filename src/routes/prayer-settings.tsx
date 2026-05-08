import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";
import { usePrayerTimes, OFFSET_OPTIONS } from "../lib/prayerTimes";

export const Route = createFileRoute("/prayer-settings")({ component: PrayerSettings });

function PrayerSettings() {
  const { prayers, setOffset } = usePrayerTimes();

  return (
    <>
      <TopBar title="Set Iqamah Times" back />
      <div style={{ padding: "12px 16px" }} className="mono">
        <div style={{ fontSize: 11, color: "var(--ink)" }}>📍 Mangaluru, Karnataka</div>
        <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 4 }}>
          AZAAN FOLLOWS API · IQAMAH OFFSET PER MASJID
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {prayers.map((p, i) => (
          <div
            key={p.name}
            style={{
              padding: "12px 16px",
              borderBottom: i < prayers.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
                  AZAAN · {p.azaan}
                </div>
              </div>
              <div className="mono" style={{ fontSize: 12, color: "var(--gold)" }}>
                IQAMAH · {p.iqamah}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {OFFSET_OPTIONS.map((m) => {
                const selected = p.offset === m;
                return (
                  <button
                    key={m}
                    onClick={() => setOffset(p.name, m)}
                    className="mono"
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: 14,
                      fontSize: 11,
                      background: selected ? "#3D2B1F" : "transparent",
                      color: selected ? "var(--card)" : "var(--ink)",
                      border: selected ? "1px solid #3D2B1F" : "1px solid var(--border)",
                    }}
                  >
                    +{m} min
                  </button>
                );
              })}
              {(() => {
                const isCustom = !(OFFSET_OPTIONS as readonly number[]).includes(p.offset);
                return (
                  <button
                    onClick={() => setOffset(p.name, isCustom ? p.offset : 25)}
                    className="mono"
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: 14,
                      fontSize: 11,
                      background: isCustom ? "#3D2B1F" : "transparent",
                      color: isCustom ? "var(--card)" : "var(--ink)",
                      border: isCustom ? "1px solid #3D2B1F" : "1px solid var(--border)",
                    }}
                  >
                    Custom
                  </button>
                );
              })()}
            </div>
            {!(OFFSET_OPTIONS as readonly number[]).includes(p.offset) && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={60}
                  value={p.offset}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(60, parseInt(e.target.value || "0", 10) || 0));
                    setOffset(p.name, v);
                  }}
                  className="mono"
                  style={{
                    width: 80, padding: "6px 8px", fontSize: 12,
                    border: "1px solid var(--border)", borderRadius: 8,
                    background: "var(--card)", color: "var(--ink)",
                  }}
                />
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>min (max 60)</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ margin: "12px 16px" }} className="mono">
        <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.5 }}>
          Tip: changes save automatically and reflect on the Home screen.
        </div>
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}
