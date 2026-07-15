import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopBar } from "../components/TopBar";
import { PRAYER_NAMES } from "../lib/prayerTimes";
import { getAllMasjids, saveMasjidTimes, normalizeTimes, type MasjidTimes } from "../lib/masjids";

export const Route = createFileRoute("/muazzin")({ component: Muazzin });

// Demo gate. With the backend, this becomes a real per-masjid muazzin login;
// each muazzin will only be able to edit the masjid assigned to them.
const DEMO_PIN = "1786";

// "5:04 AM" -> "05:04" (for <input type=time>)
function to24h(t: string): string {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return "";
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}
// "17:04" -> "5:04 PM"
function to12h(t: string): string {
  const m = t.match(/^(\d{2}):(\d{2})$/);
  if (!m) return "—";
  const h24 = parseInt(m[1], 10);
  const ap = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${m[2]} ${ap}`;
}

function Muazzin() {
  const masjids = useMemo(() => getAllMasjids(), []);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [masjidId, setMasjidId] = useState(masjids[0]?.id ?? "");
  const [times, setTimes] = useState<MasjidTimes>(() => normalizeTimes(masjids[0]?.times));
  const [saved, setSaved] = useState(false);

  const onPickMasjid = (id: string) => {
    setMasjidId(id);
    const m = masjids.find((x) => x.id === id);
    setTimes(normalizeTimes(m?.times));
    setSaved(false);
  };

  const setField = (name: string, field: "azaan" | "iqamah", value24: string) => {
    setTimes((prev) => ({
      ...prev,
      [name]: { ...prev[name], [field]: to12h(value24) },
    }));
    setSaved(false);
  };

  const save = () => {
    saveMasjidTimes(masjidId, times);
    setSaved(true);
  };

  if (!unlocked) {
    return (
      <>
        <TopBar title="Muazzin Mode" back />
        <div style={{ padding: 16 }}>
          <div
            style={{
              background: "var(--ink)",
              color: "var(--card)",
              borderRadius: 16,
              padding: 20,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 34 }}>🕌</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}>Muazzin Access</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--gold)", marginTop: 6, lineHeight: 1.5 }}>
              FOR APPROVED MUAZZINS ONLY.
              <br />
              UPDATE AZAAN &amp; IQAMAH FOR YOUR MASJID.
            </div>
          </div>

          <input
            className="input"
            placeholder="Enter access PIN"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ marginTop: 16, textAlign: "center", letterSpacing: 4 }}
          />
          <button
            onClick={() => setUnlocked(pin === DEMO_PIN)}
            className="mono"
            style={{
              width: "100%",
              minHeight: 44,
              borderRadius: 22,
              background: "var(--ink)",
              color: "var(--card)",
              fontSize: 12,
              marginTop: 10,
            }}
          >
            Unlock
          </button>
          {pin && pin !== DEMO_PIN && (
            <div className="mono" style={{ fontSize: 10, color: "#c0392b", textAlign: "center", marginTop: 8 }}>
              Incorrect PIN
            </div>
          )}
          <div className="mono" style={{ fontSize: 9, color: "var(--muted)", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
            Not a muazzin? Ask Afdhal to register your masjid from the Local Masjids page.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Muazzin Mode" back />
      <div style={{ padding: "12px 16px" }}>
        <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginBottom: 6 }}>
          YOUR MASJID
        </div>
        <select
          className="input"
          value={masjidId}
          onChange={(e) => onPickMasjid(e.target.value)}
        >
          {masjids.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {m.area}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div
          className="mono"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            padding: "8px 14px",
            background: "var(--card-dark)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: 9, color: "var(--muted)" }}>PRAYER</span>
          <span style={{ fontSize: 9, color: "var(--muted)", textAlign: "center" }}>AZAAN</span>
          <span style={{ fontSize: 9, color: "var(--gold)", textAlign: "center" }}>IQAMAH</span>
        </div>
        {PRAYER_NAMES.map((name, i) => (
          <div
            key={name}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: i < PRAYER_NAMES.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
            <input
              type="time"
              value={to24h(times[name]?.azaan ?? "")}
              onChange={(e) => setField(name, "azaan", e.target.value)}
              className="mono"
              style={{ fontSize: 12, padding: "6px 4px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--card)", color: "var(--ink)", textAlign: "center" }}
            />
            <input
              type="time"
              value={to24h(times[name]?.iqamah ?? "")}
              onChange={(e) => setField(name, "iqamah", e.target.value)}
              className="mono"
              style={{ fontSize: 12, padding: "6px 4px", border: "1px solid var(--gold)", borderRadius: 8, background: "var(--card)", color: "var(--ink)", textAlign: "center" }}
            />
          </div>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        <button
          onClick={save}
          className="mono"
          style={{
            width: "100%",
            minHeight: 44,
            borderRadius: 22,
            background: saved ? "#25D366" : "var(--ink)",
            color: "#fff",
            fontSize: 12,
          }}
        >
          {saved ? "✓ Saved" : "Save times"}
        </button>
        <div className="mono" style={{ fontSize: 9, color: "var(--muted)", textAlign: "center", marginTop: 10, lineHeight: 1.6 }}>
          Note: saved on this device for now. Once Manzil's masjid backend is live, your
          updates will sync to every user of this masjid instantly.
        </div>
      </div>

      <div style={{ height: 24 }} />
    </>
  );
}
