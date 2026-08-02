-- SPORTY SYNC VIT CHENNAI - SUPABASE DATABASE SCHEMA MIGRATION
-- Paste this script into your Supabase project's SQL Editor and run it.

-- 1. PROFILES TABLE
create table if not exists public.profiles (
    id text primary key,
    name text not null,
    phone text not null,
    college_id text unique not null,
    role text not null check (role in ('Admin', 'Student')),
    preferences text[] not null default '{}',
    password text not null,
    status text not null default 'Active' check (status in ('Active', 'Banned')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. FACILITIES TABLE
create table if not exists public.facilities (
    id text primary key,
    name text not null,
    type text not null,
    location text not null,
    capacity integer not null,
    image_url text not null,
    description text not null default '',
    is_indoor boolean not null default false,
    status text not null default 'Active',
    rules text[] not null default '{}'
);

-- 3. SLOTS TABLE
create table if not exists public.slots (
    id text primary key,
    facility_id text references public.facilities(id) on delete cascade not null,
    date text not null,
    start_time text not null,
    end_time text not null,
    status text not null default 'Available' check (status in ('Available', 'Booked', 'Full', 'Maintenance', 'Blocked')),
    max_capacity integer not null,
    current_bookings integer not null default 0
);

-- 4. BOOKINGS TABLE
create table if not exists public.bookings (
    id text primary key,
    user_id text references public.profiles(id) on delete cascade not null,
    user_name text not null,
    user_college_id text not null,
    slot_id text references public.slots(id) on delete cascade not null,
    facility_name text not null,
    sport_type text not null,
    date text not null,
    start_time text not null,
    end_time text not null,
    is_group_booking boolean not null default false,
    group_size integer not null default 1,
    group_members text[] not null default '{}',
    status text not null default 'Confirmed' check (status in ('Confirmed', 'Cancelled', 'Completed', 'Checked-In')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. WAITLIST TABLE
create table if not exists public.waitlist (
    id text primary key,
    user_id text references public.profiles(id) on delete cascade not null,
    user_name text not null,
    slot_id text references public.slots(id) on delete cascade not null,
    facility_name text not null,
    sport_type text not null,
    date text not null,
    start_time text not null,
    end_time text not null,
    position integer not null,
    status text not null default 'Waiting' check (status in ('Waiting', 'Promoted', 'Cancelled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
    id text primary key,
    user_id text not null,
    user_name text not null,
    action text not null,
    entity_type text not null,
    entity_id text not null,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. ADMIN CONFIG TABLE
create table if not exists public.admin_config (
    key text primary key,
    value text not null
);

-- Enable Row Level Security (RLS) but allow anonymous access for prototyping simplicity
-- (In a production environment, you should configure specific policies)
alter table public.profiles enable row level security;
alter table public.facilities enable row level security;
alter table public.slots enable row level security;
alter table public.bookings enable row level security;
alter table public.waitlist enable row level security;
alter table public.audit_logs enable row level security;
alter table public.admin_config enable row level security;

-- Create basic RLS policies allowing all operations for testing
drop policy if exists "Allow public access to profiles" on public.profiles;
drop policy if exists "Allow public access to profiles" on profiles;
create policy "Allow public access to profiles" on public.profiles for all using (true) with check (true);

drop policy if exists "Allow public access to facilities" on public.facilities;
drop policy if exists "Allow public access to facilities" on facilities;
create policy "Allow public access to facilities" on public.facilities for all using (true) with check (true);

drop policy if exists "Allow public access to slots" on public.slots;
drop policy if exists "Allow public access to slots" on slots;
create policy "Allow public access to slots" on public.slots for all using (true) with check (true);

drop policy if exists "Allow public access to bookings" on public.bookings;
drop policy if exists "Allow public access to bookings" on bookings;
create policy "Allow public access to bookings" on public.bookings for all using (true) with check (true);

drop policy if exists "Allow public access to waitlist" on public.waitlist;
drop policy if exists "Allow public access to waitlist" on waitlist;
create policy "Allow public access to waitlist" on public.waitlist for all using (true) with check (true);

drop policy if exists "Allow public access to audit_logs" on public.audit_logs;
drop policy if exists "Allow public access to audit_logs" on audit_logs;
create policy "Allow public access to audit_logs" on public.audit_logs for all using (true) with check (true);

drop policy if exists "Allow public access to admin_config" on public.admin_config;
drop policy if exists "Allow public access to admin_config" on admin_config;
create policy "Allow public access to admin_config" on public.admin_config for all using (true) with check (true);

-- --- SEED DATA ---

-- Insert Initial Users (Profiles)
insert into public.profiles (id, name, phone, college_id, role, preferences, password, status)
values
  ('usr-admin', 'YESWANTH', '9444012345', 'VIT-AD-001', 'Admin', '{}', 'admin123', 'Active'),
  ('usr-student1', 'Abhishek Nair', '9840123456', '20BCE1022', 'Student', '{Badminton, Cricket}', 'student123', 'Active'),
  ('usr-student2', 'Pooja Krishnan', '9840987654', '21BKT2045', 'Student', '{Basketball, Tennis}', 'student123', 'Active')
on conflict (id) do update set name = excluded.name, role = excluded.role, password = excluded.password, college_id = excluded.college_id;

-- Insert Initial Facilities
insert into public.facilities (id, name, type, location, capacity, image_url, description, is_indoor, status, rules)
values
  ('fac-bad-in-1', 'MG Indoor Badminton Court 1', 'Badminton', 'MG Auditorium & Indoor Complex', 4, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800', 'Rubberized synthetic indoor court with professional lighting.', true, 'Active', '{"Non-marking shoes mandatory","Maximum 4 players per slot"}'),
  ('fac-bad-in-2', 'MG Indoor Badminton Court 2', 'Badminton', 'MG Auditorium & Indoor Complex', 4, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800', 'Rubberized synthetic indoor court with professional lighting.', true, 'Active', '{"Non-marking shoes mandatory","Maximum 4 players per slot"}'),
  ('fac-bad-in-3', 'MG Indoor Badminton Court 3', 'Badminton', 'MG Auditorium & Indoor Complex', 4, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800', 'Rubberized synthetic indoor court with professional lighting.', true, 'Active', '{"Non-marking shoes mandatory","Maximum 4 players per slot"}'),
  ('fac-bad-in-4', 'MG Indoor Badminton Court 4', 'Badminton', 'MG Auditorium & Indoor Complex', 4, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800', 'Rubberized synthetic indoor court with professional lighting.', true, 'Active', '{"Non-marking shoes mandatory","Maximum 4 players per slot"}'),
  ('fac-bad-out-1', 'Campus Outdoor Badminton Court 1', 'Badminton', 'Main Sports Ground', 4, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800', 'Outdoor asphalt badminton court. Open air.', false, 'Active', '{"Outdoor sports shoes mandatory","Maximum 4 players per slot"}'),
  ('fac-bad-out-2', 'Campus Outdoor Badminton Court 2', 'Badminton', 'Main Sports Ground', 4, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800', 'Outdoor asphalt badminton court. Open air.', false, 'Active', '{"Outdoor sports shoes mandatory","Maximum 4 players per slot"}'),
  ('fac-bad-out-3', 'Campus Outdoor Badminton Court 3', 'Badminton', 'Main Sports Ground', 4, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800', 'Outdoor asphalt badminton court. Open air.', false, 'Active', '{"Outdoor sports shoes mandatory","Maximum 4 players per slot"}'),
  ('fac-bad-out-4', 'Campus Outdoor Badminton Court 4', 'Badminton', 'Main Sports Ground', 4, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800', 'Outdoor asphalt badminton court. Open air.', false, 'Active', '{"Outdoor sports shoes mandatory","Maximum 4 players per slot"}'),
  ('fac-cri-oval', 'Main Cricket Oval', 'Cricket', 'Main Sports Field', 22, '/cricket.png', 'Full size turf cricket ground for matches.', false, 'Active', '{"Safety gear mandatory","Prior booking approval required for external matches"}'),
  ('fac-cri-net-1', 'Cricket Practice Net 1', 'Cricket', 'Main Sports Field Area', 6, '/cricket.png', 'Practice net with concrete pitch and bowling crease.', false, 'Active', '{"Maximum 6 players per net","Safety gear mandatory"}'),
  ('fac-cri-net-2', 'Cricket Practice Net 2', 'Cricket', 'Main Sports Field Area', 6, '/cricket.png', 'Practice net with concrete pitch and bowling crease.', false, 'Active', '{"Maximum 6 players per net","Safety gear mandatory"}'),
  ('fac-cri-net-3', 'Cricket Practice Net 3', 'Cricket', 'Main Sports Field Area', 6, '/cricket.png', 'Practice net with concrete pitch and bowling crease.', false, 'Active', '{"Maximum 6 players per net","Safety gear mandatory"}'),
  ('fac-bas-1', 'Basketball Court 1 (Beside Anna Auditorium)', 'Basketball', 'Beside Anna Auditorium', 10, 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=800', 'Outdoor concrete basketball court equipped with floodlights.', false, 'Active', '{"Maximum 10 players","Clean footwear required"}'),
  ('fac-bas-2', 'Basketball Court 2 (Beside Anna Auditorium)', 'Basketball', 'Beside Anna Auditorium', 10, 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=800', 'Outdoor concrete basketball court equipped with floodlights.', false, 'Active', '{"Maximum 10 players","Clean footwear required"}'),
  ('fac-football', 'Full-Size Football Field', 'Football', 'Main Sports Field', 22, 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800', 'Full size turf football field for standard matches.', false, 'Active', '{"Proper sports cleats mandatory","Maximum 22 players"}'),
  ('fac-ten-1', 'Tennis Court 1 (Floodlights)', 'Tennis', 'Main Sports Field', 4, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800', 'Clay tennis court equipped with floodlights.', false, 'Active', '{"Proper tennis attire mandatory","Maximum 4 players"}'),
  ('fac-ten-2', 'Tennis Court 2 (Floodlights)', 'Tennis', 'Main Sports Field', 4, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800', 'Clay tennis court equipped with floodlights.', false, 'Active', '{"Proper tennis attire mandatory","Maximum 4 players"}'),
  ('fac-vol-1', 'Volleyball Court 1 (Beside Anna Auditorium)', 'Volley Ball', 'Beside Anna Auditorium', 12, 'https://images.unsplash.com/photo-1592656094270-b9bd29d79998?q=80&w=800', 'Outdoor volleyball court equipped with floodlights.', false, 'Active', '{"Maximum 12 players","Volleyball rules apply"}'),
  ('fac-vol-2', 'Volleyball Court 2 (Beside Anna Auditorium)', 'Volley Ball', 'Beside Anna Auditorium', 12, 'https://images.unsplash.com/photo-1592656094270-b9bd29d79998?q=80&w=800', 'Outdoor volleyball court equipped with floodlights.', false, 'Active', '{"Maximum 12 players","Volleyball rules apply"}'),
  ('fac-tt-1', 'Recreational Zone TT Table 1', 'Table Tennis', 'Indoor Recreation Zone', 4, 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?q=80&w=800', 'Standard Table Tennis table inside student recreation area.', true, 'Active', '{"Maximum 4 players","Paddles and ball available at counter"}'),
  ('fac-tt-2', 'Recreational Zone TT Table 2', 'Table Tennis', 'Indoor Recreation Zone', 4, 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?q=80&w=800', 'Standard Table Tennis table inside student recreation area.', true, 'Active', '{"Maximum 4 players","Paddles and ball available at counter"}'),
  ('fac-tt-3', 'Recreational Zone TT Table 3', 'Table Tennis', 'Indoor Recreation Zone', 4, 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?q=80&w=800', 'Standard Table Tennis table inside student recreation area.', true, 'Active', '{"Maximum 4 players","Paddles and ball available at counter"}'),
  ('fac-tt-4', 'Recreational Zone TT Table 4', 'Table Tennis', 'Indoor Recreation Zone', 4, 'https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?q=80&w=800', 'Standard Table Tennis table inside student recreation area.', true, 'Active', '{"Maximum 4 players","Paddles and ball available at counter"}'),
  ('fac-shuttle-1', 'Campus Shuttlecock Court 1', 'Shuttlecock', 'Main Sports Ground', 4, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800', 'Outdoor shuttlecock court for student use.', false, 'Active', '{"Maximum 4 players"}'),
  ('fac-shuttle-2', 'Campus Shuttlecock Court 2', 'Shuttlecock', 'Main Sports Ground', 4, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800', 'Outdoor shuttlecock court for student use.', false, 'Active', '{"Maximum 4 players"}'),
  ('fac-hand-1', 'Outdoor Handball Court 1', 'Handball', 'Main Sports Ground', 14, '/handball.png', 'Standard outdoor handball court with goals.', false, 'Active', '{"Maximum 14 players","Sports attire mandatory"}'),
  ('fac-hand-2', 'Outdoor Handball Court 2', 'Handball', 'Main Sports Ground', 14, '/handball.png', 'Standard outdoor handball court with goals.', false, 'Active', '{"Maximum 14 players","Sports attire mandatory"}'),
  ('fac-chess-1', 'Recreational Zone Chess Board 1', 'Chess', 'Indoor Recreation Zone', 2, 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=800', 'Chess table set up in recreation room.', true, 'Active', '{"Maximum 2 players","Maintain silence"}'),
  ('fac-chess-2', 'Recreational Zone Chess Board 2', 'Chess', 'Indoor Recreation Zone', 2, 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=800', 'Chess table set up in recreation room.', true, 'Active', '{"Maximum 2 players","Maintain silence"}'),
  ('fac-chess-3', 'Recreational Zone Chess Board 3', 'Chess', 'Indoor Recreation Zone', 2, 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=800', 'Chess table set up in recreation room.', true, 'Active', '{"Maximum 2 players","Maintain silence"}'),
  ('fac-chess-4', 'Recreational Zone Chess Board 4', 'Chess', 'Indoor Recreation Zone', 2, 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=800', 'Chess table set up in recreation room.', true, 'Active', '{"Maximum 2 players","Maintain silence"}'),
  ('fac-carrom-1', 'Recreational Zone Carrom Board 1', 'Carrom', 'Indoor Recreation Zone', 4, '/carrom.png', 'Standard carrom board with accessories.', true, 'Active', '{"Maximum 4 players","Do not waste carrom powder"}'),
  ('fac-carrom-2', 'Recreational Zone Carrom Board 2', 'Carrom', 'Indoor Recreation Zone', 4, '/carrom.png', 'Standard carrom board with accessories.', true, 'Active', '{"Maximum 4 players","Do not waste carrom powder"}'),
  ('fac-carrom-3', 'Recreational Zone Carrom Board 3', 'Carrom', 'Indoor Recreation Zone', 4, '/carrom.png', 'Standard carrom board with accessories.', true, 'Active', '{"Maximum 4 players","Do not waste carrom powder"}'),
  ('fac-carrom-4', 'Recreational Zone Carrom Board 4', 'Carrom', 'Indoor Recreation Zone', 4, '/carrom.png', 'Standard carrom board with accessories.', true, 'Active', '{"Maximum 4 players","Do not waste carrom powder"}'),
  ('fac-throw-1', 'Outdoor Throwball Court 1', 'Throw Ball', 'Main Sports Ground', 14, '/throwball.png', 'Outdoor throwball court for student matches.', false, 'Active', '{"Maximum 14 players"}')
on conflict (id) do update set image_url = excluded.image_url;

-- Insert Initial Admin Config
insert into public.admin_config (key, value)
values
  ('maxBookingsPerUserPerDay', '2'),
  ('advanceBookingWindowDays', '3'),
  ('weatherThresholdAlert', 'Rainy')
on conflict (key) do update set value = excluded.value;

-- 8. ANNOUNCEMENTS TABLE
create table if not exists public.announcements (
    id text primary key,
    message text not null,
    created_by text not null,
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and add basic select/insert/update/delete policies for announcements
alter table public.announcements enable row level security;
drop policy if exists "Allow public access to announcements" on public.announcements;
drop policy if exists "Allow public access to announcements" on announcements;
create policy "Allow public access to announcements" on public.announcements for all using (true) with check (true);
