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
      <div 
        className="relative rounded-3xl overflow-hidden border border-slate-800 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/sports_hero_bg.png)' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="space-y-6 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs text-blue-400 font-semibold font-mono">
            ⚡ VIT CHENNAI SPORTS COMPLEX
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold leading-tight text-[#0B224E]" style={{ color: '#0B224E' }}>
            Pre-Book Your Slots, <br />
            <span className="italic font-normal font-serif text-[#0B224E]" style={{ color: '#0B224E' }}>
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
        <h2 className="text-xl md:text-2xl font-heading font-bold text-white" style={{ color: '#ffffff' }}>Supported Sports & Facilities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Badminton', icon: '🏸', bg: 'from-emerald-500 to-teal-400', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400' },
            { name: 'Cricket', icon: '🏏', bg: 'from-amber-500 to-yellow-400', image: '/cricket.png' },
            { name: 'Basketball', icon: '🏀', bg: 'from-orange-500 to-red-400', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=400' },
            { name: 'Football', icon: '⚽', bg: 'from-blue-500 to-indigo-400', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=400' },
            { name: 'Tennis', icon: '🎾', bg: 'from-lime-500 to-green-400', image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400' },
            { name: 'Volley Ball', icon: '🏐', bg: 'from-pink-500 to-rose-400', image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=400' },
            { name: 'Table Tennis', icon: '🏓', bg: 'from-fuchsia-500 to-purple-400', image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=400' },
            { name: 'Shuttlecock', icon: '🏸', bg: 'from-teal-500 to-emerald-400', image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=400' },
            { name: 'Handball', icon: '🤾', bg: 'from-amber-600 to-orange-500', image: '/handball.png' },
            { name: 'Chess', icon: '♟️', bg: 'from-zinc-500 to-neutral-400', image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=400' },
            { name: 'Carrom', icon: '🎯', bg: 'from-red-400 to-amber-300', image: '/carrom.png' },
            { name: 'Throw Ball', icon: '🏐', bg: 'from-violet-500 to-purple-450', image: '/throwball.png' },
          ].map(sport => (
            <div 
              key={sport.name}
              onClick={() => onNavigate('facilities')}
              className="relative overflow-hidden h-32 rounded-2xl border border-slate-800/80 hover:border-blue-500/50 transition duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 text-center group shadow-md"
            >
              {/* Background Image */}
              <img 
                src={sport.image} 
                alt={sport.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500 filter brightness-90"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-black/50 group-hover:from-black/25 group-hover:via-black/20 group-hover:to-black/40 transition duration-300" />
              
              {/* Colored bottom glow indicator */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${sport.bg} opacity-80`} />

              {/* Content */}
              <span className="text-2xl relative z-10 group-hover:scale-110 transition duration-300 drop-shadow-md">
                {sport.icon}
              </span>
              <div className="relative z-10">
                <div className="font-heading font-bold text-sm tracking-wide drop-shadow-sm" style={{ color: '#ffffff' }}>{sport.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#ffffff', opacity: 0.8 }}>
                  {sportCounts[sport.name as any] || 0} {sportCounts[sport.name as any] === 1 ? 'Facility' : 'Facilities'}
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
