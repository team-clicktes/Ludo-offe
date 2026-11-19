import { PlayerColor, Token } from './types';

export interface GridCoord {
  row: number; // 0..14
  col: number; // 0..14
}

export const COLOR_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

/**
 * Starting global track index (0..51) for each color on the clockwise 52-cell track.
 */
export const START_TRACK_INDEX: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

/**
 * The 8 traditional safe cells on the 52-cell main track:
 * 4 colored starting squares (0, 13, 26, 39) + 4 star squares (8, 21, 34, 47).
 */
export const SAFE_TRACK_INDICES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);
export const STAR_TRACK_INDICES = new Set<number>([8, 21, 34, 47]);

/**
 * Exact 52-cell clockwise outer track on a 15x15 Ludo grid.
 * Index 0 is Red's start square (row 6, col 1).
 */
export const MAIN_TRACK_COORDS: GridCoord[] = [
  // 0..4: Red top-left horizontal going right
  { row: 6, col: 1 }, // 0: Red start (Safe)
  { row: 6, col: 2 },
  { row: 6, col: 3 },
  { row: 6, col: 4 },
  { row: 6, col: 5 },
  // 5..10: Top arm left column going up
  { row: 5, col: 6 },
  { row: 4, col: 6 },
  { row: 3, col: 6 },
  { row: 2, col: 6 }, // 8: Star (Safe)
  { row: 1, col: 6 },
  { row: 0, col: 6 },
  // 11..12: Top bridge
  { row: 0, col: 7 },
  { row: 0, col: 8 },
  // 13..17: Top arm right column going down
  { row: 1, col: 8 }, // 13: Green start (Safe)
  { row: 2, col: 8 },
  { row: 3, col: 8 },
  { row: 4, col: 8 },
  { row: 5, col: 8 },
  // 18..23: Right arm top row going right
  { row: 6, col: 9 },
  { row: 6, col: 10 },
  { row: 6, col: 11 },
  { row: 6, col: 12 }, // 21: Star (Safe)
  { row: 6, col: 13 },
  { row: 6, col: 14 },
  // 24..25: Right bridge
  { row: 7, col: 14 },
  { row: 8, col: 14 },
  // 26..30: Right arm bottom row going left
  { row: 8, col: 13 }, // 26: Yellow start (Safe)
  { row: 8, col: 12 },
  { row: 8, col: 11 },
  { row: 8, col: 10 },
  { row: 8, col: 9 },
  // 31..36: Bottom arm right column going down
  { row: 9, col: 8 },
  { row: 10, col: 8 },
  { row: 11, col: 8 },
  { row: 12, col: 8 }, // 34: Star (Safe)
  { row: 13, col: 8 },
  { row: 14, col: 8 },
  // 37..38: Bottom bridge
  { row: 14, col: 7 },
  { row: 14, col: 6 },
  // 39..43: Bottom arm left column going up
  { row: 13, col: 6 }, // 39: Blue start (Safe)
  { row: 12, col: 6 },
  { row: 11, col: 6 },
  { row: 10, col: 6 },
  { row: 9, col: 6 },
  // 44..49: Left arm bottom row going left
  { row: 8, col: 5 },
  { row: 8, col: 4 },
  { row: 8, col: 3 },
  { row: 8, col: 2 }, // 47: Star (Safe)
  { row: 8, col: 1 },
  { row: 8, col: 0 },
  // 50..51: Left bridge
  { row: 7, col: 0 },
  { row: 6, col: 0 },
];

/**
 * 5-cell colored home stretch lanes (progress 51..55).
 */
export const HOME_LANE_COORDS: Record<PlayerColor, GridCoord[]> = {
  red: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
  ],
  green: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
  ],
  yellow: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
  ],
  blue: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
  ],
};

/**
 * Token center coordinates inside each 6x6 colored base yard (in 0..15 grid units).
 */
