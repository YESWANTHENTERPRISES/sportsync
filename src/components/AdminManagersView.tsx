import React, { useState } from 'react';
import { 
  Building2, 
  CalendarRange, 
  BookOpen, 
  UserX, 
  Plus, 
  Ban, 
  Unlock, 
  Trash2, 
  Sliders, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  X,
  Megaphone,
  QrCode,
  Upload,
  Search,
  Check
} from 'lucide-react';
import jsQR from 'jsqr';
import { UserProfile, SportFacility, Booking, AuditLog, AdminConfig, Announcement, formatTo12Hour, convertTo24Hour, getISTDate, FacilitySlot, MockDatabase } from '../utils/mockDb';

interface AdminManagersProps {
  activeTab: 'admin-facilities' | 'admin-slots' | 'admin-bookings' | 'admin-users' | 'admin-announcements';
  facilities: SportFacility[];
  slots: FacilitySlot[];
  bookings: Booking[];
  users: UserProfile[];
  config: AdminConfig;
  announcements?: Announcement[];
  onAddFacility: (fac: Omit<SportFacility, 'id'>) => void;
  onUpdateFacility: (id: string, updates: Partial<SportFacility>) => void;
  onDeleteFacility: (id: string) => void;
  onUpdateConfig: (cfg: AdminConfig) => void;
  onUpdateSlotStatus: (slotId: string, status: any) => void;
  onBulkBlockSlots: (startDate: string, endDate: string, sportType?: string) => void;
  onBulkGenerateSlots: (dateRange: string[]) => void;
  onCancelBooking: (bookingId: string) => void;
  onToggleBanUser: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onAddAnnouncement?: (message: string) => void;
  onToggleAnnouncement?: (id: string, active: boolean) => void;
  onDeleteAnnouncement?: (id: string) => void;
}

