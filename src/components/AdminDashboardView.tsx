import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Ban, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { Booking, SportFacility, FacilitySlot, WaitlistEntry } from '../utils/mockDb';

interface AdminDashboardProps {
  bookings: Booking[];
  facilities: SportFacility[];
  slots: FacilitySlot[];
  waitlist: WaitlistEntry[];
  onNavigate: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardProps> = ({
  bookings,
  facilities,
  slots,
  waitlist,
  onNavigate
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const bookingsToday = bookings.filter(b => b.date === todayStr);
  const activeBookingsToday = bookingsToday.filter(b => b.status === 'Confirmed').length;
  const cancellationsToday = bookingsToday.filter(b => b.status === 'Cancelled').length;
  
  const activeCourts = facilities.filter(f => f.status === 'Active').length;
  const totalSlotsCount = slots.filter(s => s.date === todayStr).length;
  const bookedSlotsCount = slots.filter(s => s.date === todayStr && s.status === 'Booked').length;
  
  const currentWaitlistCount = waitlist.filter(w => w.status === 'Waiting').length;

  const occupancyRate = totalSlotsCount > 0 ? Math.round((bookedSlotsCount / totalSlotsCount) * 100) : 0;

  // Peak hours heatmap calculations
  const sports = ['Badminton', 'Cricket', 'Basketball', 'Football', 'Tennis', 'Volley Ball', 'Table Tennis', 'Shuttlecock', 'Handball', 'Chess', 'Carrom', 'Throw Ball'];
  const hours = ['06:00', '07:00', '08:00', '09:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  
  // Dense booking matrix (Sport x Hour)
  const getDensityClass = (sport: string, hour: string) => {
    const count = bookings.filter(b => b.sportType === sport && b.startTime === hour && b.status === 'Confirmed').length;
    if (count === 0) return 'bg-slate-950 border border-slate-900 text-slate-700';
    if (count === 1) return 'bg-blue-950 text-blue-400 border border-blue-900';
    if (count === 2) return 'bg-blue-900 text-blue-200 border border-blue-800';
    return 'bg-blue-600 text-white font-bold border border-blue-500';
  };

  const getDensityNumber = (sport: string, hour: string) => {
    return bookings.filter(b => b.sportType === sport && b.startTime === hour && b.status === 'Confirmed').length;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* KPI Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-[#1E2640] border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Bookings Today</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-heading font-bold text-white mt-2 font-mono flex items-baseline gap-1.5">
            {activeBookingsToday}
            <span className="text-xs font-normal text-blue-400">Slots</span>
          </div>
          <div className="text-[10px] text-slate-450 mt-2">Occupancy rate at {occupancyRate}%</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#1E2640] border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Active Courts</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-heading font-bold text-emerald-400 mt-2 font-mono">
            {activeCourts} <span className="text-xs font-normal text-slate-400">/ {facilities.length}</span>
          </div>
          <div className="text-[10px] text-slate-450 mt-2">All outdoor turf sectors online</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#1E2640] border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Today's Cancellations</span>
            <Ban className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-heading font-bold text-red-400 mt-2 font-mono">
            {cancellationsToday}
          </div>
          <div className="text-[10px] text-slate-450 mt-2">Reallocated to waitlisted FIFO queues</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#1E2640] border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Active Waitlists</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-heading font-bold text-indigo-400 mt-2 font-mono">
            {currentWaitlistCount} <span className="text-xs font-normal text-slate-400">Students</span>
          </div>
          <div className="text-[10px] text-slate-450 mt-2">Average queue size: 1.2 per court</div>
        </div>

      </div>

      {/* Main Row: Occupancy progress & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live occupancy status list */}
        <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-heading font-bold text-white text-base">Facility Court Occupancy</h3>
              <p className="text-xs text-slate-450">Active slot booking ratios for today's sessions</p>
            </div>
            
            <div className="space-y-3.5">
              {facilities.map(fac => {
                const facSlots = slots.filter(s => s.facilityId === fac.id && s.date === todayStr);
                const bookedCount = facSlots.filter(s => s.status === 'Booked').length;
                const ratio = facSlots.length > 0 ? Math.round((bookedCount / facSlots.length) * 100) : 0;
                
                return (
                  <div key={fac.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-white font-medium truncate max-w-[170px]">{fac.name}</span>
                      <span className="text-slate-400 font-mono font-semibold">{bookedCount}/{facSlots.length} ({ratio}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        style={{ width: `${ratio}%` }} 
                        className={`h-full rounded-full transition-all duration-300 ${
                          ratio > 75 ? 'bg-indigo-500' : ratio > 40 ? 'bg-blue-600' : 'bg-emerald-500'
                        }`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate('admin-facilities')}
            className="w-full mt-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-xs font-semibold text-blue-400 hover:text-blue-300 border border-slate-850 hover:border-slate-800 transition flex items-center justify-center gap-1.5"
          >
            Manage Facility Capacities <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right 2 Columns: Heatmap Booking Density */}
        <div className="lg:col-span-2 bg-[#1E2640] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-heading font-bold text-white text-base">Peak Hours Booking Density</h3>
            <p className="text-xs text-slate-450">Active slot metrics grid to identify peak occupancy across sports</p>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[600px] grid grid-cols-10 gap-1.5 text-center text-xs font-mono select-none">
              
              {/* Header Hour Row */}
              <div className="text-[10px] text-slate-500 text-left py-1">Sport Type</div>
              {hours.map(hour => (
                <div key={hour} className="text-[10px] text-slate-400 py-1 font-semibold">{hour}</div>
              ))}

              {/* Rows per sport */}
              {sports.map(sport => (
                <React.Fragment key={sport}>
                  <div className="text-left font-sans font-bold text-white text-[11px] py-2 truncate border-r border-slate-850 pr-1">
                    {sport}
                  </div>
                  {hours.map(hour => {
                    const density = getDensityNumber(sport, hour);
                    const cellStyle = getDensityClass(sport, hour);
                    return (
                      <div 
                        key={hour} 
                        className={`py-2 rounded font-bold text-xs ${cellStyle}`}
                        title={`${sport} at ${hour}: ${density} bookings confirmed`}
                      >
                        {density}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}

            </div>
          </div>

          {/* Density legend */}
          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-850">
            <span>Grid Legend:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-950 border border-slate-900 rounded"></span> 0 Bookings</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-950 border border-blue-900 rounded"></span> Low Density</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-600 rounded"></span> High Peak</span>
          </div>
        </div>

      </div>

      {/* Recent Bookings Table Panel */}
      <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold text-white text-base">Recent Activity Logs</h3>
          <button 
            onClick={() => onNavigate('admin-bookings')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            Full Booking Registry →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2 font-medium">Booking ID</th>
                <th className="py-2 font-medium">Student / User</th>
                <th className="py-2 font-medium">Facility</th>
                <th className="py-2 font-medium">Schedule</th>
                <th className="py-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-350">
              {bookings.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-3 font-mono font-semibold text-blue-400">{b.id}</td>
                  <td className="py-3">
                    <div className="font-semibold text-white">{b.userName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{b.userCollegeId}</div>
                  </td>
                  <td className="py-3">{b.facilityName} ({b.courtNumber})</td>
                  <td className="py-3 font-mono">{b.date} | {b.startTime} - {b.endTime}</td>
                  <td className="py-3 text-right font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      b.status === 'Confirmed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
