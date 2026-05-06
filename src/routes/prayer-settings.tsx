import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";
import { usePrayerTimes } from "../lib/prayerTimes";

export const Route = createFileRoute("/prayer-settings")({ component: PrayerSettings });

function PrayerSettings() {
  const { prayers, setIqamah } = usePrayerTimes();

  return (
    <>
      <TopBar title="Set Iqamah Times" back />
      <div style={{ padding: "12px 16px" }} className="mono">
        <div style={{ fontSize: 11, color: "var(--ink)" }}>📍 Mangaluru, Karnataka</div>
        <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 4 }}>
          AZAAN FOLLOWS API · IQAMAH IS EDITABLE PER MASJID
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {prayers.map((p, i) => (
          <div
            key={p.name}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderBottom: i < prayers.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
                AZAAN · {p.azaan}
              </div>
            </div>
            <span className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>IQAMAH</span>
            <input
              type="text"
              value={p.iqamah}
              onChange={(e) => setIqamah(p.name, e.target.value)}
              style={{
                width: 90,
                padding: "6px 8px",
                background: "var(--card-dark)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                textAlign: "center",
                color: "var(--ink)",
              }}
            />
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
