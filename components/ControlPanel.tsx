import React from 'react';
import { Play, Pause, RotateCcw, Settings, Map as MapIcon, DollarSign, Activity, Layers, Download, Plus } from 'lucide-react';
import { CityId, SimulationConfig } from '../types';

interface ControlPanelProps {
  currentCity: CityId;
  onCityChange: (city: CityId) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  config: SimulationConfig;
  onConfigChange: (newConfig: SimulationConfig) => void;
  progress: number;
  visibleLayers: { customers: boolean; prospects: boolean };
  onToggleLayer: (layer: 'customers' | 'prospects') => void;
  onImportData: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  currentCity,
  onCityChange,
  isPlaying,
  onTogglePlay,
  onReset,
  config,
  onConfigChange,
  progress,
  visibleLayers,
  onToggleLayer,
  onImportData
}) => {
  return (
    <div className="w-full lg:w-80 bg-slate-950 border-r border-slate-800 flex flex-col h-full overflow-y-auto z-10 relative shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="text-blue-500" />
          ORS <span className="text-slate-500 font-normal text-sm">v1.1</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Opportunity Rings Simulator</p>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {/* City Selection */}
        <section>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
            Select Territory
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onCityChange('dallas')}
              className={`p-3 rounded-lg text-sm font-medium border transition-all ${
                currentCity === 'dallas'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              Dallas, TX
            </button>
            <button
              onClick={() => onCityChange('paris')}
              className={`p-3 rounded-lg text-sm font-medium border transition-all ${
                currentCity === 'paris'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              Paris, FR
            </button>
          </div>
        </section>

        {/* Map Layers & Import */}
        <section>
          <div className="flex items-center justify-between mb-3">
             <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Map Layers
            </label>
          </div>
         
          <div className="space-y-2 bg-slate-900/30 p-3 rounded-lg border border-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Current Customers
              </span>
              <button 
                onClick={() => onToggleLayer('customers')}
                className={`w-10 h-5 rounded-full relative transition-colors ${visibleLayers.customers ? 'bg-blue-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${visibleLayers.customers ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Prospects
              </span>
              <button 
                onClick={() => onToggleLayer('prospects')}
                className={`w-10 h-5 rounded-full relative transition-colors ${visibleLayers.prospects ? 'bg-green-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${visibleLayers.prospects ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          <button 
            onClick={onImportData}
            className="mt-3 w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={14} />
            Import Google Business Data
          </button>
        </section>

        {/* Playback Controls */}
        <section>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">
            Simulation Control
          </label>
          <div className="flex gap-2 mb-4">
            <button
              onClick={onTogglePlay}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg font-bold text-sm transition-colors ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Start Route'}
            </button>
            <button
              onClick={onReset}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-blue-500 h-full transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Depot</span>
            <span>Route Complete</span>
          </div>
        </section>

        {/* Configuration */}
        <section className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
          <div className="flex items-center gap-2 mb-4 text-slate-200">
            <Settings size={16} />
            <h3 className="font-semibold text-sm">Operational Params</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Cost Per Stop</span>
                <span className="text-white font-mono">${config.costPerStop}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={config.costPerStop}
                onChange={(e) => onConfigChange({ ...config, costPerStop: Number(e.target.value) })}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Price Per Stop</span>
                <span className="text-white font-mono">${config.pricePerStop}</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={config.pricePerStop}
                onChange={(e) => onConfigChange({ ...config, pricePerStop: Number(e.target.value) })}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Opportunity Ring Radius</span>
                <span className="text-white font-mono">{config.ringRadius}m</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={config.ringRadius}
                onChange={(e) => onConfigChange({ ...config, ringRadius: Number(e.target.value) })}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
             <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Sim Speed</span>
                <span className="text-white font-mono">{config.vehicleSpeed}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={config.vehicleSpeed}
                onChange={(e) => onConfigChange({ ...config, vehicleSpeed: Number(e.target.value) })}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-600">
        Built for Brink's Commercial Excellence
      </div>
    </div>
  );
};