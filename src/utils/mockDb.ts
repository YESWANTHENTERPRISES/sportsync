// SportSync Local Database Simulation Layer

import { SportCategory, Region } from '../types/sportsync';

export type UserRole = 'Admin' | 'Student';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  collegeId: string;
  preferences: string[]; // multi-select tags
  status: 'Active' | 'Banned';
  role: UserRole;
  password: string;
  createdAt: string;
}

export type SlotStatus = 'Available' | 'Booked' | 'Maintenance' | 'Blocked';

export interface SportFacility {
  id: string;
  name: string;
  sportType: 'Badminton' | 'Cricket' | 'Basketball' | 'Football' | 'Tennis' | 'Volley Ball' | 'Table Tennis' | 'Shuttlecock' | 'Handball' | 'Chess' | 'Carrom' | 'Throw Ball';
  location: string;
  courtNumber: string;
  capacity: number; // e.g. 1 court = 1 slot capacity, swimming pool = 10 capacity
  photoUrl: string;
  status: 'Active' | 'Maintenance';
}

export interface Announcement {
  id: string;
  message: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
}

export interface FacilitySlot {
  id: string;
  facilityId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: SlotStatus;
  maxCapacity: number;
  currentBookings: number;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userCollegeId: string;
  facilityId: string;
  facilityName: string;
  sportType: string;
  courtNumber: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  bookedAt: string;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
  isGroupBooking: boolean;
  groupSize: number;
  groupMembers?: string[]; // student names
  cancelledAt?: string;
}

export interface WaitlistEntry {
  id: string;
  userId: string;
  userName: string;
  userCollegeId: string;
  slotId: string;
  facilityName: string;
  date: string;
  startTime: string;
  joinedAt: string;
  status: 'Waiting' | 'Promoted' | 'Cancelled';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'Booking' | 'Facility' | 'Slot' | 'User' | 'System';
  entityId: string;
  timestamp: string;
}

// Config variables managed by admin
export interface AdminConfig {
  maxBookingsPerUserPerDay: number;
  advanceBookingWindowDays: number;
  weatherThresholdAlert: string; // e.g. "Heavy Rain"
}

// Default initial config
const DEFAULT_CONFIG: AdminConfig = {
  maxBookingsPerUserPerDay: 2,
  advanceBookingWindowDays: 7,
  weatherThresholdAlert: 'Rainy',
};

