import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/quran/$surahNumber")({ component: Reader });

type Ayah = { number: number; numberInSurah: number; text: string; audio?: string };
type SurahInfo = { number: number; name: string; englishName: string; numberOfAyahs: number };
type TafsirAyah = { verse_key: string; text: string };

type Favorite = {
  surah: number;
  ayah: number;
  arabic: string;
  translation: string;
  surahName: string;
};

const FAV_KEY = "manzil_favorites";
const LAST_READ_KEY = "manzil_last_read";

function loadFavorites(): Favorite[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch {
    return [];
  }
}

function useTilawah(surahNumber: string) {
  const [info, setInfo] = useState<SurahInfo | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`).then((r) => r.json()),
      fetch(
        `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?translations=131&per_page=300`
      )
        .then((r) => r.json())
        .catch(() => null),
    ])
      .then(([ajson, tjson]) => {
        const d = ajson.data;
        setInfo({
          number: d.number, name: d.name,
          englishName: d.englishName, numberOfAyahs: d.numberOfAyahs,
        });
        setAyahs(d.ayahs);

        const map: Record<number, string> = {};
        const verses = tjson?.verses || [];
        verses.forEach((v: { verse_number: number; translations?: { text: string }[] }) => {
          const text = v.translations?.[0]?.text || "";
          map[v.verse_number] = text.replace(/<[^>]*>/g, "");
        });
        setTranslations(map);
        setLoading(false);
      })
      .catch((e) => { setError(String(e?.message || e)); setLoading(false); });
  };
  useEffect(load, [surahNumber]);
  return { info, ayahs, translations, loading, error, retry: load };
}

function useTafseer(surahNumber: string, enabled: boolean) {
  const [items, setItems] = useState<TafsirAyah[]>([]);
  const [arabicAyahs, setArabicAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`https://api.quran.com/api/v4/tafsirs/169/by_chapter/${surahNumber}`).then((r) => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`).then((r) => r.json()),
    ])
      .then(([tjson, ajson]) => {
        setItems(tjson?.tafsirs || []);
        setArabicAyahs(ajson?.data?.ayahs || []);
        setLoading(false);
      })
      .catch((e) => { setError(String(e?.message || e)); setLoading(false); });
  };
  useEffect(() => { if (enabled) load(); }, [surahNumber, enabled]);
  return { items, arabicAyahs, loading, error, retry: load };
}

