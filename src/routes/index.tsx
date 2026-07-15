import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { nextPrayer } from "../lib/prayerTimes";
import { useActivePrayers } from "../lib/masjids";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { prayers, masjid } = useActivePrayers();
  const next = useMemo(() => nextPrayer(prayers), [prayers]);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>مَنْزِل</h1>
          <div className="sub">MANZIL · YOUR PEACEFUL HOME</div>
        </div>
        <div className="icons">
          <span>🔔</span>
          <Link to="/more" style={{ color: "var(--gold)" }}>⚙️</Link>
        </div>
      </header>

      {/* Masjid selector — top of the home screen */}
      <Link
        to="/select-masjid"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--card-dark)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 16px",
          minHeight: 60,
        }}
      >
        <span style={{ fontSize: 22 }}>🕌</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {masjid ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {masjid.name}
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
                {masjid.area.toUpperCase()}, {masjid.state.toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Select your masjid</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
                TAP TO LOAD AZAAN &amp; IQAMAH TIMES
              </div>
            </>
          )}
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--gold)", border: "1px solid var(--gold)", padding: "6px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>
          {masjid ? "Change" : "Choose"} ›
        </span>
      </Link>

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

      {/* Next prayer strip — computed from the device clock */}
      {next && (
        <div style={{
          margin: "16px", height: 52, background: "var(--ink)", color: "var(--card)",
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 18px"
        }}>
          <span style={{ fontFamily: "var(--font-arabic)", fontSize: 16 }}>{next.name}</span>
          <span className="mono" style={{ fontSize: 13 }}>{next.azaan}</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--gold)" }}>{next.inLabel}</span>
        </div>
      )}

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
          const active = p.name === next?.name;
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


      <div style={{ height: 24 }} />
    </>
  );
}
