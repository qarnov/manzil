import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/quran/$surahNumber")({ component: Reader });

const ayahs = [
  { n: 1, ar: "الٓمٓ", en: "Alif, Lam, Meem." },
  { n: 2, ar: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ", en: "This is the Book about which there is no doubt, a guidance for those conscious of Allah." },
  { n: 3, ar: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ", en: "Who believe in the unseen, establish prayer, and spend out of what We have provided for them." },
];

function Reader() {
  const [tab, setTab] = useState<"tilawah" | "tafseer">("tilawah");
  const [src, setSrc] = useState("Ibn Kathir");
  return (
    <>
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="back" onClick={() => history.back()} style={{ color: "var(--gold)", fontSize: 20 }}>‹</button>
          <h1 style={{ fontFamily: "var(--font-arabic)", fontSize: 20 }}>Al-Baqarah</h1>
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

      {tab === "tilawah" ? (
        <div className="card" style={{ paddingBottom: 110 }}>
          <div className="arabic" style={{ fontSize: 20, textAlign: "center", marginBottom: 14 }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
          {ayahs.map((a, i) => (
            <div key={a.n}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  border: "1px solid var(--gold)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontFamily: "var(--font-mono)", marginTop: 4
                }}>{a.n}</div>
                <div style={{ flex: 1 }}>
                  <div className="arabic" style={{ fontSize: 18 }}>{a.ar}</div>
                  <div style={{ fontStyle: "italic", fontSize: 11, color: "var(--quote)", marginTop: 6 }}>{a.en}</div>
                </div>
              </div>
              {i < ayahs.length - 1 && <hr className="hr-dashed" />}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: "0 16px 110px" }}>
          <div style={{ background: "var(--card-dark)", border: "2px solid var(--ink)", borderRadius: 12, padding: 14 }}>
            <div className="arabic" style={{ fontSize: 18 }}>{ayahs[1].ar}</div>
            <div style={{ fontStyle: "italic", fontSize: 11, color: "var(--quote)", marginTop: 6 }}>{ayahs[1].en}</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--gold)", marginTop: 6 }}>AL-BAQARAH 2:2</div>
          </div>
          <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
            {["Ibn Kathir", "Al-Jalalayn", "Maarif"].map((s) => (
              <button key={s} onClick={() => setSrc(s)} style={{
                padding: "6px 12px", borderRadius: 20,
                background: src === s ? "var(--ink)" : "var(--card)",
                color: src === s ? "var(--card)" : "var(--ink)",
                border: "1px solid var(--border)", fontSize: 11
              }}>{s}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.7 }}>
            This verse affirms that the Qur'an is a guidance free of any doubt for those who possess taqwa — God-consciousness. The mufassirun explain that the Book itself testifies to its own truth, and only those whose hearts are open to guidance will benefit.
          </div>
        </div>
      )}

      {tab === "tilawah" && (
        <div style={{
          position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 366, margin: "0 12px",
          background: "var(--ink)", color: "var(--card)", borderRadius: 12,
          padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, zIndex: 40
        }}>
          <button style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--page-bg)", color: "var(--ink)", fontSize: 14
          }}>▶</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>ABDUL RAHMAN AL-SUDAIS</div>
            <div style={{ height: 4, background: "var(--gold)", opacity: 0.3, borderRadius: 2, marginTop: 4 }}>
              <div style={{ width: "30%", height: "100%", background: "var(--gold)", borderRadius: 2 }} />
            </div>
            <div className="mono" style={{ fontSize: 9, marginTop: 3 }}>1:23 / 4:10</div>
          </div>
          <button style={{ color: "var(--gold)", fontSize: 18 }}>⏭</button>
        </div>
      )}
    </>
  );
}
