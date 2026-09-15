import React, { useMemo } from 'react';
import {
  ExamType,
  ClassGrade,
  Subject,
  Difficulty,
  MCQQuestion,
} from '../types';
import { CHAPTER_LIST } from '../data/pyqDatabase';
import { Sparkles, BookOpen, Clock, Target, Layers, HelpCircle, Flame } from 'lucide-react';

interface PracticeConfigProps {
  selectedExam: ExamType;
  onChangeExam: (exam: ExamType) => void;
  selectedClass: ClassGrade;
  onChangeClass: (cls: ClassGrade) => void;
  selectedSubject: Subject;
  onChangeSubject: (subj: Subject) => void;
  selectedChapter: string;
  onChangeChapter: (chap: string) => void;
  selectedDifficulty: Difficulty | 'All';
  onChangeDifficulty: (diff: Difficulty | 'All') => void;
  questionCount: number;
  onChangeQuestionCount: (count: number) => void;
  mode: 'instant' | 'timed';
  onChangeMode: (mode: 'instant' | 'timed') => void;
  onStartSession: () => void;
  onGenerateAIQuestions: () => void;
  isGeneratingAI: boolean;
  availableQuestionsCount: number;
}

export const PracticeConfig: React.FC<PracticeConfigProps> = ({
  selectedExam,
  onChangeExam,
  selectedClass,
  onChangeClass,
  selectedSubject,
  onChangeSubject,
  selectedChapter,
  onChangeChapter,
  selectedDifficulty,
  onChangeDifficulty,
  questionCount,
  onChangeQuestionCount,
  mode,
  onChangeMode,
  onStartSession,
  onGenerateAIQuestions,
  isGeneratingAI,
  availableQuestionsCount,
}) => {
  // Filter subjects based on Exam (NEET doesn't have Math; JEE doesn't have Bio; KCET has all)
  const availableSubjects: Subject[] = useMemo(() => {
    if (selectedExam === 'JEE') return ['Physics', 'Chemistry', 'Mathematics'];
    if (selectedExam === 'NEET') return ['Physics', 'Chemistry', 'Biology'];
    return ['Physics', 'Chemistry', 'Mathematics', 'Biology'];
  }, [selectedExam]);

  // If currently selected subject is not valid for this exam, reset
  React.useEffect(() => {
    if (!availableSubjects.includes(selectedSubject)) {
      onChangeSubject(availableSubjects[0]);
    }
  }, [selectedExam, availableSubjects, selectedSubject, onChangeSubject]);

  // Filter available chapters based on selected subject, class, and exam
  const filteredChapters = useMemo(() => {
    return CHAPTER_LIST.filter((ch) => {
      const matchSubject = ch.subject === selectedSubject;
      const matchClass = selectedClass === 'All' || ch.classGrade === selectedClass;
      const matchExam = ch.applicableExams.includes(selectedExam);
      return matchSubject && matchClass && matchExam;
    });
  }, [selectedSubject, selectedClass, selectedExam]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-indigo-700/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Official PYQ Repository • Class 11 & 12
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Competitive Exam Question Arena
          </h1>
          <p className="text-indigo-100/90 text-sm leading-relaxed">
            Solve authentic Previous Year Questions (PYQs) from JEE Main & Advanced, NEET-UG, and KCET.
            Earn EXP with every solved question, climb all 10 mastery ranks, and conquer your entrance exam.
          </p>
        </div>
        <div className="absolute right-4 bottom-2 opacity-10 pointer-events-none hidden md:block">
          <Layers className="w-56 h-56 text-white" />
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
        {/* 1. Target Exam Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Step 1: Choose Competitive Exam
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['JEE', 'NEET', 'KCET'] as ExamType[]).map((exam) => {
              const isSelected = selectedExam === exam;
              return (
                <button
                  key={exam}
                  type="button"
                  onClick={() => onChangeExam(exam)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-bold text-slate-900">{exam}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        exam === 'JEE'
                          ? 'bg-blue-100 text-blue-800'
                          : exam === 'NEET'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {exam === 'JEE'
                        ? 'Engineering'
                        : exam === 'NEET'
                        ? 'Medical'
                        : 'Karnataka State'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {exam === 'JEE'
                      ? 'PCM • Main & Advanced PYQs (+4, -1 marking)'
                      : exam === 'NEET'
                      ? 'PCB • NCERT-focused line-by-line PYQs (+4, -1)'
                      : 'PCM/B • 60-second speed solve (+1, 0 marking)'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Class Grade & Subject Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Step 2: Class Grade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['11', '12', 'All'] as ClassGrade[]).map((cls) => {
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => onChangeClass(cls)}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all text-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {cls === 'All' ? 'Combined (11 & 12)' : `Class ${cls}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Step 3: Subject
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableSubjects.map((subj) => {
                const isSelected = selectedSubject === subj;
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => onChangeSubject(subj)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all text-center ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {subj}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Chapter Selection */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Step 4: Choose Chapter
            </span>
            <span className="text-slate-400 font-normal lowercase">
              ({filteredChapters.length} chapters available)
            </span>
          </label>
          <select
            value={selectedChapter}
            onChange={(e) => onChangeChapter(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium text-slate-800"
          >
            <option value="All Chapters">📚 All Chapters Combined (Full Syllabus)</option>
            {filteredChapters.map((ch) => (
              <option key={ch.name} value={ch.name}>
                [Class {ch.classGrade}] {ch.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Difficulty, Question Count & Practice Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Difficulty Level
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => onChangeDifficulty(e.target.value as Difficulty | 'All')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-700"
            >
              <option value="All">All Levels (Mixed)</option>
              <option value="Easy">Easy (Foundation / Direct)</option>
              <option value="Medium">Medium (Standard Exam Level)</option>
              <option value="Hard">Hard (Multi-concept / Advanced)</option>
              <option value="Tough">Tough (Top Rank Deciders)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Number of Questions
            </label>
            <div className="flex items-center gap-1.5">
              {[5, 10, 15, 20, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onChangeQuestionCount(num)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all text-center ${
                    questionCount === num
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Practice Format
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onChangeMode('instant')}
                className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all text-center ${
                  mode === 'instant'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                Instant Solution
              </button>
              <button
                type="button"
                onClick={() => onChangeMode('timed')}
                className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all text-center ${
                  mode === 'timed'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                Timed Exam Test
              </button>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{availableQuestionsCount} questions</span> ready in repository matching criteria.
            {mode === 'timed' && (
              <span className="ml-2 text-indigo-600 font-medium">
                • Timer: ~{questionCount * (selectedExam === 'KCET' ? 1 : 2)} minutes
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onGenerateAIQuestions}
              disabled={isGeneratingAI}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              {isGeneratingAI ? 'Generating with Gemini...' : 'AI Generate Fresh PYQs'}
            </button>

            <button
              type="button"
              onClick={onStartSession}
              disabled={availableQuestionsCount === 0}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{mode === 'timed' ? '⚡ Start Timed Exam Test' : '🚀 Launch Practice Arena'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
