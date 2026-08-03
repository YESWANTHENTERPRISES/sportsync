import React, { useState } from 'react';
import { 
  Trophy, 
  Plus, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  ChevronRight, 
  AlertCircle, 
  Flame, 
  Check, 
  Edit3, 
  User, 
  CheckCircle2, 
  BookOpen, 
  Bot, 
  Compass, 
  Activity, 
  ListOrdered 
} from 'lucide-react';
import { UserProfile, Tournament, TournamentMatch, RoundRobinPoints } from '../utils/mockDb';
import { MockDatabase } from '../utils/mockDb';

interface TournamentViewProps {
  currentUser: UserProfile;
  tournaments: Tournament[];
  onRegisterTeam: (tournamentId: string, teamName: string) => Promise<void>;
  onUpdateMatchScore: (tournamentId: string, matchId: string, score1: number, score2: number, summary: string) => Promise<void>;
  onCreateTournament: (tournament: any) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const TournamentView: React.FC<TournamentViewProps> = ({
  currentUser,
  tournaments,
  onRegisterTeam,
  onUpdateMatchScore,
  onCreateTournament,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'my' | 'bracket' | 'leaderboard'>('browse');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('trn-1');
  
  // Filter states
  const [sportFilter, setSportFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTrnName, setNewTrnName] = useState('');
  const [newTrnSport, setNewTrnSport] = useState('Badminton');
  const [newTrnFormat, setNewTrnFormat] = useState<'Knockout' | 'Round Robin' | 'League'>('Knockout');
  const [newTrnType, setNewTrnType] = useState<'Team' | 'Individual'>('Team');
  const [newTrnMaxParticipants, setNewTrnMaxParticipants] = useState(8);
  const [newTrnDeadline, setNewTrnDeadline] = useState('');
  const [newTrnSchedule, setNewTrnSchedule] = useState<'Auto-generate' | 'Manual'>('Auto-generate');
  const [newTrnVenue, setNewTrnVenue] = useState('');
  const [newTrnPrize, setNewTrnPrize] = useState('');

  // Register Modal State
  const [showRegisterModal, setShowRegisterModal] = useState<string | null>(null);
  const [registerTeamName, setRegisterTeamName] = useState('');

  // Enter Score Modal State
  const [showScoreModal, setShowScoreModal] = useState<{ trnId: string; match: TournamentMatch } | null>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [aiSummary, setAiSummary] = useState('');

  const isAdmin = currentUser.role === 'Admin';
  const selectedTournament = tournaments.find(t => t.id === selectedTournamentId) || tournaments[0];

  // Filters logic
  const filteredTournaments = tournaments.filter(t => {
    if (sportFilter && t.sport !== sportFilter) return false;
    if (formatFilter && t.format !== formatFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  // My registered tournaments
  // We assume user's team name is "Team Alpha" in Badminton or CSE Strikers in Cricket
  const userTeams = ['Team Alpha', 'CSE Strikers'];
  const myTournaments = tournaments.filter(t => 
    t.registeredTeams.some(teamName => userTeams.includes(teamName)) ||
    t.createdBy === currentUser.name
  );

  const myUpcoming = myTournaments.filter(t => t.status === 'Open');
  const myOngoing = myTournaments.filter(t => t.status === 'Ongoing');
  const myCompleted = myTournaments.filter(t => t.status === 'Completed');

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrnName.trim()) {
      showToast('Please enter tournament name.', 'error');
      return;
    }
    if (!newTrnDeadline) {
      showToast('Please select registration deadline.', 'error');
      return;
    }
    if (!newTrnVenue.trim()) {
      showToast('Please enter venue.', 'error');
      return;
    }

    try {
      await onCreateTournament({
        name: newTrnName.trim(),
        sport: newTrnSport,
        format: newTrnFormat,
        type: newTrnType,
        maxParticipants: Number(newTrnMaxParticipants),
        registrationDeadline: newTrnDeadline,
        scheduleType: newTrnSchedule,
        venue: newTrnVenue.trim(),
        prize: newTrnPrize.trim(),
        createdBy: currentUser.name
      });
      setShowCreateModal(false);
      // Clear inputs
      setNewTrnName('');
      setNewTrnVenue('');
      setNewTrnPrize('');
    } catch (e) {}
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRegisterModal) return;
    if (!registerTeamName.trim()) {
      showToast('Please enter a team/player name.', 'error');
      return;
    }

    try {
      await onRegisterTeam(showRegisterModal, registerTeamName.trim());
      setShowRegisterModal(null);
      setRegisterTeamName('');
    } catch (e) {}
  };

  // Generate dynamic AI Summary on score inputs
  const handleScoreChange = (val1: number, val2: number, t1: string, t2: string) => {
    setScore1(val1);
    setScore2(val2);
    if (val1 > val2) {
      setAiSummary(`${t1} edged past ${t2} in a nail-biting final set, ${val1}-${val2}.`);
    } else if (val2 > val1) {
      setAiSummary(`${t2} edged past ${t1} in a nail-biting final set, ${val2}-${val1}.`);
    } else {
      setAiSummary(`${t1} and ${t2} battled to a hard-fought draw, ${val1}-${val2}.`);
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showScoreModal) return;

    try {
      await onUpdateMatchScore(
        showScoreModal.trnId,
        showScoreModal.match.id,
        score1,
        score2,
        aiSummary
      );
      setShowScoreModal(null);
    } catch (e) {}
  };

  const renderMatchCard = (match: TournamentMatch, roundName: string) => {
    const isCompleted = match.status === 'Completed';
    const involvesUser = userTeams.includes(match.team1) || userTeams.includes(match.team2);
    
    const isTeam1Winner = isCompleted && match.winner === match.team1;
    const isTeam2Winner = isCompleted && match.winner === match.team2;
    const isTeam1Loser = isCompleted && match.winner === match.team2;
    const isTeam2Loser = isCompleted && match.winner === match.team1;

    const cardBorderClass = involvesUser 
      ? 'border-emerald-300 ring-2 ring-emerald-500/10 bg-emerald-50/10' 
      : 'border-slate-200 bg-white';

    const hoverClass = (isAdmin || selectedTournament.createdBy === currentUser.name)
      ? 'cursor-pointer hover:border-blue-400 hover:shadow-lg hover:scale-[1.02]'
      : '';

    return (
      <div 
        key={match.id}
        onClick={() => (isAdmin || selectedTournament.createdBy === currentUser.name) && setShowScoreModal({ trnId: selectedTournament.id, match })}
        className={`border rounded-2xl p-4 text-xs space-y-3 shadow-sm transition-all duration-300 relative ${cardBorderClass} ${hoverClass}`}
      >
        {/* Left Accent Bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
          isCompleted ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'
        }`} />

        <div className="flex justify-between items-center border-b border-slate-100 pb-2 pl-1 font-mono text-[9px] text-slate-500">
          <span className="font-bold tracking-wider">{roundName.toUpperCase()} - MATCH {match.id.split('-').pop()?.toUpperCase()}</span>
          {isCompleted ? (
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] border border-emerald-100">Done</span>
          ) : (
            <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] border border-blue-100">Scheduled</span>
          )}
        </div>
        
        <div className="space-y-2.5 pl-1">
          {/* Team 1 Row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 min-w-0">
              {isTeam1Winner && <span className="text-xs text-amber-500">🏆</span>}
              <span className={`truncate text-sm font-semibold ${
                isTeam1Winner ? 'text-blue-900 font-black' : 
                isTeam1Loser ? 'text-slate-400 line-through font-normal' : 
                'text-slate-700'
              }`}>
                {match.team1 || 'TBD'}
              </span>
            </div>
            <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
              isTeam1Winner ? 'text-emerald-700 bg-emerald-50' : 
              isTeam1Loser ? 'text-slate-400 bg-slate-50' : 
              'text-slate-650 bg-slate-50'
            }`}>
              {match.score1 !== undefined ? match.score1 : '-'}
            </span>
          </div>

          {/* Team 2 Row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 min-w-0">
              {isTeam2Winner && <span className="text-xs text-amber-500">🏆</span>}
              <span className={`truncate text-sm font-semibold ${
                isTeam2Winner ? 'text-blue-900 font-black' : 
                isTeam2Loser ? 'text-slate-400 line-through font-normal' : 
                'text-slate-700'
              }`}>
                {match.team2 || 'TBD'}
              </span>
            </div>
            <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
              isTeam2Winner ? 'text-emerald-700 bg-emerald-50' : 
              isTeam2Loser ? 'text-slate-400 bg-slate-50' : 
              'text-slate-650 bg-slate-50'
            }`}>
              {match.score2 !== undefined ? match.score2 : '-'}
            </span>
          </div>
        </div>

        {/* AI match summary card badge */}
        {match.aiSummary && (
          <div className="text-[9.5px] p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 leading-normal flex items-start gap-1.5 shadow-sm">
            <Bot className="w-4 h-4 shrink-0 text-indigo-600" />
            <p className="line-clamp-3 italic">"{match.aiSummary}"</p>
          </div>
        )}
      </div>
    );
  };
  // Seed Leaderboard (Page 17 specification)
  const leaderboardSeed = [
    { rank: 1, name: 'Abhishek Nair', won: 14, rate: '92.4%', sport: 'Badminton' },
    { rank: 2, name: 'Pooja Krishnan', won: 11, rate: '86.1%', sport: 'Basketball' },
    { rank: 3, name: 'Vikram Singh', won: 9, rate: '78.5%', sport: 'Cricket' },
    { rank: 4, name: 'Rahul Kumar', won: 7, rate: '74.2%', sport: 'Football' },
    { rank: 5, name: 'Sneha Paul', won: 6, rate: '68.0%', sport: 'Tennis' }
  ];

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-10rem)]">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 font-bold text-[10px] uppercase font-mono tracking-wider">
            🏆 Tournament Arena
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight font-heading">
            Compete. Advance. Dominate.
          </h1>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Join or create tournaments across all sports. Register your teams, view dynamic brackets, and climb the leaderboard rankings.
          </p>
        </div>
        <Trophy className="w-24 h-24 text-indigo-500/20 absolute -right-4 -bottom-4 sm:relative sm:right-0 sm:bottom-0 shrink-0 select-none animate-pulse" />
      </div>

