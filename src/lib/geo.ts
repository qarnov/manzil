import * as Location from 'expo-location';

/** Reverse-geocode to an Indian state name, used to pre-filter masjid lists. */
export async function detectState(): Promise<string | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    });

    // expo-location's own reverse geocoder avoids the extra network hop the
    // web prototype made to Nominatim.
    const [place] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    return place?.region ?? null;
  } catch {
    return null;
  }
}
