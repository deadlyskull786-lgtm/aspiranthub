/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppTab,
  ExamType,
  ClassGrade,
  Subject,
  Difficulty,
  MCQQuestion,
  UserProgress,
  TestRecord,
  LeaderboardEntry,
  UserProfile,
} from './types';
import { AUTHENTIC_PYQS } from './data/pyqDatabase';
import { INITIAL_LEADERBOARD } from './data/leaderboardData';
import { getLevelForExp } from './data/levelData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PracticeConfig } from './components/PracticeConfig';
import { MCQSession } from './components/MCQSession';
import { LeaderboardTab } from './components/LeaderboardTab';
import { AIAssistantTab } from './components/AIAssistantTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { RegistrationModal } from './components/RegistrationModal';
import { Sparkles, Trophy, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'aspiranthub_user_progress_v1';
const PROFILE_KEY = 'aspiranthub_user_profile_v1';

const getInitialProfile = (): UserProfile => {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        const isRegistered = Boolean(
          parsed.isRegistered &&
          parsed.name &&
          parsed.name !== 'You (Aspirant)' &&
          parsed.name.trim().length > 0
        );
        return {
          id: parsed.id || 'user-' + Math.random().toString(36).substring(2, 9),
          name: parsed.name || '',
          avatar:
            parsed.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          targetExam: parsed.targetExam || 'JEE',
          classGrade: parsed.classGrade || '12',
          isRegistered,
          registeredAt: parsed.registeredAt,
        };
      }
    }
  } catch (e) {
    console.error(e);
  }
  const randomId = 'user-' + Math.random().toString(36).substring(2, 9);
  return {
    id: randomId,
    name: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    targetExam: 'JEE',
    classGrade: '12',
    isRegistered: false,
  };
};

