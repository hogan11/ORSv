import React from 'react';
import { ControlPanel } from './components/ControlPanel';
import { MapDisplay } from './components/MapDisplay';
import { Dashboard } from './components/Dashboard';
import { useSimulation } from './hooks/useSimulation';

export default function App() {
  const {
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
  } = useSimulation();

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
        <Dashboard
          dynamicStats={dynamicStats}
          currentMargin={currentMargin}
          potentialMargin={potentialMargin}
          chartData={chartData}
        />

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