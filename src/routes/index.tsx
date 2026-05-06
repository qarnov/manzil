import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";
import { usePrayerTimes } from "../lib/prayerTimes";

export const Route = createFileRoute("/")({ component: Home });

const ACTIVE_PRAYER = "Asr";

const actions = [
  { to: "/quran", emoji: "📖", label: "Quran" },
  { to: "/duas", emoji: "🤲", label: "Duas" },
  { to: "/tasbih", emoji: "📿", label: "Tasbih" },
  { to: "/qibla", emoji: "🧭", label: "Qibla" },
];

function Home() {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>مَنْزِل</h1>
          <div className="sub">MANZIL · YOUR PEACEFUL HOME</div>
        </div>
        <div className="icons">
          <span>🔔</span>
          <span>⚙️</span>
        </div>
      </header>

      <div style={{ height: 16 }} />

      {/* Ayah of the day */}
      <div className="card lined">
        <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: "var(--muted)" }}>AYAH OF THE DAY</div>
        <hr className="hr" />
        <div className="arabic" style={{ fontSize: 24, textAlign: "center", color: "var(--ink)" }}>
          إِنَّ مَعَ الْعُسْرِ يُسْرًا
        </div>
        <div className="mono" style={{ fontSize: 9, textAlign: "right", color: "var(--gold)", marginTop: 8 }}>
          SURAH ASH-SHARH · 94:6
        </div>
        <hr className="hr" />
        <div className="italic-q" style={{ fontSize: 14, textAlign: "center", fontStyle: "italic" }}>
          "Indeed, with hardship comes ease."
        </div>
        <div style={{ textAlign: "right", marginTop: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--gold)" }}>Read Tafseer →</span>
        </div>
      </div>

      {/* Next prayer strip */}
      <div style={{
        margin: "16px", height: 52, background: "var(--ink)", color: "var(--card)",
        borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 18px"
      }}>
        <span style={{ fontFamily: "var(--font-arabic)", fontSize: 16 }}>Asr</span>
        <span className="mono" style={{ fontSize: 13 }}>4:32 PM</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--gold)" }}>in 1h 24m</span>
      </div>

      <div className="label-mono">TODAY'S PRAYERS</div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {prayers.map((p, i) => (
          <div key={p.name} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 16px", minHeight: 48,
            background: p.active ? "var(--card-dark)" : "transparent",
            borderBottom: i < prayers.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600 }}>{p.name}</span>
            <span className="mono" style={{ fontSize: 13 }}>{p.time}</span>
            {p.active ? (
              <span className="mono" style={{ fontSize: 9, padding: "3px 8px", border: "1px solid var(--gold)", color: "var(--gold)", borderRadius: 10 }}>NEXT</span>
            ) : (
              <span style={{ width: 40 }} />
            )}
          </div>
        ))}
      </div>

      <div className="label-mono">QUICK ACTIONS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "0 16px" }}>
        {actions.map((a) => (
          <Link key={a.to} to={a.to} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 12, minHeight: 90, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 6
          }}>
            <span style={{ fontSize: 28 }}>{a.emoji}</span>
            <span style={{ fontSize: 14 }}>{a.label}</span>
          </Link>
        ))}
      </div>

      <div style={{ height: 24 }} />
    </>
  );
}
