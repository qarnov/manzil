import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

export type CompassState = {
  coords: { lat: number; lng: number } | null;
  /** Device heading in degrees from true north, or null if no sensor yet. */
  heading: number | null;
  /** Platform accuracy rating, 0–3. Below 2 means "calibrate me". */
  accuracy: number | null;
  status: 'idle' | 'requesting' | 'ready' | 'denied' | 'error';
  retry: () => void;
};

/**
 * Live device heading plus GPS position.
 *
 * The web prototype hardcoded Mangaluru and read `deviceorientation`. This
 * uses expo-location's `watchHeadingAsync`, which returns a true-north heading
 * (magnetic declination already applied) on both platforms.
 */
export function useCompass(): CompassState {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [status, setStatus] = useState<CompassState['status']>('idle');

  const subscription = useRef<Location.LocationSubscription | null>(null);
  const cancelled = useRef(false);

  const start = useCallback(async () => {
    setStatus('requesting');
    try {
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (cancelled.current) return;
      setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });

      subscription.current?.remove();
      subscription.current = await Location.watchHeadingAsync((h) => {
        // trueHeading is -1 when unavailable; fall back to magnetic.
        const value = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
        setHeading(((value % 360) + 360) % 360);
        setAccuracy(h.accuracy ?? null);
      });

      if (cancelled.current) {
        subscription.current?.remove();
        subscription.current = null;
        return;
      }
      setStatus('ready');
    } catch {
      if (!cancelled.current) setStatus('error');
    }
  }, []);

  useEffect(() => {
    cancelled.current = false;
    start();
    return () => {
      cancelled.current = true;
      subscription.current?.remove();
      subscription.current = null;
    };
  }, [start]);

  return { coords, heading, accuracy, status, retry: start };
}
