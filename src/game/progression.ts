import {
  BoardThemeId,
  DiceSkinId,
  PlayerProfileStats,
} from './types';

export interface LevelInfo {
  level: number;
  currentXpInLevel: number;
  xpForNextLevel: number;
  progressPct: number;
  title: string;
}

export function getLevelTitle(level: number): string {
  if (level >= 15) return 'Grandmaster';
  if (level >= 10) return 'Royal Champion';
  if (level >= 6) return 'Star Tactician';
  if (level >= 3) return 'Rising Star';
  return 'Challenger';
}

export function calculateLevelInfo(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  let level = 1;
  let remaining = safeXp;
  let needed = 100;

  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = 100 + (level - 1) * 50;
  }

  return {
    level,
    currentXpInLevel: remaining,
    xpForNextLevel: needed,
    progressPct: Math.min(100, Math.round((remaining / needed) * 100)),
    title: getLevelTitle(level),
  };
}

export const DAILY_REWARD_AMOUNTS = [100, 150, 200, 300, 400, 500, 1000] as const;

export const FREE_COINS_AMOUNT = 60;
export const FREE_COINS_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
export const VIDEO_EARN_AMOUNT = 120;
export const PAID_SPIN_COST = 50;

export const SPIN_PRIZES = [50, 100, 250, 75, 500, 150] as const;

export function getLocalDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function canClaimDailyReward(
  profile: PlayerProfileStats,
  now: Date = new Date()
): boolean {
  const today = getLocalDateKey(now);
  return profile.lastDailyClaimDate !== today;
}

export function getFreeCoinsRemainingMs(
  profile: PlayerProfileStats,
  nowMs: number = Date.now()
): number {
  const elapsed = nowMs - profile.lastFreeCoinsAt;
  return Math.max(0, FREE_COINS_COOLDOWN_MS - elapsed);
}

export function canFreeSpinToday(
  profile: PlayerProfileStats,
  now: Date = new Date()
): boolean {
  const today = getLocalDateKey(now);
  return profile.lastFreeSpinDate !== today;
}

export interface AchievementDef {
  id: string;
  title: string;
  titleUr: string;
  desc: string;
  descUr: string;
  target: number;
  rewardCoins: number;
  rewardXp: number;
  getValue: (p: PlayerProfileStats) => number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_match',
    title: 'First Roll',
    titleUr: 'پہلا میچ',
    desc: 'Complete 1 offline match',
    descUr: '1 آف لائن میچ مکمل کریں',
    target: 1,
    rewardCoins: 100,
    rewardXp: 40,
    getValue: (p) => p.gamesPlayed,
  },
  {
    id: 'first_win',
    title: 'Crown Victor',
    titleUr: 'پہلی جیت',
    desc: 'Win 1 offline match',
    descUr: '1 آف لائن میچ جیتیں',
    target: 1,
    rewardCoins: 200,
    rewardXp: 80,
    getValue: (p) => p.gamesWon,
  },
  {
    id: 'captures_5',
    title: 'Token Hunter',
    titleUr: 'گوٹی شکار',
    desc: 'Capture 5 opponent tokens',
    descUr: 'مخالف کی 5 گوٹیاں پکڑیں',
    target: 5,
    rewardCoins: 250,
    rewardXp: 90,
    getValue: (p) => p.totalCaptures,
  },
  {
    id: 'goals_8',
    title: 'Home Runner',
    titleUr: 'گھر کی دوڑ',
    desc: 'Send 8 tokens to the center crown',
    descUr: '8 گوٹیاں مرکز تک پہنچائیں',
    target: 8,
    rewardCoins: 300,
    rewardXp: 100,
    getValue: (p) => p.totalGoals,
  },
  {
    id: 'wins_5',
    title: 'Ludo Champion',
    titleUr: 'لوڈو چیمپئن',
    desc: 'Win 5 offline matches',
    descUr: '5 آف لائن میچ جیتیں',
    target: 5,
    rewardCoins: 500,
    rewardXp: 180,
    getValue: (p) => p.gamesWon,
  },
  {
    id: 'spins_3',
    title: 'Lucky Spinner',
    titleUr: 'خوش قسمت اسپنر',
    desc: 'Spin the prize wheel 3 times',
    descUr: 'انعامات کا پہیہ 3 بار گھمائیں',
    target: 3,
    rewardCoins: 150,
    rewardXp: 60,
    getValue: (p) => p.totalSpins,
  },
];

export interface TrophyDef {
  id: string;
  name: string;
  nameUr: string;
  requirement: string;
  requirementUr: string;
  isUnlocked: (p: PlayerProfileStats) => boolean;
  accent: string;
}

