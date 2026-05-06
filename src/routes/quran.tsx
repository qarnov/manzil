import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/quran")({ component: Quran });

const surahs = [
  { n: 1, en: "Al-Fatihah", ar: "الفاتحة", verses: 7, city: "Makkah" },
  { n: 2, en: "Al-Baqarah", ar: "البقرة", verses: 286, city: "Madinah" },
  { n: 3, en: "Ali 'Imran", ar: "آل عمران", verses: 200, city: "Madinah" },
  { n: 4, en: "An-Nisa", ar: "النساء", verses: 176, city: "Madinah" },
  { n: 5, en: "Al-Ma'idah", ar: "المائدة", verses: 120, city: "Madinah" },
];

function Quran() {
  const [tab, setTab] = useState<"surah" | "juz" | "bookmarks">("surah");
  return (
    <>
      <header className="topbar">
        <h1>القرآن الكريم</h1>
        <div className="icons"><span>🔍</span></div>
      </header>

      <div style={{ display: "flex", padding: "12px 16px", gap: 8 }}>
        {(["surah", "juz", "bookmarks"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0", borderRadius: 20,
            background: tab === t ? "var(--ink)" : "var(--card)",
            color: tab === t ? "var(--card)" : "var(--ink)",
            border: "1px solid var(--border)",
            fontSize: 12, textTransform: "capitalize", minHeight: 44,
          }}>{t}</button>
        ))}
      </div>

      <div style={{
        margin: "0 16px 12px", padding: "12px 14px",
        background: "var(--card-dark)", border: "1px solid var(--border)",
        borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>LAST READ</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>Al-Baqarah · Ayah 6</div>
        </div>
        <Link to="/quran/$surahNumber" params={{ surahNumber: "2" }}
          className="mono" style={{ fontSize: 11, color: "var(--gold)", border: "1px solid var(--gold)", padding: "8px 12px", borderRadius: 20 }}>Continue →</Link>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {surahs.map((s, i) => (
          <Link key={s.n} to="/quran/$surahNumber" params={{ surahNumber: String(s.n) }}
            style={{
              display: "flex", alignItems: "center", padding: "14px 14px",
              gap: 12, borderBottom: i < surahs.length - 1 ? "1px dashed var(--border)" : "none"
            }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              border: "1px solid var(--ink)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-mono)", fontSize: 11
            }}>{s.n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{s.en}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>{s.verses} VERSES · {s.city.toUpperCase()}</div>
            </div>
            <div className="arabic" style={{ fontSize: 18 }}>{s.ar}</div>
          </Link>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}
