import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Sun, CloudRain, AlertTriangle, Users, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SportFacility, FacilitySlot, MOCK_WEATHER_REPORTS, TIME_SLOTS, formatTo12Hour, convertTo24Hour, getISTDate } from '../utils/mockDb';
import { FullWeatherState, getForecastForDate } from '../utils/weatherService';

interface SlotBookingViewProps {
  facility: SportFacility;
  slots: FacilitySlot[];
  onBack: () => void;
  onSubmitBooking: (params: {
    slotId: string;
    isGroupBooking: boolean;
    groupSize: number;
    groupMembers?: string[];
  }) => void;
  onJoinWaitlist: (slotId: string) => void;
  advanceBookingWindowDays: number;
  weather: FullWeatherState | null;
}

const getNextNDays = (n: number) => {
  const dates: { dateStr: string; label: string; weekday: string }[] = [];
  const today = getISTDate();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    dates.push({ dateStr, label, weekday });
  }
  return dates;
};

export const SlotBookingView: React.FC<SlotBookingViewProps> = ({
  facility,
  slots,
  onBack,
  onSubmitBooking,
  onJoinWaitlist,
  advanceBookingWindowDays,
  weather
}) => {
  const dateOptions = getNextNDays(advanceBookingWindowDays);
  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState<FacilitySlot | null>(null);
  
  // Booking Form State
  const [isGroup, setIsGroup] = useState(false);
  const [groupSize, setGroupSize] = useState<number>(2);
  const [groupMembersText, setGroupMembersText] = useState<string>('');
  
  // Captcha State
  const [captchaQuestion, setCaptchaQuestion] = useState<{ num1: number; num2: number; answer: number }>({ num1: 0, num2: 0, answer: 0 });
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [captchaError, setCaptchaError] = useState<boolean>(false);

  // Generate random captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * 8) + 2;
    setCaptchaQuestion({ num1, num2, answer: num1 + num2 });
    setCaptchaInput('');
    setCaptchaError(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, [selectedSlot]);

  // Filter slots for selected facility and selected date
  const filteredSlots = slots.filter(s => s.facilityId === facility.id && s.date === selectedDate);

  // Check if outdoor sport for weather integration
  const isOutdoor = facility.location.toLowerCase().includes('outdoor') || 
                    ['Cricket', 'Football', 'Tennis', 'Volley Ball', 'Shuttlecock', 'Handball', 'Throw Ball'].includes(facility.sportType);
  const todaysWeather = getForecastForDate(weather, selectedDate);

  const handleSlotClick = (slot: FacilitySlot) => {
    if (slot.status === 'Blocked' || slot.status === 'Maintenance') return;
    setSelectedSlot(slot);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    // Verify Captcha
    if (parseInt(captchaInput) !== captchaQuestion.answer) {
      setCaptchaError(true);
      return;
    }

    const members = groupMembersText.split(',').map(m => m.trim()).filter(m => m.length > 0);
    
    onSubmitBooking({
      slotId: selectedSlot.id,
      isGroupBooking: isGroup,
      groupSize: isGroup ? groupSize : 1,
      groupMembers: isGroup ? members : []
    });

    setSelectedSlot(null);
  };

  const handleWaitlist = () => {
    if (!selectedSlot) return;
    onJoinWaitlist(selectedSlot.id);
    setSelectedSlot(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in relative">
      
      {/* Header Back bar */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-350 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
            Book Slots: {facility.name}
          </h2>
          <p className="text-xs text-slate-400">
            {facility.location} • {facility.courtNumber}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Slot Grid + Picker Column */}
        <div className="flex-1 space-y-6">
          {/* Calendar Picker Pills */}
          <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Select Date Window
            </h3>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 select-none">
              {dateOptions.map(day => (
                <button
                  key={day.dateStr}
                  onClick={() => {
                    setSelectedDate(day.dateStr);
                    setSelectedSlot(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl border text-center transition shrink-0 ${
                    selectedDate === day.dateStr 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono tracking-wider font-semibold opacity-85">
                    {day.weekday}
                  </div>
                  <div className="text-xs font-heading font-bold mt-0.5">
                    {day.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Slots Time Selection Grid */}
          <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">Available Time Slots</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredSlots.map(slot => {
                const isBooked = slot.status === 'Booked';
                const isBlocked = slot.status === 'Blocked';
                const isMaint = slot.status === 'Maintenance';
                const isFull = slot.currentBookings >= slot.maxCapacity;

                let isPastTime = false;
                try {
                  const end24 = convertTo24Hour(slot.endTime);
                  const nowIST = getISTDate();
                  const slotEnd = new Date(`${slot.date}T${end24}:00`);
                  isPastTime = nowIST.getTime() >= slotEnd.getTime();
                } catch (e) {}

                let cardStyle = 'bg-slate-950 border-slate-850 hover:border-blue-500 text-slate-300';
                let statusLabel = 'Available';
                let statusStyle = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

                if (isPastTime) {
                  cardStyle = 'bg-slate-950/40 border-slate-850 opacity-40 cursor-not-allowed';
                  statusLabel = 'Slot Closed';
                  statusStyle = 'text-slate-500 bg-slate-900 border-slate-800';
                } else if (isMaint) {
                  cardStyle = 'bg-slate-900 border-slate-850 opacity-60 cursor-not-allowed';
                  statusLabel = 'Maintenance';
                  statusStyle = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                } else if (isBlocked) {
                  cardStyle = 'bg-slate-900 border-slate-850 opacity-60 cursor-not-allowed';
                  statusLabel = 'Blocked';
                  statusStyle = 'text-red-500 bg-red-500/10 border-red-500/20';
                } else if (isBooked || isFull) {
                  cardStyle = 'bg-slate-950 border-red-500/30 hover:border-red-500 text-slate-350';
                  statusLabel = 'Full (Waitlist)';
                  statusStyle = 'text-red-400 bg-red-500/10 border-red-500/20';
                }

                return (
                  <div
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    className={`p-4 rounded-xl border cursor-pointer transition select-none flex flex-col justify-between h-24 ${cardStyle}`}
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-white">
                        {formatTo12Hour(slot.startTime)} - {formatTo12Hour(slot.endTime)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Capacity: {slot.currentBookings}/{slot.maxCapacity}
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold font-mono border self-start ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Weather Forecast / Alert Column */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              {isOutdoor ? <CloudRain className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-blue-400" />}
              Facility Weather Station
            </h3>
            
            {isOutdoor ? (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                    Outdoor Court Rules
                  </div>
                  <p className="text-[11px] text-slate-350 leading-relaxed">
                    This is an outdoor court. Bad weather triggers bulk-cancellation with full notification alerts.
                  </p>
                </div>
                
                {todaysWeather.map(report => (
                  <div 
                    key={report.time} 
                    className={`p-3.5 rounded-xl border space-y-1 bg-slate-950 transition-all ${
                      report.isBadWeather 
                        ? 'border-red-500/20 bg-red-950/10 shadow-inner' 
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-450 font-mono">
                      <span>{report.time}</span>
                      <span className="text-white font-bold">{report.temp}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <span className="text-sm">{report.icon}</span>
                      <span>{report.condition}</span>
                    </div>
                    <p className={`text-[10px] italic pt-1 border-t border-slate-900 mt-1 leading-relaxed ${
                      report.isBadWeather ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {report.advisory}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-2">
                <span className="text-3xl">🏠</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Indoor Facility (Air Conditioned)</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Unaffected by weather conditions. Slots are guaranteed under all weather warning thresholds.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-[#0A0F1E]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E2640] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                  Pre-Booking Review
                </span>
                <h3 className="font-heading font-bold text-white text-base mt-1">
                  Confirm Booking Session
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSlot(null)}
                className="text-slate-400 hover:text-white font-semibold font-mono text-xs p-1"
              >
                CLOSE
              </button>
            </div>

            {/* Selected Info Summary */}
            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Facility:</span>
                <span className="text-white font-semibold">{facility.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="text-blue-400 font-mono font-bold">
                  {selectedSlot.date} | {formatTo12Hour(selectedSlot.startTime)} - {formatTo12Hour(selectedSlot.endTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SLA Court Number:</span>
                <span className="text-slate-300 font-mono">{facility.courtNumber}</span>
              </div>
            </div>

            {selectedSlot.currentBookings >= selectedSlot.maxCapacity ? (
              // Waitlist view
              <div className="space-y-4">
                <div className="p-3.5 bg-red-500/15 border border-red-500/20 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-red-400 flex items-center gap-1.5">
                    ⚠️ Slot is Fully Booked
                  </div>
                  <p className="text-[11px] text-slate-350 leading-relaxed">
                    You can join the Waitlist. If another student cancels their booking, 
                    the system automatically promotes waitlisted students in FIFO order.
                  </p>
                </div>
                <button
                  onClick={handleWaitlist}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-heading font-bold transition flex items-center justify-center gap-2"
                >
                  Join Waitlist FIFO Queue
                </button>
              </div>
            ) : (
              // Standard Booking Form
              <form onSubmit={handleConfirm} className="space-y-4">
                {/* Group Booking Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Group Booking (Captain Slot)</span>
                    <button
                      type="button"
                      onClick={() => setIsGroup(!isGroup)}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center ${
                        isGroup ? 'bg-blue-600' : 'bg-slate-950 border border-slate-800'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute ${
                        isGroup ? 'translate-x-4' : 'translate-x-0.5'
                      }`}></span>
                    </button>
                  </div>
                  
                  {isGroup && (
                    <div className="space-y-3 p-3.5 bg-slate-950 border border-slate-850 rounded-xl animate-slide-down">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 uppercase">Team Size (Max {facility.capacity})</label>
                        <input
                          type="number"
                          min={2}
                          max={facility.capacity}
                          value={groupSize}
                          onChange={(e) => setGroupSize(Math.min(facility.capacity, parseInt(e.target.value) || 2))}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 uppercase">Group Member Names (comma separated)</label>
                        <textarea
                          placeholder="e.g. Rahul, Sneha, Parth"
                          value={groupMembersText}
                          onChange={(e) => setGroupMembersText(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white h-16 resize-none placeholder:text-slate-650"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Captcha validation */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Security Verification</label>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm font-bold font-mono text-blue-400 select-none tracking-widest shrink-0">
                      {captchaQuestion.num1} + {captchaQuestion.num2} = ?
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="Answer"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  {captchaError && (
                    <div className="text-[10px] text-red-400 font-semibold font-mono">❌ Incorrect answer. Please recalculate.</div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20"
                  >
                    <ShieldCheck className="w-4 h-4" /> Book Pre-Booking Slot
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
