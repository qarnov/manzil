// Great-circle bearing and distance to the Kaaba. Pure maths, carried over
// from the web prototype's qibla screen.

export const KAABA_LAT = 21.4225;
export const KAABA_LNG = 39.8262;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Initial great-circle bearing from a position to the Kaaba, in degrees. */
export function qiblaBearing(lat: number, lng: number): number {
  const phi1 = toRad(lat);
  const dLambda = toRad(KAABA_LNG) - toRad(lng);
  const x = Math.sin(dLambda) * Math.cos(toRad(KAABA_LAT));
  const y =
    Math.cos(phi1) * Math.sin(toRad(KAABA_LAT)) -
    Math.sin(phi1) * Math.cos(toRad(KAABA_LAT)) * Math.cos(dLambda);
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
}

/** Haversine distance to the Kaaba, in whole kilometres. */
export function distanceToKaaba(lat: number, lng: number): number {
  const R = 6371;
  const dLat = toRad(KAABA_LAT - lat);
  const dLon = toRad(KAABA_LNG - lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) * Math.cos(toRad(KAABA_LAT)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/** Smallest signed difference between two headings, in (-180, 180]. */
export function headingDelta(from: number, to: number): number {
  return ((((to - from) % 360) + 540) % 360) - 180;
}
