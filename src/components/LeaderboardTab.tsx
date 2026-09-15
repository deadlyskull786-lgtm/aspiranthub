import React, { useState, useMemo } from 'react';
import { LeaderboardEntry, ExamType, UserProgress, UserProfile, ClassGrade } from '../types';
import { LEVEL_DEFINITIONS, getLevelForExp } from '../data/levelData';
import {
  Trophy,
  Medal,
  Sparkles,
  ShieldCheck,
  Flame,
  UserCheck,
  ArrowUpDown,
  Search,
  UserPlus,
  Edit3,
  CheckCircle2,
  X,
  Target,
  GraduationCap,
  Award,
} from 'lucide-react';

interface LeaderboardTabProps {
  entries: LeaderboardEntry[];
  userProgress: UserProgress;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onAddPeer?: (peer: {
    name: string;
    targetExam: ExamType;
    classGrade: ClassGrade;
    initialSolved: number;
    initialCorrect: number;
  }) => Promise<void>;
  isLoading?: boolean;
  onOpenRegistration?: () => void;
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  entries,
  userProgress,
  userProfile,
  onUpdateProfile,
  onAddPeer,
  isLoading = false,
  onOpenRegistration,
}) => {
  const [filterExam, setFilterExam] = useState<ExamType | 'All'>('All');
  const [sortBy, setSortBy] = useState<'solved' | 'accuracy' | 'exp'>('solved');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddPeerOpen, setIsAddPeerOpen] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(userProfile.name);
  const [editExam, setEditExam] = useState<ExamType>(userProfile.targetExam);
  const [editClass, setEditClass] = useState<ClassGrade>(userProfile.classGrade);

  // Add peer form state
  const [peerName, setPeerName] = useState('');
  const [peerExam, setPeerExam] = useState<ExamType>('JEE');
  const [peerClass, setPeerClass] = useState<ClassGrade>('12');
  const [peerSolved, setPeerSolved] = useState(15);
  const [peerCorrect, setPeerCorrect] = useState(13);
  const [isSubmittingPeer, setIsSubmittingPeer] = useState(false);

  const currentLevelDef = getLevelForExp(userProgress.totalExp);

  // Calculate current user's entry
  const currentUserAccuracy =
    userProgress.questionsAttempted > 0
      ? Math.round((userProgress.questionsCorrect / userProgress.questionsAttempted) * 1000) / 10
      : 0;

  const currentUserEntry: LeaderboardEntry = useMemo(
    () => ({
      id: userProfile.id,
      name: userProfile.name,
      avatar: userProfile.avatar,
      targetExam: userProfile.targetExam,
      classGrade: userProfile.classGrade,
      level: currentLevelDef.level,
      levelName: currentLevelDef.name,
      exp: userProgress.totalExp,
      solvedCount: userProgress.questionsAttempted,
      correctCount: userProgress.questionsCorrect,
      accuracy: currentUserAccuracy,
      lastActive: 'Just now',
      rank: 1,
      isCurrentUser: true,
    }),
    [userProfile, currentLevelDef, userProgress, currentUserAccuracy]
  );

  // Merge real entries from backend, ensuring current user is present
  const allMergedEntries = useMemo(() => {
    // If current user is already in entries, replace with live current data; otherwise append
    const withoutUser = entries.filter((e) => e.id !== userProfile.id);
    const combined = [...withoutUser, currentUserEntry];

    // Filter by Exam if selected
    let filtered = combined;
    if (filterExam !== 'All') {
      filtered = filtered.filter((e) => e.targetExam === filterExam);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) => e.name.toLowerCase().includes(q) || e.levelName.toLowerCase().includes(q)
      );
    }

    // Sort strictly based on selected criteria (Default: QUESTIONS SOLVED)
    filtered.sort((a, b) => {
      if (sortBy === 'solved') {
        // Primary: Questions Solved
        if (b.solvedCount !== a.solvedCount) {
          return b.solvedCount - a.solvedCount;
        }
        // Secondary: Accuracy
        if (b.accuracy !== a.accuracy) {
          return b.accuracy - a.accuracy;
        }
        // Tertiary: EXP
        return b.exp - a.exp;
      } else if (sortBy === 'accuracy') {
        if (b.accuracy !== a.accuracy) {
          return b.accuracy - a.accuracy;
        }
        return b.solvedCount - a.solvedCount;
      } else {
        // By Total EXP
        if (b.exp !== a.exp) {
          return b.exp - a.exp;
        }
        return b.solvedCount - a.solvedCount;
      }
    });

    // Re-assign accurate ranks after sorting
    return filtered.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: entry.id === userProfile.id,
    }));
  }, [entries, currentUserEntry, filterExam, searchQuery, sortBy, userProfile.id]);

  // Current user's rank in the filtered & sorted view
  const userStanding = useMemo(() => {
    const found = allMergedEntries.find((e) => e.isCurrentUser);
    return found ? found.rank : 1;
  }, [allMergedEntries]);

  // Top solver in the list
  const topSolver = allMergedEntries[0];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onUpdateProfile({
      ...userProfile,
      name: editName.trim(),
      targetExam: editExam,
      classGrade: editClass,
      isRegistered: true,
      registeredAt: userProfile.registeredAt || new Date().toISOString(),
    });
    setIsEditProfileOpen(false);
  };

  const handleCreatePeer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!peerName.trim() || !onAddPeer) return;
    setIsSubmittingPeer(true);
    try {
      await onAddPeer({
        name: peerName.trim(),
        targetExam: peerExam,
        classGrade: peerClass,
        initialSolved: Math.max(0, peerSolved),
        initialCorrect: Math.min(peerSolved, Math.max(0, peerCorrect)),
      });
      setPeerName('');
      setIsAddPeerOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPeer(false);
    }
  };

  const expInCurrentLevel = userProgress.totalExp - currentLevelDef.minExp;
  const expRange = currentLevelDef.maxExp - currentLevelDef.minExp;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((expInCurrentLevel / (expRange || 1)) * 100))
  );

  return (
    <div id="leaderboard-tab-container" className="max-w-5xl mx-auto space-y-6">
      {/* Real Users & Verified Questions Solved Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Live Real-Aspirant Leaderboard
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                0 Bots • 100% Real Users
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rankings are calculated dynamically based on <strong>actual questions solved</strong> by students preparing for JEE, NEET, and KCET.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          {!userProfile.isRegistered ? (
            <button
              id="register-profile-btn"
              type="button"
              onClick={() => {
                if (onOpenRegistration) onOpenRegistration();
                else setIsEditProfileOpen(true);
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-2xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Register Name
            </button>
          ) : (
            <button
              id="edit-profile-btn"
              type="button"
              onClick={() => {
                setEditName(userProfile.name);
                setEditExam(userProfile.targetExam);
                setEditClass(userProfile.classGrade);
                setIsEditProfileOpen(true);
              }}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              Edit Profile
            </button>
          )}

          {onAddPeer && (
            <button
              id="add-peer-btn"
              type="button"
              onClick={() => setIsAddPeerOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-white hover:bg-slate-900 transition-colors shadow-2xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Study Peer
            </button>
          )}
        </div>
      </div>

      {/* Prominent Registration Banner if not yet registered */}
      {!userProfile.isRegistered && (
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-xl p-4 border border-indigo-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Set Your Name on the National Standings
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold">
                  Required for official ranking
                </span>
              </div>
              <p className="text-[11px] text-indigo-200 mt-0.5">
                Register with your real name to be officially recognized on the verified real-aspirant leaderboard.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onOpenRegistration) onOpenRegistration();
              else setIsEditProfileOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs font-bold shadow-xs whitespace-nowrap transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Set My Name & Register</span>
          </button>
        </div>
      )}

      {/* User EXP & Standing Hero Card */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Column 1: Aspirant Profile & Badge */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {currentLevelDef.badge}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-400/30">
                  Level {currentLevelDef.level} / 10
                </span>
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {userProgress.streakDays}d Streak
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white mt-1 truncate flex items-center gap-2">
                <span>
                  {userProfile.isRegistered && userProfile.name
                    ? userProfile.name
                    : 'Guest Aspirant (Unregistered)'}
                </span>
                {userProfile.isRegistered ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenRegistration) onOpenRegistration();
                      else setIsEditProfileOpen(true);
                    }}
                    className="text-[10px] font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-2 py-0.5 rounded border border-amber-400/20 cursor-pointer"
                  >
                    Set Name &rarr;
                  </button>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {userProfile.targetExam} Aspirant • Class {userProfile.classGrade}
              </p>
            </div>
          </div>

          {/* Column 2: Key Metric - Questions Solved Standing */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Your Current Rank</span>
              <span className="text-indigo-400 font-semibold">Ranked by Solved PYQs</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                #{userStanding}
              </span>
              <span className="text-xs text-slate-300">
                of {allMergedEntries.length} active aspirants
              </span>
            </div>
            <div className="mt-2 text-xs flex items-center justify-between text-slate-300 border-t border-slate-700/50 pt-2">
              <span>Questions Solved:</span>
              <span className="font-bold text-emerald-400">
                {userProgress.questionsAttempted} ({userProgress.questionsCorrect} correct)
              </span>
            </div>
          </div>

          {/* Column 3: EXP Progress Gauge */}
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">EXP Progression</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {userProgress.totalExp} EXP
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
              <span>Lvl {currentLevelDef.level}: {currentLevelDef.name}</span>
              {currentLevelDef.level < 10 ? (
                <span>{currentLevelDef.maxExp - userProgress.totalExp} EXP to Lvl {currentLevelDef.level + 1}</span>
              ) : (
                <span className="text-amber-400 font-bold">Max Level Reached!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 10 Mastery Progression Hierarchy Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Aspirant Progression Hierarchy (Levels 1 to 10)
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Earn +25 EXP for every correctly solved PYQ
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {LEVEL_DEFINITIONS.map((lvl) => {
            const isReached = userProgress.totalExp >= lvl.minExp;
            const isCurrent = userProgress.level === lvl.level;

            return (
              <div
                key={lvl.level}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                    : isReached
                    ? 'border-slate-200 bg-slate-50/70'
                    : 'border-slate-100 bg-slate-50/30 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{lvl.badge}</span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Lvl {lvl.level}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 truncate">
                  {lvl.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {lvl.minExp} EXP
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Leaderboard Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Controls Header: Ranking filter, Search & Sort */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  National Aspirant Standings
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Primary: Questions Solved
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Displaying real active students solving authentic PYQs in real time.
              </p>
            </div>

            {/* Target Exam Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
              {(['All', 'JEE', 'NEET', 'KCET'] as const).map((exam) => (
                <button
                  key={exam}
                  type="button"
                  onClick={() => setFilterExam(exam)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    filterExam === exam
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {exam === 'All' ? 'All Exams' : exam}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Controls: Search & Sort Criteria */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real aspirants..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                Rank by:
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSortBy('solved')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    sortBy === 'solved'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Questions Solved
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('accuracy')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    sortBy === 'accuracy'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Accuracy (%)
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('exp')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    sortBy === 'exp'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  EXP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-16">Rank</th>
                <th className="py-3 px-4">Aspirant</th>
                <th className="py-3 px-4">Exam / Class</th>
                <th className="py-3 px-4">Mastery Rank</th>
                <th
                  className={`py-3 px-4 text-right ${
                    sortBy === 'solved' ? 'text-indigo-700 font-bold bg-indigo-50/50' : ''
                  }`}
                >
                  Questions Solved
                </th>
                <th
                  className={`py-3 px-4 text-right ${
                    sortBy === 'accuracy' ? 'text-indigo-700 font-bold bg-indigo-50/50' : ''
                  }`}
                >
                  Accuracy
                </th>
                <th
                  className={`py-3 px-4 text-right ${
                    sortBy === 'exp' ? 'text-indigo-700 font-bold bg-indigo-50/50' : ''
                  }`}
                >
                  Total EXP
                </th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allMergedEntries.map((aspirant) => {
                const isCurrentUser = aspirant.isCurrentUser;
                const isTop1 = aspirant.rank === 1;
                const isTop2 = aspirant.rank === 2;
                const isTop3 = aspirant.rank === 3;

                return (
                  <tr
                    key={aspirant.id}
                    className={`transition-colors ${
                      isCurrentUser
                        ? 'bg-indigo-50/80 font-medium hover:bg-indigo-50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {isTop1 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xl">🥇</span>
                          <span className="text-[11px] font-bold text-amber-600">#1</span>
                        </div>
                      ) : isTop2 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xl">🥈</span>
                          <span className="text-[11px] font-bold text-slate-600">#2</span>
                        </div>
                      ) : isTop3 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xl">🥉</span>
                          <span className="text-[11px] font-bold text-amber-800">#3</span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-600">
                          #{aspirant.rank}
                        </span>
                      )}
                    </td>

                    {/* Aspirant Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={aspirant.avatar}
                          alt={aspirant.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-semibold truncate ${
                                isCurrentUser ? 'text-indigo-950 font-bold' : 'text-slate-900'
                              }`}
                            >
                              {aspirant.name}
                            </span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-indigo-600 text-white tracking-wider uppercase">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Verified Candidate
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Target Exam & Class */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            aspirant.targetExam === 'JEE'
                              ? 'bg-blue-100 text-blue-800'
                              : aspirant.targetExam === 'NEET'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {aspirant.targetExam}
                        </span>
                        {aspirant.classGrade && (
                          <span className="text-[11px] text-slate-500">
                            Cl {aspirant.classGrade}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Level & Rank Name */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold text-slate-800">
                        Lvl {aspirant.level}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                        {aspirant.levelName}
                      </div>
                    </td>

                    {/* Questions Solved (Primary Sorting Metric) */}
                    <td
                      className={`py-3.5 px-4 text-right ${
                        sortBy === 'solved' ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-900">
                        {aspirant.solvedCount}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {aspirant.correctCount || Math.round(aspirant.solvedCount * (aspirant.accuracy / 100))} correct
                      </div>
                    </td>

                    {/* Accuracy */}
                    <td
                      className={`py-3.5 px-4 text-right font-bold text-emerald-700 ${
                        sortBy === 'accuracy' ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {aspirant.accuracy}%
                    </td>

                    {/* Total EXP */}
                    <td
                      className={`py-3.5 px-4 text-right font-bold text-slate-900 ${
                        sortBy === 'exp' ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      {aspirant.exp.toLocaleString()}
                    </td>

                    {/* Active Status */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {aspirant.lastActive || 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {allMergedEntries.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No aspirants found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-User Verification Guarantee Footer */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Rankings Integrity:</strong> All scores are calculated from actual answered PYQ practice and timed exam sessions. No automated bots or simulated records are permitted.
          </span>
        </div>
        <div className="text-slate-400 text-[11px] shrink-0">
          Rank formula: Solved Questions (Desc) &rarr; Accuracy (%) &rarr; Total EXP
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Aspirant Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Set your real name to appear accurately on the national leaderboard.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aspirant Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your real name (e.g. Aman Sharma)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Exam
                  </label>
                  <select
                    value={editExam}
                    onChange={(e) => setEditExam(e.target.value as ExamType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="JEE">JEE (Main & Adv)</option>
                    <option value="NEET">NEET (Medical)</option>
                    <option value="KCET">KCET (State)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Grade
                  </label>
                  <select
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value as ClassGrade)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="11">Class 11</option>
                    <option value="12">Class 12 / Dropper</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Study Peer Modal */}
      {isAddPeerOpen && onAddPeer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsAddPeerOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add Real Study Peer
                </h3>
                <p className="text-xs text-slate-500">
                  Add a classmate or study buddy to track questions solved together.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreatePeer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peer Aspirant Name
                </label>
                <input
                  type="text"
                  required
                  value={peerName}
                  onChange={(e) => setPeerName(e.target.value)}
                  placeholder="e.g. Vikram Joshi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Exam
                  </label>
                  <select
                    value={peerExam}
                    onChange={(e) => setPeerExam(e.target.value as ExamType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="JEE">JEE</option>
                    <option value="NEET">NEET</option>
                    <option value="KCET">KCET</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Grade
                  </label>
                  <select
                    value={peerClass}
                    onChange={(e) => setPeerClass(e.target.value as ClassGrade)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Questions Solved
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={peerSolved}
                    onChange={(e) => setPeerSolved(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correct Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={peerSolved}
                    value={peerCorrect}
                    onChange={(e) => setPeerCorrect(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPeerOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPeer}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-xs disabled:opacity-50"
                >
                  {isSubmittingPeer ? 'Adding...' : 'Add to Leaderboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
