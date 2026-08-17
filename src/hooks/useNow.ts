import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * A Date that refreshes on an interval, and immediately whenever the app comes
 * back to the foreground — timers are throttled while backgrounded, so without
 * the AppState hook the countdown would show a stale value on resume.
 */
export function useNow(intervalMs = 15_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(new Date());
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [intervalMs]);

  return now;
}
