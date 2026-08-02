import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { UserProfileView } from './components/UserProfileView';
import { FacilitiesView } from './components/FacilitiesView';
import { SlotBookingView } from './components/SlotBookingView';
import { MyBookingsView } from './components/MyBookingsView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AdminReportsView } from './components/AdminReportsView';
import { AdminManagersView } from './components/AdminManagersView';
import { AuthView } from './components/AuthView';
import { BookingVerificationPage } from './components/BookingVerificationPage';

import { 
  MockDatabase, 
  UserProfile, 
  SportFacility, 
  FacilitySlot, 
  Booking, 
  WaitlistEntry, 
  AuditLog, 
  AdminConfig,
  Announcement,
  getOffsetDateString
} from './utils/mockDb';

import { fetchLiveWeather, FullWeatherState } from './utils/weatherService';

import { AlertTriangle, CheckCircle2, Info, X, Megaphone } from 'lucide-react';

export default function App() {
  // --- DATABASE STATES ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [facilities, setFacilities] = useState<SportFacility[]>([]);
  const [slots, setSlots] = useState<FacilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // --- SCAN & VERIFICATION STATES ---
  const [verifiedBooking, setVerifiedBooking] = useState<Booking | null>(null);
  const [verifiedStudent, setVerifiedStudent] = useState<UserProfile | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);

  // --- UI SYSTEM STATES ---
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<SportFacility | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<string[]>([]);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Weather state
  const [weather, setWeather] = useState<FullWeatherState | null>(null);

  // Announcement states
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [dismissedAnnouncementId, setDismissedAnnouncementId] = useState<string | null>(null);

  // --- INITIALIZE & SYNC ---
  const syncLocalStates = async () => {
    const usersList = await MockDatabase.getUsers();
    setAllUsers(usersList);
    setFacilities(await MockDatabase.getFacilities());
    setSlots(await MockDatabase.getSlots());
    setBookings(await MockDatabase.getBookings());
    setWaitlist(await MockDatabase.getWaitlist());
    setAnnouncements(await MockDatabase.getAnnouncements());
    const config = await MockDatabase.getAdminConfig();
    setAdminConfig(config);
    
    const logs = await MockDatabase.getLogs();
    setAuditLogs(logs);
    
    // Map logs to notification strings
    const noteStrings = logs.slice(0, 10).map(log => `[${log.timestamp}] ${log.userName}: ${log.action}`);
    setRecentNotifications(noteStrings);

    // Read active user session
    const activeUserId = localStorage.getItem('sportsync_current_user_id');
    if (activeUserId) {
      const found = usersList.find(u => u.id === activeUserId);
      if (found) {
        if (found.status === 'Banned') {
          setCurrentUser(null);
          localStorage.removeItem('sportsync_current_user_id');
        } else {
          setCurrentUser(found);
        }
      } else {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    const initDb = async () => {
      await MockDatabase.initialize();
      await syncLocalStates();
    };
    const initWeather = async () => {
      const wData = await fetchLiveWeather();
      setWeather(wData);
    };
    initDb();
    initWeather();

    // Refresh weather details every 10 minutes
    const weatherInterval = setInterval(initWeather, 600000);
    return () => clearInterval(weatherInterval);
  }, []);

  // QR Code scanned parameter listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('verifyBooking');
    if (bookingId) {
      const loadVerification = async () => {
        setIsVerifying(true);
        setVerificationError(null);
        setShowVerificationModal(true);
        try {
          const booking = await MockDatabase.getBookingById(bookingId);
          if (booking) {
            setVerifiedBooking(booking);
            const studentProfile = await MockDatabase.getUserById(booking.userId);
            if (studentProfile) {
              setVerifiedStudent(studentProfile);
            }
          } else {
            setVerificationError('No active booking reservation matches this QR signature.');
          }
        } catch (err: any) {
          console.error(err);
          setVerificationError(err.message || 'Error occurred while auditing QR code pass.');
        } finally {
          setIsVerifying(false);
        }
      };
      loadVerification();
    }
  }, []);

  // Show a toast message helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // --- USER INTERACTIONS ---
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sportsync_current_user_id');
    setActiveTab('landing');
    setDismissedAnnouncementId(null);
    setShowAnnouncement(false);
    showToast('Successfully logged out.', 'info');
  };

  const handleUpdatePreferences = async (prefs: string[]) => {
    if (!currentUser) return;
    const updated = await MockDatabase.updateUser(currentUser.id, { preferences: prefs });
    setCurrentUser(updated);
    await syncLocalStates();
    showToast('Sport preferences updated!', 'success');
  };

  const handleExportData = () => {
    if (!currentUser) return;
    const data = {
      profile: currentUser,
      bookings: bookings.filter(b => b.userId === currentUser.id),
      waitlist: waitlist.filter(w => w.userId === currentUser.id)
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `SportSync_Data_${currentUser.collegeId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('GDPR Data Export downloaded.', 'success');
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    if (window.confirm('Are you sure you want to permanently delete your SportSync profile and cancel all slots?')) {
      await MockDatabase.gdprDeleteAccount(currentUser.id);
      showToast('Profile and slots deleted successfully.', 'info');
      handleLogout();
    }
  };

  const handleCreateBooking = async (params: {
    slotId: string;
    isGroupBooking: boolean;
    groupSize: number;
    groupMembers?: string[];
  }) => {
    if (!currentUser) return;
    const slot = slots.find(s => s.id === params.slotId);
    const facility = facilities.find(f => f.id === slot?.facilityId);
    if (!slot || !facility) return;

    const result = await MockDatabase.createBooking({
      user: currentUser,
      facility,
      slot,
      isGroupBooking: params.isGroupBooking,
      groupSize: params.groupSize,
      groupMembers: params.groupMembers
    });

    if (result.success) {
      showToast(result.message, 'success');
      setActiveTab('my-bookings');
    } else {
      showToast(result.message, 'error');
    }
    await syncLocalStates();
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!currentUser) return;
    const result = await MockDatabase.cancelBooking(bookingId, currentUser.id);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
    await syncLocalStates();
  };

  const handleJoinWaitlist = async (slotId: string) => {
    if (!currentUser) return;
    const result = await MockDatabase.joinWaitlist(currentUser.id, slotId);
    if (result.success) {
      showToast(result.message, 'success');
      setActiveTab('my-bookings');
    } else {
      showToast(result.message, 'error');
    }
    await syncLocalStates();
  };

  // --- QUICK REBOOK ---
  const handleQuickRebook = (facilityId: string) => {
    const fac = facilities.find(f => f.id === facilityId);
    if (fac) {
      setSelectedFacility(fac);
      setActiveTab('slot-booking');
    }
  };

  // --- ANNOUNCEMENT DISPLAY & CRUD ACTIONS ---
  const activeAnnouncement = announcements.find(a => a.isActive);

  useEffect(() => {
    if (activeAnnouncement && currentUser && dismissedAnnouncementId !== activeAnnouncement.id) {
      const timer = setTimeout(() => {
        setShowAnnouncement(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowAnnouncement(false);
    }
  }, [activeAnnouncement, currentUser, dismissedAnnouncementId]);

  const handleDismissAnnouncement = () => {
    if (activeAnnouncement) {
      setDismissedAnnouncementId(activeAnnouncement.id);
      setShowAnnouncement(false);
    }
  };

  const handleCreateAnnouncement = async (message: string) => {
    if (!currentUser) return;
    try {
      await MockDatabase.createAnnouncement(message, currentUser.name);
      await syncLocalStates();
      showToast('Announcement published successfully.', 'success');
    } catch (e: any) {
      console.error(e);
      showToast(`Failed to publish announcement: ${e.message || e}`, 'error');
    }
  };

  const handleToggleAnnouncement = async (id: string, active: boolean) => {
    try {
      await MockDatabase.toggleAnnouncementStatus(id, active);
      await syncLocalStates();
      showToast(`Announcement status updated.`, 'success');
    } catch (e: any) {
      console.error(e);
      showToast(`Failed to update status: ${e.message || e}`, 'error');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this announcement?')) {
      try {
        await MockDatabase.deleteAnnouncement(id);
        await syncLocalStates();
        showToast('Announcement deleted successfully.', 'info');
      } catch (e: any) {
        console.error(e);
        showToast(`Failed to delete announcement: ${e.message || e}`, 'error');
      }
    }
  };

  // --- ADMIN ACTIONS ---
  const handleAddFacility = async (fac: Omit<SportFacility, 'id'>) => {
    try {
      await MockDatabase.addFacility(fac);
      await syncLocalStates();
      showToast(`Added facility: ${fac.name}`, 'success');
    } catch (e: any) {
      console.error(e);
      showToast(`Failed to add facility: ${e.message || e}`, 'error');
    }
  };

  const handleUpdateFacility = async (id: string, updates: Partial<SportFacility>) => {
    try {
      await MockDatabase.updateFacility(id, updates);
      await syncLocalStates();
      showToast('Facility status updated.', 'success');
    } catch (e: any) {
      console.error(e);
      showToast(`Failed to update facility: ${e.message || e}`, 'error');
    }
  };

  const handleDeleteFacility = async (id: string) => {
    if (window.confirm('Delete this facility? All current bookings will be auto-cancelled.')) {
      try {
        await MockDatabase.deleteFacility(id);
        await syncLocalStates();
        showToast('Facility removed successfully.', 'info');
      } catch (e: any) {
        console.error(e);
        showToast(`Failed to delete facility: ${e.message || e}`, 'error');
      }
    }
  };

  const handleUpdateConfig = async (cfg: AdminConfig) => {
    try {
      await MockDatabase.updateAdminConfig(cfg);
      await syncLocalStates();
      showToast('Global pre-booking parameters applied.', 'success');
    } catch (e: any) {
      console.error(e);
      showToast(`Failed to update config: ${e.message || e}`, 'error');
    }
  };

  const handleUpdateSlotStatus = async (slotId: string, status: any) => {
    try {
      await MockDatabase.updateSlotStatus(slotId, status);
      await syncLocalStates();
      showToast(`Slot status modified to ${status}`, 'success');
    } catch (e: any) {
      console.error(e);
      showToast(`Failed to update slot status: ${e.message || e}`, 'error');
    }
  };

  const handleBulkBlockSlots = async (startDate: string, endDate: string, sportType?: string) => {
    try {
      await MockDatabase.bulkBlockSlots(startDate, endDate, sportType);
      await syncLocalStates();
      showToast('Bulk slot block completed.', 'info');
    } catch (e: any) {
      console.error(e);
      showToast(`Failed bulk block: ${e.message || e}`, 'error');
    }
  };

  const handleBulkGenerateSlots = async (dateRange: string[]) => {
    try {
      await MockDatabase.bulkGenerateSlots(dateRange);
      await syncLocalStates();
      showToast('Schedules synchronized.', 'success');
    } catch (e: any) {
      console.error(e);
      showToast(`Failed schedules generation: ${e.message || e}`, 'error');
    }
  };

  const handleToggleBanUser = async (userId: string) => {
    try {
      await MockDatabase.toggleUserBan(userId);
      await syncLocalStates();
      showToast('User status modified.', 'success');
    } catch (e: any) {
      console.error(e);
      showToast(`Failed to modify user status: ${e.message || e}`, 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this user's account, active bookings, and waitlist entries? This cannot be undone.")) {
      try {
        await MockDatabase.gdprDeleteAccount(userId);
        await syncLocalStates();
        showToast("User account and related bookings deleted successfully.", "info");
      } catch (e: any) {
        console.error(e);
        showToast(`Failed to delete user: ${e.message || e}`, "error");
      }
    }
  };

  const handleTriggerWeatherAlert = async () => {
    const count = await MockDatabase.bulkCancelOutdoorSlots('Heavy Rain Advisory');
    await syncLocalStates();
    showToast(`⚠️ Weather alert triggered: Cancelled ${count} outdoor bookings for today.`, 'info');
  };

  const handleExportCsv = () => {
    // Generate bookings CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Booking ID,Student Name,College ID,Sport,Facility,Date,Time,Status\n';
    
    bookings.forEach(b => {
      csvContent += `${b.id},"${b.userName}",${b.userCollegeId},${b.sportType},"${b.facilityName}",${b.date},${b.startTime}-${b.endTime},${b.status}\n`;
    });
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', 'SportSync_Bookings_Report.csv');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('CSV Bookings Report exported.', 'success');
  };

  if (!adminConfig) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-mono">Synchronizing Slot Engine Database...</p>
        </div>
      </div>
    );
  }

  // Standalone Verification Page View (Gate Checkpoint)
  if (showVerificationModal) {
    return (
      <BookingVerificationPage
        booking={verifiedBooking}
        student={verifiedStudent}
        loading={isVerifying}
        error={verificationError}
        currentUser={currentUser}
        onClose={() => {
          setShowVerificationModal(false);
          const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.pushState({ path: newUrl }, '', newUrl);
        }}
        onCheckIn={async (bookingId) => {
          if (!currentUser) return;
          const res = await MockDatabase.checkInBooking(bookingId, currentUser.id);
          if (res.success) {
            showToast(res.message, 'success');
            const updated = await MockDatabase.getBookingById(bookingId);
            if (updated) setVerifiedBooking(updated);
            await syncLocalStates();
          } else {
            showToast(res.message, 'error');
          }
        }}
        onCloseSlot={async (bookingId) => {
          if (!currentUser) return;
          const res = await MockDatabase.closeBookingSlot(bookingId, currentUser.id);
          if (res.success) {
            showToast(res.message, 'success');
            const updated = await MockDatabase.getBookingById(bookingId);
            if (updated) setVerifiedBooking(updated);
            await syncLocalStates();
          } else {
            showToast(res.message, 'error');
          }
        }}
      />
    );
  }

  if (!currentUser) {
    return (
      <div className="relative">
        <AuthView
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            localStorage.setItem('sportsync_current_user_id', user.id);
            syncLocalStates();
          }}
          showToast={showToast}
        />

        {/* Floating Toast Notification manager */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-55 max-w-sm w-full bg-[#1E2640] border border-slate-700 rounded-2xl p-4 shadow-2xl animate-slide-up flex items-start gap-3">
            <div className="shrink-0 pt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="p-1 text-slate-450 hover:text-white transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Active bookings for counts
  const activeBookingsCount = bookings.filter(b => b.userId === currentUser.id && b.status === 'Confirmed').length;

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col font-sans antialiased text-white selection:bg-blue-600/30 selection:text-blue-200">
      
      {/* Navbar header */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim().length > 0) {
            setSelectedFacility(null);
            if (activeTab !== 'facilities' && activeTab !== 'slot-booking') {
              setActiveTab('facilities');
            }
          }
        }}
        facilities={facilities}
        onSelectFacility={(fac) => {
          setSelectedFacility(fac);
          setActiveTab('facilities');
        }}
        onNavigate={(tab) => {
          setSelectedFacility(null);
          setActiveTab(tab);
        }}
        weatherAdvisory={activeTab === 'landing' || activeTab === 'facilities' || activeTab === 'slot-booking' ? (weather ? `${weather.current.icon} Live Weather: ${weather.current.temp} (${weather.current.condition})` : '☀️ Loading Weather...') : undefined}
        notifications={recentNotifications}
      />

      {/* Main Panel layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setSelectedFacility(null);
            setActiveTab(tab);
          }} 
          currentUser={currentUser}
          activeBookingsCount={activeBookingsCount}
        />

        {/* Content routing switcher */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Main views */}
          {activeTab === 'landing' && (
            <LandingPage
              facilities={facilities}
              onNavigate={(tab) => {
                setSelectedFacility(null);
                setActiveTab(tab);
              }}
              totalBookings={bookings.length}
            />
          )}

          {activeTab === 'profile' && (
            <UserProfileView
              currentUser={currentUser}
              bookings={bookings}
              onUpdatePreferences={handleUpdatePreferences}
              onExportData={handleExportData}
              onDeleteAccount={handleDeleteAccount}
            />
          )}

          {activeTab === 'facilities' && (
            <FacilitiesView
              facilities={facilities}
              slots={slots}
              bookings={bookings}
              currentUserId={currentUser.id}
              onSelectFacility={(fac) => {
                setSelectedFacility(fac);
                setActiveTab('slot-booking');
              }}
              onQuickRebook={handleQuickRebook}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {activeTab === 'slot-booking' && selectedFacility && (
            <SlotBookingView
              facility={selectedFacility}
              slots={slots}
              onBack={() => {
                setSelectedFacility(null);
                setActiveTab('facilities');
              }}
              onSubmitBooking={handleCreateBooking}
              onJoinWaitlist={handleJoinWaitlist}
              advanceBookingWindowDays={adminConfig.advanceBookingWindowDays}
              weather={weather}
            />
          )}

          {activeTab === 'my-bookings' && (
            <MyBookingsView
              bookings={bookings}
              currentUser={currentUser}
              onCancelBooking={handleCancelBooking}
            />
          )}

          {activeTab === 'search' && (
            <FacilitiesView
              facilities={facilities}
              slots={slots}
              bookings={bookings}
              currentUserId={currentUser.id}
              onSelectFacility={(fac) => {
                setSelectedFacility(fac);
                setActiveTab('slot-booking');
              }}
              onQuickRebook={handleQuickRebook}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {/* Admin View Routes */}
          {activeTab === 'admin-dashboard' && (
            <div className="space-y-6">
              {/* Trigger weather cancellation banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/35 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-pulse">🌧️</span>
                  <div>
                    <h3 className="font-heading font-bold text-white text-sm">Simulate Bad Weather Bulk Cancel</h3>
                    <p className="text-xs text-slate-400">Cancel all outdoor sports slots for today and alert students.</p>
                  </div>
                </div>
                <button
                  onClick={handleTriggerWeatherAlert}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-heading font-bold text-xs transition active:scale-95"
                >
                  Cancel Outdoor Slots
                </button>
              </div>

              <AdminDashboardView
                bookings={bookings}
                facilities={facilities}
                slots={slots}
                waitlist={waitlist}
                onNavigate={setActiveTab}
              />
            </div>
          )}

          {(activeTab === 'admin-facilities' || 
            activeTab === 'admin-slots' || 
            activeTab === 'admin-bookings' || 
            activeTab === 'admin-users' ||
            activeTab === 'admin-announcements') && (
            <AdminManagersView
              activeTab={activeTab as any}
              facilities={facilities}
              slots={slots}
              bookings={bookings}
              users={allUsers}
              config={adminConfig}
              announcements={announcements}
              onAddFacility={handleAddFacility}
              onUpdateFacility={handleUpdateFacility}
              onDeleteFacility={handleDeleteFacility}
              onUpdateConfig={handleUpdateConfig}
              onUpdateSlotStatus={handleUpdateSlotStatus}
              onBulkBlockSlots={handleBulkBlockSlots}
              onBulkGenerateSlots={handleBulkGenerateSlots}
              onCancelBooking={handleCancelBooking}
              onToggleBanUser={handleToggleBanUser}
              onDeleteUser={handleDeleteUser}
              onAddAnnouncement={handleCreateAnnouncement}
              onToggleAnnouncement={handleToggleAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}

          {activeTab === 'admin-reports' && (
            <AdminReportsView
              onExportCsv={handleExportCsv}
              bookings={bookings}
            />
          )}

        </main>
      </div>

      {/* Spotlight Announcement Banner */}
      {showAnnouncement && activeAnnouncement && (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-gradient-to-br from-[#1E2640]/95 to-[#161B30]/95 border border-blue-500/30 rounded-2xl p-4 shadow-2xl flex items-start gap-3 backdrop-blur-md animate-slide-up">
          <div className="shrink-0 p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg">
            <Megaphone className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 truncate">
                Admin: {activeAnnouncement.createdBy}
              </span>
              <span className="text-[9px] font-mono text-slate-400 shrink-0">
                {new Date(activeAnnouncement.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-slate-100 leading-relaxed font-medium">
              {activeAnnouncement.message}
            </p>
          </div>
          <button 
            onClick={handleDismissAnnouncement}
            className="p-1 text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Toast Notification manager */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-55 max-w-sm w-full bg-[#1E2640] border border-slate-700 rounded-2xl p-4 shadow-2xl animate-slide-up flex items-start gap-3">
          <div className="shrink-0 pt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs text-slate-200 leading-relaxed font-semibold">
              {toast.message}
            </p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="p-1 text-slate-450 hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
