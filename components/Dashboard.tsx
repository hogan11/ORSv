import React from 'react';
import { DollarSign, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StatsCard } from './StatsCard';
import { SimulationStats } from '../types';

interface DashboardProps {
    dynamicStats: SimulationStats;
    currentMargin: number;
    potentialMargin: number;
    chartData: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({
    dynamicStats,
    currentMargin,
    potentialMargin,
    chartData
}) => {
    return (
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
                                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="revenue" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                                <Bar dataKey="cost" stackId="b" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