// Initial mock data
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin',
    name: 'YESWANTH',
    phone: '9876543210',
    collegeId: 'VIT-AD-001',
    preferences: ['Badminton', 'Basketball'],
    status: 'Active',
    role: 'Admin',
    password: 'admin123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-stud1',
    name: 'Abhishek Nair',
    phone: '8123456789',
    collegeId: '20BCE1022',
    preferences: ['Badminton', 'Tennis', 'Volley Ball'],
    status: 'Active',
    role: 'Student',
    password: 'student123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-stud2',
    name: 'Pooja Krishnan',
    phone: '8123456790',
    collegeId: '21BKT2045',
    preferences: ['Basketball', 'Football'],
    status: 'Active',
    role: 'Student',
    password: 'student123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-banned',
    name: 'Vikram Singh',
    phone: '8123456799',
    collegeId: '20BME0984',
    preferences: ['Cricket'],
    status: 'Banned',
    role: 'Student',
    password: 'student123',
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_FACILITIES: SportFacility[] = [
  {
    id: 'fac-bad-in-1',
    name: 'MG Indoor Badminton Court 1',
    sportType: 'Badminton',
    location: 'MG Auditorium & Indoor Complex',
    courtNumber: 'Court 1',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-bad-in-2',
    name: 'MG Indoor Badminton Court 2',
    sportType: 'Badminton',
    location: 'MG Auditorium & Indoor Complex',
    courtNumber: 'Court 2',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-bad-in-3',
    name: 'MG Indoor Badminton Court 3',
    sportType: 'Badminton',
    location: 'MG Auditorium & Indoor Complex',
    courtNumber: 'Court 3',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-bad-in-4',
    name: 'MG Indoor Badminton Court 4',
    sportType: 'Badminton',
    location: 'MG Auditorium & Indoor Complex',
    courtNumber: 'Court 4',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-bad-out-1',
    name: 'Campus Outdoor Badminton Court 1',
    sportType: 'Badminton',
    location: 'Main Sports Ground',
    courtNumber: 'Court 1',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-bad-out-2',
    name: 'Campus Outdoor Badminton Court 2',
    sportType: 'Badminton',
    location: 'Main Sports Ground',
    courtNumber: 'Court 2',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-bad-out-3',
    name: 'Campus Outdoor Badminton Court 3',
    sportType: 'Badminton',
    location: 'Main Sports Ground',
    courtNumber: 'Court 3',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-bad-out-4',
    name: 'Campus Outdoor Badminton Court 4',
    sportType: 'Badminton',
    location: 'Main Sports Ground',
    courtNumber: 'Court 4',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-cri-oval',
    name: 'Main Cricket Oval',
    sportType: 'Cricket',
    location: 'Main Sports Field',
    courtNumber: 'Main Oval',
    capacity: 22,
    photoUrl: 'https://images.unsplash.com/photo-1531415080290-bc98529c1133?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-cri-net-1',
    name: 'Cricket Practice Net 1',
    sportType: 'Cricket',
    location: 'Main Sports Field Area',
    courtNumber: 'Net 1',
    capacity: 6,
    photoUrl: 'https://images.unsplash.com/photo-1531415080290-bc98545ab5fc?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-cri-net-2',
    name: 'Cricket Practice Net 2',
    sportType: 'Cricket',
    location: 'Main Sports Field Area',
    courtNumber: 'Net 2',
    capacity: 6,
    photoUrl: 'https://images.unsplash.com/photo-1531415080290-bc98545ab5fc?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-cri-net-3',
    name: 'Cricket Practice Net 3',
    sportType: 'Cricket',
    location: 'Main Sports Field Area',
    courtNumber: 'Net 3',
    capacity: 6,
    photoUrl: 'https://images.unsplash.com/photo-1531415080290-bc98545ab5fc?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-bas-1',
    name: 'Basketball Court 1 (Beside Anna Auditorium)',
    sportType: 'Basketball',
    location: 'Beside Anna Auditorium',
    courtNumber: 'Court 1',
    capacity: 10,
    photoUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-bas-2',
    name: 'Basketball Court 2 (Beside Anna Auditorium)',
    sportType: 'Basketball',
    location: 'Beside Anna Auditorium',
    courtNumber: 'Court 2',
    capacity: 10,
    photoUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-football',
    name: 'Full-Size Football Field',
    sportType: 'Football',
    location: 'Main Sports Field',
    courtNumber: 'Main Pitch',
    capacity: 22,
    photoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-ten-1',
    name: 'Tennis Court 1 (Floodlights)',
    sportType: 'Tennis',
    location: 'Main Sports Field',
    courtNumber: 'Court 1',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-ten-2',
    name: 'Tennis Court 2 (Floodlights)',
    sportType: 'Tennis',
    location: 'Main Sports Field',
    courtNumber: 'Court 2',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-vol-1',
    name: 'Volleyball Court 1 (Beside Anna Auditorium)',
    sportType: 'Volley Ball',
    location: 'Beside Anna Auditorium',
    courtNumber: 'Court 1',
    capacity: 12,
    photoUrl: 'https://images.unsplash.com/photo-1592656094270-b9bd29d79998?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-vol-2',
    name: 'Volleyball Court 2 (Beside Anna Auditorium)',
    sportType: 'Volley Ball',
    location: 'Beside Anna Auditorium',
    courtNumber: 'Court 2',
    capacity: 12,
    photoUrl: 'https://images.unsplash.com/photo-1592656094270-b9bd29d79998?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-tt-1',
    name: 'Recreational Zone TT Table 1',
    sportType: 'Table Tennis',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Table 1',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-tt-2',
    name: 'Recreational Zone TT Table 2',
    sportType: 'Table Tennis',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Table 2',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-tt-3',
    name: 'Recreational Zone TT Table 3',
    sportType: 'Table Tennis',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Table 3',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-tt-4',
    name: 'Recreational Zone TT Table 4',
    sportType: 'Table Tennis',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Table 4',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-shuttle-1',
    name: 'Campus Shuttlecock Court 1',
    sportType: 'Shuttlecock',
    location: 'Main Sports Ground',
    courtNumber: 'Court 1',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-shuttle-2',
    name: 'Campus Shuttlecock Court 2',
    sportType: 'Shuttlecock',
    location: 'Main Sports Ground',
    courtNumber: 'Court 2',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-hand-1',
    name: 'Outdoor Handball Court 1',
    sportType: 'Handball',
    location: 'Main Sports Ground',
    courtNumber: 'Court 1',
    capacity: 14,
    photoUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-hand-2',
    name: 'Outdoor Handball Court 2',
    sportType: 'Handball',
    location: 'Main Sports Ground',
    courtNumber: 'Court 2',
    capacity: 14,
    photoUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-chess-1',
    name: 'Recreational Zone Chess Board 1',
    sportType: 'Chess',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Board 1',
    capacity: 2,
    photoUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-chess-2',
    name: 'Recreational Zone Chess Board 2',
    sportType: 'Chess',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Board 2',
    capacity: 2,
    photoUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-chess-3',
    name: 'Recreational Zone Chess Board 3',
    sportType: 'Chess',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Board 3',
    capacity: 2,
    photoUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-chess-4',
    name: 'Recreational Zone Chess Board 4',
    sportType: 'Chess',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Board 4',
    capacity: 2,
    photoUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-carrom-1',
    name: 'Recreational Zone Carrom Board 1',
    sportType: 'Carrom',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Board 1',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-carrom-2',
    name: 'Recreational Zone Carrom Board 2',
    sportType: 'Carrom',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Board 2',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-carrom-3',
    name: 'Recreational Zone Carrom Board 3',
    sportType: 'Carrom',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Board 3',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-carrom-4',
    name: 'Recreational Zone Carrom Board 4',
    sportType: 'Carrom',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Board 4',
    capacity: 4,
    photoUrl: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  },
  {
    id: 'fac-throw-1',
    name: 'Outdoor Throwball Court 1',
    sportType: 'Throw Ball',
    location: 'Main Sports Ground',
    courtNumber: 'Court 1',
    capacity: 14,
    photoUrl: 'https://images.unsplash.com/photo-1592656094270-b9bd29d79998?auto=format&fit=crop&q=80&w=600',
    status: 'Active',
  }
];

// Helper to format date
export const getOffsetDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const TIME_SLOTS = [
  { start: '06:00', end: '07:00' },
  { start: '07:00', end: '08:00' },
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
  { start: '18:00', end: '19:00' },
  { start: '19:00', end: '20:00' },
  { start: '20:00', end: '21:00' },
];

export const MOCK_WEATHER_REPORTS = [
  { time: 'Morning (06:00 - 10:00)', temp: '28°C', condition: 'Sunny', icon: '☀️', advisory: 'Clear skies. Perfect for outdoor sports!' },
  { time: 'Evening (16:00 - 21:00)', temp: '26°C', condition: 'Rainy', icon: '🌧️', advisory: '⚠️ Rain expected — outdoor courts may close' },
];

import { SupabaseDatabase } from './supabaseDb';
export const MockDatabase = SupabaseDatabase;
