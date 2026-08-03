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
  status: 'Confirmed' | 'Cancelled' | 'Completed' | 'Checked-In';
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

export interface CustomSportBooking {
  id: string;
  sportName: string;
  date: string;
  time: string;
  duration: string;
  maxPlayers: number;
  joinedUsers: string[]; // usernames/collegeId values
  location: string;
  description?: string;
  isPublic: boolean;
  organizerId: string;
  organizerName: string;
  aiSuggested: boolean;
  createdAt: string;
  sharePhoneConsent?: boolean;
  organizerPhone?: string;
  stopAccepting?: boolean;
  isFullOverride?: boolean;
  sportEquipmentPickedUp?: boolean;
}

export interface JoinRequest {
  id: string;
  eventId: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar?: string;
  registrationId: string;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Expired';
  createdAt: string;
  expiresAt: string;
}

export interface TournamentMatch {
  id: string;
  round: number; // 1 = QF (8 teams), 2 = SF (4 teams), 3 = Finals (2 teams)
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  winner?: string;
  status: 'Scheduled' | 'Completed';
  nextMatchId?: string; // id of the match winner advances to
  date?: string;
  venue?: string;
  aiSummary?: string;
}

export interface RoundRobinPoints {
  team: string;
  played: number;
  won: number;
  lost: number;
  points: number;
}

export interface Tournament {
  id: string;
  name: string;
  sport: string;
  format: 'Knockout' | 'Round Robin' | 'League';
  type: 'Team' | 'Individual';
  maxParticipants: number;
  registrationDeadline: string;
  scheduleType: 'Auto-generate' | 'Manual';
  venue: string;
  prize?: string;
  status: 'Open' | 'Ongoing' | 'Completed';
  createdBy: string;
  registeredTeams: string[];
  matches: TournamentMatch[];
  pointsTable?: RoundRobinPoints[];
  createdAt: string;
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
  advanceBookingWindowDays: 3,
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

export const INITIAL_FACILITIES: SportFacility[] = [
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
    photoUrl: '/cricket.png',
    status: 'Active',
  },
  {
    id: 'fac-cri-net-1',
    name: 'Cricket Practice Net 1',
    sportType: 'Cricket',
    location: 'Main Sports Field Area',
    courtNumber: 'Net 1',
    capacity: 6,
    photoUrl: '/cricket.png',
    status: 'Active',
  },
  {
    id: 'fac-cri-net-2',
    name: 'Cricket Practice Net 2',
    sportType: 'Cricket',
    location: 'Main Sports Field Area',
    courtNumber: 'Net 2',
    capacity: 6,
    photoUrl: '/cricket.png',
    status: 'Active',
  },
  {
    id: 'fac-cri-net-3',
    name: 'Cricket Practice Net 3',
    sportType: 'Cricket',
    location: 'Main Sports Field Area',
    courtNumber: 'Net 3',
    capacity: 6,
    photoUrl: '/cricket.png',
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
    photoUrl: '/handball.png',
    status: 'Active',
  },
  {
    id: 'fac-hand-2',
    name: 'Outdoor Handball Court 2',
    sportType: 'Handball',
    location: 'Main Sports Ground',
    courtNumber: 'Court 2',
    capacity: 14,
    photoUrl: '/handball.png',
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
    photoUrl: '/carrom.png',
    status: 'Active',
  },
  {
    id: 'fac-carrom-2',
    name: 'Recreational Zone Carrom Board 2',
    sportType: 'Carrom',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Board 2',
    capacity: 4,
    photoUrl: '/carrom.png',
    status: 'Active',
  },
  {
    id: 'fac-carrom-3',
    name: 'Recreational Zone Carrom Board 3',
    sportType: 'Carrom',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Board 3',
    capacity: 4,
    photoUrl: '/carrom.png',
    status: 'Active',
  },
  {
    id: 'fac-carrom-4',
    name: 'Recreational Zone Carrom Board 4',
    sportType: 'Carrom',
    location: 'Indoor Recreation Zone',
    courtNumber: 'Board 4',
    capacity: 4,
    photoUrl: '/carrom.png',
    status: 'Active',
  },
  {
    id: 'fac-throw-1',
    name: 'Outdoor Throwball Court 1',
    sportType: 'Throw Ball',
    location: 'Main Sports Ground',
    courtNumber: 'Court 1',
    capacity: 14,
    photoUrl: '/throwball.png',
    status: 'Active',
  }
];

// Helper to get current Date in Indian Standard Time (IST)
export const getISTDate = (): Date => {
  const now = new Date();
  // IST offset is UTC+5:30 = +330 minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (330 * 60000));
};

// Helper to format date in YYYY-MM-DD (IST)
export const getOffsetDateString = (offsetDays: number = 0): string => {
  const d = getISTDate();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// Convert 24-hour HH:mm to 12-hour AM/PM format
export const formatTo12Hour = (timeStr: string): string => {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hStr = hours < 10 ? `0${hours}` : `${hours}`;
  return `${hStr}:${minutes} ${ampm}`;
};

// Convert 12-hour or 24-hour time string to 24-hour HH:mm string for Date calculations
export const convertTo24Hour = (timeStr: string): string => {
  if (!timeStr) return '00:00';
  const trimmed = timeStr.trim().toUpperCase();
  if (!trimmed.includes('AM') && !trimmed.includes('PM')) {
    return trimmed.padStart(5, '0');
  }
  const isPM = trimmed.includes('PM');
  const isAM = trimmed.includes('AM');
  const cleanStr = trimmed.replace('AM', '').replace('PM', '').trim();
  const parts = cleanStr.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  const hStr = hours < 10 ? `0${hours}` : `${hours}`;
  return `${hStr}:${minutes}`;
};

export const TIME_SLOTS = [
  // Morning 1-Hour Slots (07:00 AM - 12:00 PM)
  { start: '07:00 AM', end: '08:00 AM' },
  { start: '08:00 AM', end: '09:00 AM' },
  { start: '09:00 AM', end: '10:00 AM' },
  { start: '10:00 AM', end: '11:00 AM' },
  { start: '11:00 AM', end: '12:00 PM' },
  
  // AFTERNOON BREAK: 12:30 PM to 02:00 PM - EXCLUDED / NO SLOTS AVAILABLE
  
  // Afternoon & Evening 1-Hour Slots (02:00 PM - 08:00 PM)
  { start: '02:00 PM', end: '03:00 PM' },
  { start: '03:00 PM', end: '04:00 PM' },
  { start: '04:00 PM', end: '05:00 PM' },
  { start: '05:00 PM', end: '06:00 PM' },
  { start: '06:00 PM', end: '07:00 PM' },
  { start: '07:00 PM', end: '08:00 PM' },
];

export const MOCK_WEATHER_REPORTS = [
  { time: 'Morning (07:00 AM - 12:00 PM)', temp: '28°C', condition: 'Sunny', icon: '☀️', advisory: 'Clear skies. Perfect for outdoor sports!' },
  { time: 'Evening (02:00 PM - 08:00 PM)', temp: '26°C', condition: 'Rainy', icon: '🌧️', advisory: '⚠️ Rain expected — outdoor courts may close' },
];

import { SupabaseDatabase } from './supabaseDb';
export const MockDatabase = new Proxy(class {}, {
  get(target, prop) {
    return (SupabaseDatabase as any)[prop];
  },
  set(target, prop, value) {
    (SupabaseDatabase as any)[prop] = value;
    return true;
  }
}) as any;
