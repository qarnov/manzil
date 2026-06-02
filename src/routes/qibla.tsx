import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { TopBar } from "../components/TopBar";

export const Route = createFileRoute("/qibla")({ component: Qibla });

const toRad = (deg: number) => (deg * Math.PI) / 180;
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function computeQibla(userLat: number, userLng: number) {
  const φ1 = toRad(userLat);
  const Δλ = toRad(KAABA_LNG) - toRad(userLng);
  const x = Math.sin(Δλ) * Math.cos(toRad(KAABA_LAT));
  const y =
    Math.cos(φ1) * Math.sin(toRad(KAABA_LAT)) -
    Math.sin(φ1) * Math.cos(toRad(KAABA_LAT)) * Math.cos(Δλ);
  return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
}

function computeDistance(userLat: number, userLng: number) {
  const R = 6371;
  const dLat = toRad(KAABA_LAT - userLat);
  const dLon = toRad(KAABA_LNG - userLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(userLat)) * Math.cos(toRad(KAABA_LAT)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function Qibla() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState(false);
  const [city, setCity] = useState<string | null>(null);

  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [needsCompassPermission, setNeedsCompassPermission] = useState(false);
  const listeningRef = useRef(false);

  const requestLocation = async () => {
    setLocLoading(true);
    setLocError(false);

    // Native (APK): use the Capacitor plugin so Android shows the runtime
    // permission prompt and resolves location reliably inside the WebView.
    if (Capacitor.isNativePlatform()) {
      try {
        const perm = await Geolocation.requestPermissions();
        if (perm.location === "denied" && perm.coarseLocation === "denied") {
          setLocError(true);
          setLocLoading(false);
          return;
        }
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      } catch {
        setLocError(true);
        setLocLoading(false);
      }
      return;
    }

    // Web fallback
    if (!navigator.geolocation) {
      setLocError(true);
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        setLocError(true);
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Reverse geocode city name (graceful fallback)
  useEffect(() => {
    if (!coords) return;
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
    )
      .then((r) => r.json())
      .then((d) => setCity(d.address.city || d.address.town || d.address.village || null))
      .catch(() => {});
  }, [coords]);

  const startListening = () => {
    if (listeningRef.current) return;
    listeningRef.current = true;
    const handler = (event: DeviceOrientationEvent) => {
      if (event.alpha == null) return;
      setCompassHeading((360 - event.alpha + 360) % 360);
    };
    const hasAbsolute = "ondeviceorientationabsolute" in (window as object);
    if (hasAbsolute) {
      window.addEventListener("deviceorientationabsolute", handler as EventListener);
    } else {
      window.addEventListener("deviceorientation", handler as EventListener);
    }
  };

  useEffect(() => {
    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (DOE && typeof DOE.requestPermission === "function") {
      // iOS — needs explicit user gesture to enable
      setNeedsCompassPermission(true);
    } else {
      startListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enableCompass = () => {
    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    DOE.requestPermission!().then((state: string) => {
      if (state === "granted") {
        setNeedsCompassPermission(false);
        startListening();
      }
    });
  };

  const qiblaBearing = coords ? computeQibla(coords.lat, coords.lng) : null;
  const distance = coords ? computeDistance(coords.lat, coords.lng) : null;
  const hasSensor = compassHeading != null;
  const needleAngle =
    qiblaBearing != null && hasSensor
      ? (qiblaBearing - compassHeading + 360) % 360
      : qiblaBearing ?? 0;

  return (
    <>
      <TopBar title="Qibla Finder" back />

      <div
        style={{
          margin: "12px 16px",
          padding: "10px 14px",
          background: "var(--card-dark)",
          border: "1px solid var(--border)",
          borderRadius: 10,
        }}
        className="mono"
      >
        <span style={{ fontSize: 9, color: "var(--ink)" }}>
          HOLD PHONE FLAT · ROTATE SLOWLY UNTIL NEEDLE ALIGNS
        </span>
      </div>

      {locLoading && (
        <div style={{ textAlign: "center", padding: 40 }} className="mono">
          <div style={{ fontSize: 11, color: "var(--muted)" }}>FINDING YOUR LOCATION…</div>
        </div>
      )}

      {locError && !locLoading && (
        <div style={{ textAlign: "center", padding: 30 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--quote)", marginBottom: 14 }}>
            Location access is needed to find the Qibla.
          </div>
          <button
            onClick={requestLocation}
            style={{
              minHeight: 44,
              padding: "0 22px",
              background: "var(--ink)",
              color: "var(--card)",
              border: "none",
              borderRadius: 22,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            Allow Location
          </button>
        </div>
      )}

      {coords && qiblaBearing != null && (
        <>
          <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
            <div
              style={{
                width: 280,
                height: 280,
                borderRadius: "50%",
                border: "3px solid var(--ink)",
                background: "var(--page-bg)",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {(["N", "E", "S", "W"] as const).map((d, i) => {
                const positions = [
                  { top: 10, left: "50%", transform: "translateX(-50%)" },
                  { right: 12, top: "50%", transform: "translateY(-50%)" },
                  { bottom: 10, left: "50%", transform: "translateX(-50%)" },
                  { left: 12, top: "50%", transform: "translateY(-50%)" },
                ];
                return (
                  <div
                    key={d}
                    className="mono"
                    style={{ position: "absolute", fontSize: 13, fontWeight: 600, color: "var(--ink)", ...positions[i] }}
                  >
                    {d}
                  </div>
                );
              })}
              {/* Gold Qibla needle */}
              <div
                style={{
                  position: "absolute",
                  width: 6,
                  height: 200,
                  top: 40,
                  borderRadius: 3,
                  background: "var(--gold)",
                  transform: `rotate(${needleAngle}deg)`,
                  transition: "transform 0.3s ease",
                  transformOrigin: "center",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  fontSize: 22,
                  transform: `rotate(${needleAngle}deg) translateY(-108px)`,
                  transition: "transform 0.3s ease",
                }}
              >
                🕋
              </div>
              {/* Center hub */}
              <div
                style={{
                  position: "absolute",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "var(--ink)",
                  border: "2px solid var(--gold)",
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)" }}>
              Qibla: {Math.round(qiblaBearing)}°
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--muted)", marginTop: 4 }}>
              DIRECTION TO MAKKAH
            </div>
          </div>

          {needsCompassPermission && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <button
                onClick={enableCompass}
                style={{
                  minHeight: 44,
                  padding: "0 22px",
                  background: "var(--ink)",
                  color: "var(--card)",
                  border: "none",
                  borderRadius: 22,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                }}
              >
                Enable Compass
              </button>
            </div>
          )}

          {!hasSensor && !needsCompassPermission && (
            <div
              style={{
                margin: "0 16px 16px",
                padding: "10px 14px",
                background: "var(--card)",
                border: "1px dashed var(--border)",
                borderRadius: 10,
                textAlign: "center",
              }}
              className="mono"
            >
              <span style={{ fontSize: 10, color: "var(--quote)" }}>
                Point your phone North, then face {Math.round(qiblaBearing)}°
              </span>
            </div>
          )}

          <div
            style={{
              background: "var(--card-dark)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              margin: "0 16px 12px",
              padding: 14,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700 }}>{city || "Your location"}</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
              {coords.lat.toFixed(4)}° {coords.lat >= 0 ? "N" : "S"},{" "}
              {coords.lng.toFixed(4)}° {coords.lng >= 0 ? "E" : "W"}
            </div>
          </div>

          {distance != null && (
            <div
              style={{
                background: "var(--card-dark)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                margin: "0 16px",
                padding: 14,
              }}
            >
              <div className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                DISTANCE
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>
                {distance.toLocaleString()} km from Mecca
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ height: 110 }} />
    </>
  );
}
