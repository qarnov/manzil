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
  const { prayers } = usePrayerTimes();
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
      {(() => {
        const arabic = "إِنَّ مَعَ الْعُسْرِ يُسْرًا";
        const english = "Indeed, with hardship comes ease.";
        const reference = "Surah Ash-Sharh 94:6";
        const tafseer = "Allah reassures the believers that every difficulty is paired with relief — patience and trust bring ease.";
        const shareText = `${arabic}\n\n"${english}"\n— ${reference}\n\n${tafseer}\n\nShared via Manzil`;
        const onShare = () => {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
        };
        return (
          <div className="card" style={{ padding: 18 }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: "var(--muted)" }}>AYAH OF THE DAY</div>
            <div className="arabic" style={{ fontSize: 26, textAlign: "center", color: "var(--ink)", marginTop: 14, lineHeight: 1.8 }}>
              {arabic}
            </div>
            <div className="mono" style={{ fontSize: 9, textAlign: "right", color: "var(--gold)", marginTop: 10 }}>
              SURAH ASH-SHARH · 94:6
            </div>
            <div className="italic-q" style={{ fontSize: 15, textAlign: "center", fontStyle: "italic", marginTop: 14, lineHeight: 1.6 }}>
              "{english}"
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              <button className="mono" style={{
                width: "100%", padding: "10px 0", borderRadius: 20, minHeight: 44,
                background: "var(--ink)", color: "var(--card)", fontSize: 12, border: "none"
              }}>Read Tafseer →</button>
              <button onClick={onShare} className="mono" style={{
                width: "100%", padding: "10px 0", borderRadius: 20, minHeight: 44,
                background: "#25D366", color: "#fff", fontSize: 12, border: "none"
              }}>Share on WhatsApp</button>
            </div>
          </div>
        );
      })()}

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

      <div className="label-mono" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>TODAY'S PRAYERS</span>
        <Link to="/prayer-settings" className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>EDIT IQAMAH →</Link>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr auto auto",
          padding: "8px 16px", background: "var(--card-dark)",
          borderBottom: "1px solid var(--border)", gap: 12,
        }} className="mono">
          <span style={{ fontSize: 9, color: "var(--muted)" }}>PRAYER</span>
          <span style={{ fontSize: 9, color: "var(--muted)", width: 80, textAlign: "right" }}>AZAAN</span>
          <span style={{ fontSize: 9, color: "var(--gold)", width: 80, textAlign: "right" }}>IQAMAH</span>
        </div>
        {prayers.map((p, i) => {
          const active = p.name === ACTIVE_PRAYER;
          return (
            <div key={p.name} style={{
              display: "grid", gridTemplateColumns: "1fr auto auto",
              alignItems: "center", gap: 12,
              padding: "12px 16px", minHeight: 48,
              background: active ? "var(--card-dark)" : "transparent",
              borderBottom: i < prayers.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600 }}>
                {p.name}
                {active && <span className="mono" style={{ marginLeft: 8, fontSize: 9, padding: "2px 6px", border: "1px solid var(--gold)", color: "var(--gold)", borderRadius: 10 }}>NEXT</span>}
              </span>
              <span className="mono" style={{ fontSize: 13, width: 80, textAlign: "right" }}>{p.azaan}</span>
              <span className="mono" style={{ fontSize: 13, width: 80, textAlign: "right", color: "var(--gold)" }}>{p.iqamah}</span>
            </div>
          );
        })}
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
