import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { MapDisplay } from './components/MapDisplay';
import { StatsCard } from './components/StatsCard';
import { CITIES } from './services/mockData';
import { interpolatePosition, getDistanceFromLatLonInM } from './services/simulationLogic';
import { CityId, SimulationConfig, SimulationStats, Location } from './types';
import { DollarSign, TrendingUp, Target, Truck, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function App() {
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

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Controls */}
      <ControlPanel 
        currentCity={currentCity}
        onCityChange={setCurrentCity}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={resetSimulation}
        config={config}
        onConfigChange={setConfig}
        progress={progress}
        visibleLayers={visibleLayers}
        onToggleLayer={handleToggleLayer}
        onImportData={handleImportData}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Top Floating Dashboard */}
        <div className="absolute top-0 left-0 right-0 z-[500] p-4 pointer-events-none">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 pointer-events-auto">
                <StatsCard 
                    title="Current Route Value" 
                    value={`$${dynamicStats.totalCurrentRevenue.toLocaleString()}`}
                    subValue={`${dynamicStats.stopsCount} Stops`}
                    icon={DollarSign}
                    color="text-blue-500"
                />
                 <StatsCard 
                    title="Identified Opportunity" 
                    value={`$${dynamicStats.capturedPotentialRevenue.toLocaleString()}`}
                    subValue={`${dynamicStats.prospectsInRing} Prospects nearby`}
                    icon={Target}
                    color="text-green-500"
                />
                 <StatsCard 
                    title="Potential Margin" 
                    value={`$${potentialMargin.toLocaleString()}`}
                    subValue={`vs Current: $${currentMargin.toLocaleString()}`}
                    icon={TrendingUp}
                    color="text-emerald-400"
                />
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-center">
                    <h3 className="text-slate-400 text-xs font-medium mb-1">Revenue vs Cost</h3>
                    <div className="h-16 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} 
                                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                                    cursor={{fill: 'transparent'}}
                                />
                                <Bar dataKey="revenue" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                                <Bar dataKey="cost" stackId="b" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative z-0">
            <MapDisplay 
                data={cityData}
                vehiclePosition={vehiclePosition}
                capturedProspects={capturedProspects}
                ringRadius={config.ringRadius}
                visibleLayers={visibleLayers}
                activeLocations={activeLocations}
            />
        </div>
      </div>
    </div>
  );
}