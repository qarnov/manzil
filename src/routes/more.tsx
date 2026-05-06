import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/more")({ component: More });

const tools = [
  { to: "/prayer-settings", icon: "🕌", name: "Set Prayer Timings", sub: "CUSTOMIZE IQAMAH PER MASJID" },
  { to: "/tasbih", icon: "📿", name: "Tasbih Counter", sub: "COUNT YOUR DHIKR" },
  { to: "/qibla", icon: "🧭", name: "Qibla Finder", sub: "DIRECTION TO MAKKAH" },
  { to: "/zakat", icon: "💰", name: "Zakat Calculator", sub: "CALCULATE YOUR ZAKAT" },
  { to: "/hijri", icon: "🌙", name: "Hijri Calendar", sub: "ISLAMIC DATES" },
];
const community = [
  { icon: "🕌", name: "Local Masjids", sub: "FIND NEARBY" },
  { icon: "❤️", name: "Donate", sub: "SUPPORT THE COMMUNITY" },
];

function Row({ icon, name, sub, to, onClick }: any) {
  const inner = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", minHeight: 60 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: "var(--card-dark)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
        <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{sub}</div>
      </div>
      <span style={{ color: "var(--gold)", fontSize: 18 }}>›</span>
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return <button onClick={onClick} style={{ width: "100%", textAlign: "left" }}>{inner}</button>;
}

function Group({ items }: { items: any[] }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      {items.map((it, i) => (
        <div key={i} style={{ borderBottom: i < items.length - 1 ? "1px dashed var(--border)" : "none" }}>
          <Row {...it} />
        </div>
      ))}
    </div>
  );
}

function More() {
  const [showAbout, setShowAbout] = useState(false);
  return (
    <>
      <TopBar title="More" />
      <div style={{
        background: "var(--ink)", color: "var(--card)",
        margin: "12px 16px", borderRadius: 16, padding: 16,
        display: "flex", alignItems: "center", gap: 12
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "var(--gold)", color: "var(--ink)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-arabic)", fontSize: 22, fontWeight: 700
        }}>A</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Afdhal</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--gold)", marginTop: 2 }}>📍 MANGALURU, KARNATAKA</div>
        </div>
      </div>

      <div className="label-mono">TOOLS</div>
      <Group items={tools} />

      <div className="label-mono">COMMUNITY</div>
      <Group items={community} />

      <div className="label-mono">APP</div>
      <Group items={[
        { icon: "⚙️", name: "Settings", sub: "PREFERENCES" },
        { icon: "ℹ️", name: "About Manzil", sub: "VERSION & CREDITS", onClick: () => setShowAbout((s) => !s) },
      ]} />
      {showAbout && (
        <div style={{
          margin: "10px 16px", padding: 12, background: "var(--card-dark)",
          border: "1px solid var(--border)", borderRadius: 10
        }} className="mono">
          <div style={{ fontSize: 11, color: "var(--ink)" }}>v1.0 · Built by Afdhal for the Beary community</div>
        </div>
      )}
      <div style={{ height: 24 }} />
    </>
  );
}
