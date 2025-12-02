// Haversine formula to calculate distance in meters
export const getDistanceFromLatLonInM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 1000; // Distance in meters
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

// Interpolate between two points
export const interpolatePosition = (
  start: [number, number],
  end: [number, number],
  fraction: number
): [number, number] => {
  const lat = start[0] + (end[0] - start[0]) * fraction;
  const lng = start[1] + (end[1] - start[1]) * fraction;
  return [lat, lng];
};
