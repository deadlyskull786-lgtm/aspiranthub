import React from 'react';
import { UserProgress } from '../types';
import { LEVEL_DEFINITIONS, getLevelForExp } from '../data/levelData';
import { Award, BookOpen, Clock, Target, CheckCircle2, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';

interface AnalyticsTabProps {
  userProgress: UserProgress;
  onStartPractice: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  userProgress,
  onStartPractice,
}) => {
  const currentLevelDef = getLevelForExp(userProgress.totalExp);
  const overallAccuracy =
    userProgress.questionsAttempted > 0
      ? Math.round(
          (userProgress.questionsCorrect / userProgress.questionsAttempted) * 100
        )
      : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top 4 Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Mastery Rank</span>
            <span className="text-xl">{currentLevelDef.badge}</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            Level {currentLevelDef.level}
          </div>
          <div className="text-xs text-indigo-600 font-semibold mt-0.5">
            {currentLevelDef.name}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total EXP</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {userProgress.totalExp.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Ranked nationally
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Solved PYQs</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {userProgress.questionsCorrect} <span className="text-xs font-normal text-slate-400">/ {userProgress.questionsAttempted}</span>
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-0.5">
            {userProgress.questionsCorrect} Verified Correct
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Overall Accuracy</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {overallAccuracy}%
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Across JEE, NEET, KCET
          </div>
        </div>
      </div>

      {/* Subject-Wise Mastery Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Subject-Wise Accuracy & Mastery Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Physics', 'Chemistry', 'Mathematics', 'Biology'] as const).map((subj) => {
            const stats = userProgress.subjectStats[subj] || { attempted: 0, correct: 0 };
            const acc = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;

            return (
              <div
                key={subj}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{subj}</span>
                  <span className="font-bold text-emerald-700">{acc}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${acc}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>{stats.correct} Correct</span>
                  <span>{stats.attempted} Attempted</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Tests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Practice & Exam Records
            </h3>
            <p className="text-xs text-slate-500">
              Diagnostic test log and earned EXP
            </p>
          </div>

          <button
            type="button"
            onClick={onStartPractice}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs"
          >
            + Start New Test
          </button>
        </div>

        {userProgress.recentTests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <p>No tests taken yet. Launch your first practice arena test!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Exam & Grade</th>
                  <th className="py-3 px-4">Chapter</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-right">Questions</th>
                  <th className="py-3 px-4 text-right">EXP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userProgress.recentTests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-500">{t.timestamp}</td>
                    <td className="py-3 px-4 font-bold text-indigo-700">
                      {t.exam} • Class {t.classGrade}
                    </td>
                    <td className="py-3 px-4 text-slate-800">{t.chapter}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {t.score} / {t.maxScore}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {t.correct}C / {t.incorrect}W
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-600">
                      +{t.expEarned} EXP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
