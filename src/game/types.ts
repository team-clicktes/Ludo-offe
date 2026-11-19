export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerKind = 'human' | 'bot';

export type PlayerCount = 2 | 3 | 4;

export type TurnPhase =
  | 'WAIT_ROLL'
  | 'ROLLING'
  | 'SELECT_TOKEN'
  | 'MOVING'
  | 'GAME_OVER';

export type AppScreen = 'title' | 'playing';

export type HomeTab = 'home' | 'rewards' | 'shop' | 'stats' | 'settings';

export type AppLanguage = 'en' | 'ur';

export type BoardThemeId = 'royal' | 'emerald' | 'crimson' | 'obsidian';

export type DiceSkinId = 'ivory' | 'gold' | 'sapphire';

export interface Token {
  id: string;
  color: PlayerColor;
  index: number;
  /**
   * -1 = inside home base yard
   * 0..50 = on the 52-cell main outer track (relative to player's start cell)
   * 51..55 = inside player's colored home stretch lane
   * 56 = reached the central home goal
   */
  progress: number;
}

export interface PlayerSeat {
  color: PlayerColor;
  name: string;
  kind: PlayerKind;
  active: boolean;
}

export interface MoveResult {
  tokenId: string;
  color: PlayerColor;
  fromProgress: number;
  toProgress: number;
  steps: number[];
  capturedTokens: Token[];
  reachedGoal: boolean;
  extraTurn: boolean;
  threeSixesForfeit: boolean;
  winner: PlayerColor | null;
  coinsEarned: number;
}

export interface MatchState {
  id: string;
  playerCount: PlayerCount;
  activeColors: PlayerColor[];
  seats: Record<PlayerColor, PlayerSeat>;
  tokens: Record<string, Token>;
  currentTurnIndex: number;
  phase: TurnPhase;
  diceValue: number | null;
  consecutiveSixes: number;
  legalTokenIds: string[];
  winner: PlayerColor | null;
  finishOrder: PlayerColor[];
  statusMessage: string;
  turnNumber: number;
  capturesByColor: Record<PlayerColor, number>;
}

export interface SettingsState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  fastBot: boolean;
  vibrationEnabled: boolean;
  language: AppLanguage;
}

export interface MatchHistoryItem {
  id: string;
  dateIso: string;
  playerCount: PlayerCount;
  winnerColor: PlayerColor;
  winnerName: string;
  playerWon: boolean;
  captures: number;
  coinsEarned: number;
}

export interface PlayerProfileStats {
  playerName: string;
  avatarId: string;
  xp: number;
  coins: number;
  gamesPlayed: number;
  gamesWon: number;
  totalCaptures: number;
  totalGoals: number;
  currentWinStreak: number;
  bestWinStreak: number;
  totalSpins: number;
  dailyStreak: number;
  lastDailyClaimDate: string | null; // YYYY-MM-DD
  lastFreeCoinsAt: number; // epoch ms
  lastFreeSpinDate: string | null; // YYYY-MM-DD
  unlockedThemes: BoardThemeId[];
  equippedTheme: BoardThemeId;
  unlockedDice: DiceSkinId[];
  equippedDice: DiceSkinId;
  claimedAchievements: string[];
  history: MatchHistoryItem[];
}

export interface StandingEntry {
  rank: number;
  color: PlayerColor;
  name: string;
  kind: PlayerKind;
  finishedCount: number;
  totalProgress: number;
  captures: number;
}
