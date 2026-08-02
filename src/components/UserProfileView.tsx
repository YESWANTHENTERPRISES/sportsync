import React, { useState } from 'react';
import { User, Phone, BookOpen, AlertCircle, FileSpreadsheet, Trash2, CheckSquare } from 'lucide-react';
import { UserProfile, Booking } from '../utils/mockDb';

interface UserProfileViewProps {
  currentUser: UserProfile;
  bookings: Booking[];
  onUpdatePreferences: (preferences: string[]) => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
}

const AVAILABLE_SPORTS = ['Badminton', 'Cricket', 'Basketball', 'Football', 'Tennis', 'Volley Ball', 'Table Tennis', 'Shuttlecock', 'Handball', 'Chess', 'Carrom', 'Throw Ball'];

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  bookings,
  onUpdatePreferences,
  onExportData,
  onDeleteAccount
}) => {
  const [editing, setEditing] = useState(false);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(currentUser.preferences);

  const userBookings = bookings.filter(b => b.userId === currentUser.id);
  const totalBookings = userBookings.length;
  const activeBookings = userBookings.filter(b => b.status === 'Confirmed').length;
  const cancellations = userBookings.filter(b => b.status === 'Cancelled').length;

  const handleTogglePref = (sport: string) => {
    if (selectedPrefs.includes(sport)) {
      setSelectedPrefs(selectedPrefs.filter(s => s !== sport));
    } else {
      setSelectedPrefs([...selectedPrefs, sport]);
    }
  };

  const handleSave = () => {
    onUpdatePreferences(selectedPrefs);
    setEditing(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Profile Card & Preferences */}
        <div className="flex-1 bg-[#1E2640] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-heading font-bold text-white">{currentUser.name}</h2>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-blue-400">
                  {currentUser.role}
                </span>
                <span>• College ID: {currentUser.collegeId}</span>
              </div>
              <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" /> {currentUser.phone}
              </div>
            </div>
          </div>

          {/* Preferences Tags */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-heading font-bold text-white">Sport Preferences</h3>
              {editing ? (
                <button 
                  onClick={handleSave}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Save Tags
                </button>
              ) : (
                <button 
                  onClick={() => setEditing(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
                >
                  Edit Tags
                </button>
              )}
            </div>

            {editing ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {AVAILABLE_SPORTS.map(sport => {
                  const selected = selectedPrefs.includes(sport);
                  return (
                    <button
                      key={sport}
                      onClick={() => handleTogglePref(sport)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selected 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-slate-950 border-slate-800 text-slate-450 hover:text-white'
                      }`}
                    >
                      {sport}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {currentUser.preferences.length === 0 ? (
                  <div className="text-xs text-slate-500 italic">No preferences set. Click Edit.</div>
                ) : (
                  currentUser.preferences.map(sport => (
                    <span 
                      key={sport}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300"
                    >
                      {sport}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Data controls GDPR-lite */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">Account Actions & GDPR</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={onExportData}
                className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                Export My Data (.json)
              </button>
              <button
                onClick={onDeleteAccount}
                className="py-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/50 text-xs font-semibold text-red-400 transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Profile Statistics Column */}
        <div className="w-full lg:w-96 grid grid-cols-3 lg:grid-cols-1 gap-4 shrink-0">
          {[
            { label: 'Total Pre-Bookings', val: totalBookings, desc: 'Slots reserved overall', color: 'text-white' },
            { label: 'Active Slots', val: activeBookings, desc: 'Current scheduled bookings', color: 'text-blue-400' },
            { label: 'Cancellations', val: cancellations, desc: 'Released slot reservations', color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1E2640] border border-slate-800 rounded-2xl p-5 space-y-1">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">{stat.label}</div>
              <div className={`text-3xl font-heading font-bold ${stat.color} font-mono`}>{stat.val}</div>
              <div className="text-[10px] text-slate-450">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Booking History */}
      <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          Recent Booking History
        </h3>
        
        {userBookings.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm text-slate-400 font-medium">No bookings logged yet</div>
            <p className="text-xs text-slate-550 max-w-xs mx-auto">Once you pre-book a sports court, your reservation history will display here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2.5 font-medium">Booking ID</th>
                  <th className="py-2.5 font-medium">Facility</th>
                  <th className="py-2.5 font-medium">Sport</th>
                  <th className="py-2.5 font-medium">Schedule</th>
                  <th className="py-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {userBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-3 font-mono font-semibold text-blue-400">{b.id}</td>
                    <td className="py-3">{b.facilityName} ({b.courtNumber})</td>
                    <td className="py-3 font-semibold text-white">{b.sportType}</td>
                    <td className="py-3 font-mono">{b.date} | {b.startTime} - {b.endTime}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        b.status === 'Confirmed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : b.status === 'Cancelled'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-slate-700/20 text-slate-400 border border-slate-700/30'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
