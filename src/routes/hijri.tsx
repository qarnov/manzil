import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/hijri")({ component: Hijri });

const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function Hijri() {
  // Month starts Wed (offset 3), 30 days
  const offset = 3;
  const totalCells = offset + 30;
  const cells = Array.from({ length: totalCells }, (_, i) => i < offset ? null : i - offset + 1);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = 9;

  const upcoming = [
    { d: "1 Dhul-Hijjah", e: "Start of Hajj season", g: "~28 May 2026" },
    { d: "9 Dhul-Hijjah", e: "Yawm al-Arafah · Fast recommended", g: "~5 Jun" },
    { d: "10 Dhul-Hijjah", e: "Eid al-Adha 🌙", g: "~6 Jun", hl: true },
    { d: "11–13 Dhul-Hijjah", e: "Ayyam al-Tashreeq", g: "~7–9 Jun" },
  ];

  return (
    <>
      <TopBar title="Hijri Calendar" back />
      <div style={{
        margin: "12px 16px", padding: "10px 14px",
        background: "var(--card-dark)", border: "1px solid var(--border)", borderRadius: 10
      }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink)" }}>WED, 6 MAY 2026</div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--ink)", borderRadius: 12, margin: "0 16px 14px", overflow: "hidden" }}>
        <div style={{
          background: "var(--ink)", color: "var(--card)", padding: "12px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <button className="mono" style={{ color: "var(--gold)", fontSize: 12, minHeight: 32 }}>‹ Prev</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-arabic)", fontSize: 18 }}>ذو القعدة</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>DHUL-QA'DAH 1447 AH</div>
          </div>
          <button className="mono" style={{ color: "var(--gold)", fontSize: 12, minHeight: 32 }}>Next ›</button>
        </div>
        <div style={{ padding: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {days.map((d) => (
              <div key={d} className="mono" style={{ fontSize: 7, textAlign: "center", color: "var(--muted)", padding: "4px 0" }}>{d.toUpperCase()}</div>
            ))}
            {cells.map((c, i) => (
              <div key={i} style={{
                aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: c === today ? "var(--card)" : "var(--ink)",
                background: c === today ? "var(--ink)" : "transparent",
                borderRadius: "50%"
              }}>{c || ""}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, margin: "0 16px 14px", padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>9 Dhul-Qa'dah 1447</div>
          <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>WED, 6 MAY 2026</div>
        </div>
        <div style={{ fontFamily: "var(--font-arabic)", fontSize: 36, color: "var(--ink)" }}>٩</div>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--ink)", borderRadius: 12, margin: "0 16px", overflow: "hidden" }}>
        {upcoming.map((u, i) => (
          <div key={i} style={{
            padding: "12px 14px",
            background: u.hl ? "var(--card-dark)" : "transparent",
            borderBottom: i < upcoming.length - 1 ? "1px dashed var(--border)" : "none"
          }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{u.d}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink)", marginTop: 3 }}>{u.e}</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 3 }}>{u.g}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}
