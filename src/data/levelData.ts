import { LevelDefinition } from '../types';

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  {
    level: 1,
    name: 'Novice Aspirant',
    minExp: 0,
    maxExp: 200,
    badge: '🌱',
    color: 'from-slate-600 to-slate-700',
    perk: 'Unlocked standard Class 11 & 12 PYQ practice bank',
  },
  {
    level: 2,
    name: 'Concept Explorer',
    minExp: 201,
    maxExp: 500,
    badge: '🧭',
    color: 'from-emerald-600 to-teal-700',
    perk: 'Unlocked chapter-wise diagnostic test generator',
  },
  {
    level: 3,
    name: 'Formula Apprentice',
    minExp: 501,
    maxExp: 1000,
    badge: '⚡',
    color: 'from-blue-600 to-indigo-700',
    perk: 'Unlocked step-by-step formula breakdown view',
  },
  {
    level: 4,
    name: 'Problem Solver',
    minExp: 1001,
    maxExp: 1800,
    badge: '🎯',
    color: 'from-indigo-600 to-purple-700',
    perk: 'Speed-solve mode with custom timer controls',
  },
  {
    level: 5,
    name: 'Rank Contender',
    minExp: 1801,
    maxExp: 2800,
    badge: '🔥',
    color: 'from-violet-600 to-fuchsia-700',
    perk: 'Custom mock test simulations with negative marking',
  },
  {
    level: 6,
    name: 'Exam Strategist',
    minExp: 2801,
    maxExp: 4200,
    badge: '🛡️',
    color: 'from-amber-600 to-orange-700',
    perk: 'Deep accuracy & weak-chapter diagnostic analytics',
  },
  {
    level: 7,
    name: 'Subject Scholar',
    minExp: 4201,
    maxExp: 6000,
    badge: '🎓',
    color: 'from-orange-600 to-red-700',
    perk: 'AI Study Assistant Priority high-yield topic hints',
  },
  {
    level: 8,
    name: 'Top Percentiler',
    minExp: 6001,
    maxExp: 8200,
    badge: '🌟',
    color: 'from-rose-600 to-pink-700',
    perk: 'Advanced multi-concept JEE Advanced & NEET top rankers bank',
  },
  {
    level: 9,
    name: 'Grandmaster',
    minExp: 8201,
    maxExp: 11000,
    badge: '👑',
    color: 'from-purple-700 to-indigo-950',
    perk: 'Golden nameplate on global leaderboard & elite ranking',
  },
  {
    level: 10,
    name: 'AIR 1 Prodigy',
    minExp: 11001,
    maxExp: 999999,
    badge: '🏆',
    color: 'from-amber-500 via-yellow-400 to-amber-600',
    perk: 'Pinnacle Mastery: Immortalized on the Hall of Fame',
  },
];

export function getLevelForExp(exp: number): LevelDefinition {
  for (let i = LEVEL_DEFINITIONS.length - 1; i >= 0; i--) {
    if (exp >= LEVEL_DEFINITIONS[i].minExp) {
      return LEVEL_DEFINITIONS[i];
    }
  }
  return LEVEL_DEFINITIONS[0];
}