function Reader() {
  const { surahNumber } = Route.useParams();
  const [tab, setTab] = useState<"tilawah" | "tafseer">("tilawah");

  const tilawah = useTilawah(surahNumber);
  const tafseer = useTafseer(surahNumber, tab === "tafseer");

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  useEffect(() => { setFavorites(loadFavorites()); }, []);

  const isFav = (ayahNum: number) =>
    favorites.some((f) => f.surah === Number(surahNumber) && f.ayah === ayahNum);

  const toggleFav = (a: Ayah) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => f.surah === Number(surahNumber) && f.ayah === a.numberInSurah
      );
      const next = exists
        ? prev.filter(
            (f) => !(f.surah === Number(surahNumber) && f.ayah === a.numberInSurah)
          )
        : [
            ...prev,
            {
              surah: Number(surahNumber),
              ayah: a.numberInSurah,
              arabic: a.text,
              translation: tilawah.translations[a.numberInSurah] || "",
              surahName: tilawah.info?.englishName || `Surah ${surahNumber}`,
            },
          ];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markLastRead = (ayahNum: number) => {
    localStorage.setItem(
      LAST_READ_KEY,
      JSON.stringify({
        surah: Number(surahNumber),
        ayah: ayahNum,
        surahName: tilawah.info?.englishName || `Surah ${surahNumber}`,
      })
    );
  };

  // Audio player
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
    const onEnded = () => {
      setCurrentIdx((i) => {
        const next = i + 1;
        if (next < tilawah.ayahs.length) {
          setTimeout(() => { a.play().catch(() => {}); }, 50);
          return next;
        }
        setPlaying(false);
        return i;
      });
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnded);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("ended", onEnded); };
  }, [tilawah.ayahs.length]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const currentAudio = tilawah.ayahs[currentIdx]?.audio;

  return (
    <>
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="back" onClick={() => history.back()} style={{ color: "var(--gold)", fontSize: 20 }}>‹</button>
          <h1 style={{ fontFamily: "var(--font-arabic)", fontSize: 20 }}>
            {tilawah.info?.englishName || `Surah ${surahNumber}`}
          </h1>
        </div>
        <div className="icons"><span>📑</span><span>🔖</span></div>
      </header>

      <div style={{ display: "flex", padding: "12px 16px", gap: 8 }}>
        {(["tilawah", "tafseer"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px 0", borderRadius: 20, minHeight: 44,
            background: tab === t ? "var(--ink)" : "var(--card)",
            color: tab === t ? "var(--card)" : "var(--ink)",
            border: "1px solid var(--border)", fontSize: 12, textTransform: "capitalize"
          }}>{t}</button>
        ))}
      </div>

      {tab === "tilawah" && (
        <>
          {tilawah.loading && <Skeleton />}
          {tilawah.error && !tilawah.loading && <ErrorBox onRetry={tilawah.retry} />}
          {!tilawah.loading && !tilawah.error && (
            <div className="card" style={{ paddingBottom: 110 }}>
              <div className="arabic" style={{ fontSize: 20, textAlign: "center", marginBottom: 14 }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
              {tilawah.ayahs.map((a, i) => (
                <div key={a.number}>
                  <div
                    onClick={() => {
                      setCurrentIdx(i);
                      markLastRead(a.numberInSurah);
                      setTimeout(() => audioRef.current?.play().then(() => setPlaying(true)).catch(() => {}), 50);
                    }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0",
                      background: i === currentIdx && playing ? "var(--card-dark)" : "transparent",
                      borderRadius: 6,
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      border: "1px solid var(--gold)", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontFamily: "var(--font-mono)", marginTop: 4
                    }}>{a.numberInSurah}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="arabic" style={{ fontSize: 18 }}>{a.text}</div>
                      {tilawah.translations[a.numberInSurah] && (
                        <div style={{
                          fontStyle: "italic", fontSize: 13,
                          color: "var(--quote)", lineHeight: 1.6, marginTop: 8
                        }}>
                          {tilawah.translations[a.numberInSurah]}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFav(a); }}
                      style={{
                        flexShrink: 0, marginTop: 2,
                        minWidth: 32, minHeight: 32,
                        background: "transparent", border: "none", fontSize: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                      aria-label={isFav(a.numberInSurah) ? "Remove favourite" : "Add favourite"}
                    >
                      {isFav(a.numberInSurah) ? "❤️" : "🤍"}
                    </button>
                  </div>
                  {i < tilawah.ayahs.length - 1 && <hr className="hr-dashed" />}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "tafseer" && (
        <>
          {tafseer.loading && <Skeleton />}
          {tafseer.error && !tafseer.loading && <ErrorBox onRetry={tafseer.retry} />}
          {!tafseer.loading && !tafseer.error && (
            <div style={{ padding: "0 16px 110px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>TAFSIR IBN KATHIR · ENGLISH</div>
              {tafseer.items.map((it, i) => {
                const ar = tafseer.arabicAyahs[i];
                return (
                  <div key={it.verse_key} style={{
                    background: "var(--card-dark)", border: "1px solid var(--border)",
                    borderRadius: 12, padding: 14
                  }}>
                    {ar && <div className="arabic" style={{ fontSize: 18 }}>{ar.text}</div>}
                    <div className="mono" style={{ fontSize: 9, color: "var(--gold)", marginTop: 6 }}>
                      {it.verse_key}
                    </div>
                    <hr className="hr-dashed" />
                    <div
                      style={{ fontSize: 12, lineHeight: 1.7, color: "var(--ink)" }}
                      dangerouslySetInnerHTML={{ __html: it.text }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "tilawah" && currentAudio && (
        <>
          <audio ref={audioRef} src={currentAudio} preload="auto" />
          <div style={{
            position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 366, margin: "0 12px",
            background: "var(--ink)", color: "var(--card)", borderRadius: 12,
            padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, zIndex: 40
          }}>
            <button onClick={togglePlay} style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--page-bg)", color: "var(--ink)", fontSize: 14
            }}>{playing ? "⏸" : "▶"}</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>
                MISHARY ALAFASY · AYAH {currentIdx + 1}/{tilawah.ayahs.length}
              </div>
              <div style={{ height: 4, background: "var(--gold)", opacity: 0.3, borderRadius: 2, marginTop: 4 }}>
                <div style={{ width: `${progress}%`, height: "100%", background: "var(--gold)", borderRadius: 2 }} />
              </div>
            </div>
            <button onClick={() => {
              const next = Math.min(currentIdx + 1, tilawah.ayahs.length - 1);
              setCurrentIdx(next);
              setTimeout(() => audioRef.current?.play().then(() => setPlaying(true)).catch(() => {}), 50);
            }} style={{ color: "var(--gold)", fontSize: 18 }}>⏭</button>
          </div>
        </>
      )}
    </>
  );
}

function Skeleton() {
  return (
    <div className="card">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ padding: "10px 0" }}>
          <div style={{ height: 16, background: "var(--card-dark)", borderRadius: 4, width: "90%" }} />
          <div style={{ height: 10, background: "var(--card-dark)", borderRadius: 4, width: "70%", marginTop: 6 }} />
        </div>
      ))}
    </div>
  );
}

function ErrorBox({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ margin: "0 16px", padding: 14, textAlign: "center" }}>
      <div className="mono" style={{ fontSize: 11, color: "var(--quote)" }}>Failed to load. Check your connection.</div>
      <button onClick={onRetry} className="mono" style={{
        marginTop: 10, fontSize: 12, color: "var(--card)",
        background: "var(--ink)", padding: "8px 16px", borderRadius: 20
      }}>Retry</button>
    </div>
  );
}
