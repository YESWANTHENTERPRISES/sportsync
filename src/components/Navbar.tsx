import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  Bell, 
  Download, 
  ChevronDown, 
  User, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { UserProfile } from '../utils/mockDb';

interface NavbarProps {
  currentUser: UserProfile;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (page: string) => void;
  weatherAdvisory?: string;
  notifications: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  searchQuery,
  onSearchChange,
  onNavigate,
  weatherAdvisory,
  notifications
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0A0F1E]/95 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6">
      {/* Left Branding + Profile Selector */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-heading font-bold text-xl shadow-lg shadow-blue-500/20">
            S
          </div>
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
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
            }}
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

      {/* Middle Search bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search sports facilities, outdoor fields, slot availability..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/65 focus:ring-1 focus:ring-blue-500/30 transition"
          />
        </div>
      </div>

      {/* Right Indicators & Notifications */}
      <div className="flex items-center gap-3">
        {/* Live Weather Advisory for Campus */}
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
