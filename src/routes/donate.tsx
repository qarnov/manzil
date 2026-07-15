import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/donate")({ component: Donate });

function Donate() {
  return (
    <>
      <TopBar title="Donate" back />

      {/* Hero */}
      <div
        style={{
          background: "var(--ink)",
          color: "var(--card)",
          margin: "12px 16px",
          borderRadius: 16,
          padding: 20,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 34 }}>🤲</div>
        <div className="arabic" style={{ fontSize: 22, marginTop: 10, color: "var(--gold)" }}>
          صَدَقَة جَارِيَة
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 15, marginTop: 8, lineHeight: 1.6 }}>
          Sadaqah Jariyah — a charity that keeps giving
        </div>
      </div>

      {/* The intention */}
      <div className="card" style={{ padding: 16, marginTop: 4 }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: "var(--muted)" }}>
          THE INTENTION
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.7, marginTop: 10 }}>
          Manzil is built purely for the sake of the Muslim community. Any income this app
          ever earns is intended to go entirely towards charity for the ummah — never to profit.
        </div>
        <div className="italic-q" style={{ fontStyle: "italic", fontSize: 14, marginTop: 12, lineHeight: 1.6 }}>
          "When a person dies, their deeds end except for three: ongoing charity, beneficial
          knowledge, or a righteous child who prays for them."
        </div>
        <div className="mono" style={{ fontSize: 9, color: "var(--gold)", marginTop: 6 }}>
          — SAHIH MUSLIM · 1631
        </div>
      </div>

      {/* Current status */}
      <div
        style={{
          margin: "14px 16px",
          padding: 14,
          background: "var(--card-dark)",
          border: "1px dashed var(--border)",
          borderRadius: 12,
        }}
      >
        <div className="mono" style={{ fontSize: 9, letterSpacing: 1.5, color: "var(--muted)" }}>
          CURRENT STATUS
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
          This page and its donation system are still being built. Right now Manzil runs with
          <strong> no income</strong> — entirely in the hope of sadaqah jariyah for everyone
          who uses and benefits from it.
        </div>
      </div>

      {/* Coming soon */}
      <div className="label-mono">COMING SOON</div>
      <div className="card" style={{ padding: 0 }}>
        {[
          { icon: "💳", t: "Give a one-time sadaqah", s: "SECURE, TRANSPARENT" },
          { icon: "🕌", t: "Support a local masjid", s: "DIRECT TO THE COMMUNITY" },
          { icon: "📊", t: "See where it goes", s: "FULL TRANSPARENCY REPORTS" },
        ].map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              opacity: 0.65,
              borderBottom: i < 2 ? "1px dashed var(--border)" : "none",
            }}
          >
            <span style={{ fontSize: 20 }}>{r.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{r.t}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{r.s}</div>
            </div>
            <span className="mono" style={{ fontSize: 8, color: "var(--gold)", border: "1px solid var(--gold)", padding: "3px 8px", borderRadius: 10 }}>
              SOON
            </span>
          </div>
        ))}
      </div>

      <div className="mono" style={{ fontSize: 10, color: "var(--muted)", textAlign: "center", margin: "18px 24px", lineHeight: 1.6 }}>
        May Allah accept it from all of us. 🤍
      </div>

      <div style={{ height: 24 }} />
    </>
  );
}
