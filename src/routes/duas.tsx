import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/duas")({ component: Duas });

const categories = [
  { slug: "morning", emoji: "🌅", name: "Morning Duas", count: 12 },
  { slug: "evening", emoji: "🌆", name: "Evening Duas", count: 12 },
  { slug: "bathroom", emoji: "🚿", name: "Bathroom", count: 3 },
  { slug: "masjid", emoji: "🕌", name: "Masjid", count: 6 },
  { slug: "after-prayer", emoji: "🤲", name: "After Prayer", count: 8 },
  { slug: "eating", emoji: "🍽️", name: "Eating", count: 4 },
  { slug: "sleeping", emoji: "🌙", name: "Sleeping", count: 5 },
  { slug: "travelling", emoji: "✈️", name: "Travelling", count: 4 },
];

function Duas() {
  return (
    <>
      <TopBar title="Duas" />
      <div style={{ padding: "16px" }}>
        <input className="input" placeholder="Search duas..." />
      </div>

      <Link to="/tasbih" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--ink)", color: "var(--card)", margin: "0 16px",
        borderRadius: 10, padding: "14px 16px", minHeight: 64
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 26 }}>📿</span>
          <div>
            <div style={{ fontWeight: 700 }}>Tasbih Counter</div>
            <div className="mono" style={{ fontSize: 9, color: "var(--gold)" }}>COUNT YOUR DHIKR</div>
          </div>
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--gold)", border: "1px solid var(--gold)", padding: "6px 12px", borderRadius: 20 }}>Open →</span>
      </Link>

      <div className="label-mono">CATEGORIES</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "0 16px" }}>
        {categories.map((c) => (
          <Link key={c.slug} to="/duas/$category" params={{ category: c.slug }} style={{
            background: "var(--card-dark)", border: "2px solid var(--ink)",
            borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 6,
            minHeight: 100
          }}>
            <span style={{ fontSize: 26 }}>{c.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</span>
            <span className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>{c.count} DUAS</span>
          </Link>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}
