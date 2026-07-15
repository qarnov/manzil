import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopBar } from "../components/TopBar";
import { getAllMasjids, getStates, detectState } from "../lib/masjids";

export const Route = createFileRoute("/masjids")({ component: LocalMasjids });

// Where "register your masjid" requests are sent. Swap for a WhatsApp number
// (https://wa.me/<number>?text=...) once available.
const AFDHAL_EMAIL = "afaaqir@gmail.com";

function LocalMasjids() {
  const all = useMemo(() => getAllMasjids(), []);
  const states = useMemo(() => getStates(), []);
  const [filter, setFilter] = useState("all");

  // Register form
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    // Best-effort: pre-filter the list to the user's state.
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (p) => {
      const st = await detectState(p.coords.latitude, p.coords.longitude);
      if (st && states.some((s) => s.toLowerCase() === st.toLowerCase())) setFilter(st);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = filter === "all" ? all : all.filter((m) => m.state === filter);

  const submit = () => {
    if (!name.trim() || !area.trim()) return;
    const subject = encodeURIComponent(`Manzil — Register masjid: ${name}`);
    const body = encodeURIComponent(
      `Assalamu alaikum Afdhal,\n\nPlease add this masjid to Manzil:\n\n` +
        `Masjid name: ${name}\nArea / locality: ${area}\n` +
        `Muazzin / contact: ${contact || "(not provided)"}\n\nJazakAllah khair.`
    );
    window.open(`mailto:${AFDHAL_EMAIL}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <>
      <TopBar title="Local Masjids" back />

      {/* State filter */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", flexWrap: "wrap" }}>
        {["all", ...states].map((s) => {
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="mono"
              style={{
                fontSize: 11,
                padding: "6px 14px",
                borderRadius: 16,
                background: active ? "var(--ink)" : "transparent",
                color: active ? "var(--card)" : "var(--ink)",
                border: `1px solid ${active ? "var(--ink)" : "var(--border)"}`,
              }}
            >
              {s === "all" ? "All" : s}
            </button>
          );
        })}
      </div>

      <div className="label-mono" style={{ marginTop: 0 }}>
        {visible.length} MASJID{visible.length === 1 ? "" : "S"} NEAR YOU
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 16px" }}>
        {visible.map((m) => (
          <div
            key={m.id}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 14,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 22 }}>🕌</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</div>
              <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
                {m.area.toUpperCase()}, {m.state.toUpperCase()}
              </div>
            </div>
            {m.updatedAt && (
              <span className="mono" style={{ fontSize: 8, color: "var(--gold)" }}>
                UPD {m.updatedAt}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Register your masjid */}
      <div className="label-mono">REGISTER YOUR MASJID</div>
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--ink)",
          borderRadius: 12,
          margin: "0 16px",
          padding: 14,
        }}
      >
        <div className="mono" style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.5, marginBottom: 12 }}>
          Let Afdhal know your masjid and its location. Once added, its azaan &amp; iqamah
          times can be kept up to date in the app.
        </div>
        <input
          className="input"
          placeholder="Masjid name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <input
          className="input"
          placeholder="Area / locality (e.g. Kallapu)"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <input
          className="input"
          placeholder="Muazzin / your contact (optional)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <button
          onClick={submit}
          disabled={!name.trim() || !area.trim()}
          className="mono"
          style={{
            width: "100%",
            minHeight: 44,
            borderRadius: 22,
            background: name.trim() && area.trim() ? "var(--ink)" : "var(--border)",
            color: "var(--card)",
            fontSize: 12,
          }}
        >
          Send to Afdhal →
        </button>
      </div>

      <div style={{ height: 24 }} />
    </>
  );
}
