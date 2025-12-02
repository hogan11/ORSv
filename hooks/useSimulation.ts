import { useState, useEffect, useRef, useMemo } from 'react';
import { CITIES } from '../services/mockData';
import { interpolatePosition, getDistanceFromLatLonInM } from '../services/simulationLogic';
import { CityId, SimulationConfig, SimulationStats, Location } from '../types';

export const useSimulation = () => {
  // State
  const [currentCity, setCurrentCity] = useState<CityId>('dallas');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [vehiclePosition, setVehiclePosition] = useState<[number, number]>(CITIES['dallas'].path[0]);
  const [capturedProspects, setCapturedProspects] = useState<Set<string>>(new Set());
  
  // Dynamic Locations State (allows for imports)
  const [activeLocations, setActiveLocations] = useState<Location[]>([]);

  // Layer Visibility State
  const [visibleLayers, setVisibleLayers] = useState({ customers: true, prospects: true });
  
  // Config
  const [config, setConfig] = useState<SimulationConfig>({
    costPerStop: 35,
    pricePerStop: 120,
    ringRadius: 250,
    vehicleSpeed: 5,
  });

  // Refs for animation loop
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  // Initialize locations when city changes
  useEffect(() => {
    const cityData = CITIES[currentCity];
    const combinedLocations = [...cityData.customers, ...cityData.prospects];
    setActiveLocations(combinedLocations);
    setVehiclePosition(cityData.path[0]);
    setCapturedProspects(new Set());
    setProgress(0);
    setIsPlaying(false);
  }, [currentCity]);

  // Derived Data
  const cityData = CITIES[currentCity];
  const customers = activeLocations.filter(l => l.type === 'customer');
  const prospects = activeLocations.filter(l => l.type === 'prospect');
  
  // Calculate Base Stats (Static)
  const totalStops = customers.length;
  const currentBaseRevenue = customers.reduce((acc, c) => acc + c.revenue, 0);

  // Calculate Dynamic Stats (Based on simulation)
  const dynamicStats: SimulationStats = useMemo(() => {
    // Current Revenue is constant for existing customers
    const totalCurrentRevenue = currentBaseRevenue; 
    
    // Captured Potential Revenue
    let capturedRevenue = 0;
    let prospectsCount = 0;
    
    prospects.forEach(p => {
        if (capturedProspects.has(p.id)) {
            capturedRevenue += p.revenue;
            prospectsCount++;
        }
    });

    const routeDistance = 0; // Simplified for MVP

    return {
        totalCurrentRevenue,
        totalPotentialRevenue: capturedRevenue,
        capturedPotentialRevenue: capturedRevenue,
        stopsCount: totalStops,
        prospectsInRing: prospectsCount,
        distanceTraveled: routeDistance
    };
  }, [currentBaseRevenue, prospects, capturedProspects, totalStops]);

  // Derived Financials
  const totalCost = config.costPerStop * (dynamicStats.stopsCount + dynamicStats.prospectsInRing); 
  // Assumption: If we captured them, we stop there.
  
  const currentMargin = dynamicStats.totalCurrentRevenue - (config.costPerStop * dynamicStats.stopsCount);
  const potentialMargin = (dynamicStats.totalCurrentRevenue + dynamicStats.capturedPotentialRevenue) - totalCost;

  // Chart Data
  const chartData = [
    { name: 'Current', revenue: dynamicStats.totalCurrentRevenue, cost: config.costPerStop * dynamicStats.stopsCount },
    { name: 'Optimized', revenue: dynamicStats.totalCurrentRevenue + dynamicStats.capturedPotentialRevenue, cost: totalCost },
  ];

  // Simulation Loop
  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      
      // Calculate speed factor. Base loop takes 20 seconds at 1x.
      const loopDuration = 20000 / config.vehicleSpeed; 
      
      setProgress((prev) => {
        let next = prev + (deltaTime / loopDuration) * 100;
        if (next >= 100) {
            setIsPlaying(false);
            return 100;
        }
        return next;
      });
    }
    lastTimeRef.current = time;
    if (isPlaying) {
        requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = undefined;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, config.vehicleSpeed]);

  // Update Vehicle Position & Check Rings based on Progress
  useEffect(() => {
    const path = cityData.path;
    const totalSegments = path.length; // It's a loop
    // Progress is 0-100. Map to total path indices.
    
    const decimalIndex = (progress / 100) * (totalSegments);
    const currentIndex = Math.floor(decimalIndex) % totalSegments;
    const nextIndex = (currentIndex + 1) % totalSegments;
    const segmentFraction = decimalIndex - Math.floor(decimalIndex);
    
    // Interpolate
    const currentPos = path[currentIndex];
    const nextPos = path[nextIndex];
    
    if (currentPos && nextPos) {
        const newPos = interpolatePosition(currentPos, nextPos, segmentFraction);
        setVehiclePosition(newPos);

        // Check for prospects in ring
        const newCaptured = new Set(capturedProspects);
        let changed = false;
        
        prospects.forEach(p => {
            if (!newCaptured.has(p.id)) {
                const dist = getDistanceFromLatLonInM(newPos[0], newPos[1], p.lat, p.lng);
                if (dist <= config.ringRadius) {
                    newCaptured.add(p.id);
                    changed = true;
                }
            }
        });

        if (changed) {
            setCapturedProspects(newCaptured);
        }
    }
    
    if (progress >= 100) setIsPlaying(false);

  }, [progress, cityData, config.ringRadius, prospects]);

  // Handlers
  const handleToggleLayer = (layer: 'customers' | 'prospects') => {
    setVisibleLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleImportData = () => {
    // Simulate importing data from Google Maps
    // We'll generate 5 new prospects near the route center
    const center = cityData.center;
    const newProspects: Location[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `imported-${Date.now()}-${i}`,
      name: `GMB Lead #${i + 1}`,
      type: 'prospect',
      lat: center[0] + (Math.random() - 0.5) * 0.02,
      lng: center[1] + (Math.random() - 0.5) * 0.02,
      revenue: Math.floor(Math.random() * 5000) + 3000, // High value leads
      category: 'Imported Business'
    }));

    setActiveLocations(prev => [...prev, ...newProspects]);
    alert(`Successfully imported ${newProspects.length} business locations from Google Maps.`);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setProgress(0);
    setCapturedProspects(new Set());
    setVehiclePosition(cityData.path[0]);
  };

  return {
    currentCity,
    setCurrentCity,
    isPlaying,
    setIsPlaying,
    progress,
    vehiclePosition,
    capturedProspects,
    activeLocations,
    visibleLayers,
    config,
    setConfig,
    dynamicStats,
    currentMargin,
    potentialMargin,
    chartData,
    cityData,
    handleToggleLayer,
    handleImportData,
    resetSimulation
  };
};
