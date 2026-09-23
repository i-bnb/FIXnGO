/**
 * Calculates great-circle distance between two points on the Earth sphere (in Kilometers)
 * Matches PostGIS ST_DistanceSphere / 1000.0
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round((distance + Number.EPSILON) * 100) / 100;
}

/**
 * Estimates driving ETA in minutes based on distance in UAE traffic (avg 40 km/h urban speed)
 */
export function estimateEtaMinutes(distanceKm: number): number {
  const avgSpeedKmH = 40;
  const timeHours = distanceKm / avgSpeedKmH;
  const minutes = Math.ceil(timeHours * 60);
  return Math.max(5, minutes); // minimum 5 mins
}
