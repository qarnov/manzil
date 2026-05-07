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
            </div>
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
