import * as Haptics from 'expo-haptics';
import { RotateCcw } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, TextInput, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Ellipse, G } from 'react-native-svg';

import { AppBar } from '../src/components/AppBar';
import { IconButton } from '../src/components/IconButton';
import { Screen } from '../src/components/Screen';
import { getJSON, KEYS, setJSON, useStorageJSON } from '../src/lib/storage';
import { Box, Text, useTheme } from '../src/theme/components';

const TOTAL = 100;
const IMAMA_INDEX = 49; // the divider bead on a real tasbih

const PRESETS = [
  { id: 'subhan', name: 'SubhanAllah' },
  { id: 'hamd', name: 'Alhamdulillah' },
  { id: 'akbar', name: 'Allahu Akbar' },
];

type TasbihState = {
  count: number;
  rounds: number;
  presetId: string;
  customName: string | null;
};

const DEFAULT_STATE: TasbihState = {
  count: 0,
  rounds: 0,
  presetId: 'subhan',
  customName: null,
};

export default function TasbihScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  // Unlike the web prototype, the count survives leaving the screen.
  const state = useStorageJSON<TasbihState>(KEYS.tasbih, DEFAULT_STATE);

  // Reads the freshest value at call time rather than closing over the render
  // snapshot — several taps can land before React re-renders, and a counter
  // must not drop any of them.
  const update = (next: (current: TasbihState) => Partial<TasbihState>) => {
    const current = getJSON<TasbihState>(KEYS.tasbih, DEFAULT_STATE);
    setJSON(KEYS.tasbih, { ...current, ...next(current) });
  };

  const [showCustom, setShowCustom] = useState(false);
  const [draft, setDraft] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const isCustom = state.presetId === 'custom';
  const dhikrName = isCustom
    ? (state.customName ?? 'Custom')
    : (PRESETS.find((p) => p.id === state.presetId)?.name ?? PRESETS[0].name);

  const size = Math.min(width - 48, 320);

  const beads = useMemo(() => {
    const c = size / 2;
    const r = c - 22;
    return Array.from({ length: TOTAL }, (_, i) => {
      const angle = (i * 2 * Math.PI) / TOTAL - Math.PI / 2;
      return { i, x: c + r * Math.cos(angle), y: c + r * Math.sin(angle) };
    });
  }, [size]);

  const tap = () => {
    update((current) => {
      // A finished round rests on TOTAL instead of snapping back to 0, so the
      // completed count stays on screen to be read (or screenshotted). The
      // next tap is what starts the following round.
      if (current.count >= TOTAL) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return { count: 0, rounds: current.rounds + 1 };
      }
      const next = current.count + 1;
      if (next === TOTAL) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      return { count: next };
    });
  };

  const selectPreset = (presetId: string) => update(() => ({ presetId, count: 0, rounds: 0 }));

  const startCustom = () => {
    const text = draft.trim();
    if (!text) return;
    setJSON(KEYS.tasbih, { count: 0, rounds: 0, presetId: 'custom', customName: text });
    setShowCustom(false);
    setDraft('');
  };

  const total = state.rounds * TOTAL + state.count;
  const rotation = (state.count * 360) / TOTAL;
  const complete = state.count >= TOTAL;

  return (
    <Screen>
      <AppBar title="Tasbih" subtitle={dhikrName} back />

      <Box alignItems="center" marginTop="s">
        <Pressable
          onPress={tap}
          accessibilityRole="button"
          accessibilityLabel={
            complete
              ? `Round complete, ${TOTAL} of ${TOTAL}. Tap to start the next round.`
              : `Count dhikr. ${state.count} of ${TOTAL}`
          }
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <Box width={size} height={size} alignItems="center" justifyContent="center">
            <Svg width={size} height={size} style={{ position: 'absolute' }}>
              {/* String */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={size / 2 - 22}
                fill="none"
                stroke={theme.colors.hairline}
                strokeWidth={1.5}
              />
              <G rotation={rotation} originX={size / 2} originY={size / 2}>
                {beads.map((b) => {
                  if (b.i === IMAMA_INDEX) {
                    return (
                      <Ellipse
                        key={b.i}
                        cx={b.x}
                        cy={b.y}
                        rx={4}
                        ry={10}
                        fill={theme.colors.accent}
                      />
                    );
                  }
                  const counted = b.i < state.count;
                  return (
                    <Circle
                      key={b.i}
                      cx={b.x}
                      cy={b.y}
                      r={b.i === 0 ? 6 : 4.5}
                      fill={counted ? theme.colors.accent : theme.colors.hairline}
                    />
                  );
                })}
              </G>
            </Svg>

            {/* Readout */}
            <Box
              width={size * 0.58}
              height={size * 0.58}
              borderRadius="full"
              backgroundColor="accentCircle"
              alignItems="center"
              justifyContent="center"
            >
              <Text variant="displayTime" fontSize={54} lineHeight={62}>
                {state.count}
              </Text>
              <Text variant="bodySecondary" fontSize={13}>
                of {TOTAL}
              </Text>
              <Text variant="bodySecondary" fontSize={12} marginTop="xxs">
                Round {state.rounds + 1} · {total} total
              </Text>
            </Box>
          </Box>
        </Pressable>

        <Text variant="bodySecondary" fontSize={13} marginTop="s">
          {complete ? 'Round complete · tap to start again' : 'Tap the ring to count'}
        </Text>
      </Box>

      {/* Dhikr presets */}
      <Box flexDirection="row" flexWrap="wrap" justifyContent="center" marginTop="l" paddingHorizontal="s">
        {PRESETS.map((p) => (
          <Chip
            key={p.id}
            label={p.name}
            selected={!isCustom && state.presetId === p.id}
            onPress={() => selectPreset(p.id)}
          />
        ))}
        <Chip
          label={isCustom && state.customName ? state.customName : 'Custom'}
          selected={isCustom}
          onPress={() => {
            setDraft(state.customName ?? '');
            setShowCustom(true);
          }}
        />
      </Box>

      {/* Reset */}
      <Box alignItems="center" marginTop="l">
        {confirmReset ? (
          <Box flexDirection="row" alignItems="center">
            <Text variant="label" marginRight="s">
              Reset count?
            </Text>
            <Pressable
              onPress={() => {
                update(() => ({ count: 0, rounds: 0 }));
                setConfirmReset(false);
              }}
              accessibilityRole="button"
              accessibilityLabel="Confirm reset"
              hitSlop={10}
              style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }}
            >
              <Text variant="labelMedium" color="accent">
                Reset
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setConfirmReset(false)}
              accessibilityRole="button"
              accessibilityLabel="Cancel reset"
              hitSlop={10}
              style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }}
            >
              <Text variant="label" color="textSecondary">
                Cancel
              </Text>
            </Pressable>
          </Box>
        ) : (
          <IconButton circle accessibilityLabel="Reset count" onPress={() => setConfirmReset(true)}>
            <RotateCcw size={18} color={theme.colors.textSecondary} strokeWidth={1.75} />
          </IconButton>
        )}
      </Box>

      {/* Custom dhikr */}
      <Modal
        visible={showCustom}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustom(false)}
      >
        <Pressable
          onPress={() => setShowCustom(false)}
          accessibilityLabel="Close"
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          {/* Claims the touch so taps inside the sheet don't reach the
              backdrop. A nested Pressable would work but nests two buttons. */}
          <View onStartShouldSetResponder={() => true}>
            <Box
              backgroundColor="surface"
              borderTopLeftRadius="xl"
              borderTopRightRadius="xl"
              padding="l"
              paddingBottom="xxl"
            >
              <Text variant="heading">Custom dhikr</Text>
              <TextInput
                value={draft}
                onChangeText={(t) => setDraft(t.slice(0, 200))}
                placeholder="Enter your dhikr"
                placeholderTextColor={theme.colors.textSecondary}
                accessibilityLabel="Custom dhikr text"
                multiline
                style={{
                  marginTop: theme.spacing.m,
                  backgroundColor: theme.colors.surfaceHighlight,
                  borderRadius: 12,
                  padding: theme.spacing.s,
                  minHeight: 88,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 15,
                  color: theme.colors.textPrimary,
                  textAlignVertical: 'top',
                }}
              />
              <Pressable
                onPress={startCustom}
                disabled={!draft.trim()}
                accessibilityRole="button"
                accessibilityLabel="Start counting this dhikr"
                style={({ pressed }) => ({
                  opacity: !draft.trim() ? 0.4 : pressed ? 0.6 : 1,
                  minHeight: 44,
                  justifyContent: 'center',
                })}
              >
                <Text variant="labelMedium" color="accent" marginTop="m">
                  Start counting
                </Text>
              </Pressable>
            </Box>
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, margin: 4 })}
    >
      <Box
        paddingHorizontal="s"
        minHeight={44}
        justifyContent="center"
        borderRadius="full"
        backgroundColor={selected ? 'accentSoftBg' : 'surface'}
      >
        <Text
          variant={selected ? 'labelMedium' : 'label'}
          fontSize={14}
          color={selected ? 'accentSoftText' : 'textSecondary'}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
