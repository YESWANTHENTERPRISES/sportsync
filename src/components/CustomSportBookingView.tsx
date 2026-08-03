import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, MapPin, Users, Info, AlignLeft, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { UserProfile, CustomSportBooking } from '../utils/mockDb';
import { MockDatabase } from '../utils/mockDb';

interface CustomSportBookingProps {
  currentUser: UserProfile;
  onBookingCreated: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onNavigateToBoard: () => void;
}

export const CustomSportBookingView: React.FC<CustomSportBookingProps> = ({
  currentUser,
  onBookingCreated,
  showToast,
  onNavigateToBoard
}) => {
  const [sportName, setSportName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('1hr');
  const [customDuration, setCustomDuration] = useState('');
  const [players, setPlayers] = useState(4);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [sharePhoneConsent, setSharePhoneConsent] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<CustomSportBooking | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sportName.trim()) {
      showToast('Please enter a sport or game name.', 'error');
      return;
    }
    if (!date) {
      showToast('Please select a match date.', 'error');
      return;
    }
    if (!time) {
      showToast('Please enter a start time.', 'error');
      return;
    }
    if (!location.trim()) {
      showToast('Please specify a match location or venue.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalDuration = duration === 'custom' ? customDuration : duration;
      const res = await MockDatabase.createCustomSport({
        sportName: sportName.trim(),
        date,
        time,
        duration: finalDuration || '1hr',
        maxPlayers: Number(players) || 4,
        joinedUsers: [currentUser.name], // Organizer joins by default
        location: location.trim(),
        description: description.trim() || undefined,
        isPublic,
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        aiSuggested: false, // Custom matches created by user
        sharePhoneConsent,
        organizerPhone: currentUser.phone
      });

      setCreatedEvent(res);
      showToast('Custom sport match created successfully!', 'success');
      onBookingCreated();
    } catch (e: any) {
      showToast(e.message || 'Failed to create match.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSportName('');
    setDate('');
    setTime('');
    setDuration('1hr');
    setCustomDuration('');
    setPlayers(4);
    setLocation('');
    setDescription('');
    setIsPublic(false);
    setSharePhoneConsent(false);
    setCreatedEvent(null);
  };

  if (createdEvent) {
    return (
      <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#1E2640]/90 to-[#0A0F1E]/95 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-slide-up">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white font-heading">Custom Match Scheduled!</h2>
          <p className="text-xs text-slate-400">Your custom event is officially active and registered.</p>
        </div>

        {/* Info Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-3">
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">EVENT REFERENCE ID</span>
            <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider select-all">{createdEvent.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] font-mono">SPORT GAME</span>
              <span className="font-semibold text-white mt-0.5 block">{createdEvent.sportName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-mono font-semibold">DATE & TIME</span>
              <span className="font-semibold text-white mt-0.5 block">{createdEvent.date} @ {createdEvent.time}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-mono font-semibold">DURATION</span>
              <span className="font-semibold text-white mt-0.5 block">{createdEvent.duration}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-mono font-semibold">VENUE / LOCATION</span>
              <span className="font-semibold text-white mt-0.5 block truncate">{createdEvent.location}</span>
            </div>
          </div>

          <div className="border-t border-slate-850 pt-3 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] font-mono">PRIVACY MODE</span>
              <span className="font-semibold text-white mt-0.5 block">
                {createdEvent.isPublic ? 'Public Match' : 'Private Match'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] font-mono">PLAYER SLOTS</span>
              <span className="font-semibold text-white mt-0.5 block">{createdEvent.joinedUsers.length} / {createdEvent.maxPlayers} Joined</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
          {createdEvent.isPublic && (
            <button
              onClick={onNavigateToBoard}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition active:scale-95 cursor-pointer"
            >
              Go to Community Board
            </button>
          )}
          <button
            onClick={handleResetForm}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition active:scale-95 cursor-pointer border border-slate-750"
          >
            Create Another Match
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-br from-[#1E2640]/40 to-[#0A0F1E]/80 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-blue-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h2 className="text-lg font-bold text-white font-heading">Custom Sport Booking</h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Can't find a predefined slot or standard court? Schedule your own custom match, set a custom spot, and invite players.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        
        {/* Sport Name */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-300 font-mono">Sport Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={sportName}
              onChange={(e) => setSportName(e.target.value)}
              placeholder="e.g. Street Football, Kabaddi, Chess Match..."
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3 text-white outline-none transition placeholder-slate-500"
            />
          </div>
        </div>

        {/* Date and Time Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-450" />
              Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-450" />
              Start Time (24h)
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none transition"
            />
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <label className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-450" />
            Duration Selector
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: '30min', label: '30 Min' },
              { id: '1hr', label: '1 Hour' },
              { id: '2hr', label: '2 Hours' },
              { id: 'custom', label: 'Custom' }
            ].map(dur => (
              <button
                key={dur.id}
                type="button"
                onClick={() => setDuration(dur.id)}
                className={`py-2.5 rounded-xl border font-semibold text-center transition cursor-pointer active:scale-95 ${
                  duration === dur.id
                    ? 'bg-blue-600/25 border-blue-500 text-blue-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>
          {duration === 'custom' && (
            <input
              type="text"
              required
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              placeholder="e.g. 1.5 Hours, 3 Hours..."
              className="w-full mt-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none transition"
            />
          )}
        </div>

        {/* Players Slot Count */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-450" />
            No. of Players Required
          </label>
          <input
            type="number"
            min={2}
            max={100}
            required
            value={players}
            onChange={(e) => setPlayers(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none transition"
          />
        </div>

        {/* Location & Description */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-450" />
            Location/Venue (Free Text)
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Open Ground near Hostel B, Room 102..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-slate-450" />
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe match rules, equipment needed, or player criteria..."
            rows={3}
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-3 text-white outline-none transition resize-none"
          />
        </div>

        {/* Privacy Note & Mobile Sharing Consent */}
        <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sharePhoneConsent}
              onChange={(e) => {
                const checked = e.target.checked;
                setSharePhoneConsent(checked);
                if (!checked) {
                  setIsPublic(false); // Force private if consent is withdrawn
                }
              }}
              className="mt-0.5 w-4.5 h-4.5 accent-blue-500 rounded border-slate-800 bg-slate-900 focus:ring-0 cursor-pointer"
            />
            <div className="space-y-1 text-left">
              <span className="font-bold text-slate-350 text-xs">Share Mobile Number</span>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                I agree to share my mobile number with users who request to join my public event.
              </p>
              <p className="text-[9px] text-slate-500 font-mono italic">
                Your number is only shown to registered VIT students.
              </p>
            </div>
          </label>
        </div>

        {/* Toggle Make Public vs Private */}
        <div className={`bg-slate-950/60 border border-slate-850 rounded-2xl p-4 flex items-center justify-between transition-opacity ${!sharePhoneConsent ? 'opacity-50' : ''}`}>
          <div className="space-y-0.5">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              {isPublic ? <Eye className="w-4 h-4 text-blue-400" /> : <EyeOff className="w-4 h-4 text-slate-450" />}
              Visibility Setting
            </span>
            <p className="text-[10px] text-slate-500">
              {isPublic 
                ? 'Public match: Auto-publishes to the Community Board for anyone to join.' 
                : 'Private match: Hidden from public views. Strictly invite only.'}
            </p>
          </div>
          <button
            type="button"
            disabled={!sharePhoneConsent}
            onClick={() => setIsPublic(!isPublic)}
            className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer disabled:cursor-not-allowed ${
              isPublic ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${
              isPublic ? 'translate-x-6' : ''
            }`} />
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide transition shadow-lg shadow-blue-600/10 cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? 'Creating Event...' : 'Create Match ✦'}
        </button>

      </form>

    </div>
  );
};
