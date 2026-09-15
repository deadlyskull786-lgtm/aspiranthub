export type ExamType = 'JEE' | 'NEET' | 'KCET';
export type ClassGrade = '11' | '12' | 'All';
export type Subject = 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Tough';
export type AppTab = 'practice' | 'test' | 'leaderboard' | 'ai-tutor' | 'analytics';

export interface MCQQuestion {
  id: string;
  exam: ExamType;
  year: string;
  subject: Subject;
  classGrade: '11' | '12';
  chapter: string;
  question: string;
  options: string[]; // [A, B, C, D]
  correctOptionIndex: number; // 0, 1, 2, 3
  explanation: string;
  difficulty: Difficulty;
  formulaUsed?: string;
  tags: string[];
}

export interface LevelDefinition {
  level: number;
  name: string;
  minExp: number;
  maxExp: number;
  badge: string;
  color: string;
  perk: string;
}

export interface UserProgress {
  userProfile?: UserProfile;
  totalExp: number;
  level: number;
  levelName: string;
  questionsAttempted: number;
  questionsCorrect: number;
  streakDays: number;
  lastActiveDate: string;
  solvedQuestionIds: Record<string, boolean>;
  subjectStats: Record<Subject, { attempted: number; correct: number }>;
  recentTests: TestRecord[];
}

export interface TestRecord {
  id: string;
  timestamp: string;
  exam: ExamType;
  classGrade: ClassGrade;
  chapter: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  expEarned: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  targetExam: ExamType;
  classGrade: ClassGrade;
  isRegistered?: boolean;
  registeredAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  targetExam: ExamType;
  classGrade?: ClassGrade;
  level: number;
  levelName: string;
  exp: number;
  solvedCount: number; // Primary ranking metric
  correctCount: number;
  accuracy: number;
  rank: number;
  lastActive: string;
  isCurrentUser?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  subjectHint?: Subject;
}

// Auxiliary & Compatibility Types
export type NavSection = 'overview' | 'analytics' | 'projects' | 'customers' | 'reports' | 'settings';

export interface StatMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  timeframe: string;
  secondaryLabel?: string;
}

export interface ActivityUser {
  name: string;
  avatar: string;
  email: string;
}

export interface ActivityItem {
  id: string;
  user: ActivityUser | string;
  action: string;
  target: string;
  timestamp: string;
  status?: string;
  avatar?: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  client: string;
  status: 'Active' | 'In Review' | 'Completed' | 'Delayed' | 'Under Review';
  category: string;
  budget: string;
  deadline: string;
  progress: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  authMethod: 'google' | 'phone' | 'email' | 'guest';
  phoneNumber?: string;
}


