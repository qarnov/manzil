import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/quran")({ component: Quran });

type Surah = {
  number: number;
  name: string; // Arabic
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
};

type Favorite = {
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
  surahName: string;
};

type LastRead = { surah: number; ayah: number; surahName: string };

function Quran() {
  const [tab, setTab] = useState<"tilawah" | "fav" | "tafseer">("tilawah");
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem("manzil_favorites") || "[]"));
    } catch {
      setFavorites([]);
    }
    try {
      const lr = localStorage.getItem("manzil_last_read");
      setLastRead(lr ? JSON.parse(lr) : null);
    } catch {
      setLastRead(null);
    }
  }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("https://api.alquran.cloud/v1/surah")
      .then((r) => r.json())
      .then((j) => {
        setSurahs(j.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e?.message || e));
        setLoading(false);
      });
  };
  useEffect(load, []);

  return (
    <>
      <header className="topbar">
        <h1>القرآن الكريم</h1>
        <div className="icons"><span>🔍</span></div>
      </header>

      <div style={{ display: "flex", padding: "12px 16px", gap: 8 }}>
        {(["tilawah", "fav", "tafseer"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0", borderRadius: 20,
            background: tab === t ? "var(--ink)" : "var(--card)",
            color: tab === t ? "var(--card)" : "var(--ink)",
            border: "1px solid var(--border)",
            fontSize: 12, textTransform: "capitalize", minHeight: 44,
          }}>{t}</button>
        ))}
      </div>

      {lastRead && (
        <div style={{
          margin: "0 16px 12px", padding: "12px 14px",
          background: "var(--card-dark)", border: "1px solid var(--border)",
          borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <div className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>LAST READ</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>
              {lastRead.surahName} · Ayah {lastRead.ayah}
            </div>
          </div>
          <Link to="/quran/$surahNumber" params={{ surahNumber: String(lastRead.surah) }}
            className="mono" style={{ fontSize: 11, color: "var(--gold)", border: "1px solid var(--gold)", padding: "8px 12px", borderRadius: 20, minHeight: 44, display: "inline-flex", alignItems: "center" }}>Continue →</Link>
        </div>
      )}

      {tab === "fav" && (
        <div style={{ padding: "0 16px 110px", display: "flex", flexDirection: "column", gap: 12 }}>
          {favorites.length === 0 ? (
            <div className="mono" style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "30px 10px", lineHeight: 1.6 }}>
              No favourites yet. Tap ❤️ on any ayah to save it.
            </div>
          ) : (
            favorites.map((f, i) => (
              <Link key={`${f.surah}-${f.ayah}-${i}`} to="/quran/$surahNumber" params={{ surahNumber: String(f.surah) }}
                style={{
                  display: "block", background: "var(--card-dark)",
                  border: "1px solid var(--border)", borderRadius: 12, padding: 14
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{f.surahName}</span>
                  <span className="mono" style={{
                    fontSize: 9, color: "var(--card)", background: "var(--ink)",
                    padding: "2px 8px", borderRadius: 12, letterSpacing: 1
                  }}>AYAH {f.ayah}</span>
                </div>
                <div className="arabic" style={{ fontSize: 18, textAlign: "right" }} dir="rtl">{f.arabic}</div>
                {f.translation && (
                  <div style={{ fontStyle: "italic", fontSize: 13, color: "var(--quote)", lineHeight: 1.6, marginTop: 8 }}>
                    {f.translation}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      )}

      {tab !== "fav" && loading && (
        <div className="card" style={{ padding: 0 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "14px",
              borderBottom: i < 7 ? "1px dashed var(--border)" : "none",
              alignItems: "center"
            }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--card-dark)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, background: "var(--card-dark)", borderRadius: 4, width: "60%" }} />
                <div style={{ height: 8, background: "var(--card-dark)", borderRadius: 4, width: "40%", marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab !== "fav" && error && !loading && (
        <div style={{ margin: "0 16px", padding: 14, textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--quote)" }}>Failed to load surahs.</div>
          <button onClick={load} className="mono" style={{
            marginTop: 10, fontSize: 12, color: "var(--card)",
            background: "var(--ink)", padding: "8px 16px", borderRadius: 20
          }}>Retry</button>
        </div>
      )}

      {tab !== "fav" && !loading && !error && (
        <div className="card" style={{ padding: 0 }}>
          {surahs.map((s, i) => (
            <Link key={s.number} to="/quran/$surahNumber" params={{ surahNumber: String(s.number) }}
              style={{
                display: "flex", alignItems: "center", padding: "14px 14px",
                gap: 12, borderBottom: i < surahs.length - 1 ? "1px dashed var(--border)" : "none"
              }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                border: "1px solid var(--ink)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontSize: 11
              }}>{s.number}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.englishName}</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>
                  {s.numberOfAyahs} VERSES
                </div>
              </div>
              <div className="arabic" style={{ fontSize: 18 }}>{s.name}</div>
            </Link>
          ))}
        </div>
      )}
      <div style={{ height: 24 }} />
    </>
  );
}
