import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Search, 
  Calendar, 
  Users, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  UserPlus, 
  Phone, 
  X, 
  Clock, 
  AlertCircle, 
  Check, 
  Trash, 
  Sliders
} from 'lucide-react';
import { UserProfile, CustomSportBooking, JoinRequest } from '../utils/mockDb';

interface CommunityBoardProps {
  currentUser: UserProfile;
  events: CustomSportBooking[];
  onJoinMatch: (eventId: string) => Promise<void>;
  onCreateNewMatch: () => void;
  joinRequests: JoinRequest[];
  onSendJoinRequest: (eventId: string, message: string) => Promise<void>;
  onUpdateJoinRequestStatus: (requestId: string, status: 'Accepted' | 'Declined') => Promise<void>;
  onUpdateCustomSportControls: (eventId: string, stopAccepting: boolean, isFullOverride: boolean) => Promise<void>;
  onRemoveAcceptedPlayer: (eventId: string, playerName: string) => Promise<void>;
  onToggleEquipment: (eventId: string, pickedUp: boolean) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const CommunityBoardView: React.FC<CommunityBoardProps> = ({
  currentUser,
  events,
  onCreateNewMatch,
  joinRequests,
  onSendJoinRequest,
  onUpdateJoinRequestStatus,
  onUpdateCustomSportControls,
  onRemoveAcceptedPlayer,
  onToggleEquipment,
  onDeleteEvent,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'my-events'>('browse');
  const [sportFilter, setSportFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [onlyOpenSlots, setOnlyOpenSlots] = useState(false);

  // Modals state
  const [joinModalEvent, setJoinModalEvent] = useState<CustomSportBooking | null>(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [manageModalEvent, setManageModalEvent] = useState<CustomSportBooking | null>(null);
  const [selectedQREvent, setSelectedQREvent] = useState<CustomSportBooking | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Force re-renders for countdown clock updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate QR code when equipment checkout is requested
  useEffect(() => {
    if (selectedQREvent) {
      const generateQR = async () => {
        try {
          const origin = window.location.origin;
          const verificationUrl = `${origin}/verify.html?verifyEquipment=${selectedQREvent.id}`;
          const url = await QRCode.toDataURL(verificationUrl, {
            margin: 2,
            width: 200,
            color: {
              dark: '#0B224E',
              light: '#FFFFFF'
            }
          });
          setQrCodeUrl(url);
        } catch (err) {
          console.error('Error generating equipment QR Code:', err);
        }
      };
      generateQR();
    } else {
      setQrCodeUrl('');
    }
  }, [selectedQREvent]);

  // Filter calculations
  const filteredEvents = events.filter(evt => {
    if (!evt.isPublic) return false;
    
    // Sport name match
    if (sportFilter && !evt.sportName.toLowerCase().includes(sportFilter.toLowerCase())) {
      return false;
    }
    // Date match
    if (dateFilter && evt.date !== dateFilter) {
      return false;
    }
    // Open slots match
    if (onlyOpenSlots) {
      const isFull = evt.joinedUsers.length >= evt.maxPlayers || evt.isFullOverride;
      if (isFull || evt.stopAccepting) return false;
    }
    return true;
  });

  // Calculate my pending incoming requests count
  const myEvents = events.filter(e => e.organizerId === currentUser.id);
  const myEventIds = myEvents.map(e => e.id);
  const pendingIncomingRequests = joinRequests.filter(r => r.status === 'Pending' && myEventIds.includes(r.eventId));
  const pendingIncomingCount = pendingIncomingRequests.length;

  const handleOpenJoinRequest = (evt: CustomSportBooking) => {
    setJoinMessage('Hey, can I join? I play striker.');
    setJoinModalEvent(evt);
  };

  const handleSendRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinModalEvent) return;
    await onSendJoinRequest(joinModalEvent.id, joinMessage);
    setJoinModalEvent(null);
  };

  const handleBulkAction = async (eventId: string, status: 'Accepted' | 'Declined') => {
    const targets = joinRequests.filter(r => r.eventId === eventId && r.status === 'Pending');
    for (const req of targets) {
      await onUpdateJoinRequestStatus(req.id, status);
    }
  };

  // Helper to format remaining countdown time (2 hours auto-revoke window)
  const getRemainingTimeText = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (3600 * 1000));
    const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    return `Request expires in ${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Creator Notification Banner */}
      {pendingIncomingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <div className="text-left">
              <h4 className="text-xs font-bold text-slate-900 font-heading">
                {pendingIncomingCount} player{pendingIncomingCount > 1 ? 's' : ''} want to join your matches
              </h4>
              <p className="text-[10px] text-slate-500">
                You have active pending player approvals waiting for your confirmation.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('my-events')}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-[10px] uppercase rounded-lg transition active:scale-95 cursor-pointer shadow-sm border border-amber-400"
          >
            Review Requests
          </button>
        </div>
      )}

      {/* Header and Filter controls */}
      <div className="bg-[#0A0F1E] border border-slate-200 rounded-3xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-left">
            <h2 className="text-base font-bold text-[#0B224E] font-heading">Student Community Match Board</h2>
            <p className="text-xs text-slate-500">Join matches created by other students or create your own custom game.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'browse' ? 'my-events' : 'browse')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer border ${
                activeTab === 'my-events'
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {activeTab === 'my-events' ? 'Browse Grid' : 'My Custom Events'}
            </button>
            <button
              onClick={onCreateNewMatch}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-600/10 border border-blue-500/35 font-heading"
            >
              Create Custom Match ✦
            </button>
          </div>
        </div>

        {/* Filter controls bar (only for browse mode) */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-2">
            {/* Sport type search */}
            <div className="relative text-xs">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                placeholder="Filter by sport name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder-slate-450 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition"
              />
            </div>

            {/* Date Picker */}
            <div className="relative text-xs">
              <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition"
              />
            </div>

            {/* Checkbox Open Slots */}
            <label className="flex items-center gap-2 px-3 py-3 border border-slate-200 bg-slate-50/50 rounded-xl cursor-pointer hover:border-slate-300 transition">
              <input
                type="checkbox"
                checked={onlyOpenSlots}
                onChange={(e) => setOnlyOpenSlots(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded border-slate-350 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-slate-700 font-semibold select-none">Show Open Slots Only</span>
            </label>
          </div>
        )}
      </div>

      {/* Grid List - Browse public events */}
      {activeTab === 'browse' ? (
        filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map(evt => {
              const isCreator = evt.organizerId === currentUser.id;
              const hasJoined = evt.joinedUsers.includes(currentUser.name);
              const progress = (evt.joinedUsers.length / evt.maxPlayers) * 100;

              // Check request status
              const myRequest = joinRequests.find(r => r.eventId === evt.id && r.requesterId === currentUser.id);
              const isPending = myRequest?.status === 'Pending';
              const isAccepted = myRequest?.status === 'Accepted' || hasJoined;
              const isDeclinedOrExpired = myRequest?.status === 'Declined' || myRequest?.status === 'Expired';

              // Card availability status
              const isClosed = evt.stopAccepting;
              const isFull = evt.joinedUsers.length >= evt.maxPlayers || evt.isFullOverride;

              return (
                <div 
                  key={evt.id}
                  className={`bg-white border rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition ${
                    isAccepted ? 'border-emerald-300 ring-1 ring-emerald-500/10' : 'border-slate-200'
                  }`}
                >
                  
                  {/* Card Title & AI Badge */}
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-slate-900 tracking-wide line-clamp-1">{evt.sportName}</h3>
                      <div className="flex items-center gap-1 shrink-0">
                        {evt.aiSuggested && (
                          <span className="flex items-center gap-0.5 text-[9px] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-bold font-mono">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI SLOT
                          </span>
                        )}
                        {isCreator && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold font-mono">
                            MINE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {evt.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  {/* Organizer Details */}
                  <div className="flex items-center gap-2.5 border-t border-b border-slate-100 py-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center text-xs font-bold text-blue-600 uppercase">
                      {evt.organizerName.charAt(0)}
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] text-slate-400 font-mono block uppercase">ORGANIZER</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">{evt.organizerName}</span>
                    </div>
                  </div>

                  {/* Venue & Time Info */}
                  <div className="space-y-2 text-[11px] text-slate-650 text-left">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{evt.date} @ {evt.time} ({evt.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>

                  {/* Slots Progress & CTA Box */}
                  <div className="space-y-3 pt-2">
                    
                    {/* Progress slider bar */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between text-[10px] font-semibold">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Players Joined
                        </span>
                        <span className={isFull ? 'text-rose-600 font-mono font-bold' : 'text-slate-800 font-mono font-bold'}>
                          {evt.joinedUsers.length} / {evt.maxPlayers}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isFull ? 'bg-rose-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>

                    {/* CTA Flow Decisions */}
                    {isCreator ? (
                      <button
                        onClick={() => setManageModalEvent(evt)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sliders className="w-4 h-4 text-slate-500" />
                        Manage Event
                      </button>
                    ) : isAccepted ? (
                      <div className="space-y-2">
                        <div className="w-full py-2 bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Joined Match
                        </div>
                        <p className="text-[10px] text-emerald-600 font-semibold text-center bg-emerald-50 py-1.5 px-2 rounded-lg leading-normal">
                          🎉 You're in! Show up at {evt.location} by {evt.time}.
                        </p>
                      </div>
                    ) : isPending ? (
                      <div className="space-y-2">
                        <div className="w-full py-2 bg-amber-50 border border-amber-250 text-amber-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                          Pending Approval
                        </div>
                        <div className="flex flex-col gap-1.5 items-center bg-amber-50 border border-amber-150 p-2 rounded-xl text-center">
                          <p className="text-[10px] text-amber-800 font-semibold leading-relaxed">
                            Request sent. Waiting for approval.
                          </p>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-[9px] font-bold text-amber-800">
                            {getRemainingTimeText(myRequest.expiresAt)}
                          </span>
                        </div>
                      </div>
                    ) : isDeclinedOrExpired ? (
                      <div className="space-y-2">
                        <div className="w-full py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          Not Approved
                        </div>
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[10px] text-center leading-normal">
                          Your request was not approved. Try another event or create your own.
                        </div>
                        <button
                          onClick={() => handleOpenJoinRequest(evt)}
                          disabled={isClosed || isFull}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
                        >
                          Re-submit Request
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenJoinRequest(evt)}
                        disabled={isClosed || isFull}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 ${
                          isClosed 
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                            : isFull
                            ? 'bg-rose-50 text-rose-500 border border-rose-200 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/20 shadow-sm shadow-blue-600/5'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        {isClosed ? 'Registrations Closed' : isFull ? 'Match Full' : 'Request to Join'}
                      </button>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-slate-250 rounded-3xl py-16 px-6 text-center bg-white space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">No events yet — create one!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No matching public custom events are active right now. Schedule your own custom game to invite others!
              </p>
            </div>
          </div>
        )
      ) : (
        /* Creator dashboard view */
        myEvents.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-left">
              <h3 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-wider">My Public Custom Events</h3>
              <span className="text-[10px] text-slate-450">Manage player slots, accept incoming request queues, and adjust limits.</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {myEvents.map(evt => {
                const incoming = joinRequests.filter(r => r.eventId === evt.id);
                const pendings = incoming.filter(r => r.status === 'Pending');
                const acceptedCount = evt.joinedUsers.length;
                
                return (
                  <div key={evt.id} className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-5 text-left">
                    {/* Event Title Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-850 font-heading">{evt.sportName}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 font-bold rounded">
                            {evt.date} @ {evt.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Venue: {evt.location} | Active Players: {acceptedCount}/{evt.maxPlayers}</p>
                      </div>

                      {/* Controls Toggle Group */}
                      <div className="flex items-center gap-3 self-start sm:self-center">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                          <input 
                            type="checkbox"
                            checked={evt.stopAccepting || false}
                            onChange={(e) => onUpdateCustomSportControls(evt.id, e.target.checked, evt.isFullOverride || false)}
                            className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-slate-600 select-none">Stop Requests</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                          <input 
                            type="checkbox"
                            checked={evt.isFullOverride || false}
                            onChange={(e) => onUpdateCustomSportControls(evt.id, evt.stopAccepting || false, e.target.checked)}
                            className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-slate-600 select-none">Mark Full</span>
                        </label>
                      </div>
                    </div>

                    {/* Equipment checkout status & deletion controls */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🎒</span>
                        <div className="text-left">
                          <h5 className="text-xs font-bold text-slate-800">Sport Equipment Status</h5>
                          {evt.sportEquipmentPickedUp ? (
                            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              ● Checked Out
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full">
                              ● Not Checked Out (Returned)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {evt.sportEquipmentPickedUp ? (
                          <button
                            onClick={() => onToggleEquipment(evt.id, false)}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase rounded-xl transition cursor-pointer"
                          >
                            Return Equipment
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggleEquipment(evt.id, true)}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase rounded-xl transition cursor-pointer"
                          >
                            Check Out Equipment
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (evt.sportEquipmentPickedUp) {
                              showToast("Cannot delete event: You must return the checked-out sports equipment first.", "error");
                            } else {
                              if (window.confirm("Are you sure you want to delete this custom sport match?")) {
                                onDeleteEvent(evt.id);
                              }
                            }
                          }}
                          className={`px-3.5 py-2 border rounded-xl font-bold text-[10px] uppercase transition cursor-pointer flex items-center gap-1 ${
                            evt.sportEquipmentPickedUp
                              ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                              : 'border-rose-200 text-rose-600 hover:bg-rose-55'
                          }`}
                        >
                          <Trash className="w-3.5 h-3.5" />
                          Delete Event
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Active accepted list */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono font-bold text-slate-450 block uppercase tracking-wide">
                          Accepted Players ({acceptedCount} / {evt.maxPlayers})
                        </span>
                        
                        {evt.joinedUsers.length > 0 ? (
                          <div className="border border-slate-150 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
                            {evt.joinedUsers.map((player, pIdx) => {
                              const isSelf = player === currentUser.name;
                              return (
                                <div key={pIdx} className="flex justify-between items-center p-3 text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-center uppercase">
                                      {player.charAt(0)}
                                    </div>
                                    <span className="font-semibold text-slate-350">
                                      {player} {isSelf && <span className="text-[9px] text-slate-700 font-normal">(Organizer)</span>}
                                    </span>
                                  </div>
                                  {!isSelf && (
                                    <button 
                                      onClick={() => onRemoveAcceptedPlayer(evt.id, player)}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                      title="Remove player"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-450 italic p-3 border border-dashed border-slate-200 rounded-2xl bg-white text-center">
                            No players accepted yet.
                          </p>
                        )}
                      </div>

                      {/* Pending requests panel with bulk action */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold text-amber-600 block uppercase tracking-wide">
                            Pending Requests ({pendings.length})
                          </span>
                          
                          {pendings.length > 0 && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleBulkAction(evt.id, 'Accepted')}
                                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded border border-emerald-250 cursor-pointer"
                              >
                                Accept All
                              </button>
                              <button
                                onClick={() => handleBulkAction(evt.id, 'Declined')}
                                className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold rounded border border-rose-250 cursor-pointer"
                              >
                                Decline All
                              </button>
                            </div>
                          )}
                        </div>

                        {pendings.length > 0 ? (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {pendings.map(req => (
                              <div key={req.id} className="p-3 border border-slate-150 bg-slate-50/20 rounded-2xl space-y-2 text-xs relative">
                                <div className="flex justify-between items-start gap-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-50 text-[10px] font-bold text-blue-700 flex items-center justify-center uppercase shrink-0">
                                      {req.requesterName.charAt(0)}
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-350 block">{req.requesterName}</span>
                                      <span className="text-[9px] text-slate-700 font-mono block">VIT ID: {req.registrationId}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button
                                      onClick={() => onUpdateJoinRequestStatus(req.id, 'Accepted')}
                                      className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition cursor-pointer"
                                      title="Accept request"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => onUpdateJoinRequestStatus(req.id, 'Declined')}
                                      className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer"
                                      title="Decline request"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                
                                {req.message && (
                                  <p className="text-[10px] text-slate-350 bg-slate-50 p-2 rounded-xl italic leading-relaxed">
                                    "{req.message}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-450 italic p-3 border border-dashed border-slate-200 rounded-2xl bg-white text-center">
                            No active pending requests for this event.
                          </p>
                        )}

                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-slate-250 rounded-3xl py-16 px-6 text-center bg-white space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-450">
              <Sliders className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">You haven't scheduled any custom events</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you create a public custom match, you will be able to manage players and request queues right here.
              </p>
            </div>
          </div>
        )
      )}

      {/* 2. REQUEST TO JOIN MODAL (Page 15 Step 1) */}
      {joinModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider flex items-center gap-1">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Submit Match Entry Request
              </h3>
              <button 
                onClick={() => setJoinModalEvent(null)} 
                className="text-slate-450 hover:text-slate-850 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Event overview summary */}
            <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex flex-col gap-2 text-xs text-left">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-855 text-sm font-heading">{joinModalEvent.sportName}</span>
                <span className="font-mono text-[9px] bg-blue-50 border border-blue-200 text-blue-600 px-2 py-0.5 rounded">
                  {joinModalEvent.date} @ {joinModalEvent.time}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Location/Venue: {joinModalEvent.location}</p>
              
              {/* Creator details */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 mt-1">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-[9px] font-bold text-blue-600 flex items-center justify-center uppercase shrink-0">
                  {joinModalEvent.organizerName.charAt(0)}
                </div>
                <span className="text-[10px] text-slate-600">
                  Organizer: <strong className="text-slate-350">{joinModalEvent.organizerName}</strong>
                </span>
              </div>
            </div>

            {/* Prominent Call Box tel: link */}
            {joinModalEvent.sharePhoneConsent && joinModalEvent.organizerPhone && (
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between gap-3 text-xs text-left">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider block">Can't wait? Call the organizer directly</span>
                  <a 
                    href={`tel:${joinModalEvent.organizerPhone}`} 
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline mt-1"
                  >
                    <Phone className="w-4 h-4 text-blue-600 animate-pulse" />
                    +91 {joinModalEvent.organizerPhone}
                  </a>
                </div>
                <span className="text-[9px] text-slate-450 font-mono text-right max-w-[120px] leading-tight">
                  Tappable link available for VIT students.
                </span>
              </div>
            )}

            {/* Request Submission form */}
            <form onSubmit={handleSendRequestSubmit} className="space-y-4 text-xs">
              <div className="space-y-1 text-left">
                <label className="font-bold text-slate-700 font-mono">Message for Organizer (Optional)</label>
                <textarea
                  required
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  placeholder="Hey, can I join? I play striker."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-slate-900 outline-none transition resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setJoinModalEvent(null)}
                  className="flex-1 py-2.5 border border-slate-250 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition cursor-pointer active:scale-95"
                >
                  Send Request
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 3. MANAGE PLAYERS QUICK MODAL (Fallback click from card) */}
      {manageModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 font-heading">
                Manage Players: {manageModalEvent.sportName}
              </h3>
              <button 
                onClick={() => setManageModalEvent(null)} 
                className="text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Status Toggles */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-150 rounded-2xl">
              <label className="flex items-center gap-2 cursor-pointer p-1 justify-center bg-white border border-slate-200 rounded-xl">
                <input 
                  type="checkbox"
                  checked={manageModalEvent.stopAccepting || false}
                  onChange={(e) => {
                    onUpdateCustomSportControls(manageModalEvent.id, e.target.checked, manageModalEvent.isFullOverride || false);
                    setManageModalEvent(prev => prev ? { ...prev, stopAccepting: e.target.checked } : null);
                  }}
                  className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer"
                />
                <span className="text-[10px] font-bold text-slate-600 select-none">Stop Accepting Requests</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-1 justify-center bg-white border border-slate-200 rounded-xl">
                <input 
                  type="checkbox"
                  checked={manageModalEvent.isFullOverride || false}
                  onChange={(e) => {
                    onUpdateCustomSportControls(manageModalEvent.id, manageModalEvent.stopAccepting || false, e.target.checked);
                    setManageModalEvent(prev => prev ? { ...prev, isFullOverride: e.target.checked } : null);
                  }}
                  className="w-3.5 h-3.5 accent-rose-600 rounded cursor-pointer"
                />
                <span className="text-[10px] font-bold text-slate-600 select-none">Mark Event as Full</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
              
              {/* Accepted section */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-mono font-bold text-slate-450 block uppercase tracking-wide">
                  Accepted ({manageModalEvent.joinedUsers.length} / {manageModalEvent.maxPlayers})
                </span>

                <div className="border border-slate-150 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-slate-50/50 max-h-[220px] overflow-y-auto">
                  {manageModalEvent.joinedUsers.map((player, pIdx) => {
                    const isSelf = player === currentUser.name;
                    return (
                      <div key={pIdx} className="flex justify-between items-center p-3 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-5.5 h-5.5 rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center uppercase shrink-0">
                            {player.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-350 truncate max-w-[120px]">
                            {player}
                          </span>
                        </div>
                        {!isSelf && (
                          <button 
                            onClick={async () => {
                              await onRemoveAcceptedPlayer(manageModalEvent.id, player);
                              setManageModalEvent(prev => prev ? { ...prev, joinedUsers: prev.joinedUsers.filter(u => u !== player) } : null);
                            }}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pending section */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-mono font-bold text-amber-600 block uppercase tracking-wide">
                  Pending Request Inbox
                </span>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {joinRequests
                    .filter(r => r.eventId === manageModalEvent.id && r.status === 'Pending')
                    .map(req => (
                      <div key={req.id} className="p-2.5 border border-slate-150 bg-slate-50/30 rounded-2xl space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-350 block leading-tight">{req.requesterName}</span>
                            <span className="text-[9px] text-slate-700 font-mono block">ID: {req.registrationId}</span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={async () => {
                                await onUpdateJoinRequestStatus(req.id, 'Accepted');
                                setManageModalEvent(prev => prev ? { ...prev, joinedUsers: [...prev.joinedUsers, req.requesterName] } : null);
                              }}
                              className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                await onUpdateJoinRequestStatus(req.id, 'Declined');
                              }}
                              className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>

            {/* Modal Equipment & Delete Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 mt-3">
              <div className="flex items-center gap-2 text-left">
                <span className="text-lg">🎒</span>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800">Equipment Checkout</h5>
                  {manageModalEvent.sportEquipmentPickedUp ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full">
                      ● Checked Out
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-250 px-1.5 py-0.5 rounded-full">
                      ● Returned
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {manageModalEvent.sportEquipmentPickedUp ? (
                  <button
                    onClick={async () => {
                      await onToggleEquipment(manageModalEvent.id, false);
                      setManageModalEvent(prev => prev ? { ...prev, sportEquipmentPickedUp: false } : null);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] uppercase rounded-lg transition cursor-pointer"
                  >
                    Return
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedQREvent(manageModalEvent);
                    }}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] uppercase rounded-lg transition cursor-pointer"
                  >
                    Check Out
                  </button>
                )}

                <button
                  onClick={async () => {
                    if (manageModalEvent.sportEquipmentPickedUp) {
                      showToast("Cannot delete event: You must return the checked-out sports equipment first.", "error");
                    } else {
                      if (window.confirm("Are you sure you want to delete this custom sport match?")) {
                        await onDeleteEvent(manageModalEvent.id);
                        setManageModalEvent(null);
                      }
                    }
                  }}
                  className={`px-2.5 py-1.5 border rounded-lg font-bold text-[9px] uppercase transition flex items-center gap-1 cursor-pointer ${
                    manageModalEvent.sportEquipmentPickedUp
                      ? 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                      : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <Trash className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>

            <button
              onClick={() => setManageModalEvent(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition cursor-pointer text-xs"
            >
              Done Managing
            </button>

          </div>
        </div>
      )}
      {/* 4. EQUIPMENT QR CODE CHECKOUT PASS MODAL */}
      {selectedQREvent && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-mono font-bold text-blue-600">VIT Chennai Equipment Pass</span>
              <button 
                onClick={() => setSelectedQREvent(null)}
                className="text-slate-450 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* QR Visual */}
            <div className="p-4 bg-white rounded-2xl w-48 h-48 mx-auto flex flex-col items-center justify-center gap-1.5 border border-slate-200 shadow-inner">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Equipment QR Code Pass" className="w-38 h-38" />
              ) : (
                <div className="w-38 h-38 flex items-center justify-center text-slate-400 text-xs font-mono">
                  Generating...
                </div>
              )}
              <span className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider">Scan at Sports Desk</span>
            </div>

            <div className="space-y-1">
              <h4 className="font-heading font-bold text-slate-850 text-base">{selectedQREvent.sportName} Equipment</h4>
              <p className="text-xs text-slate-500 font-mono">{selectedQREvent.location} | {selectedQREvent.date} @ {selectedQREvent.time}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-left text-xs font-mono space-y-1 text-slate-750">
              <div className="flex justify-between">
                <span className="text-slate-450">Organizer:</span>
                <span className="text-slate-850 font-bold">{selectedQREvent.organizerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Event Key:</span>
                <span className="text-blue-600 font-bold">{selectedQREvent.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Kits Required:</span>
                <span className="text-slate-800 font-bold">{selectedQREvent.sportName} Standard Set</span>
              </div>
            </div>

            <button
              onClick={async () => {
                await onToggleEquipment(selectedQREvent.id, true);
                if (manageModalEvent && manageModalEvent.id === selectedQREvent.id) {
                  setManageModalEvent(prev => prev ? { ...prev, sportEquipmentPickedUp: true } : null);
                }
                setSelectedQREvent(null);
                showToast("Equipment checked out successfully via QR verification!", "success");
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-heading transition active:scale-95 cursor-pointer"
            >
              Confirm / Complete Checkout
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
