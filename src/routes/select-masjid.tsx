import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { TopBar } from "../components/TopBar";
import {
  getAllMasjids,
  getStates,
  detectState,
  useSelectedMasjid,
} from "../lib/masjids";

export const Route = createFileRoute("/select-masjid")({ component: SelectMasjid });

async function currentPosition(): Promise<{ lat: number; lng: number }> {
  if (Capacitor.isNativePlatform()) {
    await Geolocation.requestPermissions();
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  }
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("no geolocation"));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function SelectMasjid() {
  const navigate = useNavigate();
  const { masjid: selected, select } = useSelectedMasjid();
  const all = useMemo(() => getAllMasjids(), []);
  const states = useMemo(() => getStates(), []);

  const [detecting, setDetecting] = useState(false);
  const [detectedState, setDetectedState] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const runDetect = async () => {
    setDetecting(true);
    try {
      const { lat, lng } = await currentPosition();
      const st = await detectState(lat, lng);
      if (st) {
        setDetectedState(st);
        // If we have masjids in that state, filter to it.
        if (states.some((s) => s.toLowerCase() === st.toLowerCase())) setFilter(st);
      }
    } catch {
      /* user denied or unavailable — they can still browse manually */
    } finally {
      setDetecting(false);
    }
  };

  // Auto-detect on first open (best effort; silent on failure).
  useEffect(() => {
    runDetect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = filter === "all" ? all : all.filter((m) => m.state === filter);

  const choose = (id: string) => {
    select(id);
    navigate({ to: "/" });
  };

  return (
    <>
      <TopBar title="Choose Masjid" back />

      <div style={{ padding: "12px 16px" }}>
        <button
          onClick={runDetect}
          disabled={detecting}
          className="mono"
          style={{
            width: "100%",
            minHeight: 44,
            borderRadius: 22,
            background: "var(--ink)",
            color: "var(--card)",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {detecting ? "Detecting your location…" : "📍 Use my location"}
        </button>
        {detectedState && (
          <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 8, textAlign: "center" }}>
            DETECTED: {detectedState.toUpperCase()}
          </div>
        )}
      </div>

      {/* State filter chips */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px 12px", flexWrap: "wrap" }}>
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

      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 16px" }}>
        {visible.map((m) => {
          const isSel = selected?.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => choose(m.id)}
              style={{
                textAlign: "left",
                background: isSel ? "var(--card-dark)" : "var(--card)",
                border: `2px solid ${isSel ? "var(--ink)" : "var(--border)"}`,
                borderRadius: 14,
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
                <div className="mono" style={{ fontSize: 9, color: "var(--gold)", marginTop: 4 }}>
                  FAJR {m.times.Fajr?.iqamah ?? "—"} · MAGHRIB {m.times.Maghrib?.iqamah ?? "—"}
                </div>
              </div>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: `2px solid ${isSel ? "var(--gold)" : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isSel && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--gold)" }} />}
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          margin: "16px",
          padding: 14,
          background: "var(--card)",
          border: "1px dashed var(--border)",
          borderRadius: 12,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700 }}>Can't find your masjid?</div>
        <div className="mono" style={{ fontSize: 10, color: "var(--muted)", margin: "6px 0 12px" }}>
          Help us add it to Manzil
        </div>
        <Link
          to="/masjids"
          className="mono"
          style={{
            display: "inline-block",
            minHeight: 44,
            lineHeight: "44px",
            padding: "0 20px",
            borderRadius: 22,
            background: "var(--ink)",
            color: "var(--card)",
            fontSize: 12,
          }}
        >
          Register a masjid →
        </Link>
      </div>

      <div style={{ height: 24 }} />
    </>
  );
}
