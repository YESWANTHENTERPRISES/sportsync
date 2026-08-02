import { supabase } from './supabaseClient';
import { 
  UserProfile, 
  SportFacility, 
  FacilitySlot, 
  Booking, 
  WaitlistEntry, 
  AuditLog, 
  AdminConfig,
  Announcement,
  getOffsetDateString,
  formatTo12Hour,
  convertTo24Hour,
  getISTDate,
  TIME_SLOTS,
  INITIAL_FACILITIES
} from './mockDb';

// --- DATABASE MAPPING UTILITIES ---

const mapProfile = (row: any): UserProfile => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  collegeId: row.college_id,
  role: row.role,
  preferences: row.preferences || [],
  password: row.password,
  status: row.status,
  createdAt: row.created_at
});

const mapFacility = (row: any): SportFacility => ({
  id: row.id,
  name: row.name,
  sportType: row.type,
  location: row.location,
  courtNumber: row.name.includes('Court') ? row.name.split(' ').slice(-2).join(' ') : 'Court A',
  capacity: row.capacity,
  photoUrl: row.image_url || '',
  status: row.status
});

const mapSlot = (row: any): FacilitySlot => ({
  id: row.id,
  facilityId: row.facility_id,
  date: row.date,
  startTime: row.start_time,
  endTime: row.end_time,
  status: row.status,
  maxCapacity: row.max_capacity,
  currentBookings: row.current_bookings
});

const mapBooking = (row: any): Booking => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  userCollegeId: row.user_college_id,
  facilityId: row.slot_id ? row.slot_id.split('-')[0] : '', // Derived for typescript backward compatibility
  facilityName: row.facility_name,
  sportType: row.sport_type,
  courtNumber: 'Court A',
  slotId: row.slot_id,
  date: row.date,
  startTime: row.start_time,
  endTime: row.end_time,
  bookedAt: row.created_at,
  status: row.status,
  isGroupBooking: row.is_group_booking,
  groupSize: row.group_size,
  groupMembers: row.group_members || []
});

const mapWaitlist = (row: any): WaitlistEntry => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  userCollegeId: row.user_college_id || '',
  slotId: row.slot_id,
  facilityName: row.facility_name,
  date: row.date,
  startTime: row.start_time,
  joinedAt: row.created_at,
  status: row.status
});

const mapAuditLog = (row: any): AuditLog => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  action: row.action,
  entityType: row.entity_type,
  entityId: row.entity_id,
  timestamp: new Date(row.timestamp).toLocaleString()
});

const mapAnnouncement = (row: any): Announcement => ({
  id: row.id,
  message: row.message,
  createdBy: row.created_by,
  isActive: row.is_active,
  createdAt: row.created_at
});

export class SupabaseDatabase {
  
  static async initialize(): Promise<void> {
    // Ensure the admin name is set to YESWANTH in the database
    await supabase.from('profiles')
      .update({ name: 'YESWANTH' })
      .eq('id', 'usr-admin');

    // Generate slots for next 7 days if slots table is empty
    const { data: currentSlots, error } = await supabase.from('slots').select('id').limit(1);
    if (!error && (!currentSlots || currentSlots.length === 0)) {
      const generatedSlots: any[] = [];
      const { data: facilities } = await supabase.from('facilities').select('*');
      
      if (facilities && facilities.length > 0) {
        for (let day = 0; day < 7; day++) {
          const dateStr = getOffsetDateString(day);
          facilities.forEach(fac => {
            TIME_SLOTS.forEach((slotInfo, index) => {
              let status = 'Available';
              if (day === 0 && index < 3 && Math.random() > 0.4) {
                status = 'Booked';
              } else if (Math.random() > 0.95) {
                status = 'Maintenance';
              }
              
              generatedSlots.push({
                id: `${fac.id}-${dateStr}-${slotInfo.start.replace(':', '')}`,
                facility_id: fac.id,
                date: dateStr,
                start_time: slotInfo.start,
                end_time: slotInfo.end,
                status,
                max_capacity: fac.capacity,
                current_bookings: status === 'Booked' ? 1 : 0
              });
            });
          });
        }
        await supabase.from('slots').insert(generatedSlots);
      }
    }
  }

