import React, { useState } from 'react';
import { Search, MapPin, Layers, Users, Calendar, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { SportFacility, FacilitySlot, Booking, convertTo24Hour } from '../utils/mockDb';

interface FacilitiesViewProps {
  facilities: SportFacility[];
  slots: FacilitySlot[];
  bookings: Booking[];
  currentUserId: string;
  onSelectFacility: (facility: SportFacility) => void;
  onQuickRebook: (facilityId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({
  facilities,
  slots,
  bookings,
  currentUserId,
  onSelectFacility,
  onQuickRebook,
  searchQuery,
  onSearchChange
}) => {
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [timeOfDay, setTimeOfDay] = useState<string>('ALL'); // ALL, Morning, Afternoon, Evening
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Get previously booked facilities for Quick Rebook
  const userBookings = bookings.filter(b => b.userId === currentUserId && b.status === 'Confirmed');
  const lastBookedFacilityId = userBookings.length > 0 ? userBookings[userBookings.length - 1].facilityId : null;
  const quickRebookFacility = lastBookedFacilityId ? facilities.find(f => f.id === lastBookedFacilityId) : null;

  // Filter facilities based on search query, sport type, and slot criteria
  const filteredFacilities = facilities.filter(fac => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = fac.name.toLowerCase().includes(query) || 
                          fac.sportType.toLowerCase().includes(query) ||
                          fac.location.toLowerCase().includes(query);
    
    // 2. Sport filter
    const matchesSport = selectedSport === 'ALL' || fac.sportType === selectedSport;
    
    // 3. Slot criteria (time of day / availability)
    const facSlots = slots.filter(s => s.facilityId === fac.id);
    
    let matchesTime = true;
    if (timeOfDay !== 'ALL') {
      matchesTime = facSlots.some(s => {
        const start24 = convertTo24Hour(s.startTime);
        const hour24 = parseInt(start24.split(':')[0], 10);
        if (timeOfDay === 'Morning') return hour24 >= 7 && hour24 < 12;
        if (timeOfDay === 'Afternoon') return hour24 >= 12 && hour24 < 16;
        if (timeOfDay === 'Evening') return hour24 >= 16 && hour24 <= 20;
        return true;
      });
    }

    let matchesAvailability = true;
    if (onlyAvailable) {
      matchesAvailability = facSlots.some(s => s.status === 'Available');
    }

    return matchesSearch && matchesSport && matchesTime && matchesAvailability;
  });

  // Calculate available slots per facility for "Today" / next 7 days
  const getAvailableSlotsCount = (facilityId: string) => {
    return slots.filter(s => s.facilityId === facilityId && s.status === 'Available').length;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Quick Rebook Component */}
      {quickRebookFacility && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border border-blue-500/35 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center text-lg shadow">
              ⚡
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-blue-400">QUICK REBOOK AVAILABLE</div>
              <h3 className="font-heading font-bold text-white text-sm">
                Book {quickRebookFacility.name} again?
              </h3>
              <p className="text-xs text-slate-400">
                You booked this recently. Jump straight to slot picking.
              </p>
            </div>
          </div>
          <button
            onClick={() => onQuickRebook(quickRebookFacility.id)}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs transition active:scale-95 flex items-center gap-1.5 shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Book Now
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 bg-[#1E2640] border border-slate-800 rounded-2xl p-5 space-y-6 h-fit">
          <div className="flex items-center gap-2 text-sm font-heading font-bold text-white border-b border-slate-850 pb-3">
            <Filter className="w-4 h-4 text-blue-400" />
            Filter Facilities
          </div>

          {/* Sport Filter */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-400">Sport Category</label>
            <div className="space-y-1">
              {['ALL', 'Badminton', 'Cricket', 'Basketball', 'Football', 'Tennis', 'Volley Ball', 'Table Tennis', 'Shuttlecock', 'Handball', 'Chess', 'Carrom', 'Throw Ball'].map(sport => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    selectedSport === sport 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {sport === 'ALL' ? 'All Sports' : sport}
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-850">
            <label className="text-xs font-mono uppercase text-slate-400">Time of Day</label>
            <div className="space-y-1">
              {['ALL', 'Morning', 'Afternoon', 'Evening'].map(time => (
                <button
                  key={time}
                  onClick={() => setTimeOfDay(time)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    timeOfDay === time 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {time === 'ALL' ? 'Any Time' : `${time} Slots`}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Available Slots Only</span>
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${
                onlyAvailable ? 'bg-blue-600' : 'bg-slate-950 border border-slate-800'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute ${
                onlyAvailable ? 'translate-x-5' : 'translate-x-1'
              }`}></span>
            </button>
          </div>
        </aside>

        {/* Facilities Grid */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Showing {filteredFacilities.length} facilities matching filters</span>
          </div>

          {filteredFacilities.length === 0 ? (
            <div className="text-center py-20 bg-[#1E2640]/40 border border-dashed border-slate-800 rounded-2xl space-y-2">
              <div className="text-sm font-semibold text-slate-400">No facilities match your search.</div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Try clearing search or filters to see available facilities on campus.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredFacilities.map(fac => {
                const availCount = getAvailableSlotsCount(fac.id);
                return (
                  <div 
                    key={fac.id}
                    className="bg-[#1E2640] border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/40 transition flex flex-col"
                  >
                    {/* Facility Image */}
                    <div className="h-44 relative bg-slate-950 overflow-hidden">
                      <img 
                        src={fac.photoUrl} 
                        alt={fac.name}
                        className="w-full h-full object-cover hover:scale-105 transition duration-550"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-[#0A0F1E]/80 backdrop-blur-sm border border-slate-700 text-[10px] font-bold uppercase tracking-wider font-mono" style={{ color: '#ffffff' }}>
                        {fac.sportType}
                      </div>
                      
                      {/* Available indicator */}
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm" style={{ color: '#4ade80' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4ade80' }}></span>
                        {availCount} slots available
                      </div>
                    </div>

                    {/* Facility Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <h3 className="font-heading font-bold text-white text-base leading-snug">
                          {fac.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{fac.location}</span>
                        </div>
                        <div className="flex items-center gap-4 pt-1 text-[11px] font-mono text-slate-400">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-slate-550" />
                            {fac.courtNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-550" />
                            Cap: {fac.capacity}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectFacility(fac)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-heading font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Book A Slot
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