      {/* Notifications Bar: User match scheduled alert */}
      <div className="bg-emerald-500/10 border border-emerald-500/35 rounded-2xl p-4 flex items-start gap-3.5 animate-slide-up">
        <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider">Next Match Day Alert</span>
          <p className="text-xs text-slate-200 leading-relaxed font-semibold">
            Your QF match vs <span className="text-white font-bold text-sm">Team Nova</span> is scheduled for <span className="text-white font-bold">Aug 6, 4PM</span> at <span className="text-white font-bold">Court 2</span>.
          </p>
        </div>
      </div>

      {/* Sub Tabs Controls */}
      <div className="flex border-b border-slate-800">
        {[
          { id: 'browse', label: 'Browse Tournaments', icon: Compass },
          ...(isAdmin ? [
            { id: 'my', label: 'My Tournaments', icon: Activity },
            { id: 'bracket', label: 'Bracket / Points Table', icon: BookOpen }
          ] : []),
          { id: 'leaderboard', label: 'Leaderboard', icon: ListOrdered }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-blue-500 text-blue-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* View router switcher */}
      <div className="pt-2">

        {/* 1. Browse Tournaments tab */}
        {activeSubTab === 'browse' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-900/30 border border-slate-850 p-4 rounded-2xl text-xs text-slate-350">
              <span className="font-bold font-mono text-slate-500 flex items-center gap-1.5 uppercase mr-2">
                <Filter className="w-3.5 h-3.5" />
                Filters:
              </span>
              
              {/* Sport Selector */}
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none"
              >
                <option value="">All Sports</option>
                <option value="Badminton">Badminton</option>
                <option value="Cricket">Cricket</option>
                <option value="Basketball">Basketball</option>
                <option value="Football">Football</option>
              </select>

              {/* Format Selector */}
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none"
              >
                <option value="">All Formats</option>
                <option value="Knockout">Knockout</option>
                <option value="Round Robin">Round Robin</option>
                <option value="League">League</option>
              </select>

              {/* Status Selector */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Tournaments Grid list */}
            {filteredTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTournaments.map(trn => {
                  const isRegistered = trn.registeredTeams.some(team => userTeams.includes(team));
                  const isFull = trn.registeredTeams.length >= trn.maxParticipants;
                  const isClosed = trn.status !== 'Open';

                  return (
                    <div 
                      key={trn.id}
                      className="bg-slate-900/40 border border-slate-800 hover:border-slate-750 rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:shadow-xl transition"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold font-mono uppercase">
                            {trn.sport}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono uppercase ${
                            trn.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                            trn.status === 'Ongoing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                            'bg-slate-800 text-slate-450 border border-slate-700/60'
                          }`}>
                            {trn.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-white tracking-wide">{trn.name}</h3>
                          <p className="text-[10px] font-mono text-slate-500">
                            FORMAT: <span className="text-slate-350 font-bold">{trn.format} ({trn.type})</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400 pt-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{trn.venue}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>Reg Deadline: {trn.registrationDeadline}</span>
                          </div>
                        </div>

                        {/* Prize */}
                        {trn.prize && (
                          <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl flex items-center gap-2.5 text-[11px]">
                            <Trophy className="w-4 h-4 text-indigo-400 shrink-0" />
                            <div>
                              <span className="text-slate-500 font-mono text-[9px] block">PRIZE & BONUS</span>
                              <span className="font-bold text-slate-200 mt-0.5 block">{trn.prize}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* slots bar & Action */}
                      <div className="space-y-3 border-t border-slate-850 pt-4 mt-2">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-450 font-mono">
                          <span>REGISTRATION PROGRESS</span>
                          <span>{trn.registeredTeams.length} / {trn.maxParticipants} TEAMS</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${(trn.registeredTeams.length / trn.maxParticipants) * 100}%` }}
                          />
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          {isAdmin ? (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedTournamentId(trn.id);
                                  setActiveSubTab('bracket');
                                }}
                                className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl transition border border-slate-750 cursor-pointer text-center"
                              >
                                View Bracket
                              </button>

                              {isRegistered ? (
                                <div className="flex-1 py-2 bg-emerald-600/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  Registered
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowRegisterModal(trn.id)}
                                  disabled={isClosed || isFull}
                                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 disabled:opacity-50 ${
                                    isClosed || isFull
                                      ? 'bg-slate-850 text-slate-500 border border-slate-800/80'
                                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/5 border border-blue-500/30'
                                  }`}
                                >
                                  {isFull ? 'Reg Full' : isClosed ? 'Reg Closed' : 'Register Now'}
                                </button>
                              )}
                            </>
                          ) : (
                            isRegistered ? (
                              <div className="w-full py-2.5 bg-emerald-600/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                Registered
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowRegisterModal(trn.id)}
                                disabled={isClosed || isFull}
                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 disabled:opacity-50 ${
                                  isClosed || isFull
                                    ? 'bg-slate-850 text-slate-500 border border-slate-800/80'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/5 border border-blue-500/30'
                                }`}
                              >
                                {isFull ? 'Registration Full' : isClosed ? 'Registration Closed' : 'Register for Tournament'}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-slate-850 rounded-2xl py-12 text-center text-slate-500 text-xs">
                No active tournaments match filters.
              </div>
            )}
          </div>
        )}

