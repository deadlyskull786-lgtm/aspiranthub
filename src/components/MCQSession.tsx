import React, { useState, useEffect, useMemo } from 'react';
import { MCQQuestion, ExamType, TestRecord, UserProfile } from '../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award,
  AlertCircle,
  Flag,
} from 'lucide-react';

interface MCQSessionProps {
  questions: MCQQuestion[];
  mode: 'instant' | 'timed';
  exam: ExamType;
  classGrade: string;
  chapter: string;
  onFinishSession: (result: TestRecord, expEarned: number) => void;
  onExitSession: () => void;
  onAskAIAboutQuestion: (question: MCQQuestion) => void;
  userProfile?: UserProfile;
}

export const MCQSession: React.FC<MCQSessionProps> = ({
  questions,
  mode,
  exam,
  classGrade,
  chapter,
  onFinishSession,
  onExitSession,
  onAskAIAboutQuestion,
  userProfile,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(() => {
    // 2 minutes per question for JEE/NEET, 1 minute for KCET
    const perQ = exam === 'KCET' ? 60 : 120;
    return questions.length * perQ;
  });
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [earnedExpAnimation, setEarnedExpAnimation] = useState<number | null>(null);

  const currentQ = questions[currentIndex];

  // Timer logic for timed test
  useEffect(() => {
    if (isSubmitted) return;

    const interval = setInterval(() => {
      setSecondsSpent((s) => s + 1);
      if (mode === 'timed') {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, isSubmitted]);

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    if (mode === 'instant' && selectedAnswers[currentIndex] !== undefined) {
      // already answered in instant mode
      return;
    }

    const wasAnswered = selectedAnswers[currentIndex] !== undefined;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));

    if (mode === 'instant' && !wasAnswered) {
      const isCorrect = optionIndex === currentQ.correctOptionIndex;
      const exp = isCorrect ? 25 : 5;
      setEarnedExpAnimation(exp);
      setTimeout(() => setEarnedExpAnimation(null), 2000);
    }
  };

  const handleToggleReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const handleClearResponse = () => {
    if (mode === 'instant') return;
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentIndex];
      return copy;
    });
  };

  const testStats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach((q, idx) => {
      const ans = selectedAnswers[idx];
      if (ans === undefined) {
        unattempted++;
      } else if (ans === q.correctOptionIndex) {
        correct++;
      } else {
        incorrect++;
      }
    });

    // Marking scheme: JEE/NEET +4, -1; KCET +1, 0
    let score = 0;
    let maxScore = 0;
    if (exam === 'KCET') {
      score = correct * 1;
      maxScore = questions.length * 1;
    } else {
      score = correct * 4 - incorrect * 1;
      maxScore = questions.length * 4;
    }

    const accuracy =
      correct + incorrect > 0
        ? Math.round((correct / (correct + incorrect)) * 100)
        : 0;

    const expEarned = correct * 30 + incorrect * 5;

    return {
      correct,
      incorrect,
      unattempted,
      score,
      maxScore,
      accuracy,
      expEarned,
    };
  }, [questions, selectedAnswers, exam]);

  const handleSubmitTest = () => {
    setIsSubmitted(true);
    const result: TestRecord = {
      id: `test-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exam,
      classGrade: classGrade as any,
      chapter: chapter,
      totalQuestions: questions.length,
      correct: testStats.correct,
      incorrect: testStats.incorrect,
      unattempted: testStats.unattempted,
      score: testStats.score,
      maxScore: testStats.maxScore,
      timeSpentSeconds: secondsSpent,
      expEarned: testStats.expEarned,
    };
    onFinishSession(result, testStats.expEarned);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If submitted in timed mode, show the full Scorecard
  if (isSubmitted && mode === 'timed') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
        {/* Scorecard Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <Award className="w-9 h-9 text-amber-600" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {exam} Test Completed
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Performance Scorecard
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {chapter} • Class {classGrade}
            </p>
            {userProfile?.name && (
              <div className="inline-flex items-center gap-2 mt-2.5 px-3 py-1 bg-slate-100/90 rounded-full text-xs font-semibold text-slate-700 border border-slate-200">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>Aspirant: {userProfile.name}</span>
                {userProfile.isRegistered && (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Verified
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Key Metric Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500">Marks Scored</span>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {testStats.score} <span className="text-xs font-normal text-slate-400">/ {testStats.maxScore}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-700">Accuracy</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">
                {testStats.accuracy}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <span className="text-[11px] font-semibold text-indigo-700">EXP Earned</span>
              <div className="text-xl font-bold text-indigo-700 mt-1 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                +{testStats.expEarned}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-[11px] font-semibold text-blue-700">Time Taken</span>
              <div className="text-xl font-bold text-blue-700 mt-1">
                {formatTime(secondsSpent)}
              </div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {testStats.correct} Correct ({exam === 'KCET' ? `+${testStats.correct}` : `+${testStats.correct * 4}`})
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800">
              <XCircle className="w-3.5 h-3.5" />
              {testStats.incorrect} Incorrect ({exam === 'KCET' ? '0' : `-${testStats.incorrect}`})
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
              <AlertCircle className="w-3.5 h-3.5" />
              {testStats.unattempted} Unattempted
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onExitSession}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              Return to Practice Arena
            </button>
          </div>
        </div>

        {/* Detailed Solutions Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Detailed Step-by-Step Question Review
          </h3>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctOptionIndex;
              const isSkipped = userAns === undefined;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isSkipped
                      ? 'border-slate-200 bg-slate-50/50'
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-800">Q{idx + 1}.</span>
                      <span className="font-semibold text-indigo-700 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">
                        {q.year}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">{q.chapter}</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : isSkipped
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? 'Correct (+4)' : isSkipped ? 'Skipped (0)' : 'Incorrect (-1)'}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-900 mb-3">{q.question}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctOptionIndex;
                      const isOptionUser = optIdx === userAns;

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                            isOptionCorrect
                              ? 'border-emerald-500 bg-emerald-100/70 text-emerald-900 font-semibold'
                              : isOptionUser
                              ? 'border-rose-400 bg-rose-100/60 text-rose-900'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-200/70 flex items-center justify-center font-bold text-[10px]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                          {isOptionCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 ml-auto shrink-0" />
                          )}
                          {isOptionUser && !isOptionCorrect && (
                            <XCircle className="w-4 h-4 text-rose-700 ml-auto shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Solution block */}
                  <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1.5">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>💡 Step-by-Step Explanation:</span>
                      <button
                        type="button"
                        onClick={() => onAskAIAboutQuestion(q)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 text-[11px]"
                      >
                        <Sparkles className="w-3 h-3" />
                        Ask AI Assistant
                      </button>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                    {q.formulaUsed && (
                      <div className="pt-1 text-indigo-700 font-medium font-mono text-[11px]">
                        Formula: {q.formulaUsed}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active question solving screen
  const userSelectedOption = selectedAnswers[currentIndex];
  const isAnswered = userSelectedOption !== undefined;
  const isCorrect = userSelectedOption === currentQ.correctOptionIndex;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitSession}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                {exam} • Class {currentQ.classGrade}
              </span>
              <span className="text-xs font-semibold text-slate-800">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
              {currentQ.chapter}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {mode === 'timed' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {formatTime(timeRemainingSeconds)}
            </div>
          )}

          {earnedExpAnimation && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              +{earnedExpAnimation} EXP!
            </div>
          )}

          {mode === 'timed' ? (
            <button
              type="button"
              onClick={handleSubmitTest}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs"
            >
              Submit Test
            </button>
          ) : (
            <div className="text-xs font-semibold text-slate-600">
              Instant Check Mode
            </div>
          )}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Question Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
              {currentQ.year}
            </span>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                currentQ.difficulty === 'Easy'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : currentQ.difficulty === 'Medium'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {currentQ.difficulty}
            </span>
            <span className="text-xs text-slate-400">
              {exam === 'KCET' ? '(+1 mark)' : '(+4, -1 mark)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'timed' && (
              <button
                type="button"
                onClick={handleToggleReview}
                className={`text-xs font-medium px-2.5 py-1 rounded-lg border inline-flex items-center gap-1 transition-colors ${
                  markedForReview[currentIndex]
                    ? 'border-purple-300 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Flag className="w-3 h-3" />
                {markedForReview[currentIndex] ? 'Marked for Review' : 'Mark Review'}
              </button>
            )}

            <button
              type="button"
              onClick={() => onAskAIAboutQuestion(currentQ)}
              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 inline-flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Ask AI Tutor
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
          {currentQ.question}
        </div>

        {/* 4 MCQ Options */}
        <div className="space-y-3">
          {currentQ.options.map((optText, optIdx) => {
            const isSelected = userSelectedOption === optIdx;
            const isCorrectOption = optIdx === currentQ.correctOptionIndex;

            let optionStyle =
              'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 bg-white';

            if (mode === 'instant' && isAnswered) {
              if (isCorrectOption) {
                optionStyle =
                  'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20';
              } else if (isSelected && !isCorrectOption) {
                optionStyle =
                  'border-rose-500 bg-rose-50/70 text-rose-900 ring-2 ring-rose-500/20';
              } else {
                optionStyle = 'border-slate-200 opacity-60 bg-white text-slate-600';
              }
            } else if (isSelected) {
              optionStyle =
                'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20';
            }

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${optionStyle}`}
              >
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                    mode === 'instant' && isAnswered && isCorrectOption
                      ? 'bg-emerald-600 text-white'
                      : mode === 'instant' && isAnswered && isSelected
                      ? 'bg-rose-600 text-white'
                      : isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span className="text-sm font-medium flex-1 pt-0.5">{optText}</span>

                {mode === 'instant' && isAnswered && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {mode === 'instant' && isAnswered && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* In Instant Mode: Step-by-Step Explanation Banner */}
        {mode === 'instant' && isAnswered && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between font-bold">
              <span className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                {isCorrect ? '🎉 Correct Answer! (+25 EXP)' : '❌ Incorrect Choice (+5 EXP for effort)'}
              </span>
              <span className="text-slate-400 font-normal">Official Key: Option {String.fromCharCode(65 + currentQ.correctOptionIndex)}</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
            {currentQ.formulaUsed && (
              <div className="pt-2 text-indigo-700 font-mono text-[11px] font-semibold">
                Formula: {currentQ.formulaUsed}
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {mode === 'timed' && isAnswered && (
              <button
                type="button"
                onClick={handleClearResponse}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
              >
                Clear Response
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold disabled:opacity-40 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : mode === 'timed' ? (
              <button
                type="button"
                onClick={handleSubmitTest}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs"
              >
                Finish & Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleSubmitTest();
                }}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs"
              >
                Complete Practice
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Palette for quick navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <span className="text-xs font-bold text-slate-700 block mb-2">Question Palette:</span>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((_, idx) => {
            const isCurrent = idx === currentIndex;
            const hasAnswered = selectedAnswers[idx] !== undefined;
            const isMarked = markedForReview[idx];

            let badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
            if (isCurrent) {
              badgeClass = 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400';
            } else if (isMarked) {
              badgeClass = 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
            } else if (hasAnswered) {
              badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs border flex items-center justify-center transition-all ${badgeClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
