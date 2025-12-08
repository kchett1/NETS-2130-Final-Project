import type { Truck } from "@/data/trucks";

const GOOGLE_MAPS_BASE = "https://www.google.com/maps/search/";

export const PENN_CAMPUS_BOUNDING_BOX = {
  north: 39.9605,
  south: 39.9465,
  east: -75.182,
  west: -75.2085,
};

export const CAMPUS_CENTER = {
  lat: 39.9522,
  lng: -75.1932,
};

export function buildGoogleMapsUrl(truck: Pick<Truck, "lat" | "lng" | "name">) {
  const query = encodeURIComponent(
    `${truck.lat},${truck.lng} (${truck.name ?? "Food truck"})`,
  );
  return `${GOOGLE_MAPS_BASE}?api=1&query=${query}`;
}

export function isWithinPennCampus(lat: number, lng: number): boolean {
  const { north, south, east, west } = PENN_CAMPUS_BOUNDING_BOX;
  return lat <= north && lat >= south && lng <= east && lng >= west;
}