export const TROPHIES: TrophyDef[] = [
  {
    id: 'bronze_cup',
    name: 'Bronze Challenger',
    nameUr: 'کانسی کا کپ',
    requirement: 'Win 1 match',
    requirementUr: '1 میچ جیتیں',
    isUnlocked: (p) => p.gamesWon >= 1,
    accent: '#d97706',
  },
  {
    id: 'silver_cup',
    name: 'Silver Tactician',
    nameUr: 'چاندی کا کپ',
    requirement: 'Win 3 matches',
    requirementUr: '3 میچ جیتیں',
    isUnlocked: (p) => p.gamesWon >= 3,
    accent: '#cbd5e1',
  },
  {
    id: 'gold_cup',
    name: 'Golden Star',
    nameUr: 'سنہری ستارہ',
    requirement: 'Reach Level 5',
    requirementUr: 'لیول 5 حاصل کریں',
    isUnlocked: (p) => calculateLevelInfo(p.xp).level >= 5,
    accent: '#facc15',
  },
  {
    id: 'royal_crown',
    name: 'Royal Legend',
    nameUr: 'شاہی لیجنڈ',
    requirement: 'Capture 15 tokens',
    requirementUr: '15 گوٹیاں پکڑیں',
    isUnlocked: (p) => p.totalCaptures >= 15,
    accent: '#a855f7',
  },
];

export interface BoardThemeDef {
  id: BoardThemeId;
  name: string;
  nameUr: string;
  price: number;
  frameGradient: string;
  frameShadow: string;
  backdropGradient: string;
  previewPrimary: string;
  previewSecondary: string;
}

export const BOARD_THEMES: BoardThemeDef[] = [
  {
    id: 'royal',
    name: 'Royal Indigo',
    nameUr: 'شاہی نیلا',
    price: 0,
    frameGradient: 'linear-gradient(145deg, #fbbf24 0%, #d97706 48%, #92400e 100%)',
    frameShadow: '#6b2f06',
    backdropGradient: 'linear-gradient(180deg, #16195c 0%, #1e1354 48%, #130b38 100%)',
    previewPrimary: '#312e81',
    previewSecondary: '#fbbf24',
  },
  {
    id: 'emerald',
    name: 'Emerald Palace',
    nameUr: 'زمرد محل',
    price: 300,
    frameGradient: 'linear-gradient(145deg, #6ee7b7 0%, #059669 48%, #064e3b 100%)',
    frameShadow: '#022c22',
    backdropGradient: 'linear-gradient(180deg, #0b3b36 0%, #11244d 55%, #07192e 100%)',
    previewPrimary: '#047857',
    previewSecondary: '#6ee7b7',
  },
  {
    id: 'crimson',
    name: 'Ruby Sultan',
    nameUr: 'یاقوت سلطان',
    price: 500,
    frameGradient: 'linear-gradient(145deg, #fda4af 0%, #be123c 48%, #881337 100%)',
    frameShadow: '#4c0519',
    backdropGradient: 'linear-gradient(180deg, #3b0d3c 0%, #26114d 55%, #160728 100%)',
    previewPrimary: '#be123c',
    previewSecondary: '#fda4af',
  },
  {
    id: 'obsidian',
    name: 'Midnight Gold',
    nameUr: 'سیاہ و سنہری',
    price: 800,
    frameGradient: 'linear-gradient(145deg, #fef08a 0%, #ca8a04 45%, #1e293b 100%)',
    frameShadow: '#0f172a',
    backdropGradient: 'linear-gradient(180deg, #111827 0%, #1e1b4b 55%, #090d1f 100%)',
    previewPrimary: '#0f172a',
    previewSecondary: '#facc15',
  },
];

export interface DiceSkinDef {
  id: DiceSkinId;
  name: string;
  nameUr: string;
  price: number;
  faceBg: string;
  pipColor: string;
  aceColor: string;
}

export const DICE_SKINS: DiceSkinDef[] = [
  {
    id: 'ivory',
    name: 'Classic Ivory',
    nameUr: 'کلاسک سفید',
    price: 0,
    faceBg: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 65%, #cbd5e1 100%)',
    pipColor: '#1e293b',
    aceColor: '#dc2626',
  },
  {
    id: 'gold',
    name: 'Royal Gold',
    nameUr: 'شاہی سنہری',
    price: 400,
    faceBg: 'linear-gradient(145deg, #fef9c3 0%, #facc15 60%, #b45309 100%)',
    pipColor: '#451a03',
    aceColor: '#991b1b',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Gem',
    nameUr: 'نیلم ڈائس',
    price: 600,
    faceBg: 'linear-gradient(145deg, #dbeafe 0%, #3b82f6 65%, #1e3a8a 100%)',
    pipColor: '#ffffff',
    aceColor: '#fde047',
  },
];

export const AVATAR_OPTIONS = [
  { id: 'crown', label: 'Crown' },
  { id: 'star', label: 'Star' },
  { id: 'shield', label: 'Knight' },
  { id: 'trophy', label: 'Champion' },
] as const;
