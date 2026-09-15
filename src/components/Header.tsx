import React from 'react';
import {
  Menu,
  Sparkles,
  Bot,
  Flame,
  UserCheck,
  User,
  ShieldCheck,
} from 'lucide-react';
import { AppTab, ExamType, UserProgress, UserProfile } from '../types';
import { getLevelForExp } from '../data/levelData';

interface HeaderProps {
  activeTab: AppTab;
  onOpenMobileSidebar: () => void;
  userProgress: UserProgress;
  targetExam: ExamType;
  onNavigateTab: (tab: AppTab) => void;
  userProfile?: UserProfile;
  onOpenRegistration?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  userProgress,
  targetExam,
  onNavigateTab,
  userProfile,
  onOpenRegistration,
}) => {
  const currentLevelDef = getLevelForExp(userProgress.totalExp);

  const getTabTitle = (tab: AppTab) => {
    switch (tab) {
      case 'practice':
        return 'PYQ Practice Arena';
      case 'test':
        return 'Live Exam Session';
      case 'leaderboard':
        return 'Leaderboard & Mastery Ranks';
      case 'ai-tutor':
        return 'Gemini AI Study Mentor';
      case 'analytics':
        return 'Performance & Diagnostics';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 select-none"
    >
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <button
          id="btn-open-mobile-sidebar"
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open mobile navigation menu"
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
          <span className="font-bold text-indigo-700 hidden sm:inline px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
            {targetExam}
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span
            id="breadcrumb-current-section"
            className="font-bold text-slate-800 tracking-tight truncate"
          >
            {getTabTitle(activeTab)}
          </span>
        </div>
      </div>

      {/* Right: User Level, EXP Badge, Quick AI Tutor CTA */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Level & EXP Pill */}
        <button
          type="button"
          onClick={() => onNavigateTab('leaderboard')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-left"
          title="Click to view full Leaderboard and all 10 Levels"
        >
          <span className="text-base">{currentLevelDef.badge}</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-700 leading-tight">
              Lvl {currentLevelDef.level}: {currentLevelDef.name}
            </span>
            <span className="text-[10px] font-mono font-bold text-indigo-600 leading-tight flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              {userProgress.totalExp} EXP
            </span>
          </div>
        </button>

        {/* Streak Pill */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>{userProgress.streakDays}d</span>
        </div>

        {/* User Registration Status / Name Badge */}
        {userProfile?.isRegistered && userProfile.name ? (
          <button
            id="btn-header-profile"
            type="button"
            onClick={onOpenRegistration}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer text-left"
            title="Click to view or edit registered aspirant profile"
          >
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-6 h-6 rounded-full object-cover border border-indigo-200 shrink-0"
            />
            <div className="hidden sm:flex flex-col min-w-0 max-w-[110px]">
              <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                {userProfile.name}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 leading-tight flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                Registered
              </span>
            </div>
          </button>
        ) : (
          <button
            id="btn-header-register"
            type="button"
            onClick={onOpenRegistration}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            title="Register your student name to compete on national leaderboard"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Register</span>
          </button>
        )}

        {/* Quick AI Tutor Trigger */}
        <button
          type="button"
          onClick={() => onNavigateTab('ai-tutor')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
        >
          <Bot className="w-3.5 h-3.5 text-indigo-200" />
          <span className="hidden xs:inline">Ask AI Tutor</span>
        </button>
      </div>
    </header>
  );
};
