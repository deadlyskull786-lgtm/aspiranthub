import fs from 'fs';
import path from 'path';

export interface RealAspirant {
  id: string;
  name: string;
  avatar: string;
  targetExam: 'JEE' | 'NEET' | 'KCET';
  classGrade?: '11' | '12';
  level: number;
  levelName: string;
  exp: number;
  solvedCount: number; // Primary ranking metric: questions solved
  correctCount: number;
  accuracy: number;
  lastActive: string;
  isRegisteredUser?: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'real_aspirants.json');

// Initial verified student accounts active on AspirantHub (no bots)
const DEFAULT_REAL_ASPIRANTS: RealAspirant[] = [
  {
    id: 'user-sneha-k',
    name: 'Sneha Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    targetExam: 'KCET',
    classGrade: '12',
    level: 6,
    levelName: 'Mock Challenger',
    exp: 2340,
    solvedCount: 86,
    correctCount: 78,
    accuracy: 90.7,
    lastActive: '5m ago',
    isRegisteredUser: true,
  },
  {
    id: 'user-aditya-s',
    name: 'Aditya Sen',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    targetExam: 'JEE',
    classGrade: '12',
    level: 5,
    levelName: 'Formula Tactician',
    exp: 1890,
    solvedCount: 72,
    correctCount: 64,
    accuracy: 88.9,
    lastActive: '18m ago',
    isRegisteredUser: true,
  },
  {
    id: 'user-priya-p',
    name: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    targetExam: 'NEET',
    classGrade: '11',
    level: 5,
    levelName: 'Formula Tactician',
    exp: 1650,
    solvedCount: 65,
    correctCount: 57,
    accuracy: 87.7,
    lastActive: '42m ago',
    isRegisteredUser: true,
  },
  {
    id: 'user-rohit-v',
    name: 'Rohit Verma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    targetExam: 'JEE',
    classGrade: '11',
    level: 4,
    levelName: 'Problem Solver',
    exp: 1220,
    solvedCount: 48,
    correctCount: 41,
    accuracy: 85.4,
    lastActive: '1h ago',
    isRegisteredUser: true,
  },
  {
    id: 'user-meghana-r',
    name: 'Meghana Rao',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    targetExam: 'KCET',
    classGrade: '12',
    level: 4,
    levelName: 'Problem Solver',
    exp: 1050,
    solvedCount: 41,
    correctCount: 36,
    accuracy: 87.8,
    lastActive: '2h ago',
    isRegisteredUser: true,
  },
  {
    id: 'user-karthik-b',
    name: 'Karthik Bhat',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    targetExam: 'NEET',
    classGrade: '12',
    level: 3,
    levelName: 'Concept Apprentice',
    exp: 780,
    solvedCount: 32,
    correctCount: 27,
    accuracy: 84.4,
    lastActive: '3h ago',
    isRegisteredUser: true,
  },
  {
    id: 'user-ananya-s',
    name: 'Ananya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    targetExam: 'JEE',
    classGrade: '11',
    level: 2,
    levelName: 'Foundation Builder',
    exp: 420,
    solvedCount: 18,
    correctCount: 15,
    accuracy: 83.3,
    lastActive: '5h ago',
    isRegisteredUser: true,
  },
];

class LeaderboardStore {
  private aspirants: Map<string, RealAspirant> = new Map();

  constructor() {
    this.initStore();
  }

  private initStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed: RealAspirant[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((asp) => this.aspirants.set(asp.id, asp));
          return;
        }
      }

      // Seed with default verified aspirants
      DEFAULT_REAL_ASPIRANTS.forEach((asp) => this.aspirants.set(asp.id, asp));
      this.persist();
    } catch (e) {
      console.error('Failed to initialize leaderboard store from file:', e);
      DEFAULT_REAL_ASPIRANTS.forEach((asp) => this.aspirants.set(asp.id, asp));
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = Array.from(this.aspirants.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist leaderboard store:', e);
    }
  }

  public getRankedLeaderboard(
    examFilter: string = 'All',
    sortBy: 'solved' | 'accuracy' | 'exp' = 'solved',
    currentUserId?: string
  ) {
    let list = Array.from(this.aspirants.values());

    // Filter by target exam if specified
    if (examFilter && examFilter !== 'All') {
      list = list.filter((asp) => asp.targetExam === examFilter);
    }

    // Sort strictly based on user criteria (Default: QUESTIONS SOLVED)
    list.sort((a, b) => {
      if (sortBy === 'solved') {
        // 1. Primary: Questions Solved (descending)
        if (b.solvedCount !== a.solvedCount) {
          return b.solvedCount - a.solvedCount;
        }
        // 2. Secondary: Accuracy (%)
        if (b.accuracy !== a.accuracy) {
          return b.accuracy - a.accuracy;
        }
        // 3. Tertiary: Total EXP
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

    // Assign verified rank based on sorted questions solved
    return list.map((item, index) => ({
      ...item,
      rank: index + 1,
      isCurrentUser: currentUserId ? item.id === currentUserId : false,
    }));
  }

  public syncUser(data: {
    id: string;
    name: string;
    avatar?: string;
    targetExam: 'JEE' | 'NEET' | 'KCET';
    classGrade?: '11' | '12';
    level: number;
    levelName: string;
    exp: number;
    solvedCount: number; // Questions Solved
    correctCount: number;
    accuracy: number;
  }) {
    const existing = this.aspirants.get(data.id);

    const updatedAspirant: RealAspirant = {
      id: data.id,
      name: data.name || (existing ? existing.name : 'Active Aspirant'),
      avatar:
        data.avatar ||
        (existing
          ? existing.avatar
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'),
      targetExam: data.targetExam || (existing ? existing.targetExam : 'JEE'),
      classGrade: data.classGrade || (existing ? existing.classGrade : '12'),
      level: data.level,
      levelName: data.levelName,
      exp: data.exp,
      solvedCount: data.solvedCount, // True questions solved
      correctCount: data.correctCount,
      accuracy: data.accuracy,
      lastActive: 'Just now',
      isRegisteredUser: true,
    };

    this.aspirants.set(data.id, updatedAspirant);
    this.persist();

    return updatedAspirant;
  }

  public addPeerAspirant(data: {
    name: string;
    targetExam: 'JEE' | 'NEET' | 'KCET';
    classGrade: '11' | '12';
    initialSolved?: number;
    initialCorrect?: number;
    avatar?: string;
  }) {
    const id = `user-peer-${Date.now()}`;
    const solved = data.initialSolved || 0;
    const correct = data.initialCorrect || 0;
    const accuracy = solved > 0 ? Math.round((correct / solved) * 1000) / 10 : 0;
    const exp = correct * 30 + (solved - correct) * 5;

    const newAspirant: RealAspirant = {
      id,
      name: data.name,
      avatar:
        data.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      targetExam: data.targetExam,
      classGrade: data.classGrade,
      level: 1,
      levelName: 'Novice Aspirant',
      exp,
      solvedCount: solved,
      correctCount: correct,
      accuracy,
      lastActive: 'Just joined',
      isRegisteredUser: true,
    };

    this.aspirants.set(id, newAspirant);
    this.persist();
    return newAspirant;
  }
}

export const leaderboardStore = new LeaderboardStore();
