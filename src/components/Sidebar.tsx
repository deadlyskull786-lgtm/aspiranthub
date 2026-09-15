import React from 'react';
import {
  BookOpen,
  Trophy,
  Bot,
  BarChart2,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  Target,
  Flame,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { AppTab, ExamType, UserProgress, UserProfile } from '../types';
import { getLevelForExp } from '../data/levelData';
import {
  UserCheck,
  ShieldCheck,
  User,
} from 'lucide-react';

interface SidebarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  userProgress: UserProgress;
  targetExam: ExamType;
  onChangeTargetExam: (exam: ExamType) => void;
  isTestInProgress?: boolean;
  userProfile?: UserProfile;
  onOpenRegistration?: () => void;
}

interface NavItemConfig {
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  userProgress,
  targetExam,
  onChangeTargetExam,
  isTestInProgress = false,
  userProfile,
  onOpenRegistration,
}) => {
  const currentLevelDef = getLevelForExp(userProgress.totalExp);

  const PRIMARY_NAV: NavItemConfig[] = [
    { id: 'practice', label: 'PYQ Practice Arena', icon: BookOpen, badge: 'Live' },
    ...(isTestInProgress ? [{ id: 'test' as AppTab, label: 'Active Test Session', icon: Clock, badge: 'Active' }] : []),
    { id: 'leaderboard', label: 'Leaderboard & EXP', icon: Trophy, badge: `Lvl ${currentLevelDef.level}` },
    { id: 'ai-tutor', label: 'AI Study Assistant', icon: Bot, badge: 'Gemini' },
    { id: 'analytics', label: 'My Performance', icon: BarChart2 },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            id="brand-logo-badge"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shrink-0 font-bold shadow-md"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-sm tracking-tight truncate">
                AspirantHub
              </span>
              <span className="text-[10px] text-indigo-300 font-semibold tracking-wide uppercase truncate">
                JEE • NEET • KCET
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          id="btn-close-mobile-sidebar"
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          aria-label="Close navigation sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Target Exam Quick Switcher */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
              Active Focus Exam
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(['JEE', 'NEET', 'KCET'] as ExamType[]).map((exam) => (
                <button
                  key={exam}
                  type="button"
                  onClick={() => onChangeTargetExam(exam)}
                  className={`py-1 rounded-md text-[11px] font-bold transition-all ${
                    targetExam === exam
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User EXP & Level Mini Showcase in Sidebar */}
      {!isCollapsed && (
        <div className="px-3 py-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-500/20 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                <span>{currentLevelDef.badge}</span> Level {currentLevelDef.level}
              </span>
              <span className="font-mono text-amber-300 font-bold text-[11px]">
                {userProgress.totalExp} EXP
              </span>
            </div>
            <p className="text-xs font-semibold text-white truncate">
              {currentLevelDef.name}
            </p>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-indigo-500 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      ((userProgress.totalExp - currentLevelDef.minExp) /
                        (currentLevelDef.maxExp - currentLevelDef.minExp || 1)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {!isCollapsed && (
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Study Modules
          </p>
        )}
        <nav className="space-y-1" aria-label="Portal navigation">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-500/40 text-indigo-100 border border-indigo-300/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Daily Streak Box */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <div>
                <div className="font-bold text-slate-200">
                  {userProgress.streakDays} Day Streak!
                </div>
                <div className="text-[10px] text-slate-400">Keep solving daily</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              +10% EXP
            </span>
          </div>
        </div>
      )}

      {/* User Registration Status / Name Bar */}
      {!isCollapsed && (
        <div className="px-3 pb-2">
          {userProfile?.isRegistered && userProfile.name ? (
            <button
              type="button"
              onClick={onOpenRegistration}
              className="w-full p-2.5 rounded-xl bg-slate-900/80 border border-indigo-900/40 hover:border-indigo-700/60 flex items-center justify-between gap-2.5 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-8 h-8 rounded-full object-cover border border-indigo-500/50 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 truncate transition-colors">
                    {userProfile.name}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Aspirant
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-slate-200">Edit</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenRegistration}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-indigo-900/70 to-indigo-800/70 border border-indigo-600/50 hover:border-indigo-500 flex items-center justify-between text-left transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-xs font-bold text-white">Register Aspirant</div>
                  <div className="text-[10px] text-indigo-200">Set your name for ranking</div>
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Desktop Collapse Toggle */}
      <div className="hidden md:flex items-center justify-between px-3 py-3 border-t border-slate-800/80">
        {!isCollapsed && (
          <span className="text-xs text-slate-400 font-medium px-2">Collapse sidebar</span>
        )}
        <button
          id="btn-toggle-sidebar-collapse"
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mx-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="desktop-sidebar"
        className={`hidden md:block shrink-0 transition-all duration-200 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          id="mobile-sidebar-overlay"
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 md:hidden transform transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