const DEFAULT_USER_PROGRESS: UserProgress = {
  totalExp: 140, // Starts at Level 1 Novice Aspirant
  level: 1,
  levelName: 'Novice Aspirant',
  questionsAttempted: 6,
  questionsCorrect: 5,
  streakDays: 4,
  lastActiveDate: new Date().toISOString(),
  solvedQuestionIds: {},
  subjectStats: {
    Physics: { attempted: 2, correct: 2 },
    Chemistry: { attempted: 2, correct: 1 },
    Mathematics: { attempted: 2, correct: 2 },
    Biology: { attempted: 0, correct: 0 },
  },
  recentTests: [],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('practice');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Configuration state
  const [selectedExam, setSelectedExam] = useState<ExamType>('JEE');
  const [selectedClass, setSelectedClass] = useState<ClassGrade>('12');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Physics');
  const [selectedChapter, setSelectedChapter] = useState<string>('All Chapters');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [practiceMode, setPracticeMode] = useState<'instant' | 'timed'>('instant');

  // Question bank state (combining authentic curated PYQs + generated AI questions)
  const [allQuestions, setAllQuestions] = useState<MCQQuestion[]>(AUTHENTIC_PYQS);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Active session questions
  const [sessionQuestions, setSessionQuestions] = useState<MCQQuestion[]>([]);

  // User progress & Gamification state with localStorage persistence
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_USER_PROGRESS;
  });

  // User Profile state (representing the real active student)
  const [userProfile, setUserProfile] = useState<UserProfile>(getInitialProfile);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

  // Registration modal state
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationToast, setRegistrationToast] = useState<string | null>(null);

  // Auto prompt for registration if user hasn't registered their name yet
  useEffect(() => {
    if (!userProfile.isRegistered || !userProfile.name) {
      const timer = setTimeout(() => {
        setIsRegistrationModalOpen(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  // Level Up Toast Notification
  const [levelUpToast, setLevelUpToast] = useState<{ level: number; name: string } | null>(null);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);

  // AI Tutor context question
  const [aiQuestionContext, setAiQuestionContext] = useState<MCQQuestion | null>(null);

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (e) {
      console.error(e);
    }
  }, [userProgress]);

  // Save profile changes
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
    } catch (e) {
      console.error(e);
    }
  }, [userProfile]);

  // Fetch real verified leaderboard from backend
  const fetchLeaderboard = useCallback(
    async (
      exam: ExamType | 'All' = 'All',
      sortBy: 'solved' | 'accuracy' | 'exp' = 'solved'
    ) => {
      setIsLeaderboardLoading(true);
      try {
        const res = await fetch(
          `/api/leaderboard?exam=${exam}&sortBy=${sortBy}&currentUserId=${userProfile.id}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.entries) {
            setLeaderboard(data.entries);
          }
        }
      } catch (err) {
        console.warn('Leaderboard fetch fallback:', err);
      } finally {
        setIsLeaderboardLoading(false);
      }
    },
    [userProfile.id]
  );

  // Synchronize actual questions solved to server real-time store
  const syncUserToLeaderboard = useCallback(
    async (progress: UserProgress, profile: UserProfile) => {
      try {
        const accuracy =
          progress.questionsAttempted > 0
            ? Math.round((progress.questionsCorrect / progress.questionsAttempted) * 1000) / 10
            : 0;

        const res = await fetch('/api/leaderboard/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar,
            targetExam: profile.targetExam,
            classGrade: profile.classGrade,
            level: progress.level,
            levelName: progress.levelName,
            exp: progress.totalExp,
            solvedCount: progress.questionsAttempted,
            correctCount: progress.questionsCorrect,
            accuracy,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.entries) {
            setLeaderboard(data.entries);
          }
        }
      } catch (err) {
        console.warn('Leaderboard sync fallback:', err);
      }
    },
    []
  );

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    syncUserToLeaderboard(userProgress, userProfile);
  }, [
    userProgress.questionsAttempted,
    userProgress.totalExp,
    userProfile,
    syncUserToLeaderboard,
  ]);

  // Handle registering user profile with their name
  const handleRegisterUser = async (data: {
    name: string;
    targetExam: ExamType;
    classGrade: ClassGrade;
    avatar: string;
  }) => {
    const cleanName = data.name.trim();
    const updatedProfile: UserProfile = {
      ...userProfile,
      name: cleanName,
      targetExam: data.targetExam,
      classGrade: data.classGrade,
      avatar: data.avatar,
      isRegistered: true,
      registeredAt: new Date().toISOString(),
    };

    setUserProfile(updatedProfile);
    setSelectedExam(data.targetExam);
    setSelectedClass(data.classGrade);

    try {
      const accuracy =
        userProgress.questionsAttempted > 0
          ? Math.round((userProgress.questionsCorrect / userProgress.questionsAttempted) * 1000) / 10
          : 83.3;

      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedProfile.id,
          name: cleanName,
          avatar: updatedProfile.avatar,
          targetExam: updatedProfile.targetExam,
          classGrade: updatedProfile.classGrade,
          level: userProgress.level,
          levelName: userProgress.levelName,
          exp: userProgress.totalExp,
          solvedCount: userProgress.questionsAttempted,
          correctCount: userProgress.questionsCorrect,
          accuracy,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.entries) {
          setLeaderboard(resData.entries);
        }
      }
    } catch (err) {
      console.warn('Registration sync error:', err);
    }

    setRegistrationToast(
      `Welcome, ${cleanName}! Your aspirant profile has been successfully registered.`
    );
    setTimeout(() => setRegistrationToast(null), 5000);
  };

  // Handle adding peer aspirant
  const handleAddPeer = async (peerData: {
    name: string;
    targetExam: ExamType;
    classGrade: ClassGrade;
    initialSolved: number;
    initialCorrect: number;
  }) => {
    try {
      const res = await fetch('/api/leaderboard/add-peer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(peerData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.entries) {
          setLeaderboard(data.entries);
        }
      }
    } catch (err) {
      console.error('Failed to add peer:', err);
    }
  };

  // Filter matching questions based on current config
  const matchingQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchExam = q.exam === selectedExam;
      const matchClass = selectedClass === 'All' || q.classGrade === selectedClass;
      const matchSubject = q.subject === selectedSubject;
      const matchChapter =
        selectedChapter === 'All Chapters' || q.chapter === selectedChapter;
      const matchDifficulty =
        selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      return matchExam && matchClass && matchSubject && matchChapter && matchDifficulty;
    });
  }, [
    allQuestions,
    selectedExam,
    selectedClass,
    selectedSubject,
    selectedChapter,
    selectedDifficulty,
  ]);

  // Handle starting a test session
  const handleStartSession = () => {
    // If no strict matches or fewer than requested, broaden slightly to match exam and subject
    let pool = [...matchingQuestions];
    if (pool.length === 0) {
      pool = allQuestions.filter((q) => q.exam === selectedExam && q.subject === selectedSubject);
    }
    if (pool.length === 0) {
      pool = allQuestions.filter((q) => q.exam === selectedExam);
    }
    if (pool.length === 0) {
      pool = allQuestions;
    }

    // Shuffle and pick requested count
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionCount);

    setSessionQuestions(selected);
    setActiveTab('test');
  };

  // Handle Dynamic AI Generation of fresh authentic questions
  const handleGenerateAIQuestions = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam: selectedExam,
          classGrade: selectedClass === 'All' ? '12' : selectedClass,
          subject: selectedSubject,
          chapter: selectedChapter === 'All Chapters' ? `${selectedSubject} Fundamentals` : selectedChapter,
          difficulty: selectedDifficulty === 'All' ? 'Medium' : selectedDifficulty,
          count: 5,
        }),
      });

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setAllQuestions((prev) => [...data.questions, ...prev]);
        alert(`Successfully generated ${data.questions.length} authentic ${selectedExam} questions via Gemini!`);
      } else {
        alert('Could not generate AI questions at this time. Standard PYQs loaded.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while connecting to AI question generator.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Handle completion of test/practice session and award EXP & update Levels
  const handleFinishSession = (result: TestRecord, expEarned: number) => {
    setUserProgress((prev) => {
      const newTotalExp = prev.totalExp + expEarned;
      const oldLevelDef = getLevelForExp(prev.totalExp);
      const newLevelDef = getLevelForExp(newTotalExp);

      if (newLevelDef.level > oldLevelDef.level) {
        setLevelUpToast({ level: newLevelDef.level, name: newLevelDef.name });
        setTimeout(() => setLevelUpToast(null), 5000);
      }

      const attemptedInSession = result.correct + result.incorrect;
      const prevSubj = prev.subjectStats[selectedSubject] || { attempted: 0, correct: 0 };
      const updatedSubjStats = {
        ...prev.subjectStats,
        [selectedSubject]: {
          attempted: prevSubj.attempted + attemptedInSession,
          correct: prevSubj.correct + result.correct,
        },
      };

      return {
        ...prev,
        totalExp: newTotalExp,
        level: newLevelDef.level,
        levelName: newLevelDef.name,
        questionsAttempted: prev.questionsAttempted + attemptedInSession,
        questionsCorrect: prev.questionsCorrect + result.correct,
        subjectStats: updatedSubjStats,
        recentTests: [result, ...prev.recentTests.slice(0, 19)],
      };
    });
  };

  const handleAskAIAboutQuestion = (q: MCQQuestion) => {
    setAiQuestionContext(q);
    setActiveTab('ai-tutor');
  };

  return (
    <div
      id="aspiranthub-root-layout"
      className="flex h-screen w-full overflow-hidden bg-slate-100/70 font-sans text-slate-900 antialiased"
    >
      {/* Registration Success Toast */}
      {registrationToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg">
            🎉
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
              Registration Successful
            </div>
            <div className="text-xs font-bold text-white">
              {registrationToast}
            </div>
          </div>
        </div>
      )}

      {/* Level Up Celebration Toast */}
      {levelUpToast && (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-5 py-3.5 rounded-2xl shadow-xl border-2 border-amber-300 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
            🏆
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
              Level Up Achieved!
            </div>
            <div className="text-sm font-black text-white">
              Level {levelUpToast.level}: {levelUpToast.name}
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal - Sets student's name upon registration */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onRegister={handleRegisterUser}
        initialProfile={userProfile}
        canDismiss={Boolean(userProfile.isRegistered && userProfile.name)}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        userProgress={userProgress}
        targetExam={selectedExam}
        onChangeTargetExam={(exam) => {
          setSelectedExam(exam);
        }}
        isTestInProgress={sessionQuestions.length > 0 && activeTab === 'test'}
        userProfile={userProfile}
        onOpenRegistration={() => setIsRegistrationModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          userProgress={userProgress}
          targetExam={selectedExam}
          onNavigateTab={(tab) => setActiveTab(tab)}
          userProfile={userProfile}
          onOpenRegistration={() => setIsRegistrationModalOpen(true)}
        />

        {/* Dynamic Tab Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'practice' && (
            <PracticeConfig
              selectedExam={selectedExam}
              onChangeExam={setSelectedExam}
              selectedClass={selectedClass}
              onChangeClass={setSelectedClass}
              selectedSubject={selectedSubject}
              onChangeSubject={setSelectedSubject}
              selectedChapter={selectedChapter}
              onChangeChapter={setSelectedChapter}
              selectedDifficulty={selectedDifficulty}
              onChangeDifficulty={setSelectedDifficulty}
              questionCount={questionCount}
              onChangeQuestionCount={setQuestionCount}
              mode={practiceMode}
              onChangeMode={setPracticeMode}
              onStartSession={handleStartSession}
              onGenerateAIQuestions={handleGenerateAIQuestions}
              isGeneratingAI={isGeneratingAI}
              availableQuestionsCount={matchingQuestions.length}
            />
          )}

          {activeTab === 'test' && (
            <MCQSession
              questions={
                sessionQuestions.length > 0 ? sessionQuestions : allQuestions.slice(0, 5)
              }
              mode={practiceMode}
              exam={selectedExam}
              classGrade={selectedClass}
              chapter={selectedChapter}
              onFinishSession={handleFinishSession}
              onExitSession={() => setActiveTab('practice')}
              onAskAIAboutQuestion={handleAskAIAboutQuestion}
              userProfile={userProfile}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardTab
              entries={leaderboard}
              userProgress={userProgress}
              userProfile={userProfile}
              onUpdateProfile={(updated) => setUserProfile(updated)}
              onAddPeer={handleAddPeer}
              isLoading={isLeaderboardLoading}
              onOpenRegistration={() => setIsRegistrationModalOpen(true)}
            />
          )}

          {activeTab === 'ai-tutor' && (
            <AIAssistantTab
              initialQuestionContext={aiQuestionContext}
              onClearQuestionContext={() => setAiQuestionContext(null)}
              targetExam={selectedExam}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              userProgress={userProgress}
              onStartPractice={() => setActiveTab('practice')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