export const HOME_YARD_POSITIONS: Record<PlayerColor, Array<{ x: number; y: number }>> = {
  red: [
    { x: 2.0, y: 2.0 },
    { x: 4.0, y: 2.0 },
    { x: 2.0, y: 4.0 },
    { x: 4.0, y: 4.0 },
  ],
  green: [
    { x: 11.0, y: 2.0 },
    { x: 13.0, y: 2.0 },
    { x: 11.0, y: 4.0 },
    { x: 13.0, y: 4.0 },
  ],
  yellow: [
    { x: 11.0, y: 11.0 },
    { x: 13.0, y: 11.0 },
    { x: 11.0, y: 13.0 },
    { x: 13.0, y: 13.0 },
  ],
  blue: [
    { x: 2.0, y: 11.0 },
    { x: 4.0, y: 11.0 },
    { x: 2.0, y: 13.0 },
    { x: 4.0, y: 13.0 },
  ],
};

/**
 * Center home goal triangle resting spots (in 0..15 grid units).
 */
export const GOAL_POSITIONS: Record<PlayerColor, { x: number; y: number }> = {
  red: { x: 6.55, y: 7.5 },
  green: { x: 7.5, y: 6.55 },
  yellow: { x: 8.45, y: 7.5 },
  blue: { x: 7.5, y: 8.45 },
};

/**
 * Converts (color, progress) into global 0..51 track index if token is on the outer track,
 * or null if in yard (-1), home lane (51..55), or goal (56).
 */
export function getGlobalTrackIndex(color: PlayerColor, progress: number): number | null {
  if (progress < 0 || progress > 50) {
    return null;
  }
  return (START_TRACK_INDEX[color] + progress) % 52;
}

/**
 * Returns the continuous (x, y) position in 0..15 board grid coordinates for a token.
 */
export function getTokenBoardPoint(token: Token): { x: number; y: number } {
  if (token.progress < 0) {
    return HOME_YARD_POSITIONS[token.color][token.index];
  }
  if (token.progress <= 50) {
    const idx = getGlobalTrackIndex(token.color, token.progress)!;
    const coord = MAIN_TRACK_COORDS[idx];
    return { x: coord.col + 0.5, y: coord.row + 0.5 };
  }
  if (token.progress <= 55) {
    const laneIdx = token.progress - 51;
    const coord = HOME_LANE_COORDS[token.color][laneIdx];
    return { x: coord.col + 0.5, y: coord.row + 0.5 };
  }
  return GOAL_POSITIONS[token.color];
}

/**
 * Returns a cell key for grouping co-located tokens so we can fan them out neatly.
 */
export function getTokenCellKey(token: Token): string {
  if (token.progress < 0) {
    return `yard-${token.color}-${token.index}`;
  }
  if (token.progress <= 50) {
    return `track-${getGlobalTrackIndex(token.color, token.progress)}`;
  }
  if (token.progress <= 55) {
    return `lane-${token.color}-${token.progress}`;
  }
  return `goal-${token.color}`;
}

export const PLAYER_THEME: Record<
  PlayerColor,
  {
    label: string;
    primary: string;
    dark: string;
    light: string;
    glow: string;
    badgeBg: string;
    textAccent: string;
  }
> = {
  red: {
    label: 'Red',
    primary: '#ef4444',
    dark: '#991b1b',
    light: '#fca5a5',
    glow: 'rgba(239, 68, 68, 0.55)',
    badgeBg: 'from-red-500 to-red-700',
    textAccent: 'text-red-300',
  },
  green: {
    label: 'Green',
    primary: '#22c55e',
    dark: '#166534',
    light: '#86efac',
    glow: 'rgba(34, 197, 94, 0.55)',
    badgeBg: 'from-emerald-500 to-emerald-700',
    textAccent: 'text-emerald-300',
  },
  yellow: {
    label: 'Yellow',
    primary: '#facc15',
    dark: '#a16207',
    light: '#fef08a',
    glow: 'rgba(250, 204, 21, 0.6)',
    badgeBg: 'from-amber-400 to-amber-600',
    textAccent: 'text-amber-300',
  },
  blue: {
    label: 'Blue',
    primary: '#3b82f6',
    dark: '#1e40af',
    light: '#93c5fd',
    glow: 'rgba(59, 130, 246, 0.55)',
    badgeBg: 'from-blue-500 to-blue-700',
    textAccent: 'text-blue-300',
  },
};
