import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/qibla")({ component: Qibla });

function Qibla() {
  const bearing = 287;
  return (
    <>
      <TopBar title="Qibla Finder" back />
      <div style={{
        margin: "12px 16px", padding: "10px 14px",
        background: "var(--card-dark)", border: "1px solid var(--border)",
        borderRadius: 10
      }} className="mono">
        <span style={{ fontSize: 9, color: "var(--ink)" }}>HOLD PHONE FLAT · ROTATE SLOWLY UNTIL NEEDLE ALIGNS</span>
      </div>

      <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
        <div style={{
          width: 200, height: 200, borderRadius: "50%",
          border: "3px solid var(--ink)", background: "var(--card)",
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {(["N", "E", "S", "W"] as const).map((d, i) => {
            const positions = [
              { top: 6, left: "50%", transform: "translateX(-50%)" },
              { right: 8, top: "50%", transform: "translateY(-50%)" },
              { bottom: 6, left: "50%", transform: "translateX(-50%)" },
              { left: 8, top: "50%", transform: "translateY(-50%)" },
            ];
            return <div key={d} className="mono" style={{ position: "absolute", fontSize: 11, color: "var(--ink)", ...positions[i] }}>{d}</div>;
          })}
          <div style={{
            position: "absolute", width: 4, height: 140, top: 30,
            transform: `rotate(${bearing}deg)`, transformOrigin: "center 70px"
          }}>
            <div style={{ width: "100%", height: "50%", background: "var(--ink)" }} />
            <div style={{ width: "100%", height: "50%", background: "var(--border)" }} />
          </div>
          <div style={{
            position: "absolute", fontSize: 18,
            transform: `rotate(${bearing}deg) translateY(-78px)`
          }}>🕋</div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-arabic)", fontSize: 32, color: "var(--ink)" }}>{bearing}°</div>
        <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 4 }}>NW · DIRECTION TO MAKKAH</div>
      </div>

      <div style={{ background: "var(--card-dark)", border: "1px solid var(--border)", borderRadius: 12, margin: "0 16px 12px", padding: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Mangaluru, Karnataka</div>
        <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>12.8698° N, 74.8431° E</div>
      </div>
      <div style={{ background: "var(--card-dark)", border: "1px solid var(--border)", borderRadius: 12, margin: "0 16px", padding: 14 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>DISTANCE</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>3,842 km to Makkah</div>
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}
