import { AppLanguage } from '../game/types';

export interface Translations {
  offlineBadge: string;
  selectPlayers: string;
  passAndPlay: string;
  vsComputer: string;
  playersLabel: string;
  playOffline: string;
  resumeMatch: string;
  howToPlay: string;
  settings: string;
  tabHome: string;
  tabRewards: string;
  tabShop: string;
  tabStats: string;
  tabSettings: string;
  rewardsTitle: string;
  dailyRewards: string;
  freeCoins: string;
  spinAndWin: string;
  watchEarn: string;
  achievements: string;
  trophies: string;
  claim: string;
  claimed: string;
  spinNow: string;
  spinFor: string;
  shopTitle: string;
  themesSection: string;
  diceSection: string;
  equipped: string;
  equip: string;
  unlock: string;
  statsTitle: string;
  matchesPlayed: string;
  matchesWon: string;
  winRate: string;
  captures: string;
  goalsScored: string;
  bestStreak: string;
  recentMatches: string;
  noMatchesYet: string;
  settingsTitle: string;
  musicLabel: string;
  soundLabel: string;
  vibrationLabel: string;
  fastBotLabel: string;
  languageLabel: string;
  privacyPolicy: string;
  resetGame: string;
  confirmReset: string;
  playerProfile: string;
  playerName: string;
  saveProfile: string;
  levelLabel: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  en: {
    offlineBadge: 'Classic Royal Board Game · 100% Offline',
    selectPlayers: 'Select Players',
    passAndPlay: 'Pass & Play',
    vsComputer: 'vs Computer',
    playersLabel: 'Players',
    playOffline: 'PLAY OFFLINE',
    resumeMatch: 'Resume Saved Match',
    howToPlay: 'How to Play',
    settings: 'Settings',
    tabHome: 'Home',
    tabRewards: 'Rewards',
    tabShop: 'Shop',
    tabStats: 'Stats',
    tabSettings: 'Settings',
    rewardsTitle: 'Rewards & Trophies',
    dailyRewards: 'Daily Rewards',
    freeCoins: 'Free Coins',
    spinAndWin: 'Spin & Win',
    watchEarn: 'Watch Video & Earn',
    achievements: 'Achievements',
    trophies: 'Trophies',
    claim: 'Claim',
    claimed: 'Claimed',
    spinNow: 'Free Spin',
    spinFor: 'Spin (50 Coins)',
    shopTitle: 'Themes & Shop',
    themesSection: 'Board Themes',
    diceSection: '3D Dice Styles',
    equipped: 'Equipped',
    equip: 'Equip',
    unlock: 'Buy',
    statsTitle: 'Player Statistics',
    matchesPlayed: 'Matches',
    matchesWon: 'Wins',
    winRate: 'Win Rate',
    captures: 'Captures',
    goalsScored: 'Goals',
    bestStreak: 'Best Streak',
    recentMatches: 'Recent Offline Matches',
    noMatchesYet: 'Play your first offline match to record stats!',
    settingsTitle: 'Settings',
    musicLabel: 'Music',
    soundLabel: 'Sound',
    vibrationLabel: 'Vibration',
    fastBotLabel: 'Fast CPU Turns',
    languageLabel: 'Language',
    privacyPolicy: 'Privacy Policy',
    resetGame: 'Reset Game',
    confirmReset: 'Tap Again to Confirm Reset',
    playerProfile: 'Player Profile',
    playerName: 'Player Name',
    saveProfile: 'Save Profile',
    levelLabel: 'Level',
  },
  ur: {
    offlineBadge: 'کلاسک شاہی لوڈو · 100% آف لائن گیم',
    selectPlayers: 'کھلاڑی منتخب کریں',
    passAndPlay: 'پاس اینڈ پلے',
    vsComputer: 'کمپیوٹر کے خلاف',
    playersLabel: 'کھلاڑی',
    playOffline: 'آف لائن کھیلیں',
    resumeMatch: 'پچھلا میچ جاری رکھیں',
    howToPlay: 'کھیلنے کا طریقہ',
    settings: 'سیٹنگز',
    tabHome: 'ہوم',
    tabRewards: 'انعامات',
    tabShop: 'شاپ',
    tabStats: 'اعدادوشمار',
    tabSettings: 'سیٹنگز',
    rewardsTitle: 'انعامات اور ٹرافیاں',
    dailyRewards: 'روزانہ انعامات',
    freeCoins: 'مفت سکے',
    spinAndWin: 'اسپن اینڈ ون',
    watchEarn: 'ویڈیو دیکھیں اور کمائیں',
    achievements: 'کامیابیاں',
    trophies: 'ٹرافیاں',
    claim: 'حاصل کریں',
    claimed: 'حاصل شدہ',
    spinNow: 'مفت اسپن',
    spinFor: 'اسپن (50 سکے)',
    shopTitle: 'تھیمز اور شاپ',
    themesSection: 'بورڈ تھیمز',
    diceSection: '3D ڈائس اسٹائل',
    equipped: 'فعال',
    equip: 'منتخب کریں',
    unlock: 'خریدیں',
    statsTitle: 'کھلاڑی کے اعدادوشمار',
    matchesPlayed: 'کل میچ',
    matchesWon: 'جیتے',
    winRate: 'جیت کی شرح',
    captures: 'پکڑی گوٹیاں',
    goalsScored: 'مکمل گوٹیاں',
    bestStreak: 'بہترین تسلسل',
    recentMatches: 'حالیہ آف لائن میچز',
    noMatchesYet: 'اعدادوشمار دیکھنے کے لیے اپنا پہلا میچ کھیلیں!',
    settingsTitle: 'سیٹنگز',
    musicLabel: 'میوزک',
    soundLabel: 'ساؤنڈ',
    vibrationLabel: 'وائبریشن',
    fastBotLabel: 'تیز کمپیوٹر باری',
    languageLabel: 'زبان',
    privacyPolicy: 'پرائیویسی پالیسی',
    resetGame: 'گیم ری سیٹ کریں',
    confirmReset: 'تصدیق کے لیے دوبارہ دبائیں',
    playerProfile: 'کھلاڑی پروفائل',
    playerName: 'کھلاڑی کا نام',
    saveProfile: 'محفوظ کریں',
    levelLabel: 'لیول',
  },
};
