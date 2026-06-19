const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

export interface NearbyRestaurant {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  distance_meters?: number;
  types: string[];
}

export async function getNearbyRestaurants(
  latitude: number,
  longitude: number,
  radius = 1000  // meters
): Promise<NearbyRestaurant[]> {
  const url = `https://places.googleapis.com/v1/places:searchNearby`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY!,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.types',
    },
    body: JSON.stringify({
      includedTypes: ['restaurant', 'cafe', 'food'],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius,
        },
      },
    }),
  });

  const data = await response.json();
  return (data.places || []).map((place: any) => ({
    place_id: place.id,
    name: place.displayName?.text || 'Unknown',
    address: place.formattedAddress || '',
    rating: place.rating,
    types: place.types || [],
  }));
}