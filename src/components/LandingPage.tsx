import React from 'react';
import { Play, Award, Calendar, CheckSquare } from 'lucide-react';
import { SportFacility } from '../utils/mockDb';

interface LandingPageProps {
  facilities: SportFacility[];
  onNavigate: (page: string) => void;
  totalBookings: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  facilities,
  onNavigate,
  totalBookings
}) => {
  const sportCounts = facilities.reduce((acc, f) => {
    acc[f.sportType] = (acc[f.sportType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-12 pb-12 animate-fade-in">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-[#1E2640] to-slate-950 border border-slate-800 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="space-y-6 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs text-blue-400 font-semibold font-mono">
            ⚡ VIT CHENNAI SPORTS COMPLEX
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight text-white">
            Pre-Book Your Slots, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Skip The Long Queues
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-lg leading-relaxed">
            Pre-book courts, fields, and lanes at VIT Chennai's premium sports arenas. 
            Real-time conflict checks, automated waitlists, and live weather alerts.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => onNavigate('facilities')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-sm transition shadow-lg shadow-blue-500/25 flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" /> Browse Sports
            </button>
            <button 
              onClick={() => onNavigate('my-bookings')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-heading font-semibold text-sm transition active:scale-95"
            >
              View My Bookings
            </button>
          </div>
        </div>

        {/* Hero Visual KPI */}
        <div className="w-full md:w-80 shrink-0 bg-slate-950/70 border border-slate-800 rounded-2xl p-6 space-y-4 relative z-10 backdrop-blur-sm">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500">Live Campus Stats</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#1E2640] rounded-xl border border-slate-800">
              <div className="text-2xl font-bold text-white font-mono">6</div>
              <div className="text-[10px] text-slate-400">Active Sports</div>
            </div>
            <div className="p-3 bg-[#1E2640] rounded-xl border border-slate-800">
              <div className="text-2xl font-bold text-blue-400 font-mono">{facilities.length}</div>
              <div className="text-[10px] text-slate-400">Total Facilities</div>
            </div>
            <div className="p-3 bg-[#1E2640] rounded-xl border border-slate-800">
              <div className="text-2xl font-bold text-emerald-400 font-mono">99.8%</div>
              <div className="text-[10px] text-slate-400">Court Uptime</div>
            </div>
            <div className="p-3 bg-[#1E2640] rounded-xl border border-slate-800">
              <div className="text-2xl font-bold text-indigo-400 font-mono">{totalBookings + 42}</div>
              <div className="text-[10px] text-slate-400">Bookings Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sports Categories Grid */}
      <div className="space-y-4">
        <h2 className="text-xl md:text-2xl font-heading font-bold text-white">Supported Sports & Facilities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Badminton', icon: '🏸', bg: 'from-emerald-500/20 to-teal-500/10' },
            { name: 'Cricket', icon: '🏏', bg: 'from-amber-500/20 to-yellow-500/10' },
            { name: 'Basketball', icon: '🏀', bg: 'from-orange-500/20 to-red-500/10' },
            { name: 'Football', icon: '⚽', bg: 'from-blue-500/20 to-indigo-500/10' },
            { name: 'Tennis', icon: '🎾', bg: 'from-lime-500/20 to-green-500/10' },
            { name: 'Volley Ball', icon: '🏐', bg: 'from-pink-500/20 to-rose-500/10' },
            { name: 'Table Tennis', icon: '🏓', bg: 'from-fuchsia-500/20 to-purple-500/10' },
            { name: 'Shuttlecock', icon: '🏸', bg: 'from-teal-500/20 to-emerald-500/10' },
            { name: 'Handball', icon: '🤾', bg: 'from-amber-600/20 to-orange-600/10' },
            { name: 'Chess', icon: '♟️', bg: 'from-zinc-500/20 to-neutral-500/10' },
            { name: 'Carrom', icon: '🎯', bg: 'from-red-400/20 to-amber-400/10' },
            { name: 'Throw Ball', icon: '🏐', bg: 'from-violet-500/20 to-purple-500/10' },
          ].map(sport => (
            <div 
              key={sport.name}
              onClick={() => onNavigate('facilities')}
              className={`p-6 rounded-2xl bg-gradient-to-b ${sport.bg} border border-slate-800 hover:border-slate-700 transition cursor-pointer flex flex-col items-center justify-center gap-3 text-center group`}
            >
              <span className="text-3xl group-hover:scale-110 transition duration-300">{sport.icon}</span>
              <div>
                <div className="font-heading font-bold text-white text-sm">{sport.name}</div>
                <div className="text-[10px] text-slate-450 mt-0.5">
                  {sportCounts[sport.name as any] || 0} Facilities
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-[#1E2640]/55 border border-slate-850 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-heading font-bold text-white text-center">How Pre-Booking Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-heading font-bold">1</div>
            <div>
              <h3 className="font-heading font-bold text-white text-sm">Select Sport & Facility</h3>
              <p className="text-xs text-slate-400 mt-1">Browse the indoor courts or outdoor turf fields available on campus.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-heading font-bold">2</div>
            <div>
              <h3 className="font-heading font-bold text-white text-sm">Pick Date & Time Slot</h3>
              <p className="text-xs text-slate-400 mt-1">View the live availability calendar and reserve your 1-hour session.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-heading font-bold">3</div>
            <div>
              <h3 className="font-heading font-bold text-white text-sm">Get QR Code & Check In</h3>
              <p className="text-xs text-slate-400 mt-1">Get your instant digital pass. Present the QR code at the facility to check in.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
