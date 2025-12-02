export type CityId = 'dallas' | 'paris';

export interface Location {
  id: string;
  name: string;
  type: 'customer' | 'prospect';
  lat: number;
  lng: number;
  revenue: number; // Monthly revenue (or estimated)
  category: string; // e.g., "Retail", "Restaurant"
}

export interface RouteData {
  cityId: CityId;
  center: [number, number];
  zoom: number;
  path: [number, number][];
  customers: Location[];
  prospects: Location[];
}

export interface SimulationConfig {
  costPerStop: number;
  pricePerStop: number;
  ringRadius: number; // in meters
  vehicleSpeed: number; // multiplier
}

export interface SimulationStats {
  totalCurrentRevenue: number;
  totalPotentialRevenue: number;
  capturedPotentialRevenue: number;
  stopsCount: number;
  prospectsInRing: number;
  distanceTraveled: number;
}
