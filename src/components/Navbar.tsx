import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Bell, 
  ChevronDown, 
  User, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { UserProfile, SportFacility } from '../utils/mockDb';

interface NavbarProps {
  currentUser: UserProfile;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (page: string) => void;
  facilities?: SportFacility[];
  onSelectFacility?: (facility: SportFacility) => void;
  weatherAdvisory?: string;
  notifications: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  searchQuery,
  onSearchChange,
  onNavigate,
  facilities = [],
  onSelectFacility,
  weatherAdvisory,
  notifications
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = facilities.filter(fac => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return false;
    return fac.name.toLowerCase().includes(q) ||
           fac.sportType.toLowerCase().includes(q) ||
           fac.location.toLowerCase().includes(q) ||
           fac.courtNumber.toLowerCase().includes(q);
  }).slice(0, 5);

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0A0F1E]/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6">
      {/* Left Branding + Profile Selector */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('landing')}>
          <img src="/logo.png" alt="SportSync Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-blue-500/10" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-lg tracking-tight text-white">
                SportSync
              </span>
              <span className="font-heading font-semibold text-lg text-blue-400">
                VIT
              </span>
            </div>
            <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-medium">
              Sports Slot Pre-Booking
            </span>
          </div>
        </div>

        {/* Profile Info & Logout */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-850 border border-slate-700/60 text-xs text-slate-200 transition"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-white max-w-[180px] truncate">
              {currentUser.name} ({currentUser.role})
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-[#1E2640] border border-slate-700 rounded-xl shadow-2xl z-50 py-3 px-4 space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">{currentUser.collegeId}</div>
                <div className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-1">
                  Role: {currentUser.role}
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                className="w-full py-2 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/55 text-red-400 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                Log Out Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle Search Bar with Dropdown */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative" ref={searchRef}>
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Search sports facilities, outdoor fields, slot availability..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/65 focus:ring-1 focus:ring-blue-500/30 transition"
          />
          {searchQuery && (
            <button 
              onClick={() => {
                onSearchChange('');
                setShowSearchResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
            >
              ✕
            </button>
          )}

          {/* Search Dropdown Results */}
          {showSearchResults && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-[#1E2640] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex justify-between items-center">
                <span>Matching Facilities ("{searchQuery}")</span>
                <span className="text-blue-400">{searchResults.length} Found</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-mono">
                  No matching facilities found. Try searching "Badminton", "Cricket", or "Indoor".
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
                  {searchResults.map(fac => (
                    <div
                      key={fac.id}
                      onClick={() => {
                        if (onSelectFacility) {
                          onSelectFacility(fac);
                        } else {
                          onNavigate('facilities');
                        }
                        setShowSearchResults(false);
                      }}
                      className="p-3 hover:bg-slate-800/70 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white group-hover:text-blue-400 transition flex items-center gap-2">
                          {fac.name}
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {fac.sportType}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {fac.location} • {fac.courtNumber}
                        </div>
                      </div>
                      <span className="text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition flex items-center gap-1">
                        Book <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Indicators & Notifications */}
      <div className="flex items-center gap-3">
        {weatherAdvisory && (
          <div className="hidden lg:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-[11px] text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>{weatherAdvisory}</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-300 font-mono">VIT-C Area 4</span>
          <span className="text-slate-500">|</span>
          <span className="text-blue-400 font-medium">Slots Live</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-850 text-slate-350 relative transition border border-slate-700/50"
            title="Pre-Booking Live Alerts"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500"></span>
              </>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1E2640] border border-slate-700 rounded-xl shadow-2xl z-50 p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  Live Booking Feed
                </span>
                {notifications.length > 0 && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">
                    New Logs
                  </span>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center text-slate-500 py-6 text-xs">No recent actions logged.</div>
                ) : (
                  notifications.map((note, index) => (
                    <div key={index} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                      {note}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick booking dashboard trigger */}
        <button
          onClick={() => onNavigate('facilities')}
          className="bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-1.5"
        >
          Book Facility
        </button>
      </div>
    </header>
  );
};