export const AdminManagersView: React.FC<AdminManagersProps> = ({
  activeTab,
  facilities,
  slots,
  bookings,
  users,
  config,
  announcements = [],
  onAddFacility,
  onUpdateFacility,
  onDeleteFacility,
  onUpdateConfig,
  onUpdateSlotStatus,
  onBulkBlockSlots,
  onBulkGenerateSlots,
  onCancelBooking,
  onToggleBanUser,
  onDeleteUser,
  onAddAnnouncement,
  onToggleAnnouncement,
  onDeleteAnnouncement
}) => {
  const [newAnnMsg, setNewAnnMsg] = useState('');

  // QR Check-in states
  const [manualCode, setManualCode] = useState('');
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [scannedStudent, setScannedStudent] = useState<UserProfile | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccessMsg, setScanSuccessMsg] = useState<string | null>(null);

  const lookupBooking = async (bookingId: string) => {
    if (!bookingId) return;
    setScanLoading(true);
    setScanError(null);
    setScanSuccessMsg(null);
    setScannedBooking(null);
    setScannedStudent(null);
    
    try {
      const cleanId = bookingId.trim();
      const booking = await MockDatabase.getBookingById(cleanId);
      if (booking) {
        setScannedBooking(booking);
        const studentProfile = await MockDatabase.getUserById(booking.userId);
        if (studentProfile) {
          setScannedStudent(studentProfile);
        }
      } else {
        setScanError(`Booking code "${cleanId}" not found in registry.`);
      }
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || 'Error occurred while looking up booking ID.');
    } finally {
      setScanLoading(false);
    }
  };

  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanLoading(true);
    setScanError(null);
    setScanSuccessMsg(null);
    setScannedBooking(null);
    setScannedStudent(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            setScanError('Failed to get canvas 2D context.');
            setScanLoading(false);
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0, img.width, img.height);
          const imageData = context.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            console.log('QR Code Decoded:', code.data);
            
            // Extract booking ID via regex matching (URL query param or raw text field)
            const urlMatch = code.data.match(/verifyBooking=([A-Za-z0-9-]+)/);
            const idMatch = code.data.match(/Booking ID:\s*([A-Za-z0-9-]+)/i);
            
            let bookingId = code.data.trim();
            if (urlMatch) {
              bookingId = urlMatch[1];
            } else if (idMatch) {
              bookingId = idMatch[1];
            }
            
            lookupBooking(bookingId);
          } else {
            setScanError('Could not find any readable QR Code in this image.');
            setScanLoading(false);
          }
        } catch (err: any) {
          console.error(err);
          setScanError('Error decoding image file.');
          setScanLoading(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGateCheckIn = async () => {
    if (!scannedBooking) return;
    setScanLoading(true);
    try {
      const res = await MockDatabase.checkInBooking(scannedBooking.id, 'usr-admin');
      if (res.success) {
        setScanSuccessMsg(res.message);
        const updated = await MockDatabase.getBookingById(scannedBooking.id);
        if (updated) setScannedBooking(updated);
      } else {
        setScanError(res.message);
      }
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || 'Check-in transaction failed.');
    } finally {
      setScanLoading(false);
    }
  };

  const handleGateCloseSlot = async () => {
    if (!scannedBooking) return;
    setScanLoading(true);
    try {
      const res = await MockDatabase.closeBookingSlot(scannedBooking.id, 'usr-admin');
      if (res.success) {
        setScanSuccessMsg(res.message);
        const updated = await MockDatabase.getBookingById(scannedBooking.id);
        if (updated) setScannedBooking(updated);
      } else {
        setScanError(res.message);
      }
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || 'Close slot transaction failed.');
    } finally {
      setScanLoading(false);
    }
  };
  // Facility Form Modal State
  const [facModalOpen, setFacModalOpen] = useState(false);
  const [newFacName, setNewFacName] = useState('');
  const [newFacSport, setNewFacSport] = useState<'Badminton' | 'Cricket' | 'Basketball' | 'Football' | 'Tennis' | 'Volley Ball' | 'Table Tennis' | 'Shuttlecock' | 'Handball' | 'Chess' | 'Carrom' | 'Throw Ball'>('Badminton');
  const [newFacLoc, setNewFacLoc] = useState('');
  const [newFacCourt, setNewFacCourt] = useState('Court 1');
  const [newFacCap, setNewFacCap] = useState(4);
  const [newFacPhoto, setNewFacPhoto] = useState('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600');

  // Config State
  const [advWindow, setAdvWindow] = useState(config.advanceBookingWindowDays);
  const [maxDaily, setMaxDaily] = useState(config.maxBookingsPerUserPerDay);
  
  // Bulk block scheduler state
  const [bulkStart, setBulkStart] = useState('');
  const [bulkEnd, setBulkEnd] = useState('');
  const [bulkSport, setBulkSport] = useState('ALL');

  // Edit Facility State
  const [editingFacId, setEditingFacId] = useState<string | null>(null);

  const handleCreateFacility = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFacility({
      name: newFacName,
      sportType: newFacSport,
      location: newFacLoc,
      courtNumber: newFacCourt,
      capacity: newFacCap,
      photoUrl: newFacPhoto,
      status: 'Active'
    });
    setNewFacName('');
    setNewFacLoc('');
    setFacModalOpen(false);
  };

  const handleAnnPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnMsg.trim() || !onAddAnnouncement) return;
    onAddAnnouncement(newAnnMsg.trim());
    setNewAnnMsg('');
  };

  const handleSaveConfig = () => {
    onUpdateConfig({
      advanceBookingWindowDays: advWindow,
      maxBookingsPerUserPerDay: maxDaily,
      weatherThresholdAlert: config.weatherThresholdAlert
    });
  };

  const handleBulkBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkStart || !bulkEnd) return;
    onBulkBlockSlots(bulkStart, bulkEnd, bulkSport === 'ALL' ? undefined : bulkSport);
    setBulkStart('');
    setBulkEnd('');
    alert(`Bulk blocked slots from ${bulkStart} to ${bulkEnd} successfully.`);
  };

  const triggerGenerateNextWeek = () => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    onBulkGenerateSlots(dates);
    alert('Regenerated slots for next 7 days.');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* 1. FACILITY MANAGER TAB */}
      {activeTab === 'admin-facilities' && (
        <div className="space-y-6">
          {/* Config parameters slider form */}
          <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-heading font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-400" />
              Global Pre-Booking Parameters
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Advance Booking Window (Days)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={14}
                    value={advWindow}
                    onChange={(e) => setAdvWindow(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-xs font-mono font-bold text-white shrink-0">{advWindow} Days</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Max Bookings Per Student Per Day</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={maxDaily}
                    onChange={(e) => setMaxDaily(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-xs font-mono font-bold text-white shrink-0">{maxDaily} Bookings</span>
                </div>
              </div>

              <button
                onClick={handleSaveConfig}
                className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs transition active:scale-95 shadow"
              >
                Apply Parameters
              </button>
            </div>
          </div>

          {/* Facility Table */}
          <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-heading font-bold text-white text-base">VIT Campus Facilities</h3>
                <p className="text-xs text-slate-450">Active courts, fields, and zones</p>
              </div>
              <button
                onClick={() => setFacModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs transition flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Add Court/Field
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2 font-medium">Facility ID</th>
                    <th className="py-2 font-medium">Name</th>
                    <th className="py-2 font-medium">Sport</th>
                    <th className="py-2 font-medium">Sector Location</th>
                    <th className="py-2 font-medium">Slots Cap</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-350">
                  {facilities.map(fac => (
                    <tr key={fac.id} className="hover:bg-slate-850/30 transition">
                      <td className="py-3 font-mono text-slate-400">{fac.id}</td>
                      <td className="py-3 font-semibold text-white">{fac.name}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                          {fac.sportType}
                        </span>
                      </td>
                      <td className="py-3">{fac.location} ({fac.courtNumber})</td>
                      <td className="py-3 font-mono">{fac.capacity} Players</td>
                      <td className="py-3">
                        <button
                          onClick={() => onUpdateFacility(fac.id, { status: fac.status === 'Active' ? 'Maintenance' : 'Active' })}
                          className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${
                            fac.status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          }`}
                        >
                          {fac.status}
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onDeleteFacility(fac.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition"
                          title="Delete Facility"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. SLOT SCHEDULER TAB */}
      {activeTab === 'admin-slots' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Configurator controls */}
          <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-5 space-y-6 h-fit">
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-white text-base flex items-center gap-1.5">
                <CalendarRange className="w-4 h-4 text-indigo-400" />
                Slot Generation Desk
              </h3>
              <p className="text-xs text-slate-450">Manage weekly calendar schedules and bulk rules</p>
            </div>

            <button
              onClick={triggerGenerateNextWeek}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-xs font-semibold text-white transition flex items-center justify-center gap-2"
            >
              🔄 Refresh / Generate Weekly Slots
            </button>

            {/* Bulk block form */}
            <form onSubmit={handleBulkBlockSubmit} className="space-y-4 pt-4 border-t border-slate-850">
              <div className="text-xs font-bold text-white">Bulk Block / Closure Action</div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Start Date</label>
                <input
                  type="date"
                  required
                  value={bulkStart}
                  onChange={(e) => setBulkStart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase">End Date</label>
                <input
                  type="date"
                  required
                  value={bulkEnd}
                  onChange={(e) => setBulkEnd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Sport Scope</label>
                <select
                  value={bulkSport}
                  onChange={(e) => setBulkSport(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Sports</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Football">Football</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Volley Ball">Volley Ball</option>
                  <option value="Table Tennis">Table Tennis</option>
                  <option value="Shuttlecock">Shuttlecock</option>
                  <option value="Handball">Handball</option>
                  <option value="Chess">Chess</option>
                  <option value="Carrom">Carrom</option>
                  <option value="Throw Ball">Throw Ball</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/35 text-xs font-heading font-bold text-red-400 transition"
              >
                🚫 Bulk Block Schedule Range
              </button>
            </form>
          </div>

          {/* Right 2 Columns: Slot audit log list */}
          <div className="lg:col-span-2 bg-[#1E2640] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-heading font-bold text-white text-base">Weekly Slots Registry</h3>
              <p className="text-xs text-slate-450">Detailed grid of slots matching current dates</p>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">
              {slots.slice(0, 30).map(slot => (
                <div key={slot.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-4 text-xs font-mono">
                  <div>
                    <div className="text-white font-bold">{slot.id}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Date: {slot.date} | Hours: {slot.startTime} - {slot.endTime}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      slot.status === 'Available'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : slot.status === 'Booked'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {slot.status} ({slot.currentBookings}/{slot.maxCapacity})
                    </span>
                    <select
                      value={slot.status}
                      onChange={(e) => onUpdateSlotStatus(slot.id, e.target.value as any)}
                      className="bg-[#1E2640] border border-slate-800 rounded p-1 text-[11px] text-slate-300 focus:outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. BOOKINGS REGISTRY AUDIT TAB */}
      {activeTab === 'admin-bookings' && (
        <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-heading font-bold text-white text-base">Global Bookings Registry</h3>
            <p className="text-xs text-slate-450">Complete registry database audits of campus pre-bookings</p>
          </div>

          {/* QR Scan & Manual Verification Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-5 border border-slate-850 rounded-2xl">
            
            {/* Input & Upload Panel */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-heading font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  QR Verification & Check-In Desk
                </h4>
                <p className="text-[11px] text-slate-455 mt-0.5">Scan student pass screenshot or type booking ID key</p>
              </div>

              {/* Manual Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Booking Key Reference</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. SS-1700000000000-123"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    onClick={() => lookupBooking(manualCode)}
                    disabled={!manualCode.trim() || scanLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-heading font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" /> Lookup
                  </button>
                </div>
              </div>

              {/* QR Image drag & drop */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Upload Student QR Code Pass</label>
                <div className="border border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl p-4 text-center cursor-pointer transition relative bg-slate-900/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
                    <Upload className="w-6 h-6 text-slate-500" />
                    <span className="text-xs font-semibold">Select or Drop QR Code Image</span>
                    <span className="text-[9px] text-slate-500">Supports PNG, JPG (Client Decoded)</span>
                  </div>
                </div>
              </div>

              {/* Scan Alerts */}
              {scanLoading && (
                <div className="text-xs text-slate-450 font-mono animate-pulse flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Verifying signature with database...
                </div>
              )}
              {scanError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{scanError}</span>
                </div>
              )}
              {scanSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{scanSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Scanned/Decoded Detail Panel */}
            <div className="bg-slate-900/50 border border-slate-850/80 rounded-2xl p-4 flex flex-col justify-between gap-4 min-h-[220px]">
              {scannedBooking ? (
                <div className="space-y-4 flex-1">
                  {/* Status header */}
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">INSPECTED PASS STATUS</span>
                      <div className="mt-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          scannedBooking.status === 'Confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : scannedBooking.status === 'Completed'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                            : 'bg-red-500/10 text-red-400 border-red-500/25'
                        }`}>
                          {scannedBooking.status === 'Confirmed' ? '✅ APPROVED' : scannedBooking.status === 'Completed' ? '🔹 CLOSED' : '❌ CANCELLED'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-950 px-2 py-1 border border-slate-800 rounded">
                      ID: {scannedBooking.id}
                    </span>
                  </div>

                  {/* Late Arrival Warning */}
                  {(() => {
                    try {
                      const now = new Date();
                      const slotStart = new Date(`${scannedBooking.date}T${scannedBooking.startTime}:00`);
                      const diffMinutes = Math.floor((now.getTime() - slotStart.getTime()) / (1000 * 60));
                      if (diffMinutes > 0 && scannedBooking.status === 'Confirmed') {
                        return (
                          <div className="p-3 bg-amber-500/10 border border-amber-550/20 rounded-xl text-xs text-amber-400 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500 animate-pulse" />
                            <div>
                              <strong className="text-amber-300">Late Arrival:</strong> Student is late by <strong className="font-mono text-sm">{diffMinutes}</strong> minutes.
                            </div>
                          </div>
                        );
                      }
                    } catch {}
                    return null;
                  })()}

                  {/* Student & Booking Details split */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Student Name</div>
                        <div className="font-bold text-white">{scannedBooking.userName}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">College Registration</div>
                        <div className="font-mono font-semibold text-slate-350">{scannedBooking.userCollegeId}</div>
                      </div>
                      {scannedStudent && (
                        <div>
                          <div className="text-[9px] font-mono text-slate-500 uppercase">Contact Phone</div>
                          <div className="font-mono text-slate-400">{scannedStudent.phone}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Sport Facility</div>
                        <div className="font-bold text-white">{scannedBooking.facilityName}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Scheduled slot</div>
                        <div className="font-semibold text-slate-300">{scannedBooking.date}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-mono text-slate-500 uppercase">Timing</div>
                        <div className="font-mono text-blue-400 font-semibold">{formatTo12Hour(scannedBooking.startTime)} - {formatTo12Hour(scannedBooking.endTime)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        disabled={scannedBooking.status !== 'Confirmed'}
                        onClick={handleGateCheckIn}
                        className={`w-full py-2.5 rounded-xl font-heading font-extrabold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          scannedBooking.status === 'Confirmed'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Check className="w-4 h-4" /> 
                        {scannedBooking.status === 'Checked-In' ? 'Checked In' : 'Confirm Check-In'}
                      </button>

                      <button
                        disabled={scannedBooking.status !== 'Confirmed' && scannedBooking.status !== 'Checked-In'}
                        onClick={handleGateCloseSlot}
                        className={`w-full py-2.5 rounded-xl font-heading font-extrabold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          (scannedBooking.status === 'Confirmed' || scannedBooking.status === 'Checked-In')
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow active:scale-95'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        {(() => {
                          try {
                            const now = getISTDate();
                            const start24 = convertTo24Hour(scannedBooking.startTime);
                            const slotStart = new Date(`${scannedBooking.date}T${start24}:00`);
                            const diffMinutes = Math.floor((now.getTime() - slotStart.getTime()) / (1000 * 60));
                            if (diffMinutes > 0) {
                              return `Cancel Slot (${diffMinutes}m Late)`;
                            }
                          } catch {}
                          return 'Cancel Slot';
                        })()}
                      </button>
                    </div>

                    {scannedBooking.status === 'Completed' && (
                      <div className="text-center text-[10px] font-mono text-slate-500 p-2 border border-slate-800 rounded bg-slate-950/40">
                        ✅ Slot is Closed (Student Checked In).
                      </div>
                    )}
                    {scannedBooking.status === 'Cancelled' && (
                      <div className="text-center text-[10px] font-mono text-red-400 p-2 border border-red-950/30 rounded bg-red-950/10">
                        ❌ Booking Cancelled (Late Arrival / No Show).
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-550 gap-2">
                  <QrCode className="w-8 h-8 text-slate-700 animate-pulse" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-400">Waiting for QR Signature</h5>
                    <p className="text-[10px] text-slate-500 max-w-[200px] mt-0.5">Please scan or input a booking verification key to begin gate audits</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2.5 font-medium">Booking ID</th>
                  <th className="py-2.5 font-medium">Student Profile</th>
                  <th className="py-2.5 font-medium">Facility</th>
                  <th className="py-2.5 font-medium">Schedule</th>
                  <th className="py-2.5 font-medium">Status</th>
                  <th className="py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-350">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 italic">No bookings recorded.</td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-850/30 transition">
                      <td className="py-3 font-mono font-semibold text-blue-450">{b.id}</td>
                      <td className="py-3">
                        <div className="font-semibold text-white">{b.userName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{b.userCollegeId}</div>
                      </td>
                      <td className="py-3">{b.facilityName} ({b.courtNumber})</td>
                      <td className="py-3 font-mono">{b.date} | {b.startTime} - {b.endTime}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          b.status === 'Confirmed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {b.status === 'Confirmed' && (
                          <button
                            onClick={() => onCancelBooking(b.id)}
                            className="text-red-400 hover:text-red-300 font-semibold transition"
                          >
                            Revoke Slot
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. USER CONTROL BAN TAB */}
      {activeTab === 'admin-users' && (
        <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="font-heading font-bold text-white text-base">User Directory & Status Panel</h3>
            <p className="text-xs text-slate-450">Ban or reset student/user accounts and monitor roles</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2.5 font-medium">User ID</th>
                  <th className="py-2.5 font-medium">Name</th>
                  <th className="py-2.5 font-medium">College ID</th>
                  <th className="py-2.5 font-medium">Phone Number</th>
                  <th className="py-2.5 font-medium">SLA Role</th>
                  <th className="py-2.5 font-medium">Account State</th>
                  <th className="py-2.5 font-medium text-right">Action Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-350">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/30 transition">
                    <td className="py-3 font-mono text-slate-400">{u.id}</td>
                    <td className="py-3 font-semibold text-white">{u.name}</td>
                    <td className="py-3 font-mono text-slate-300">{u.collegeId}</td>
                    <td className="py-3 font-mono text-slate-450">{u.phone}</td>
                    <td className="py-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        u.role === 'Admin' 
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        u.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role === 'Student' && (
                        <div className="inline-flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-1.5">
                          <button
                            onClick={() => onToggleBanUser(u.id)}
                            className={`px-3 py-1 rounded text-xs font-semibold border transition text-center whitespace-nowrap ${
                              u.status === 'Active'
                                ? 'bg-red-950/20 border-red-900/30 hover:border-red-900/50 text-red-400 hover:bg-red-950/40'
                                : 'bg-emerald-950/20 border-emerald-900/30 hover:border-emerald-900/50 text-emerald-450 hover:bg-emerald-950/40'
                            }`}
                          >
                            {u.status === 'Active' ? 'Ban Account' : 'Lift Ban'}
                          </button>
                          <button
                            onClick={() => onDeleteUser && onDeleteUser(u.id)}
                            className="px-3 py-1 rounded text-xs font-semibold border border-red-500/30 text-red-450 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 transition inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ANNOUNCEMENTS TAB */}
      {activeTab === 'admin-announcements' && (
        <div className="space-y-6">
          {/* Create Announcement Form */}
          <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="font-heading font-bold text-white text-base flex items-center gap-1.5">
                <Megaphone className="w-4.5 h-4.5 text-blue-400" />
                Publish Campus Announcement
              </h3>
              <p className="text-xs text-slate-450">Broadcast a real-time message or alert to all student profiles on sign-in.</p>
            </div>

            <form onSubmit={handleAnnPublish} className="space-y-4">
              <div className="space-y-1.5">
                <textarea
                  required
                  rows={3}
                  maxLength={500}
                  placeholder="e.g. ⚠️ The main outdoor tennis courts will be closed for maintenance between 06:00 and 12:00 on Monday."
                  value={newAnnMsg}
                  onChange={(e) => setNewAnnMsg(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:border-blue-500 focus:outline-none transition leading-relaxed"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Maximum 500 characters</span>
                  <span>{newAnnMsg.length}/500</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newAnnMsg.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-heading font-bold text-xs transition shadow flex items-center gap-1.5"
                >
                  Publish Spotlight
                </button>
              </div>
            </form>
          </div>

          {/* Announcement Logs Table */}
          <div className="bg-[#1E2640] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="font-heading font-bold text-white text-base">Broadcast History</h3>
              <p className="text-xs text-slate-450">Manage previous bulletins and alerts</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2.5 font-medium">Created At</th>
                    <th className="py-2.5 font-medium">Published By</th>
                    <th className="py-2.5 font-medium">Message Bulletin</th>
                    <th className="py-2.5 font-medium">Publish State</th>
                    <th className="py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-350">
                  {announcements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                        No previous broadcasts found.
                      </td>
                    </tr>
                  ) : (
                    announcements.map((ann) => (
                      <tr key={ann.id} className="hover:bg-slate-850/30 transition align-top">
                        <td className="py-3 font-mono text-slate-400">
                          {new Date(ann.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 font-semibold text-white">{ann.createdBy}</td>
                        <td className="py-3 max-w-md pr-6 text-slate-300 leading-relaxed break-words">{ann.message}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            ann.isActive 
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}>
                            {ann.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-1.5">
                            <button
                              onClick={() => onToggleAnnouncement && onToggleAnnouncement(ann.id, !ann.isActive)}
                              className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition text-center whitespace-nowrap ${
                                ann.isActive
                                  ? 'bg-amber-950/20 border-amber-900/30 hover:border-amber-900/50 text-amber-400 hover:bg-amber-950/40'
                                  : 'bg-blue-950/20 border-blue-900/30 hover:border-blue-900/50 text-blue-400 hover:bg-blue-950/40'
                              }`}
                            >
                              {ann.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => onDeleteAnnouncement && onDeleteAnnouncement(ann.id)}
                              className="p-1 text-slate-550 hover:text-red-400 hover:bg-slate-800/40 rounded transition inline-flex items-center justify-center align-middle"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {facModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A0F1E]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E2640] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-heading font-bold text-white text-base">Add Facility Arena</h3>
                <p className="text-[11px] text-slate-400">Introduce a new sports court or turf zone to VIT campus</p>
              </div>
              <button 
                onClick={() => setFacModalOpen(false)}
                className="text-slate-450 hover:text-white"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateFacility} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netaji Court 3"
                  value={newFacName}
                  onChange={(e) => setNewFacName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Sport Type</label>
                  <select
                    value={newFacSport}
                    onChange={(e) => setNewFacSport(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white"
                  >
                    <option value="Badminton">Badminton</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Football">Football</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Volley Ball">Volley Ball</option>
                    <option value="Table Tennis">Table Tennis</option>
                    <option value="Shuttlecock">Shuttlecock</option>
                    <option value="Handball">Handball</option>
                    <option value="Chess">Chess</option>
                    <option value="Carrom">Carrom</option>
                    <option value="Throw Ball">Throw Ball</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Capacity (Players)</label>
                  <input
                    type="number"
                    min={1}
                    value={newFacCap}
                    onChange={(e) => setNewFacCap(parseInt(e.target.value) || 4)}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Campus Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block E Sports Hall"
                  value={newFacLoc}
                  onChange={(e) => setNewFacLoc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Court/Field Sector Number</label>
                <input
                  type="text"
                  required
                  value={newFacCourt}
                  onChange={(e) => setNewFacCourt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-heading font-bold text-xs transition shadow"
                >
                  Create Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
