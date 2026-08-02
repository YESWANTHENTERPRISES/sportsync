import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  User, 
  Phone, 
  Award, 
  Building2, 
  Activity,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Booking, UserProfile } from '../utils/mockDb';

interface BookingVerificationModalProps {
  booking: Booking | null;
  student: UserProfile | null;
  loading: boolean;
  error: string | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onCheckIn: (bookingId: string) => void;
}

export const BookingVerificationModal: React.FC<BookingVerificationModalProps> = ({
  booking,
  student,
  loading,
  error,
  currentUser,
  onClose,
  onCheckIn
}) => {
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
        icon: <XCircle className="w-8 h-8 text-red-500" />,
        shadow: 'shadow-red-500/10'
      };
    }
    
    if (booking.status === 'Completed') {
      return {
        label: 'CLOSED',
        bgColor: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        icon: <CheckCircle2 className="w-8 h-8 text-blue-400" />,
        shadow: 'shadow-blue-500/10'
      };
    }

    if (expired) {
      return {
        label: 'EXPIRED',
        bgColor: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
        icon: <Clock className="w-8 h-8 text-slate-400" />,
        shadow: 'shadow-slate-500/10'
      };
    }

    return {
      label: 'APPROVED',
      bgColor: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" />,
      shadow: 'shadow-emerald-500/20'
    };
  };

  const getLateMinutes = () => {
    if (!booking) return 0;
    try {
      const now = new Date();
      const slotStart = new Date(`${booking.date}T${booking.startTime}:00`);
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
    <div className="fixed inset-0 z-55 bg-[#0A0F1E]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161B30]/95 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

         <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" /> SportSync Booking Pass Verification
          </div>
          <h2 className="text-xl md:text-2xl font-heading font-extrabold text-white mt-2">Digital Pass Inspector</h2>
          <p className="text-xs text-slate-400">Scanned via booking checkpoint validation protocol</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-mono">Decoding QR Signature & Fetching Profile...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Verification Failed</h4>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-red-950/30 hover:bg-red-950/50 border border-red-900/40 text-red-400 rounded-xl text-xs font-bold transition mt-2"
            >
              Acknowledge & Close
            </button>
          </div>
        )}

        {/* Success / Details State */}
         {!loading && !error && booking && (
          <div className="space-y-6">
            
            {/* Status Hero Card */}
            <div className={`p-5 rounded-2xl border text-center flex flex-col items-center gap-3 transition shadow-lg ${badge?.bgColor} ${badge?.shadow}`}>
              {badge?.icon}
              <div>
                <h3 className="text-sm font-heading font-bold uppercase tracking-wider">{badge?.label}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Booking Ref: {booking.id}</p>
              </div>
            </div>

            {/* Late Arrival Warning Notification */}
            {lateMinutes > 0 && booking.status === 'Confirmed' && (
              <div className="p-4 bg-amber-500/10 border border-amber-550/20 rounded-2xl flex items-start gap-3 text-xs text-amber-400">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h5 className="font-bold text-amber-300">Late Arrival Notice</h5>
                  <p className="text-slate-350 leading-relaxed">
                    Student has arrived <strong className="font-mono text-sm text-amber-400">{lateMinutes} minutes</strong> late after the scheduled start time ({booking.startTime}).
                  </p>
                </div>
              </div>
            )}

            {/* Student Profile details */}
            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4.5 space-y-3.5">
              <h4 className="text-[11px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Student Profile Details
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Student Name</span>
                  <div className="text-sm font-bold text-white">{booking.userName}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">College ID / Registration</span>
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
            <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4.5 space-y-3.5">
              <h4 className="text-[11px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Booking Reservation Info
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
                    <Clock className="w-3.5 h-3.5 text-blue-500/60" /> {booking.startTime} - {booking.endTime}
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
                  <div className="space-y-1 mt-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Group Roster</span>
                    <div className="text-[11px] text-slate-350 bg-slate-900/50 p-2 rounded-xl border border-slate-900 font-mono">
                      {booking.groupMembers.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

             {/* Check-In Controls */}
            <div className="space-y-3 pt-2">
              {isAdmin ? (
                canCheckIn ? (
                  <button
                    onClick={() => onCheckIn(booking.id)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-heading font-extrabold text-sm transition active:scale-95 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" /> {lateMinutes > 0 ? `Accept & Close Slot (${lateMinutes}m Late)` : 'Confirm Check-In & Close Slot'}
                  </button>
                ) : (
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-xs text-slate-500 font-mono">
                    {booking.status === 'Completed' ? '✅ Slot is Closed (Student Checked In).' : '🔒 This slot cannot be checked in / closed (Cancelled or Expired).'}
                  </div>
                )
              ) : (
                <div className="p-3.5 bg-slate-900/50 border border-slate-850 rounded-2xl text-center text-xs text-slate-400 leading-relaxed">
                  📢 Scan verified successfully. Closing the slot requires a logged-in physical security administrator profile.
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-350 text-xs font-semibold transition"
              >
                Close Pass
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
