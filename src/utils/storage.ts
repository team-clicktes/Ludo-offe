import { MatchState, PlayerProfileStats, SettingsState } from '../game/types';

const MATCH_KEY = 'ludo_star_saved_match_v1';
const SETTINGS_KEY = 'ludo_star_settings_v1';
const PROFILE_KEY = 'ludo_star_profile_v1';

export const DEFAULT_SETTINGS: SettingsState = {
  soundEnabled: true,
  musicEnabled: false,
  fastBot: false,
  vibrationEnabled: true,
  language: 'en',
};

export const DEFAULT_PROFILE: PlayerProfileStats = {
  playerName: 'Player 1',
  avatarId: 'crown',
  xp: 0,
  coins: 500,
  gamesPlayed: 0,
  gamesWon: 0,
  totalCaptures: 0,
  totalGoals: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  totalSpins: 0,
  dailyStreak: 0,
  lastDailyClaimDate: null,
  lastFreeCoinsAt: 0,
  lastFreeSpinDate: null,
  unlockedThemes: ['royal'],
  equippedTheme: 'royal',
  unlockedDice: ['ivory'],
  equippedDice: 'ivory',
  claimedAchievements: [],
  history: [],
};

export function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SettingsState): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadProfile(): PlayerProfileStats {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      unlockedThemes: Array.isArray(parsed?.unlockedThemes) && parsed.unlockedThemes.length
        ? parsed.unlockedThemes
        : DEFAULT_PROFILE.unlockedThemes,
      unlockedDice: Array.isArray(parsed?.unlockedDice) && parsed.unlockedDice.length
        ? parsed.unlockedDice
        : DEFAULT_PROFILE.unlockedDice,
      claimedAchievements: Array.isArray(parsed?.claimedAchievements)
        ? parsed.claimedAchievements
        : [],
      history: Array.isArray(parsed?.history) ? parsed.history : [],
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: PlayerProfileStats): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore
  }
}

export function loadSavedMatch(): MatchState | null {
  try {
    const raw = localStorage.getItem(MATCH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MatchState;
    if (!parsed || !parsed.tokens || !parsed.activeColors) return null;
    if (parsed.phase === 'GAME_OVER') return null;
    if (parsed.phase === 'ROLLING' || parsed.phase === 'MOVING') {
      parsed.phase = parsed.legalTokenIds?.length ? 'SELECT_TOKEN' : 'WAIT_ROLL';
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveMatchProgress(match: MatchState | null): void {
  try {
    if (!match || match.phase === 'GAME_OVER') {
      localStorage.removeItem(MATCH_KEY);
      return;
    }
    localStorage.setItem(MATCH_KEY, JSON.stringify(match));
  } catch {
    // Ignore
  }
}
