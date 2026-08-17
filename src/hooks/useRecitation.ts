import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Ayah } from '../lib/quran';

/**
 * Per-ayah recitation with auto-advance.
 *
 * expo-audio keeps one player instance; changing ayah calls `replace()` rather
 * than creating a new player, so playback stays gapless and nothing leaks.
 */
export function useRecitation(ayahs: Ayah[]) {
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);

  const player = useAudioPlayer(undefined, { updateInterval: 400 });
  const status = useAudioPlayerStatus(player);

  // Recitation should be audible even with the ringer switch off.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const loadedFor = useRef<string | null>(null);

  const playIndex = useCallback(
    (i: number) => {
      const url = ayahs[i]?.audio;
      if (!url) return;
      setIndex(i);
      setActive(true);
      if (loadedFor.current !== url) {
        player.replace(url);
        loadedFor.current = url;
      }
      player.play();
    },
    [ayahs, player]
  );

  const toggle = useCallback(() => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (loadedFor.current == null) {
      playIndex(index);
      return;
    }
    player.play();
  }, [index, playIndex, player, status.playing]);

  // Advance to the next ayah when one finishes.
  useEffect(() => {
    if (!status.didJustFinish) return;
    const next = index + 1;
    if (next < ayahs.length && ayahs[next]?.audio) {
      playIndex(next);
    } else {
      setActive(false);
    }
  }, [status.didJustFinish, index, ayahs, playIndex]);

  // A new surah resets the queue.
  useEffect(() => {
    setIndex(0);
    setActive(false);
    loadedFor.current = null;
  }, [ayahs]);

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  return {
    index,
    active,
    playing: status.playing,
    isBuffering: status.isBuffering,
    progress,
    playIndex,
    toggle,
    next: () => playIndex(Math.min(index + 1, ayahs.length - 1)),
    previous: () => playIndex(Math.max(index - 1, 0)),
  };
}
