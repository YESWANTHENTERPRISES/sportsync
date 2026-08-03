import React from 'react';
import { 
  Home, 
  Map, 
  Search, 
  CalendarDays, 
  User, 
  LayoutDashboard, 
  Settings, 
  Clock, 
  BookOpen, 
  ShieldAlert, 
  BarChart3,
  Calendar,
  Megaphone,
  Bot,
  Users,
  Trophy,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../utils/mockDb';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUser: UserProfile;
  activeBookingsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  currentUser,
  activeBookingsCount
}) => {
  const isAdmin = currentUser.role !== 'Student';

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0A0F1E]/50 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        
        {/* Student View Section */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Student Portal
          </div>
          <nav className="space-y-1">
            {[
              { id: 'landing', label: 'Welcome / Home', icon: Home },
              { id: 'facilities', label: 'Browse Facilities', icon: Map },
              { id: 'search', label: 'Search & Filter', icon: Search },
              {
                id: 'my-bookings',
                label: 'My Bookings',
                icon: CalendarDays,
                badge: activeBookingsCount > 0 ? String(activeBookingsCount) : undefined,
                badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              },
              { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
              { id: 'community-board', label: 'Community Board', icon: Users },
              { id: 'tournament', label: '🏆 Tournaments', icon: Trophy },
              { id: 'profile', label: 'User Profile', icon: User }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition group ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700/80 shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : 'bg-slate-950 text-slate-400 group-hover:text-slate-355'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {item.label}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Portal Section */}
        {isAdmin && (
          <div>
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Admin Portal Desk
            </div>
            <nav className="space-y-1">
              {[
                { id: 'admin-dashboard', label: 'Stats Dashboard', icon: LayoutDashboard },
                { id: 'admin-facilities', label: 'Manage Courts', icon: Settings },
                { id: 'admin-slots', label: 'Slot Scheduler', icon: Calendar },
                { id: 'admin-bookings', label: 'Bookings Logs', icon: BookOpen },
                { id: 'admin-users', label: 'User Directory', icon: ShieldAlert },
                { id: 'admin-announcements', label: 'Announcements', icon: Megaphone },
                { id: 'admin-ai-insights', label: '✦ AI Insights', icon: Bot },
                { id: 'admin-reports', label: 'Data Reports', icon: BarChart3 }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition group ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700/80 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                          isActive
                            ? 'bg-indigo-500/20 text-indigo-450 border border-indigo-500/40'
                            : 'bg-slate-950 text-slate-400 group-hover:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {item.label}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Custom Sport Promo Card (Page 15 requirement) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1E2640] to-slate-950 border border-blue-500/25 space-y-2.5 shadow-md relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-14 h-14 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition"></div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white font-heading">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            Custom Sport Match
          </div>
          <p className="text-[10px] text-slate-450 leading-normal">
            Can't find a court slot? Schedule a custom game and invite other players.
          </p>
          <button
            onClick={() => onTabChange('custom-sport')}
            className="w-full py-2 bg-blue-600 hover:bg-blue-550 text-white font-bold text-[10px] rounded-xl transition active:scale-95 cursor-pointer shadow-sm shadow-blue-600/10 border border-blue-500/30"
          >
            Create Match ✦
          </button>
        </div>

        {/* Mini Rules Info Widget */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/85 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Booking Rules
          </div>
          <div className="space-y-1 text-[10px] text-slate-400 font-mono">
            <div>• Cancellations: &gt;3h only</div>
            <div>• Max booking: Daily Cap</div>
            <div>• Conflict Check: Enabled</div>
            <div>• Rate Limits: Enabled</div>
          </div>
        </div>

      </div>

      {/* Footer session info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-450">
        <div className="text-[10px] text-slate-500 font-mono">ACTIVE PROFILE ID</div>
        <div className="font-semibold text-white truncate">{currentUser.collegeId}</div>
      </div>
    </aside>
  );
};