        {/* 2. My Tournaments tab */}
        {activeSubTab === 'my' && (
          <div className="space-y-6">
            
            {/* Split categories */}
            <div className="space-y-6">
              
              {/* Ongoing matches */}
              <div>
                <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider mb-3">Ongoing Tournaments</h3>
                {myOngoing.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myOngoing.map(trn => (
                      <div key={trn.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-white">{trn.name}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono font-semibold">Ongoing</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl space-y-2 text-xs">
                          <span className="text-slate-500 block text-[9px] font-mono font-bold">NEXT MATCH SCHEDULE</span>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-200">Team Alpha vs Team Nova</span>
                            <span className="font-mono text-[10px] text-blue-400 font-bold">Aug 6 @ 4:00 PM</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block"><span className="font-bold">Venue:</span> Court 2</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTournamentId(trn.id);
                            setActiveSubTab('bracket');
                          }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 font-bold border border-slate-750 rounded-xl transition cursor-pointer"
                        >
                          Check Bracket Position
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic p-3 border border-dashed border-slate-850 rounded-xl">No active ongoing tournaments.</p>
                )}
              </div>

              {/* Upcoming */}
              <div>
                <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider mb-3">Upcoming Tournaments</h3>
                {myUpcoming.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myUpcoming.map(trn => (
                      <div key={trn.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="text-xs font-bold text-white">{trn.name}</h4>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Registrations: {trn.registeredTeams.length}/{trn.maxParticipants} teams</span>
                          <span className="text-emerald-400 font-semibold font-mono">Open</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTournamentId(trn.id);
                            setActiveSubTab('bracket');
                          }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 font-bold border border-slate-750 rounded-xl transition cursor-pointer"
                        >
                          View Teams List
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic p-3 border border-dashed border-slate-850 rounded-xl">No registered upcoming tournaments.</p>
                )}
              </div>

              {/* Completed */}
              <div>
                <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider mb-3">Completed Tournaments</h3>
                {myCompleted.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myCompleted.map(trn => (
                      <div key={trn.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="text-xs font-bold text-white">{trn.name}</h4>
                        <p className="text-xs text-slate-400">Winner: <span className="text-amber-400 font-bold">Team Alpha 🏆</span></p>
                        <button
                          onClick={() => {
                            setSelectedTournamentId(trn.id);
                            setActiveSubTab('bracket');
                          }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-xs text-slate-300 font-bold border border-slate-750 rounded-xl transition cursor-pointer"
                        >
                          Show Full Results history
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic p-3 border border-dashed border-slate-850 rounded-xl">No completed tournaments records found.</p>
                )}
              </div>

            </div>

          </div>
        )}

        {/* 3. Bracket / Points Table tab */}
        {activeSubTab === 'bracket' && (
          <div className="space-y-6">
            
            {/* Header select */}
            <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-850 p-4 rounded-2xl">
              <label className="text-xs font-bold text-slate-300 font-mono uppercase shrink-0">Tournament:</label>
              <select
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none w-full sm:w-64"
              >
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.format})</option>
                ))}
              </select>
            </div>

            {/* Display points table if Round-Robin */}
            {selectedTournament.format === 'Round Robin' || selectedTournament.format === 'League' ? (
              <div className="bg-[#0A0F1E] border border-slate-800 rounded-3xl overflow-hidden shadow-lg space-y-4 p-5 md:p-6">
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">{selectedTournament.name} Standings</h3>
                  <p className="text-xs text-slate-400">Round Robin points matrix. Top teams advance to next season.</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase font-mono font-bold text-slate-500">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Team</th>
                        <th className="py-3 px-4">Played</th>
                        <th className="py-3 px-4">Won</th>
                        <th className="py-3 px-4">Lost</th>
                        <th className="py-3 px-4">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {selectedTournament.pointsTable?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-450">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-bold text-white">{row.team}</td>
                          <td className="py-3.5 px-4 font-mono">{row.played}</td>
                          <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{row.won}</td>
                          <td className="py-3.5 px-4 font-mono text-rose-400 font-bold">{row.lost}</td>
                          <td className="py-3.5 px-4 font-mono text-blue-400 font-black">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Display Tree Bracket if Knockout */
              <div className="bg-[#0A0F1E] border border-slate-800 rounded-3xl p-6 overflow-x-auto shadow-lg space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white font-heading">{selectedTournament.name} Bracket</h3>
                  <p className="text-xs text-slate-400">Full visual tree bracket layout. Left-to-right progression. Click on match card to input score (organizers only).</p>
                </div>

                {/* Tree progression display columns */}
                <div className="flex items-start gap-12 min-w-[720px] py-4 relative">
                  
                  {/* Round 1: QFs */}
                  <div className="flex-1 flex flex-col justify-around h-[380px]">
                    <div className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider mb-2 text-center">Quarterfinals</div>
                    {selectedTournament.matches.filter(m => m.round === 1).map(match => renderMatchCard(match, 'QF'))}
                  </div>

                  {/* Round 2: SFs */}
                  <div className="flex-1 flex flex-col justify-around h-[380px]">
                    <div className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider mb-2 text-center">Semifinals</div>
                    {selectedTournament.matches.filter(m => m.round === 2).map(match => renderMatchCard(match, 'SF'))}
                  </div>

                  {/* Round 3: Finals */}
                  <div className="flex-1 flex flex-col justify-around h-[380px]">
                    <div className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider mb-2 text-center">Finals</div>
                    {selectedTournament.matches.filter(m => m.round === 3 || m.id.includes('final')).map(match => renderMatchCard(match, 'Championship'))}
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* 4. Leaderboard tab */}
        {activeSubTab === 'leaderboard' && (
          <div className="bg-[#0A0F1E] border border-slate-800 rounded-3xl overflow-hidden shadow-lg p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-white font-heading">Tournament All-Time Standings</h3>
                <p className="text-xs text-slate-400">All-time winners, record stats, and championship win rates.</p>
              </div>
              
              {/* Leaderboard filter */}
              <select
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-350 outline-none w-full sm:w-44"
              >
                <option value="">All Sports</option>
                <option value="Badminton">Badminton</option>
                <option value="Cricket">Cricket</option>
                <option value="Basketball">Basketball</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-mono font-bold text-slate-500">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Player Name</th>
                    <th className="py-3 px-4">Tournaments Won</th>
                    <th className="py-3 px-4">Win Rate</th>
                    <th className="py-3 px-4">Preferred Sport</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {leaderboardSeed.map((row, idx) => {
                    const isTop3 = row.rank <= 3;
                    const rankColor = 
                      row.rank === 1 ? 'text-amber-400 font-bold bg-amber-400/10 border border-amber-500/20' :
                      row.rank === 2 ? 'text-slate-350 font-bold bg-slate-350/10 border border-slate-400/20' :
                      row.rank === 3 ? 'text-amber-600 font-bold bg-amber-600/10 border border-amber-700/20' :
                      'text-slate-400 font-mono';

                    return (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-3.5 px-4">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${rankColor}`}>
                            {row.rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-1.5">
                          {row.name}
                          {row.rank === 1 && <span className="text-[10px] text-amber-400">👑</span>}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">{row.won}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{row.rate}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-semibold">
                            {row.sport}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Floating Action Button for Create Tournament */}
      {isAdmin && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] border border-blue-500/30 transition hover:scale-105 active:scale-95 cursor-pointer z-40"
          title="Create Tournament"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* CREATE TOURNAMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-heading">
                <Trophy className="w-4 h-4 text-amber-400" />
                Initialize Tournament
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-450 hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-350 font-mono">Tournament Name</label>
                <input
                  type="text"
                  required
                  value={newTrnName}
                  onChange={(e) => setNewTrnName(e.target.value)}
                  placeholder="e.g. Annual Badminton Cup, Winter Cricket League..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-350 font-mono">Sport Category</label>
                  <select
                    value={newTrnSport}
                    onChange={(e) => setNewTrnSport(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                  >
                    <option value="Badminton">Badminton</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Football">Football</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-350 font-mono">Type</label>
                  <select
                    value={newTrnType}
                    onChange={(e) => setNewTrnType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                  >
                    <option value="Team">Team Game</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
              </div>

              {/* Format Select pills */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-350 font-mono block">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Knockout', 'Round Robin', 'League'].map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setNewTrnFormat(fmt as any)}
                      className={`py-2 rounded-xl text-center border font-semibold transition cursor-pointer ${
                        newTrnFormat === fmt
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-350 font-mono">Max Participants</label>
                  <select
                    value={newTrnMaxParticipants}
                    onChange={(e) => setNewTrnMaxParticipants(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                  >
                    <option value={8}>8 Teams / Players</option>
                    <option value={16}>16 Teams / Players</option>
                    <option value={32}>32 Teams / Players</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-350 font-mono">Reg. Deadline</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={newTrnDeadline}
                    onChange={(e) => setNewTrnDeadline(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-350 font-mono">Scheduling</label>
                  <select
                    value={newTrnSchedule}
                    onChange={(e) => setNewTrnSchedule(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                  >
                    <option value="Auto-generate">Auto-Generate</option>
                    <option value="Manual">Manual Entry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-350 font-mono">Venue</label>
                  <input
                    type="text"
                    required
                    value={newTrnVenue}
                    onChange={(e) => setNewTrnVenue(e.target.value)}
                    placeholder="e.g. Court 2, Main Oval"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-350 font-mono">Prize/Description</label>
                <input
                  type="text"
                  value={newTrnPrize}
                  onChange={(e) => setNewTrnPrize(e.target.value)}
                  placeholder="e.g. ₹5,000 Cash Prize, Trophy & Medals..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition cursor-pointer active:scale-[0.98] shadow-lg shadow-blue-600/10 border border-blue-500/30"
              >
                Launch Tournament 🏆
              </button>

            </form>
          </div>
        </div>
      )}

      {/* REGISTER FOR TOURNAMENT MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">Tournament Entry Registration</h3>
              <button onClick={() => setShowRegisterModal(null)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>
            
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 font-mono">Team or Player Display Name</label>
                <input
                  type="text"
                  required
                  value={registerTeamName}
                  onChange={(e) => setRegisterTeamName(e.target.value)}
                  placeholder="e.g. Team Nova, CSE Strikers..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-[10px] text-slate-450 leading-relaxed font-mono">
                ⚠️ Reaching the participant quota auto-starts brackets and schedules match timings. No edits can be made post start.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition cursor-pointer active:scale-95 border border-blue-500/30"
              >
                Confirm Registration Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MATCH RESULT ENTRY PANEL MODAL (Page 17 specific) */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Submit Match result</h3>
              <button onClick={() => setShowScoreModal(null)} className="text-slate-450 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleScoreSubmit} className="space-y-4 text-xs">
              
              <div className="flex items-center justify-between gap-4 text-center">
                
                {/* Team 1 Score */}
                <div className="flex-1 space-y-2">
                  <span className="font-bold text-slate-200 block truncate">{showScoreModal.match.team1}</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={score1}
                    onChange={(e) => handleScoreChange(Number(e.target.value), score2, showScoreModal.match.team1, showScoreModal.match.team2)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 text-center text-lg font-bold text-white outline-none focus:border-blue-500"
                  />
                </div>

                <span className="font-mono text-slate-500 font-bold shrink-0 mt-6">VS</span>

                {/* Team 2 Score */}
                <div className="flex-1 space-y-2">
                  <span className="font-bold text-slate-200 block truncate">{showScoreModal.match.team2}</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={score2}
                    onChange={(e) => handleScoreChange(score1, Number(e.target.value), showScoreModal.match.team1, showScoreModal.match.team2)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 text-center text-lg font-bold text-white outline-none focus:border-blue-500"
                  />
                </div>

              </div>

              {/* Dynamic AI summary card display */}
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[10px] font-mono uppercase">
                  <Bot className="w-3.5 h-3.5" />
                  AI Summary Preview
                </div>
                <textarea
                  value={aiSummary}
                  onChange={(e) => setAiSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-[11px] text-slate-300 outline-none leading-relaxed resize-none"
                  rows={2}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition cursor-pointer active:scale-95 border border-blue-500/30"
              >
                Apply Match Results & Update Brackets
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
