import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/duas/$category")({ component: DuasCategory });

const duas = [
  {
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    en: "We have entered the morning and the dominion belongs to Allah, all praise is for Allah.",
    src: "Muslim 2723",
  },
  {
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا",
    en: "O Allah, by You we enter the morning and by You we enter the evening.",
    src: "Tirmidhi 3391",
  },
  {
    arabic: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ",
    en: "Allah is sufficient for me, there is no god but Him, in Him I place my trust.",
    src: "Abu Dawud 5081",
  },
];

function DuasCategory() {
  const { category } = Route.useParams();
  const name = category.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  return (
    <>
      <TopBar title={`${name} 🌅`} back />
      <div style={{ padding: "8px 18px 14px" }} className="mono">
        <span style={{ fontSize: 9, color: "var(--muted)" }}>{duas.length} DUAS · RECITE AFTER FAJR</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 16px" }}>
        {duas.map((d, i) => (
          <div key={i} style={{
            background: "var(--card-dark)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 14
          }}>
            <div className="arabic" style={{ fontSize: 16, color: "var(--ink)" }}>{d.arabic}</div>
            <div style={{ fontStyle: "italic", fontSize: 11, marginTop: 8, color: "var(--quote)" }}>
              {d.en}
            </div>
            <hr className="hr-dashed" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>{d.src}</span>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="mono" style={{ fontSize: 11, color: "var(--ink)" }}>🔊 Play</button>
                <button className="mono" style={{ fontSize: 11, color: "var(--ink)" }}>📋 Copy</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}