  // --- LOGGING ---
  static async log(userId: string, userName: string, action: string, entityType: string, entityId: string): Promise<void> {
    await supabase.from('audit_logs').insert([{
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      user_name: userName,
      action,
      entity_type: entityType,
      entity_id: entityId
    }]);
  }

  static async getLogs(): Promise<AuditLog[]> {
    const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(50);
    if (error || !data) return [];
    return data.map(mapAuditLog);
  }

  // --- USERS ---
  static async getUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error || !data) return [];
    return data.map(mapProfile);
  }

  static async getUserById(id: string): Promise<UserProfile | undefined> {
    const { data, error } = await supabase.from('profiles')
      .select('*')
      .or(`id.eq.${id},college_id.eq.${id}`)
      .maybeSingle();
    if (error || !data) return undefined;
    return mapProfile(data);
  }

  static async login(collegeId: string, password: string): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    const user = await this.getUserById(collegeId);
    if (!user) {
      return { success: false, message: 'Invalid College ID or Admin ID.' };
    }
    if (user.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }
    if (user.status === 'Banned') {
      return { success: false, message: 'Your account has been banned. Please contact sports admin.' };
    }
    await this.log(user.id, user.name, 'Logged in successfully', 'User', user.id);
    return { success: true, message: 'Login successful!', user };
  }

  static async createUser(profile: Omit<UserProfile, 'id' | 'createdAt' | 'status'>): Promise<UserProfile> {
    const newUser: UserProfile = {
      ...profile,
      id: `usr-${Date.now()}`,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    await supabase.from('profiles').insert([{
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      college_id: newUser.collegeId,
      role: newUser.role,
      preferences: newUser.preferences,
      password: newUser.password,
      status: newUser.status,
      created_at: newUser.createdAt
    }]);

    await this.log(newUser.id, newUser.name, `Registered profile with College ID: ${newUser.collegeId}`, 'User', newUser.id);
    return newUser;
  }

  static async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.password !== undefined) dbUpdates.password = updates.password;

    const { data, error } = await supabase.from('profiles')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error('Failed to update user profile');
    const mapped = mapProfile(data);
    await this.log(id, mapped.name, 'Updated user profile preferences', 'User', id);
    return mapped;
  }

  static async toggleUserBan(id: string): Promise<UserProfile> {
    const user = await this.getUserById(id);
    if (!user) throw new Error('User not found');
    const newStatus = user.status === 'Active' ? 'Banned' : 'Active';
    
    const { data } = await supabase.from('profiles')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    const mapped = mapProfile(data);
    await this.log('usr-admin', 'YESWANTH', `${newStatus === 'Banned' ? 'Banned' : 'Unbanned'} user ${mapped.name}`, 'User', id);
    return mapped;
  }

  // --- FACILITIES ---
  static async getFacilities(): Promise<SportFacility[]> {
    const { data, error } = await supabase.from('facilities').select('*');
    if (error || !data) return [];
    return data.map(mapFacility);
  }

  static async addFacility(fac: Omit<SportFacility, 'id'>): Promise<SportFacility> {
    const newId = `fac-${Date.now()}`;
    const { data, error } = await supabase.from('facilities').insert([{
      id: newId,
      name: fac.name,
      type: fac.sportType,
      location: fac.location,
      capacity: fac.capacity,
      image_url: fac.photoUrl,
      status: fac.status,
      description: `Standard ${fac.sportType} facility.`,
      is_indoor: fac.location.toLowerCase().includes('indoor') || fac.location.toLowerCase().includes('mg auditorium'),
      rules: []
    }]).select().single();

    if (error || !data) {
      console.error('Supabase facility insert error:', error);
      throw new Error('Failed to insert facility');
    }
    return mapFacility(data);
  }

  static async updateFacility(id: string, updates: Partial<SportFacility>): Promise<SportFacility> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.sportType !== undefined) dbUpdates.type = updates.sportType;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.capacity !== undefined) dbUpdates.capacity = updates.capacity;
    if (updates.photoUrl !== undefined) dbUpdates.image_url = updates.photoUrl;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { data, error } = await supabase.from('facilities')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error('Failed to update facility');
    return mapFacility(data);
  }

  static async deleteFacility(id: string): Promise<void> {
    await supabase.from('facilities').delete().eq('id', id);
  }

  // --- SLOTS ---
  static async getSlots(): Promise<FacilitySlot[]> {
    // 1. Fetch facilities
    let facilities: SportFacility[] = [];
    try {
      const { data: facData } = await supabase.from('facilities').select('*');
      if (facData && facData.length > 0) {
        facilities = facData.map(mapFacility);
      }
    } catch (e) {
      console.warn('Failed to fetch facilities from Supabase', e);
    }
    if (facilities.length === 0) {
      facilities = INITIAL_FACILITIES;
    }

    // 2. Fetch DB slots for manual overrides
    const dbSlotMap = new Map<string, any>();
    try {
      const { data: rawSlots } = await supabase.from('slots').select('*');
      if (rawSlots) {
        rawSlots.forEach(s => dbSlotMap.set(s.id, s));
      }
    } catch (e) {}

    // 3. Fetch active bookings (Confirmed or Checked-In)
    const activeSlotMap = new Map<string, { totalOccupancy: number; isActive: boolean }>();
    try {
      const { data: activeBookingsData } = await supabase.from('bookings')
        .select('slot_id, is_group_booking, group_size, status')
        .in('status', ['Confirmed', 'Checked-In']);

      if (activeBookingsData) {
        activeBookingsData.forEach(b => {
          if (!b.slot_id) return;
          const existing = activeSlotMap.get(b.slot_id) || { totalOccupancy: 0, isActive: false };
          const occupancy = b.is_group_booking ? (b.group_size || 1) : 1;
          existing.totalOccupancy += occupancy;
          existing.isActive = true;
          activeSlotMap.set(b.slot_id, existing);
        });
      }
    } catch (e) {}

    // 4. Generate clean 1-hour slots for 7 days based on TIME_SLOTS rules
    const slots: FacilitySlot[] = [];
    const dateRange: string[] = [];
    for (let i = 0; i < 7; i++) {
      dateRange.push(getOffsetDateString(i));
    }

    facilities.forEach(fac => {
      dateRange.forEach(dateStr => {
        TIME_SLOTS.forEach(slotInfo => {
          const slotId = `${fac.id}-${dateStr}-${slotInfo.start.replace(/[^a-zA-Z0-9]/g, '')}`;
          const dbRow = dbSlotMap.get(slotId);
          
          let status: FacilitySlot['status'] = 'Available';
          if (dbRow && (dbRow.status === 'Blocked' || dbRow.status === 'Maintenance')) {
            status = dbRow.status;
          }

          const activeInfo = activeSlotMap.get(slotId);
          if (activeInfo && activeInfo.isActive) {
            if (activeInfo.totalOccupancy >= fac.capacity) {
              status = 'Booked';
            }
          }

          slots.push({
            id: slotId,
            facilityId: fac.id,
            date: dateStr,
            startTime: formatTo12Hour(slotInfo.start),
            endTime: formatTo12Hour(slotInfo.end),
            status,
            maxCapacity: fac.capacity,
            currentBookings: activeInfo ? activeInfo.totalOccupancy : 0
          });
        });
      });
    });

    return slots;
  }

  static async updateSlotStatus(slotId: string, status: string): Promise<void> {
    await supabase.from('slots').update({ status }).eq('id', slotId);
  }

  static async bulkBlockSlots(startDate: string, endDate: string, sportType?: string): Promise<void> {
    const { data: facilities } = await supabase.from('facilities').select('id, type');
    if (!facilities) return;

    let targetFacs = facilities;
    if (sportType) {
      targetFacs = facilities.filter(f => f.type === sportType);
    }
    const facIds = targetFacs.map(f => f.id);

    // Fetch matching slots
    const { data: slots } = await supabase.from('slots')
      .select('id, date, facility_id')
      .in('facility_id', facIds);

    if (slots) {
      const matchIds = slots
        .filter(s => s.date >= startDate && s.date <= endDate)
        .map(s => s.id);

      if (matchIds.length > 0) {
        await supabase.from('slots')
          .update({ status: 'Blocked', current_bookings: 0 })
          .in('id', matchIds);
      }
    }
  }

  static async bulkGenerateSlots(dateRange: string[]): Promise<void> {
    const { data: facilities } = await supabase.from('facilities').select('*');
    if (!facilities) return;

    const newSlots: any[] = [];
    for (const dateStr of dateRange) {
      // Clear existing to avoid collision
      await supabase.from('slots').delete().eq('date', dateStr);
      
      facilities.forEach(fac => {
        TIME_SLOTS.forEach(slotInfo => {
          newSlots.push({
            id: `${fac.id}-${dateStr}-${slotInfo.start.replace(/[^a-zA-Z0-9]/g, '')}`,
            facility_id: fac.id,
            date: dateStr,
            start_time: slotInfo.start,
            end_time: slotInfo.end,
            status: 'Available',
            max_capacity: fac.capacity,
            current_bookings: 0
          });
        });
      });
    }

    if (newSlots.length > 0) {
      await supabase.from('slots').insert(newSlots);
    }
  }

  // --- BOOKINGS ---
  static async getBookings(): Promise<Booking[]> {
    let dbBookings: Booking[] = [];
    try {
      const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        dbBookings = data.map(mapBooking);
      }
    } catch (e) {}

    let localBookings: Booking[] = [];
    try {
      const raw = localStorage.getItem('sportsync_bookings');
      if (raw) {
        localBookings = JSON.parse(raw);
      }
    } catch (e) {}

    const bookingMap = new Map<string, Booking>();
    
    // Add local bookings
    localBookings.forEach(b => {
      bookingMap.set(b.id, b);
    });

    // Add or override with DB bookings
    dbBookings.forEach(b => {
      const existing = bookingMap.get(b.id);
      if (existing) {
        if (b.status === 'Cancelled' || b.status === 'Completed' || b.status === 'Checked-In') {
          bookingMap.set(b.id, b);
        } else if (existing.status === 'Cancelled' || existing.status === 'Completed' || existing.status === 'Checked-In') {
          bookingMap.set(b.id, existing);
        } else {
          bookingMap.set(b.id, b);
        }
      } else {
        bookingMap.set(b.id, b);
      }
    });

    const merged = Array.from(bookingMap.values());
    try {
      localStorage.setItem('sportsync_bookings', JSON.stringify(merged));
    } catch (e) {}

    return merged;
  }

  static async createBooking(params: {
    user: UserProfile;
    facility: SportFacility;
    slot: FacilitySlot;
    isGroupBooking: boolean;
    groupSize: number;
    groupMembers?: string[];
  }): Promise<{ success: boolean; message: string; booking?: Booking }> {
    const { user, facility, slot } = params;

    // Daily Cap verification
    const { data: userBookingsToday } = await supabase.from('bookings')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', slot.date)
      .eq('status', 'Confirmed');

    const config = await this.getAdminConfig();
    const maxDaily = config.maxBookingsPerUserPerDay;
    if (userBookingsToday && userBookingsToday.length >= maxDaily) {
      return { success: false, message: `Daily booking cap reached! Admin allows max ${maxDaily} bookings per day.` };
    }

    // Double Booking Check
    const { data: doubleBookings } = await supabase.from('bookings')
      .select('id')
      .eq('user_id', user.id)
      .eq('slot_id', slot.id)
      .eq('status', 'Confirmed');

    if (doubleBookings && doubleBookings.length > 0) {
      return { success: false, message: 'You have already booked this slot!' };
    }

    // Check active slot availability & occupancy
    const { data: activeBookingCheck } = await supabase.from('bookings')
      .select('id, group_size, is_group_booking')
      .eq('slot_id', slot.id)
      .in('status', ['Confirmed', 'Checked-In']);

    let totalOccupancy = 0;
    if (activeBookingCheck && activeBookingCheck.length > 0) {
      activeBookingCheck.forEach(b => {
        totalOccupancy += b.is_group_booking ? (b.group_size || 1) : 1;
      });
    }

    const requestedOccupancy = params.isGroupBooking ? (params.groupSize || 1) : 1;
    const maxCapacity = facility.capacity || slot.maxCapacity || 4;

    if (totalOccupancy + requestedOccupancy > maxCapacity || totalOccupancy >= maxCapacity) {
      return { success: false, message: 'Slot is fully booked. You can join the waitlist instead.' };
    }

    // Ensure slot row exists in slots table in Supabase
    const newCount = totalOccupancy + requestedOccupancy;
    const newStatus = newCount >= maxCapacity ? 'Booked' : 'Available';

    try {
      const { data: activeSlot } = await supabase.from('slots').select('id').eq('id', slot.id).maybeSingle();
      if (!activeSlot) {
        await supabase.from('slots').insert([{
          id: slot.id,
          facility_id: facility.id,
          date: slot.date,
          start_time: slot.startTime,
          end_time: slot.endTime,
          status: newStatus,
          max_capacity: maxCapacity,
          current_bookings: newCount
        }]);
      } else {
        await supabase.from('slots')
          .update({ current_bookings: newCount, status: newStatus })
          .eq('id', slot.id);
      }
    } catch (e) {
      console.warn('Slot table sync warning:', e);
    }

    const bookingId = `SS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newBooking: Booking = {
      id: bookingId,
      userId: user.id,
      userName: user.name,
      userCollegeId: user.collegeId,
      facilityId: facility.id,
      facilityName: facility.name,
      sportType: facility.sportType,
      courtNumber: 'Court A',
      slotId: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      bookedAt: new Date().toISOString(),
      status: 'Confirmed',
      isGroupBooking: params.isGroupBooking,
      groupSize: params.groupSize,
      groupMembers: params.groupMembers || []
    };

    await supabase.from('bookings').insert([{
      id: newBooking.id,
      user_id: newBooking.userId,
      user_name: newBooking.userName,
      user_college_id: newBooking.userCollegeId,
      slot_id: newBooking.slotId,
      facility_name: newBooking.facilityName,
      sport_type: newBooking.sportType,
      date: newBooking.date,
      start_time: newBooking.startTime,
      end_time: newBooking.endTime,
      is_group_booking: newBooking.isGroupBooking,
      group_size: newBooking.groupSize,
      group_members: newBooking.groupMembers,
      status: newBooking.status,
      created_at: newBooking.bookedAt
    }]);

    await this.log(user.id, user.name, `Booked slot for ${facility.name} on ${slot.date} at ${slot.startTime}`, 'Booking', newBooking.id);
    return { success: true, message: 'Booking confirmed!', booking: newBooking };
  }

  static async getBookingById(id: string): Promise<Booking | null> {
    try {
      const { data, error } = await supabase.from('bookings')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (data) return mapBooking(data);
    } catch (e) {}

    // Fallback: Check local storage
    try {
      const raw = localStorage.getItem('sportsync_bookings');
      if (raw) {
        const list = JSON.parse(raw);
        const found = list.find((b: any) => b.id === id);
        if (found) return found;
      }
    } catch (e) {}

    return null;
  }

  static async cancelBooking(bookingId: string, actingUserId: string): Promise<{ success: boolean; message: string }> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };
    if (booking.status !== 'Confirmed') return { success: false, message: 'Booking already cancelled or completed' };

    const user = await this.getUserById(actingUserId);
    if (!user) return { success: false, message: 'User not found' };

    if (booking.isGroupBooking && user.role === 'Student' && booking.userId !== user.id) {
      return { success: false, message: 'Only the booking captain can cancel a group booking!' };
    }

    // 1. Update Supabase
    try {
      await supabase.from('bookings').update({ status: 'Cancelled' }).eq('id', bookingId);
      if (booking.slotId) {
        const { data: slot } = await supabase.from('slots').select('current_bookings').eq('id', booking.slotId).maybeSingle();
        if (slot && slot.current_bookings > 0) {
          await supabase.from('slots')
            .update({ current_bookings: Math.max(0, slot.current_bookings - 1), status: 'Available' })
            .eq('id', booking.slotId);
        }
      }
    } catch (e) {}

    // 2. Update LocalStorage cache
    try {
      const raw = localStorage.getItem('sportsync_bookings');
      if (raw) {
        const list = JSON.parse(raw);
        const idx = list.findIndex((b: any) => b.id === bookingId);
        if (idx !== -1) {
          list[idx].status = 'Cancelled';
          localStorage.setItem('sportsync_bookings', JSON.stringify(list));
        }
      }
    } catch (e) {}

    await this.log(user.id, user.name, `Cancelled slot booking: ${bookingId}`, 'Booking', bookingId);

    // Promote waitlist automatically
    if (booking.slotId) {
      await this.promoteWaitlist(booking.slotId);
    }

    return { success: true, message: 'Booking cancelled successfully' };
  }

  static async checkInBooking(bookingId: string, actingUserId: string): Promise<{ success: boolean; message: string; schemaWarning?: boolean }> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };
    if (booking.status === 'Cancelled') return { success: false, message: 'Cannot check in a cancelled booking.' };
    if (booking.status === 'Checked-In') return { success: true, message: 'Student is already checked in.' };

    const user = await this.getUserById(actingUserId);
    const userName = user ? user.name : 'System';

    // 1. Update Supabase
    try {
      await supabase.from('bookings')
        .update({ status: 'Checked-In' })
        .eq('id', bookingId);
    } catch (e) {}

    // 2. Update LocalStorage cache
    try {
      const raw = localStorage.getItem('sportsync_bookings');
      if (raw) {
        const list = JSON.parse(raw);
        const idx = list.findIndex((b: any) => b.id === bookingId);
        if (idx !== -1) {
          list[idx].status = 'Checked-In';
          localStorage.setItem('sportsync_bookings', JSON.stringify(list));
        }
      }
    } catch (e) {}

    let delayMinutes = 0;
    try {
      const nowIST = getISTDate();
      const start24 = convertTo24Hour(booking.startTime);
      const slotStart = new Date(`${booking.date}T${start24}:00`);
      delayMinutes = Math.floor((nowIST.getTime() - slotStart.getTime()) / (1000 * 60));
    } catch (e) {}

    let logMsg = `Slot opened on time for ${booking.facilityName} (${booking.userName})`;
    if (delayMinutes > 0) {
      logMsg = `Slot opened ${delayMinutes}m delayed for ${booking.facilityName} (${booking.userName})`;
    }

    await this.log(actingUserId, userName, logMsg, 'Booking', bookingId);
    return { success: true, message: 'Student checked in successfully!' };
  }

  static async closeBookingSlot(bookingId: string, actingUserId: string): Promise<{ success: boolean; message: string; schemaWarning?: boolean }> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };
    if (booking.status === 'Completed' || booking.status === 'Cancelled') {
      return { success: true, message: 'Booking slot is already closed.' };
    }

    const user = await this.getUserById(actingUserId);
    const userName = user ? user.name : 'System';

    // If the student never checked in (still Confirmed), this is a late/absent Cancellation.
    // If they checked in, they completed their slot.
    const targetStatus = booking.status === 'Confirmed' ? 'Cancelled' : 'Completed';

    // 1. Update Supabase
    try {
      await supabase.from('bookings')
        .update({ status: targetStatus })
        .eq('id', bookingId);

      if (booking.slotId) {
        const { data: slot } = await supabase.from('slots').select('current_bookings, status').eq('id', booking.slotId).maybeSingle();
        if (slot) {
          const releaseSize = booking.isGroupBooking ? (booking.groupSize || 1) : 1;
          const nextCount = Math.max(0, slot.current_bookings - releaseSize);
          const nextStatus = nextCount === 0 ? 'Available' : 'Available'; // Reopen slot if below capacity
          await supabase.from('slots')
            .update({ status: nextStatus, current_bookings: nextCount })
            .eq('id', booking.slotId);
        }
      }
    } catch (e) {}

    // 2. Update LocalStorage cache
    try {
      const raw = localStorage.getItem('sportsync_bookings');
      if (raw) {
        const list = JSON.parse(raw);
        const idx = list.findIndex((b: any) => b.id === bookingId);
        if (idx !== -1) {
          list[idx].status = targetStatus;
          localStorage.setItem('sportsync_bookings', JSON.stringify(list));
        }
      }
    } catch (e) {}

    // Promote waitlist if anyone was waiting for this slot
    if (booking.slotId) {
      await this.promoteWaitlist(booking.slotId);
    }

    let earlyMinutes = 0;
    try {
      const nowIST = getISTDate();
      const end24 = convertTo24Hour(booking.endTime);
      const slotEnd = new Date(`${booking.date}T${end24}:00`);
      earlyMinutes = Math.floor((slotEnd.getTime() - nowIST.getTime()) / (1000 * 60));
    } catch (e) {}

    const actionVerb = targetStatus === 'Cancelled' ? 'cancelled (no-show/late)' : 'closed';
    let logMsg = `Slot ${actionVerb} for ${booking.facilityName} (${booking.userName})`;
    if (earlyMinutes > 0 && targetStatus === 'Completed') {
      logMsg = `Slot closed ${earlyMinutes}m before the slot closes for ${booking.facilityName} (${booking.userName})`;
    }

    await this.log(actingUserId, userName, logMsg, 'Booking', bookingId);
    return { 
      success: true, 
      message: targetStatus === 'Cancelled' ? 'Booking cancelled due to delay/no-show.' : 'Booking slot closed successfully!' 
    };
  }

  // --- WAITLIST ---
  static async getWaitlist(): Promise<WaitlistEntry[]> {
    const { data, error } = await supabase.from('waitlist').select('*').order('created_at', { ascending: true });
    if (error || !data) return [];
    return data.map(mapWaitlist);
  }

  static async joinWaitlist(userId: string, slotId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.getUserById(userId);
    if (!user) return { success: false, message: 'User not found' };

    const { data: slot } = await supabase.from('slots').select('*').eq('id', slotId).single();
    if (!slot) return { success: false, message: 'Slot not found' };

    const { data: waitlist } = await supabase.from('waitlist').select('*').eq('slot_id', slotId).eq('status', 'Waiting');
    const alreadyOnWaitlist = waitlist?.some(w => w.user_id === userId);
    if (alreadyOnWaitlist) return { success: false, message: 'You are already on the waitlist for this slot' };

    const { data: facilities } = await supabase.from('facilities').select('name, type');
    const fac = facilities?.find(f => f.name !== ''); // Basic selection fallback
    const facilityName = fac ? fac.name : 'Unknown facility';
    const sportType = fac ? fac.type : 'Badminton';

    const position = (waitlist?.length || 0) + 1;
    const entryId = `WL-${Date.now()}`;

    await supabase.from('waitlist').insert([{
      id: entryId,
      user_id: user.id,
      user_name: user.name,
      user_college_id: user.collegeId,
      slot_id: slotId,
      facility_name: facilityName,
      sport_type: sportType,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      position,
      status: 'Waiting'
    }]);

    await this.log(user.id, user.name, `Joined waitlist for slot ${slotId}`, 'System', entryId);
    return { success: true, message: 'Successfully joined the waitlist!' };
  }

  static async promoteWaitlist(slotId: string): Promise<void> {
    const { data: waiting } = await supabase.from('waitlist')
      .select('*')
      .eq('slot_id', slotId)
      .eq('status', 'Waiting')
      .order('created_at', { ascending: true })
      .limit(1);

    if (!waiting || waiting.length === 0) return;
    const nextUser = waiting[0];

    // Mark as promoted
    await supabase.from('waitlist').update({ status: 'Promoted' }).eq('id', nextUser.id);

    // Book the slot
    const { data: slot } = await supabase.from('slots').select('current_bookings, max_capacity').eq('id', slotId).single();
    if (slot) {
      const nextCount = slot.current_bookings + 1;
      const nextStatus = nextCount >= slot.max_capacity ? 'Booked' : 'Available';
      await supabase.from('slots').update({ current_bookings: nextCount, status: nextStatus }).eq('id', slotId);
    }

    const bookingId = `SS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await supabase.from('bookings').insert([{
      id: bookingId,
      user_id: nextUser.user_id,
      user_name: nextUser.user_name,
      user_college_id: nextUser.user_college_id || '',
      slot_id: slotId,
      facility_name: nextUser.facility_name,
      sport_type: nextUser.sport_type,
      court_number: 'Court A',
      date: nextUser.date,
      start_time: nextUser.start_time,
      end_time: nextUser.end_time,
      status: 'Confirmed'
    }]);

    await this.log('System', 'Waitlist Automation', `Promoted waitlisted user ${nextUser.user_name} to slot ${slotId}`, 'Booking', bookingId);
  }

  // --- ADMIN CONFIG ---
  static async getAdminConfig(): Promise<AdminConfig> {
    const { data } = await supabase.from('admin_config').select('*');
    const configObj: any = {
      maxBookingsPerUserPerDay: 2,
      advanceBookingWindowDays: 3,
      weatherThresholdAlert: 'Rainy'
    };
    if (data) {
      data.forEach(row => {
        configObj[row.key] = parseInt(row.value);
      });
    }
    return configObj as AdminConfig;
  }

  static async updateAdminConfig(updates: Partial<AdminConfig>): Promise<void> {
    const ops = Object.entries(updates).map(([key, val]) => {
      return supabase.from('admin_config').upsert({ key, value: String(val) });
    });
    await Promise.all(ops);
  }

  static async bulkCancelOutdoorSlots(weatherAlert: string): Promise<number> {
    const { data: facilities } = await supabase.from('facilities').select('id, type');
    if (!facilities) return 0;

    const outdoorSports = ['Cricket', 'Football', 'Tennis', 'Basketball'];
    const affectedFacs = facilities.filter(f => outdoorSports.includes(f.type)).map(f => f.id);
    const dateStr = getOffsetDateString(0);

    // Block outdoor slots for today
    await supabase.from('slots')
      .update({ status: 'Blocked', current_bookings: 0 })
      .in('facility_id', affectedFacs)
      .eq('date', dateStr);

    // Fetch and Cancel matching bookings
    const { data: bookings } = await supabase.from('bookings')
      .select('id')
      .in('facility_id', affectedFacs)
      .eq('date', dateStr)
      .eq('status', 'Confirmed');

    if (bookings && bookings.length > 0) {
      const bIds = bookings.map(b => b.id);
      await supabase.from('bookings').update({ status: 'Cancelled' }).in('id', bIds);
      await this.log('System', 'Weather Advisory System', `Weather warning: auto-cancelled ${bIds.length} outdoor bookings`, 'Booking', 'bulk-cancel');
      return bIds.length;
    }
    return 0;
  }

  static async gdprDeleteAccount(userId: string): Promise<void> {
    await supabase.from('bookings').delete().eq('user_id', userId);
    await supabase.from('waitlist').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);
    await this.log('System', 'Compliance Officer', `Purged all data for user ID ${userId} per GDPR request`, 'User', userId);
  }

  // --- ANNOUNCEMENTS ---
  static async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapAnnouncement);
  }

  static async createAnnouncement(message: string, createdBy: string): Promise<Announcement> {
    // Deactivate all previous announcements to keep only the new one active
    await supabase.from('announcements')
      .update({ is_active: false })
      .eq('is_active', true);

    const newId = `ann-${Date.now()}`;
    const newAnnouncement = {
      id: newId,
      message,
      created_by: createdBy,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('announcements')
      .insert([newAnnouncement])
      .select()
      .single();

    if (error || !data) {
      console.error('Failed to create announcement:', error);
      throw new Error(`Failed to create announcement: ${error?.message || 'Unknown error'}`);
    }

    await this.log('System', createdBy, `Published new announcement: "${message.substring(0, 30)}..."`, 'Announcement', newId);
    return mapAnnouncement(data);
  }

  static async toggleAnnouncementStatus(id: string, isActive: boolean): Promise<void> {
    if (isActive) {
      await supabase.from('announcements')
        .update({ is_active: false })
        .eq('is_active', true);
    }

    const { error } = await supabase.from('announcements')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      console.error('Failed to update announcement status:', error);
      throw new Error(`Failed to update announcement status: ${error.message}`);
    }
  }

  static async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase.from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete announcement:', error);
      throw new Error(`Failed to delete announcement: ${error.message}`);
    }
  }
}
