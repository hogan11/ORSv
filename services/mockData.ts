import { RouteData, Location } from '../types';

// Helper to jitter coordinates slightly
const jitter = (coord: number, amount: number = 0.002) => coord + (Math.random() - 0.5) * amount;

// --- DALLAS DATA ---
// Center near Downtown Dallas
const dallasCenter: [number, number] = [32.7767, -96.7970];

const dallasRoutePath: [number, number][] = [
  [32.7767, -96.7970],
  [32.7845, -96.8000],
  [32.7900, -96.8050], // Victory Park
  [32.8000, -96.8000], // Uptown
  [32.8050, -96.7900],
  [32.7950, -96.7800], // Deep Ellum
  [32.7850, -96.7800],
  [32.7767, -96.7970], // Loop close
];

const dallasCustomers: Location[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `c-dal-${i}`,
  name: `Client #${i + 1} (DAL)`,
  type: 'customer',
  lat: jitter(dallasRoutePath[i % dallasRoutePath.length][0], 0.005),
  lng: jitter(dallasRoutePath[i % dallasRoutePath.length][1], 0.005),
  revenue: Math.floor(Math.random() * 2000) + 1000,
  category: 'Retail'
}));

const dallasProspects: Location[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `p-dal-${i}`,
  name: `Prospect #${i + 1} (DAL)`,
  type: 'prospect',
  lat: jitter(dallasRoutePath[i % dallasRoutePath.length][0], 0.008),
  lng: jitter(dallasRoutePath[i % dallasRoutePath.length][1], 0.008),
  revenue: Math.floor(Math.random() * 3000) + 1500,
  category: ['Restaurant', 'Dispensary', 'Gas Station'][Math.floor(Math.random() * 3)]
}));

// --- PARIS DATA ---
// Center near Le Marais / Louvre
const parisCenter: [number, number] = [48.8566, 2.3522];

const parisRoutePath: [number, number][] = [
  [48.8566, 2.3522],
  [48.8606, 2.3376], // Louvre
  [48.8655, 2.3212], // Concorde
  [48.8710, 2.3300], // Opera
  [48.8700, 2.3500],
  [48.8600, 2.3600], // Marais
  [48.8530, 2.3580],
  [48.8566, 2.3522], // Loop close
];

const parisCustomers: Location[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `c-par-${i}`,
  name: `Client #${i + 1} (PAR)`,
  type: 'customer',
  lat: jitter(parisRoutePath[i % parisRoutePath.length][0], 0.004),
  lng: jitter(parisRoutePath[i % parisRoutePath.length][1], 0.004),
  revenue: Math.floor(Math.random() * 4000) + 2000,
  category: 'Luxury Retail'
}));

const parisProspects: Location[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `p-par-${i}`,
  name: `Prospect #${i + 1} (PAR)`,
  type: 'prospect',
  lat: jitter(parisRoutePath[i % parisRoutePath.length][0], 0.006),
  lng: jitter(parisRoutePath[i % parisRoutePath.length][1], 0.006),
  revenue: Math.floor(Math.random() * 5000) + 2000,
  category: ['Jeweler', 'Cafe', 'Tourist Shop'][Math.floor(Math.random() * 3)]
}));

export const CITIES: Record<string, RouteData> = {
  dallas: {
    cityId: 'dallas',
    center: dallasCenter,
    zoom: 13,
    path: dallasRoutePath,
    customers: dallasCustomers,
    prospects: dallasProspects,
  },
  paris: {
    cityId: 'paris',
    center: parisCenter,
    zoom: 13,
    path: parisRoutePath,
    customers: parisCustomers,
    prospects: parisProspects,
  }
};
