import React, { useState } from 'react';
import { ExamType, ClassGrade, UserProfile } from '../types';
import {
  UserCheck,
  GraduationCap,
  X,
  Sparkles,
  Trophy,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: {
    name: string;
    targetExam: ExamType;
    classGrade: ClassGrade;
    avatar: string;
  }) => Promise<void>;
  initialProfile?: UserProfile;
  canDismiss?: boolean;
}

const AVATAR_PRESETS = [
  {
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    label: 'Student 1',
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    label: 'Student 2',
  },
  {
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    label: 'Student 3',
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    label: 'Student 4',
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    label: 'Student 5',
  },
  {
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    label: 'Student 6',
  },
];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  initialProfile,
  canDismiss = true,
}) => {
  const [name, setName] = useState(initialProfile?.name && initialProfile.name !== 'You (Aspirant)' ? initialProfile.name : '');
  const [targetExam, setTargetExam] = useState<ExamType>(initialProfile?.targetExam || 'JEE');
  const [classGrade, setClassGrade] = useState<ClassGrade>(initialProfile?.classGrade || '12');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    initialProfile?.avatar || AVATAR_PRESETS[0].url
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await onRegister({
        name: cleanName,
        targetExam,
        classGrade,
        avatar: selectedAvatar,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="registration-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="registration-modal-card"
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-auto"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white relative">
          {canDismiss && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close registration modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-200 shadow-inner">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Aspirant Registration
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  National Standings
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                Set your official name to enter live competitive rankings and save your verified progress.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Student Name Input */}
          <div>
            <label
              htmlFor="register-student-name"
              className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5"
            >
              Your Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="register-student-name"
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g. Aarav Sharma, Sneha Kulkarni..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 shadow-2xs"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Your name will be displayed when you solve PYQs, take tests, and climb the leaderboard.
            </p>
          </div>

          {/* Target Exam Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Target Competitive Exam
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['JEE', 'NEET', 'KCET'] as ExamType[]).map((exam) => (
                <button
                  key={exam}
                  type="button"
                  onClick={() => setTargetExam(exam)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    targetExam === exam
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold shadow-2xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-bold">{exam}</div>
                  <div className="text-[10px] text-slate-500">
                    {exam === 'JEE' ? 'Engineering' : exam === 'NEET' ? 'Medical' : 'Karnataka CET'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Academic Class */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Current Academic Grade
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setClassGrade('11')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  classGrade === '11'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Class 11 (Foundation)
              </button>
              <button
                type="button"
                onClick={() => setClassGrade('12')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  classGrade === '12'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Class 12 / Dropper
              </button>
            </div>
          </div>

          {/* Choose Avatar */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Choose Profile Avatar
            </label>
            <div className="flex items-center gap-3">
              {AVATAR_PRESETS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(av.url)}
                  className={`relative rounded-full p-0.5 transition-all ${
                    selectedAvatar === av.url
                      ? 'ring-2 ring-indigo-600 scale-105 shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={av.url}
                    alt={av.label}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  {selectedAvatar === av.url && (
                    <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={selectedAvatar}
                alt="Selected Avatar"
                className="w-9 h-9 rounded-full object-cover border border-indigo-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {name.trim() || 'Your Name Preview'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {targetExam} Aspirant • Class {classGrade}
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified Aspirant
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            {canDismiss && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Continue as Guest
              </button>
            )}
            <button
              id="submit-registration-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Registering...</span>
              ) : (
                <>
                  <span>Set Name & Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
