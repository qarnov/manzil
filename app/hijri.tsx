import { useMemo } from 'react';

import { AppBar } from '../src/components/AppBar';
import { Screen } from '../src/components/Screen';
import {
  getHijriMonthGrid,
  getHijriToday,
  hijriMonthNumber,
  monthNameOf,
  OBSERVANCES,
} from '../src/lib/hijri';
import { Box, Card, Text } from '../src/theme/components';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function HijriScreen() {
  const { today, grid, monthNum } = useMemo(() => {
    const now = new Date();
    return {
      today: getHijriToday(now),
      grid: getHijriMonthGrid(now),
      monthNum: hijriMonthNumber(now),
    };
  }, []);

  const cells: (number | null)[] = Array.from(
    { length: grid.offset + grid.daysInMonth },
    (_, i) => (i < grid.offset ? null : i - grid.offset + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const thisMonth = OBSERVANCES.filter((o) => o.month === monthNum);
  const nextMonth = OBSERVANCES.filter((o) => o.month === (monthNum % 12) + 1);
  const upcoming = [...thisMonth, ...nextMonth].slice(0, 4);

  return (
    <Screen>
      <AppBar title="Hijri calendar" subtitle={today.gregorian} back />

      {/* Today */}
      <Card marginHorizontal="m" padding="l">
        <Text variant="overline">Today</Text>
        <Text variant="displayTime" fontSize={28} marginTop="xxs">
          {today.day} {today.monthName} {today.year}
        </Text>
        <Text variant="arabicSmall" fontSize={20} marginTop="xs">
          {today.arabicMonth}
        </Text>
        {!today.exact ? (
          <Text variant="bodySecondary" fontSize={12} marginTop="s">
            Calculated arithmetically — may differ by a day from local moon sighting.
          </Text>
        ) : null}
      </Card>

      {/* Month grid */}
      <Card marginHorizontal="m" marginTop="m" padding="l">
        <Text variant="overline" textAlign="center">
          {today.monthName} {today.year} AH
        </Text>

        <Box flexDirection="row" marginTop="m">
          {WEEKDAYS.map((d) => (
            <Box key={d} flex={1} alignItems="center">
              <Text variant="bodySecondary" fontSize={12}>
                {d}
              </Text>
            </Box>
          ))}
        </Box>

        <Box flexDirection="row" flexWrap="wrap" marginTop="xs">
          {cells.map((c, i) => {
            const isToday = c === today.day;
            return (
              <Box
                key={i}
                width="14.28%"
                aspectRatio={1}
                alignItems="center"
                justifyContent="center"
              >
                <Box
                  width={34}
                  height={34}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={isToday ? 'accentSoftBg' : 'transparent'}
                >
                  <Text
                    variant={isToday ? 'labelMedium' : 'label'}
                    fontSize={14}
                    color={isToday ? 'accentSoftText' : 'textPrimary'}
                  >
                    {c ?? ''}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Card>

      {upcoming.length > 0 ? (
        <>
          <Text variant="heading" marginHorizontal="m" marginTop="xl" marginBottom="xs">
            Observances
          </Text>
          <Box marginHorizontal="xs">
            {upcoming.map((o, i) => (
              <Box
                key={`${o.month}-${o.day}-${i}`}
                paddingHorizontal="s"
                paddingVertical="s"
                minHeight={56}
                justifyContent="center"
                borderRadius="m"
                backgroundColor={o.highlight ? 'surfaceHighlight' : 'transparent'}
              >
                <Text variant={o.highlight ? 'labelMedium' : 'label'}>{o.name}</Text>
                <Text variant="bodySecondary" fontSize={13} marginTop="xxs">
                  {o.day} {monthNameOf(o.month)}
                  {o.note ? ` · ${o.note}` : ''}
                </Text>
              </Box>
            ))}
          </Box>
        </>
      ) : null}
    </Screen>
  );
}
