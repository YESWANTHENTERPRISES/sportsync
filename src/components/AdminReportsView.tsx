import React from 'react';
import { BarChart3, Download, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Booking } from '../utils/mockDb';

interface AdminReportsProps {
  onExportCsv: () => void;
  bookings: Booking[];
}

const getReportsData = (bookings: Booking[]) => {
  const sportCounts: Record<string, number> = {
    Badminton: 0,
    Cricket: 0,
    Basketball: 0,
    Football: 0,
    Tennis: 0,
    'Volley Ball': 0,
    'Table Tennis': 0,
    Shuttlecock: 0,
    Handball: 0,
    Chess: 0,
    Carrom: 0,
    'Throw Ball': 0
  };
  bookings.forEach(b => {
    if (sportCounts[b.sportType] !== undefined && b.status === 'Confirmed') {
      sportCounts[b.sportType]++;
    }
  });

  const trendCounts: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    trendCounts[dateStr] = 0;
  }
  bookings.forEach(b => {
    if (trendCounts[b.date] !== undefined && b.status === 'Confirmed') {
      trendCounts[b.date]++;
    }
  });

  const TIME_SLOTS = [
    { start: '06:00', end: '07:30' },
    { start: '07:30', end: '09:00' },
    { start: '09:00', end: '10:30' },
    { start: '10:30', end: '12:00' },
    { start: '12:00', end: '13:30' },
    { start: '13:30', end: '15:00' },
    { start: '15:00', end: '16:30' },
    { start: '16:30', end: '18:00' },
    { start: '18:00', end: '19:30' }
  ];

  const peakMatrix: Record<string, number[]> = {
    Badminton: Array(9).fill(0),
    Cricket: Array(9).fill(0),
    Basketball: Array(9).fill(0),
    Football: Array(9).fill(0),
    Tennis: Array(9).fill(0),
    'Volley Ball': Array(9).fill(0),
    'Table Tennis': Array(9).fill(0),
    Shuttlecock: Array(9).fill(0),
    Handball: Array(9).fill(0),
    Chess: Array(9).fill(0),
    Carrom: Array(9).fill(0),
    'Throw Ball': Array(9).fill(0)
  };

  bookings.forEach(b => {
    if (peakMatrix[b.sportType]) {
      const slotIdx = TIME_SLOTS.findIndex(s => s.start === b.startTime);
      if (slotIdx !== -1 && b.status === 'Confirmed') {
        peakMatrix[b.sportType][slotIdx] += 1;
      }
    }
  });

  return {
    sportCounts,
    trendCounts,
    peakMatrix
  };
};

export const AdminReportsView: React.FC<AdminReportsProps> = ({
  onExportCsv,
  bookings
}) => {
  const reportsData = getReportsData(bookings);

  // 1. Sport Booking Counts (Bar Chart Data)
  const sports = Object.keys(reportsData.sportCounts);
  const maxSportCount = Math.max(...Object.values(reportsData.sportCounts), 1);

  // 2. Trend Booking Counts (Line Chart Data)
  const dates = Object.keys(reportsData.trendCounts).sort();
  const trendValues = dates.map(d => reportsData.trendCounts[d]);
  const maxTrendValue = Math.max(...trendValues, 1);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Reports Header */}
      <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Analytics Reports Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregate reports for slot occupancy, daily trends, and booking density across campus sports complex.
          </p>
        </div>
        <button
          onClick={onExportCsv}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2 shadow"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Report 1: Bookings per Sport (Bar Chart) */}
        <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-white text-base">Slots Booked per Sport Category</h3>
            <p className="text-xs text-slate-450">Cumulative bookings representing student sport preferences</p>
          </div>

          <div className="space-y-3 pt-2">
            {sports.map(sport => {
              const count = reportsData.sportCounts[sport];
              const pct = Math.round((count / maxSportCount) * 100);
              return (
                <div key={sport} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">{sport}</span>
                    <span className="text-white font-mono font-bold">{count} bookings</span>
                  </div>
                  <div className="h-5 w-full bg-slate-950 rounded border border-slate-850 flex items-center overflow-hidden">
                    <div 
                      style={{ width: `${pct || 4}%` }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-r shadow-inner transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Report 2: Daily Booking Trend (Line Chart) */}
        <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-white text-base">7-Day Booking Trend Activity</h3>
            <p className="text-xs text-slate-450">Active daily slot pre-bookings volume</p>
          </div>

          {/* SVG Line Chart Visualization */}
          <div className="h-44 w-full bg-slate-950 border border-slate-850 rounded-xl relative pt-6 px-4 flex items-end">
            <svg className="absolute inset-0 w-full h-full p-6 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="#1E2640" strokeWidth="0.5" strokeDasharray="2" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#1E2640" strokeWidth="0.5" strokeDasharray="2" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="#1E2640" strokeWidth="0.5" strokeDasharray="2" />
              
              {/* Chart Line Path */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={
                  dates.map((d, index) => {
                    const x = (index / (dates.length - 1)) * 100;
                    const y = 90 - ((reportsData.trendCounts[d] / maxTrendValue) * 75);
                    return `${x},${y}`;
                  }).join(' ')
                }
              />

              {/* Data points */}
              {dates.map((d, index) => {
                const x = (index / (dates.length - 1)) * 100;
                const y = 90 - ((reportsData.trendCounts[d] / maxTrendValue) * 75);
                return (
                  <circle 
                    key={d}
                    cx={x} 
                    cy={y} 
                    r="2.5" 
                    fill="#3b82f6" 
                    stroke="#1E2640" 
                    strokeWidth="1"
                    className="hover:scale-125 hover:fill-white cursor-pointer transition duration-300"
                  />
                );
              })}
            </svg>

            {/* Date Labels below */}
            <div className="w-full flex justify-between text-[9px] font-mono text-slate-450 z-10 pb-1">
              {dates.map(d => {
                const parts = d.split('-');
                return <span key={d}>{parts[2]}/{parts[1]}</span>;
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-850 rounded-xl text-[11px] text-slate-400">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Highest active volume recorded: <strong className="text-white">{maxTrendValue} bookings/day</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
};
