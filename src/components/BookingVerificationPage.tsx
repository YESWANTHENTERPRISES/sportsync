import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Phone, 
  Award, 
  Building2, 
  Calendar,
  Sparkles,
  Home,
  Check
} from 'lucide-react';
import { Booking, UserProfile, formatTo12Hour, convertTo24Hour, getISTDate } from '../utils/mockDb';

interface BookingVerificationPageProps {
  booking: Booking | null;
  student: UserProfile | null;
  loading: boolean;
  error: string | null;
  currentUser: UserProfile | null;
  onClose: () => void; // Used to clear parameters and go home
  onCheckIn: (bookingId: string) => void;
  onCloseSlot: (bookingId: string) => void;
}

export const BookingVerificationPage: React.FC<BookingVerificationPageProps> = ({
  booking,
  student,
  loading,
  error,
  currentUser,
  onClose,
  onCheckIn,
  onCloseSlot
}) => {
  // Read flash message from URL query params
  const params = new URLSearchParams(window.location.search);
  const msg = params.get('msg');

  // Determine if booking is expired based on date and time
  const isPastBooking = (bookingDate: string, endTimeStr: string) => {
    try {
      const now = new Date();
      const bookingEnd = new Date(`${bookingDate}T${endTimeStr}:00`);
      return now.getTime() > bookingEnd.getTime();
    } catch {
      return false;
    }
  };

  const getStatusBadge = () => {
    if (!booking) return null;
    
    const expired = isPastBooking(booking.date, booking.endTime);
    
    if (booking.status === 'Cancelled') {
      return {
        label: 'CANCELLED',
        bgColor: 'bg-red-500/10 border-red-500/30 text-red-400',
        icon: <XCircle className="w-12 h-12 text-red-500" />,
        shadow: 'shadow-red-500/10'
      };
    }
    
    if (booking.status === 'Completed') {
      return {
        label: 'CLOSED',
        bgColor: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        icon: <CheckCircle2 className="w-12 h-12 text-blue-400" />,
        shadow: 'shadow-blue-500/10'
      };
    }

    if (booking.status === 'Checked-In') {
      return {
        label: 'APPROVED / STARTED',
        bgColor: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
        icon: <CheckCircle2 className="w-12 h-12 text-emerald-400" />,
        shadow: 'shadow-emerald-500/20'
      };
    }

    if (expired) {
      return {
        label: 'EXPIRED',
        bgColor: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
        icon: <Clock className="w-12 h-12 text-slate-400" />,
        shadow: 'shadow-slate-500/10'
      };
    }

    return {
      label: 'APPROVED',
      bgColor: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      icon: <CheckCircle2 className="w-12 h-12 text-emerald-400" />,
      shadow: 'shadow-emerald-500/20'
    };
  };

  const getLateMinutes = () => {
    if (!booking) return 0;
    try {
      const now = getISTDate();
      const startTime24 = convertTo24Hour(booking.startTime);
      const slotStart = new Date(`${booking.date}T${startTime24}:00`);
      const diff = now.getTime() - slotStart.getTime();
      return Math.max(0, Math.floor(diff / (1000 * 60)));
    } catch {
      return 0;
    }
  };

  const badge = getStatusBadge();
  const isAdmin = currentUser?.role === 'Admin';
  const canCheckIn = booking && booking.status === 'Confirmed' && !isPastBooking(booking.date, booking.endTime);
  const lateMinutes = getLateMinutes();

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-4 md:p-6 select-none relative overflow-y-auto">
      {/* Decorative blueprint grids in background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="max-w-xl w-full relative z-10 space-y-6 my-8">
        
        {/* Standalone Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono font-bold tracking-widest uppercase shadow-md shadow-blue-500/5">
            <Sparkles className="w-4.5 h-4.5" /> VIT Chennai Booking Checker
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white mt-1">Pass Audit Inspector</h1>
          <p className="text-xs text-slate-400">Official campus facility gate checkpoint validation node</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-[#161B30]/90 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-mono">Auditing pass signature & fetching profile details...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-[#161B30]/90 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Verification Failed</h3>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
            <button 
              onClick={onClose}
              className="mt-2 px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <Home className="w-4 h-4" /> Return to SportSync Home
            </button>
          </div>
        )}

        {/* Success / Details Page */}
        {!loading && !error && booking && (
          <div className="bg-[#161B30]/95 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            
            {/* Flash Message Banner */}
            {msg === 'started' && (
              <div className="p-4 rounded-2xl text-center text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2 animate-pulse">
                Congrats! Your slot has started. Enjoy your time! 🎉
              </div>
            )}
            {msg === 'closed' && (
              <div className="p-4 rounded-2xl text-center text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center gap-2">
                Slot Closed.
              </div>
            )}

            {/* Status Hero Card */}
            <div className={`p-6 rounded-2xl border text-center flex flex-col items-center gap-3 transition shadow-lg ${badge?.bgColor} ${badge?.shadow}`}>
              {badge?.icon}
              <div>
                <h2 className="text-base font-heading font-extrabold uppercase tracking-wider">{badge?.label}</h2>
                <p className="text-[11px] text-slate-400 font-mono mt-1">Pass ID: {booking.id}</p>
              </div>
            </div>

            {/* Late Arrival Warning Notification */}
            {lateMinutes > 0 && booking.status === 'Confirmed' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-xs text-amber-400">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h5 className="font-bold text-amber-300">Late Arrival Notice</h5>
                  <p className="text-slate-300 leading-relaxed">
                    Student has arrived <strong className="font-mono text-sm text-amber-400">{lateMinutes} minutes</strong> late after the scheduled start time ({booking.startTime}).
                  </p>
                </div>
              </div>
            )}

            {/* Student Profile details */}
            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-mono text-blue-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <User className="w-4 h-4" /> Student Profile Details
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Student Name</span>
                  <div className="text-sm font-bold text-white">{booking.userName}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">College ID / Reg No.</span>
                  <div className="text-sm font-mono font-bold text-slate-200">{booking.userCollegeId}</div>
                </div>
                
                {student && (
                  <>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Contact Phone</span>
                      <div className="text-sm font-mono font-bold text-slate-200 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-450" /> {student.phone}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">System Role</span>
                      <div className="text-sm font-bold text-slate-200 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-450" /> {student.role}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {student && student.preferences && student.preferences.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Sports Preferences</span>
                  <div className="flex flex-wrap gap-1.5">
                    {student.preferences.map(pref => (
                      <span key={pref} className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Slot Details */}
            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-mono text-blue-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                <Building2 className="w-4 h-4" /> Booking Reservation Info
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Facility Name</span>
                  <div className="text-sm font-bold text-white">{booking.facilityName}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Sport Category</span>
                  <div className="text-sm font-semibold text-slate-200">{booking.sportType}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Scheduled Slot Date</span>
                  <div className="text-sm font-mono font-bold text-slate-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-450" /> {booking.date}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Slot Hours (Timing)</span>
                  <div className="text-sm font-mono font-bold text-blue-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-500/60" /> {formatTo12Hour(booking.startTime)} - {formatTo12Hour(booking.endTime)}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Booking Type:</span>
                  <span className="font-semibold text-slate-200">
                    {booking.isGroupBooking ? `Group Booking (${booking.groupSize} Players)` : 'Single Slot Booking'}
                  </span>
                </div>
                
                {booking.isGroupBooking && booking.groupMembers && booking.groupMembers.length > 0 && (
                  <div className="space-y-1 mt-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Group Roster</span>
                    <div className="text-[11px] text-slate-350 bg-slate-900/50 p-2.5 rounded-xl border border-slate-900 font-mono">
                      {booking.groupMembers.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Check-In Controls */}
            <div className="space-y-3 pt-2">
              {isAdmin && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={booking.status !== 'Confirmed'}
                      onClick={() => onCheckIn(booking.id)}
                      className={`w-full py-3.5 rounded-2xl font-heading font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        booking.status === 'Confirmed'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/10 active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle2 className="w-4.5 h-4.5" /> 
                      {booking.status === 'Checked-In' ? 'Already Checked In' : 'Confirm Check-In'}
                    </button>

                    <button
                      disabled={booking.status !== 'Confirmed' && booking.status !== 'Checked-In'}
                      onClick={() => onCloseSlot(booking.id)}
                      className={`w-full py-3.5 rounded-2xl font-heading font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        (booking.status === 'Confirmed' || booking.status === 'Checked-In')
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/10 active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <XCircle className="w-4.5 h-4.5" /> 
                      {lateMinutes > 0 ? `Cancel Slot (${lateMinutes}m Late)` : 'Cancel Slot'}
                    </button>
                  </div>
                  
                  {booking.status === 'Completed' && (
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-xs text-slate-500 font-mono">
                      ✅ Slot is Closed (Student Checked In).
                    </div>
                  )}

                  {booking.status === 'Cancelled' && (
                    <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-center text-xs text-red-400 font-mono">
                      ❌ Booking Cancelled (Late Arrival / No Show).
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-350 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-4 h-4" /> Go to SportSync Home
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
