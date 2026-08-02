import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, X, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { Booking, UserProfile } from '../utils/mockDb';

interface MyBookingsViewProps {
  bookings: Booking[];
  currentUser: UserProfile;
  onCancelBooking: (bookingId: string) => void;
}

// Helper to format remaining time
const getRemainingTime = (dateStr: string, timeStr: string) => {
  const targetStr = `${dateStr}T${timeStr}:00`;
  const diff = new Date(targetStr).getTime() - Date.now();
  
  if (diff <= 0) return 'Started / Ended';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `Starts in ${hours}h ${minutes}m`;
  }
  return `Starts in ${minutes}m ${seconds}s`;
};

// Check if booking is cancelable (cancellations allowed up to 3 hours before start time)
const isCancelable = (dateStr: string, timeStr: string, role: string) => {
  if (role !== 'Student') return true; // Admins / Staff bypass limits
  const targetStr = `${dateStr}T${timeStr}:00`;
  const diff = new Date(targetStr).getTime() - Date.now();
  const threeHours = 3 * 60 * 60 * 1000;
  return diff >= threeHours;
};

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  currentUser,
  onCancelBooking
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'Upcoming' | 'Past' | 'Cancelled'>('Upcoming');
  const [selectedQRBooking, setSelectedQRBooking] = useState<Booking | null>(null);
  const [timeTicker, setTimeTicker] = useState<number>(Date.now());

  // Update countdown timers every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredBookings = bookings
    .filter(b => b.userId === currentUser.id)
    .filter(b => {
      const slotStart = new Date(`${b.date}T${b.startTime}:00`).getTime();
      const isPast = slotStart < Date.now();
      
      if (activeSubTab === 'Upcoming') {
        return b.status === 'Confirmed' && !isPast;
      }
      if (activeSubTab === 'Past') {
        return (b.status === 'Confirmed' && isPast) || b.status === 'Completed';
      }
      return b.status === 'Cancelled';
    })
    .sort((a, b) => new Date(`${a.date}T${a.startTime}:00`).getTime() - new Date(`${b.date}T${b.startTime}:00`).getTime());

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 pb-1.5 gap-6">
        {['Upcoming', 'Past', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab as any)}
            className={`pb-3 text-sm font-heading font-semibold transition relative ${
              activeSubTab === tab 
                ? 'text-blue-400 font-bold' 
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            {tab}
            {activeSubTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-[#1E2640]/40 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <div>
            <div className="text-sm font-semibold text-slate-400">No {activeSubTab.toLowerCase()} bookings found.</div>
            <p className="text-xs text-slate-550 max-w-xs mx-auto">
              {activeSubTab === 'Upcoming' 
                ? "You don't have any scheduled sessions. Choose a facility to book a court!"
                : "No matching record available in this category."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBookings.map(booking => {
            const cancelable = isCancelable(booking.date, booking.startTime, currentUser.role);
            const remaining = getRemainingTime(booking.date, booking.startTime);
            
            return (
              <div 
                key={booking.id}
                className="bg-[#1E2640] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-0.5 rounded-full">
                        {booking.sportType}
                      </span>
                      <h3 className="font-heading font-bold text-white text-base mt-2">
                        {booking.facilityName}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Court/Lanes: {booking.courtNumber}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0">
                      ID: {booking.id}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>{booking.date} | {booking.startTime} - {booking.endTime}</span>
                    </div>
                    {booking.isGroupBooking && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>👥 Group Booking ({booking.groupSize} Players)</span>
                      </div>
                    )}
                    {booking.status === 'Confirmed' && (
                      <div className="flex items-center gap-2 text-blue-400 font-mono text-[11px] font-semibold animate-pulse-subtle">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{remaining}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="flex gap-3">
                  {booking.status === 'Confirmed' && (
                    <>
                      <button
                        onClick={() => setSelectedQRBooking(booking)}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20"
                      >
                        Show QR Pass
                      </button>
                      
                      <button
                        disabled={!cancelable}
                        onClick={() => onCancelBooking(booking.id)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                          cancelable 
                            ? 'bg-slate-950 border-red-500/30 hover:border-red-500 text-red-400 hover:bg-red-500/10' 
                            : 'bg-slate-900 border-slate-850 text-slate-600 cursor-not-allowed'
                        }`}
                        title={!cancelable ? 'Cancellation lock: starts in less than 3 hours' : 'Cancel booking'}
                      >
                        Cancel Slot
                      </button>
                    </>
                  )}

                  {booking.status === 'Cancelled' && (
                    <div className="text-xs text-red-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Cancelled {booking.cancelledAt ? `on ${new Date(booking.cancelledAt).toLocaleDateString()}` : ''}
                    </div>
                  )}

                  {activeSubTab === 'Past' && (
                    <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-slate-600" />
                      Session Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Pass Modal */}
      {selectedQRBooking && (
        <div className="fixed inset-0 z-50 bg-[#0A0F1E]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E2640] border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-blue-400">VIT Chennai Gate Pass</span>
              <button 
                onClick={() => setSelectedQRBooking(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* QR Visual */}
            <div className="p-4 bg-white rounded-xl w-48 h-48 mx-auto flex flex-col items-center justify-center gap-2 border border-slate-300 shadow-inner">
              {/* Dynamic QR canvas replacement using SVG */}
              <svg className="w-40 h-40" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" />
                {/* Simulated QR Code patterns */}
                <rect x="5" y="5" width="25" height="25" fill="#0A0F1E" />
                <rect x="10" y="10" width="15" height="15" fill="white" />
                <rect x="12" y="12" width="11" height="11" fill="#0A0F1E" />
                
                <rect x="70" y="5" width="25" height="25" fill="#0A0F1E" />
                <rect x="75" y="10" width="15" height="15" fill="white" />
                <rect x="77" y="12" width="11" height="11" fill="#0A0F1E" />

                <rect x="5" y="70" width="25" height="25" fill="#0A0F1E" />
                <rect x="10" y="75" width="15" height="15" fill="white" />
                <rect x="12" y="77" width="11" height="11" fill="#0A0F1E" />

                {/* Random blocks */}
                <rect x="40" y="15" width="10" height="5" fill="#0A0F1E" />
                <rect x="50" y="25" width="5" height="10" fill="#0A0F1E" />
                <rect x="35" y="45" width="15" height="15" fill="#0A0F1E" />
                <rect x="60" y="60" width="20" height="10" fill="#0A0F1E" />
                <rect x="45" y="80" width="10" height="15" fill="#0A0F1E" />
                <rect x="80" y="40" width="15" height="15" fill="#0A0F1E" />
              </svg>
              <span className="text-[8px] font-mono text-slate-500 font-bold">SCAN AT PHYSICAL CHECK-IN</span>
            </div>

            <div className="space-y-1">
              <h4 className="font-heading font-bold text-white text-base">{selectedQRBooking.facilityName}</h4>
              <p className="text-xs text-slate-400 font-mono">{selectedQRBooking.courtNumber} | {selectedQRBooking.startTime} - {selectedQRBooking.endTime}</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-left text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Student ID:</span>
                <span className="text-slate-300">{selectedQRBooking.userCollegeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Key:</span>
                <span className="text-blue-400 font-bold">{selectedQRBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Players Cap:</span>
                <span className="text-slate-300">{selectedQRBooking.groupSize} Players</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedQRBooking(null)}
              className="w-full py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-350 text-xs font-semibold transition"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
