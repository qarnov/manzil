import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/prayer")({ component: Prayer });

const prayers = [
  { name: "Fajr", time: "5:04 AM" },
  { name: "Dhuhr", time: "12:31 PM" },
  { name: "Asr", time: "4:32 PM", active: true },
  { name: "Maghrib", time: "6:47 PM" },
  { name: "Isha", time: "8:01 PM" },
];

function Prayer() {
  return (
    <>
      <TopBar title="Prayer Times" />
      <div style={{ padding: "12px 16px" }} className="mono">
        <div style={{ fontSize: 11, color: "var(--ink)" }}>📍 Mangaluru, Karnataka</div>
        <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 4 }}>WED, 6 MAY 2026 · 18 DHUL-QA'DAH 1447</div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {prayers.map((p, i) => (
          <div key={p.name} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 16px", height: 56,
            background: p.active ? "var(--card-dark)" : "transparent",
            borderBottom: i < prayers.length - 1 ? "1px solid var(--border)" : "none"
          }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
            <span className="mono" style={{ fontSize: 13 }}>{p.time}</span>
            {p.active ? (
              <span className="mono" style={{ fontSize: 9, padding: "3px 8px", border: "1px solid var(--gold)", color: "var(--gold)", borderRadius: 10 }}>NEXT</span>
            ) : <span style={{ width: 40 }} />}
          </div>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}
