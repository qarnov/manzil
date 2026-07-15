import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { TopBar } from "../components/TopBar";
import {
  getHijriToday,
  getHijriMonthGrid,
  hijriMonthNumber,
  OBSERVANCES,
} from "../lib/hijri";

export const Route = createFileRoute("/hijri")({ component: Hijri });

const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function Hijri() {
  // Computed once per render from the device clock.
  const { today, grid, monthNum } = useMemo(() => {
    const now = new Date();
    return {
      today: getHijriToday(now),
      grid: getHijriMonthGrid(now),
      monthNum: hijriMonthNumber(now),
    };
  }, []);

  const cells: (number | null)[] = Array.from(
    { length: grid.offset + grid.daysInMonth },
    (_, i) => (i < grid.offset ? null : i - grid.offset + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);

  // Observances in the current Hijri month, plus the next couple after it.
  const thisMonth = OBSERVANCES.filter((o) => o.month === monthNum);
  const upcoming = OBSERVANCES.filter((o) => o.month === (monthNum % 12) + 1);
  const shown = [...thisMonth, ...upcoming].slice(0, 4);

  return (
    <>
      <TopBar title="Hijri Calendar" back />
      <div
        style={{
          margin: "12px 16px",
          padding: "10px 14px",
          background: "var(--card-dark)",
          border: "1px solid var(--border)",
          borderRadius: 10,
        }}
      >
        <div className="mono" style={{ fontSize: 10, color: "var(--ink)" }}>
          {today.weekday.toUpperCase()}, {today.gregorian.replace(/^[A-Z]+ /, "")}
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--ink)",
          borderRadius: 12,
          margin: "0 16px 14px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "var(--ink)",
            color: "var(--card)",
            padding: "12px 14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: "var(--font-arabic)", fontSize: 18 }}>{today.arabicMonth}</div>
          <div className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>
            {today.monthName.toUpperCase()} {today.year} AH
          </div>
        </div>
        <div style={{ padding: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {days.map((d) => (
              <div
                key={d}
                className="mono"
                style={{ fontSize: 7, textAlign: "center", color: "var(--muted)", padding: "4px 0" }}
              >
                {d.toUpperCase()}
              </div>
            ))}
            {cells.map((c, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: c === today.day ? "var(--card)" : "var(--ink)",
                  background: c === today.day ? "var(--ink)" : "transparent",
                  borderRadius: "50%",
                }}
              >
                {c || ""}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          margin: "0 16px 14px",
          padding: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            {today.day} {today.monthName} {today.year}
          </div>
          <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
            {today.weekday.toUpperCase()}, {today.gregorian.replace(/^[A-Z]+ /, "")}
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-arabic)", fontSize: 36, color: "var(--ink)" }}>
          {today.day.toLocaleString("ar-EG")}
        </div>
      </div>

      {shown.length > 0 && (
        <>
          <div className="label-mono">ISLAMIC OBSERVANCES</div>
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--ink)",
              borderRadius: 12,
              margin: "0 16px",
              overflow: "hidden",
            }}
          >
            {shown.map((u, i) => (
              <div
                key={i}
                style={{
                  padding: "12px 14px",
                  background: u.highlight ? "var(--card-dark)" : "transparent",
                  borderBottom: i < shown.length - 1 ? "1px dashed var(--border)" : "none",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700 }}>{u.name}</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 3 }}>
                  {u.day} {monthNameOf(u.month)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{ height: 24 }} />
    </>
  );
}

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhirah",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul-Qa'dah",
  "Dhul-Hijjah",
];
function monthNameOf(m: number) {
  return HIJRI_MONTHS[m - 1] ?? "";
}
