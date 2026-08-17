import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { AppBar } from '../../src/components/AppBar';
import { Screen } from '../../src/components/Screen';
import { ErrorState, Loading } from '../../src/components/States';
import { useCompass } from '../../src/hooks/useCompass';
import { distanceToKaaba, headingDelta, qiblaBearing } from '../../src/lib/qibla';
import { Box, Card, Text, useTheme } from '../../src/theme/components';

/** Within this many degrees the needle is considered aligned. */
const ALIGNED_WITHIN = 5;

export default function QiblaScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const compass = useCompass();

  const dialSize = Math.min(width - 64, 300);

  const bearing = useMemo(
    () => (compass.coords ? qiblaBearing(compass.coords.lat, compass.coords.lng) : null),
    [compass.coords]
  );
  const distance = useMemo(
    () => (compass.coords ? distanceToKaaba(compass.coords.lat, compass.coords.lng) : null),
    [compass.coords]
  );

  // Where the needle should point on screen: the Qibla bearing rotated into
  // the device's own frame of reference.
  const delta = bearing != null && compass.heading != null ? headingDelta(compass.heading, bearing) : null;
  const aligned = delta != null && Math.abs(delta) <= ALIGNED_WITHIN;

  const needle = useSharedValue(0);
  const dial = useSharedValue(0);
  const unwrapped = useRef(0);

  useEffect(() => {
    if (delta == null) return;
    // Unwrap so the needle takes the short way round instead of spinning
    // through 359° when crossing north.
    const step = headingDelta(unwrapped.current, delta);
    unwrapped.current += step;
    needle.value = withTiming(unwrapped.current, { duration: 250 });
  }, [delta, needle]);

  useEffect(() => {
    if (compass.heading == null) return;
    dial.value = withTiming(-compass.heading, { duration: 250 });
  }, [compass.heading, dial]);

  // A single tap of feedback the moment the user lines up.
  const wasAligned = useRef(false);
  useEffect(() => {
    if (aligned && !wasAligned.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    wasAligned.current = aligned;
  }, [aligned]);

  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${needle.value}deg` }],
  }));
  const dialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dial.value}deg` }],
  }));

  return (
    <Screen>
      <AppBar title="Qibla" subtitle="Direction to the Kaaba" />

      {compass.status === 'requesting' || compass.status === 'idle' ? (
        <Loading label="Finding your location…" />
      ) : null}

      {compass.status === 'denied' ? (
        <ErrorState
          message="Manzil needs location access to work out the Qibla direction from where you are."
          onRetry={compass.retry}
        />
      ) : null}

      {compass.status === 'error' ? (
        <ErrorState message="Couldn’t read your location." onRetry={compass.retry} />
      ) : null}

      {compass.status === 'ready' && bearing != null ? (
        <>
          <Text variant="bodySecondary" textAlign="center" marginHorizontal="l" marginBottom="m">
            Hold your phone flat and turn slowly until the needle points up.
          </Text>

          <Box alignItems="center" justifyContent="center" marginVertical="m">
            <Box
              width={dialSize}
              height={dialSize}
              borderRadius="full"
              backgroundColor="surface"
              alignItems="center"
              justifyContent="center"
              style={{
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 3,
              }}
            >
              {/* Compass rose — counter-rotates so N tracks true north */}
              <Animated.View style={[{ position: 'absolute' }, dialStyle]}>
                <CompassRose size={dialSize} theme={theme} />
              </Animated.View>

              {/* Qibla needle */}
              <Animated.View style={[{ position: 'absolute' }, needleStyle]}>
                <QiblaNeedle size={dialSize} color={theme.colors.accent} dimmed={!aligned} />
              </Animated.View>

              <Box
                width={14}
                height={14}
                borderRadius="full"
                backgroundColor="accent"
                position="absolute"
              />
            </Box>
          </Box>

          <Box alignItems="center" marginBottom="l">
            <Text variant="displayTime">{Math.round(bearing)}°</Text>
            <Text variant="bodySecondary" marginTop="xxs">
              {aligned ? 'Facing the Qibla' : 'from true north'}
            </Text>
          </Box>

          {compass.accuracy != null && compass.accuracy < 2 ? (
            <Box
              backgroundColor="surfaceHighlight"
              borderRadius="m"
              marginHorizontal="m"
              marginBottom="m"
              padding="s"
            >
              <Text variant="bodySecondary" fontSize={13} textAlign="center">
                Compass accuracy is low. Move the phone in a figure-eight to calibrate.
              </Text>
            </Box>
          ) : null}

          <Card marginHorizontal="m" padding="l">
            <Text variant="overline">Your location</Text>
            <Text variant="label" marginTop="xxs">
              {compass.coords!.lat.toFixed(4)}° {compass.coords!.lat >= 0 ? 'N' : 'S'},{' '}
              {compass.coords!.lng.toFixed(4)}° {compass.coords!.lng >= 0 ? 'E' : 'W'}
            </Text>
            {distance != null ? (
              <>
                <Box height={1} backgroundColor="hairline" marginVertical="s" />
                <Text variant="overline">Distance to Makkah</Text>
                <Text variant="label" marginTop="xxs">
                  {distance.toLocaleString('en-IN')} km
                </Text>
              </>
            ) : null}
          </Card>

          {compass.heading == null ? (
            <Box marginHorizontal="m" marginTop="m">
              <Text variant="bodySecondary" fontSize={13} textAlign="center">
                No compass detected on this device. Face {Math.round(bearing)}° from north.
              </Text>
            </Box>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function CompassRose({ size, theme }: { size: number; theme: ReturnType<typeof useTheme> }) {
  const c = size / 2;
  const r = c - 18;
  const marks = Array.from({ length: 72 }, (_, i) => i * 5);

  return (
    <Svg width={size} height={size}>
      {marks.map((deg) => {
        const major = deg % 90 === 0;
        const mid = deg % 30 === 0;
        const len = major ? 12 : mid ? 8 : 4;
        const rad = ((deg - 90) * Math.PI) / 180;
        return (
          <Line
            key={deg}
            x1={c + (r - len) * Math.cos(rad)}
            y1={c + (r - len) * Math.sin(rad)}
            x2={c + r * Math.cos(rad)}
            y2={c + r * Math.sin(rad)}
            stroke={major ? theme.colors.textSecondary : theme.colors.hairline}
            strokeWidth={major ? 1.5 : 1}
            strokeLinecap="round"
          />
        );
      })}
      {(['N', 'E', 'S', 'W'] as const).map((label, i) => {
        const rad = ((i * 90 - 90) * Math.PI) / 180;
        const rr = r - 30;
        return (
          <SvgText
            key={label}
            x={c + rr * Math.cos(rad)}
            y={c + rr * Math.sin(rad) + 5}
            fontSize={14}
            fontFamily="Inter_500Medium"
            fill={label === 'N' ? theme.colors.textPrimary : theme.colors.textSecondary}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

function QiblaNeedle({
  size,
  color,
  dimmed,
}: {
  size: number;
  color: string;
  dimmed: boolean;
}) {
  const c = size / 2;
  const tip = 34;

  return (
    <Svg width={size} height={size} opacity={dimmed ? 0.55 : 1}>
      <G>
        {/* Shaft */}
        <Line
          x1={c}
          y1={c}
          x2={c}
          y2={tip + 18}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* Arrowhead */}
        <Path
          d={`M ${c} ${tip} L ${c - 9} ${tip + 20} L ${c} ${tip + 15} L ${c + 9} ${tip + 20} Z`}
          fill={color}
        />
        {/* Kaaba marker */}
        <Circle cx={c} cy={tip - 12} r={7} stroke={color} strokeWidth={1.75} fill="none" />
      </G>
    </Svg>
  );
}
