import {
  COLOR_ORDER,
  SAFE_TRACK_INDICES,
  START_TRACK_INDEX,
  getGlobalTrackIndex,
} from './boardGeometry';
import {
  MatchState,
  MoveResult,
  PlayerColor,
  PlayerCount,
  PlayerKind,
  PlayerSeat,
  StandingEntry,
  Token,
} from './types';

export function getActiveColorsForCount(count: PlayerCount): PlayerColor[] {
  if (count === 2) {
    // Traditional diagonal opposing corners for balanced 2-player Ludo
    return ['red', 'yellow'];
  }
  if (count === 3) {
    return ['red', 'green', 'yellow'];
  }
  return ['red', 'green', 'yellow', 'blue'];
}

export function createInitialMatch(
  playerCount: PlayerCount,
  seatKinds: Partial<Record<PlayerColor, PlayerKind>> = {},
  customNames: Partial<Record<PlayerColor, string>> = {}
): MatchState {
  const activeColors = getActiveColorsForCount(playerCount);

  const seats = {} as Record<PlayerColor, PlayerSeat>;
  const capturesByColor = {} as Record<PlayerColor, number>;
  const tokens: Record<string, Token> = {};

  for (const color of COLOR_ORDER) {
    const active = activeColors.includes(color);
    const kind: PlayerKind = color === 'red' ? 'human' : seatKinds[color] ?? 'human';
    const defaultLabel =
      color.charAt(0).toUpperCase() + color.slice(1) + (kind === 'bot' ? ' Bot' : '');
    seats[color] = {
      color,
      name: customNames[color] ?? defaultLabel,
      kind,
      active,
    };
    capturesByColor[color] = 0;

    if (active) {
      for (let i = 0; i < 4; i++) {
        const id = `${color}-${i}`;
        tokens[id] = {
          id,
          color,
          index: i,
          progress: -1,
        };
      }
    }
  }

  return {
    id: `match-${Date.now()}`,
    playerCount,
    activeColors,
    seats,
    tokens,
    currentTurnIndex: 0,
    phase: 'WAIT_ROLL',
    diceValue: null,
    consecutiveSixes: 0,
    legalTokenIds: [],
    winner: null,
    finishOrder: [],
    statusMessage: `${seats[activeColors[0]].name}'s Turn · Roll Dice`,
    turnNumber: 1,
    capturesByColor,
  };
}

export function getCurrentPlayerColor(state: MatchState): PlayerColor {
  return state.activeColors[state.currentTurnIndex];
}

export function rollDiceValue(rng: () => number = Math.random): number {
  return Math.floor(rng() * 6) + 1;
}

export function canTokenMove(token: Token, diceValue: number): boolean {
  if (diceValue < 1 || diceValue > 6) return false;
  if (token.progress === -1) {
    return diceValue === 6;
  }
  if (token.progress >= 56) {
    return false;
  }
  return token.progress + diceValue <= 56;
}

export function getLegalTokenIds(
  tokens: Record<string, Token>,
  color: PlayerColor,
  diceValue: number
): string[] {
  return Object.values(tokens)
    .filter((t) => t.color === color && canTokenMove(t, diceValue))
    .map((t) => t.id);
}

export function getTokenTargetProgress(currentProgress: number, diceValue: number): number {
  if (currentProgress === -1) {
    return diceValue === 6 ? 0 : -1;
  }
  return currentProgress + diceValue;
}

export function getTokenStepSequence(fromProgress: number, diceValue: number): number[] {
  if (fromProgress === -1) {
    return diceValue === 6 ? [0] : [];
  }
  const steps: number[] = [];
  for (let s = 1; s <= diceValue; s++) {
    steps.push(fromProgress + s);
  }
  return steps;
}

export function getNextTurnIndex(state: MatchState): number {
  const count = state.activeColors.length;
  for (let offset = 1; offset <= count; offset++) {
    const idx = (state.currentTurnIndex + offset) % count;
    const color = state.activeColors[idx];
    if (!state.finishOrder.includes(color)) {
      return idx;
    }
  }
  return state.currentTurnIndex;
}

/**
 * Evaluates a dice roll for the current player and computes next turn phase.
 * Handles the traditional 3-consecutive-6s forfeit rule and auto-skipping when no legal move exists.
 */
export function resolveDiceRoll(
  state: MatchState,
  diceValue: number
): {
  nextState: MatchState;
  threeSixesForfeit: boolean;
  hasLegalMoves: boolean;
} {
  const currentColor = getCurrentPlayerColor(state);
  const currentSeat = state.seats[currentColor];
  const nextSixes = diceValue === 6 ? state.consecutiveSixes + 1 : 0;

  // Traditional rule: rolling three 6s in a row forfeits the turn
  if (nextSixes >= 3) {
    const nextIdx = getNextTurnIndex(state);
    const nextColor = state.activeColors[nextIdx];
    return {
      threeSixesForfeit: true,
      hasLegalMoves: false,
      nextState: {
        ...state,
        diceValue,
        consecutiveSixes: 0,
        legalTokenIds: [],
        currentTurnIndex: nextIdx,
        phase: 'WAIT_ROLL',
        turnNumber: state.turnNumber + 1,
        statusMessage: `Triple 6! ${currentSeat.name} forfeits · ${state.seats[nextColor].name}'s Turn`,
      },
    };
  }

  const legalIds = getLegalTokenIds(state.tokens, currentColor, diceValue);

  if (legalIds.length === 0) {
    // If rolled a 6 with no legal moves (rare, e.g., all remaining tokens at 54/55), pass turn
    const nextIdx = getNextTurnIndex(state);
    const nextColor = state.activeColors[nextIdx];
    return {
      threeSixesForfeit: false,
      hasLegalMoves: false,
      nextState: {
        ...state,
        diceValue,
        consecutiveSixes: 0,
        legalTokenIds: [],
        currentTurnIndex: nextIdx,
        phase: 'WAIT_ROLL',
        turnNumber: state.turnNumber + 1,
        statusMessage: `${currentSeat.name} rolled ${diceValue} · No moves · ${state.seats[nextColor].name}'s Turn`,
      },
    };
  }

  return {
    threeSixesForfeit: false,
    hasLegalMoves: true,
    nextState: {
      ...state,
      diceValue,
      consecutiveSixes: nextSixes,
      legalTokenIds: legalIds,
      phase: 'SELECT_TOKEN',
      statusMessage: `${currentSeat.name} rolled ${diceValue} · Select a token`,
    },
  };
}

/**
 * Applies a legal token move and returns the updated state plus move details.
 */
export function applyTokenMove(
  state: MatchState,
  tokenId: string
): { nextState: MatchState; result: MoveResult } {
  const diceValue = state.diceValue;
  if (diceValue === null) {
    throw new Error('Cannot apply move without a dice value');
  }
  const token = state.tokens[tokenId];
  const currentColor = getCurrentPlayerColor(state);

  if (!token || token.color !== currentColor || !canTokenMove(token, diceValue)) {
    throw new Error(`Illegal token move: ${tokenId} for dice ${diceValue}`);
  }

  const fromProgress = token.progress;
  const toProgress = getTokenTargetProgress(fromProgress, diceValue);
  const steps = getTokenStepSequence(fromProgress, diceValue);

  const nextTokens: Record<string, Token> = {
    ...state.tokens,
    [tokenId]: {
      ...token,
      progress: toProgress,
    },
  };

  // Capture check: only on main outer track (0..50) and NOT on safe cells
  const capturedTokens: Token[] = [];
  const landedGlobalIdx = getGlobalTrackIndex(currentColor, toProgress);
  if (landedGlobalIdx !== null && !SAFE_TRACK_INDICES.has(landedGlobalIdx)) {
    for (const other of Object.values(nextTokens)) {
      if (other.color === currentColor) continue;
      const otherIdx = getGlobalTrackIndex(other.color, other.progress);
      if (otherIdx !== null && otherIdx === landedGlobalIdx) {
        capturedTokens.push(other);
        nextTokens[other.id] = {
          ...other,
          progress: -1,
        };
      }
    }
  }

  const reachedGoal = toProgress === 56;
  const nextCapturesByColor = {
    ...state.capturesByColor,
    [currentColor]: state.capturesByColor[currentColor] + capturedTokens.length,
  };

  // Check if current player has finished all 4 tokens
  const finishedTokensCount = Object.values(nextTokens).filter(
    (t) => t.color === currentColor && t.progress === 56
  ).length;

  let nextFinishOrder = [...state.finishOrder];
  if (finishedTokensCount === 4 && !nextFinishOrder.includes(currentColor)) {
    nextFinishOrder.push(currentColor);
  }

  // First player to finish all 4 tokens wins the Ludo Star match
  const winner = nextFinishOrder.length > 0 ? nextFinishOrder[0] : null;

  let coinsEarned = 0;
  if (capturedTokens.length > 0) coinsEarned += capturedTokens.length * 25;
  if (reachedGoal) coinsEarned += 30;
  if (winner === currentColor) coinsEarned += 150;

  if (winner) {
    return {
      result: {
        tokenId,
        color: currentColor,
        fromProgress,
        toProgress,
        steps,
        capturedTokens,
        reachedGoal,
        extraTurn: false,
        threeSixesForfeit: false,
        winner,
        coinsEarned,
      },
      nextState: {
        ...state,
        tokens: nextTokens,
        legalTokenIds: [],
        phase: 'GAME_OVER',
        winner,
        finishOrder: nextFinishOrder,
        capturesByColor: nextCapturesByColor,
        statusMessage: `${state.seats[winner].name} wins the match!`,
      },
    };
  }

  // Extra turn on rolling 6, capturing an opponent, or reaching home goal
  const extraTurn = diceValue === 6 || capturedTokens.length > 0 || reachedGoal;
  const nextTurnIndex = extraTurn ? state.currentTurnIndex : getNextTurnIndex(state);
  const nextColor = state.activeColors[nextTurnIndex];
  const nextSeat = state.seats[nextColor];

  let statusMessage = `${nextSeat.name}'s Turn · Roll Dice`;
  if (capturedTokens.length > 0) {
    statusMessage = `Captured! ${nextSeat.name} gets a Bonus Roll!`;
  } else if (reachedGoal) {
    statusMessage = `Home Goal! ${nextSeat.name} gets a Bonus Roll!`;
  } else if (diceValue === 6) {
    statusMessage = `Rolled 6! ${nextSeat.name} gets a Bonus Roll!`;
  }

  return {
    result: {
      tokenId,
      color: currentColor,
      fromProgress,
      toProgress,
      steps,
      capturedTokens,
      reachedGoal,
      extraTurn,
      threeSixesForfeit: false,
      winner: null,
      coinsEarned,
    },
    nextState: {
      ...state,
      tokens: nextTokens,
      legalTokenIds: [],
      currentTurnIndex: nextTurnIndex,
      phase: 'WAIT_ROLL',
      diceValue: null,
      consecutiveSixes: diceValue === 6 ? state.consecutiveSixes : 0,
      turnNumber: extraTurn ? state.turnNumber : state.turnNumber + 1,
      capturesByColor: nextCapturesByColor,
      finishOrder: nextFinishOrder,
      statusMessage,
    },
  };
}

/**
 * Smart tactical AI heuristic for Computer opponents.
 */
export function chooseBotToken(state: MatchState): string | null {
  const dice = state.diceValue;
  if (dice === null || state.legalTokenIds.length === 0) return null;

  const botColor = getCurrentPlayerColor(state);
  let bestId = state.legalTokenIds[0];
  let bestScore = -Infinity;

  for (const id of state.legalTokenIds) {
    const token = state.tokens[id];
    const targetProgress = getTokenTargetProgress(token.progress, dice);
    let score = 0;

    // 1. Entering the Home Goal is top priority
    if (targetProgress === 56) {
      score += 1000;
    }

    // 2. Capturing an opponent token is huge
    const targetGlobalIdx = getGlobalTrackIndex(botColor, targetProgress);
    if (targetGlobalIdx !== null && !SAFE_TRACK_INDICES.has(targetGlobalIdx)) {
      const oppCount = Object.values(state.tokens).filter((other) => {
        if (other.color === botColor) return false;
        return getGlobalTrackIndex(other.color, other.progress) === targetGlobalIdx;
      }).length;
      if (oppCount > 0) {
        score += 750 * oppCount;
      }
    }

    // 3. Bringing a token out of base on a 6
    if (token.progress === -1 && targetProgress === 0) {
      score += 420;
    }

    // 4. Entering own safe home stretch (51..55)
    if (token.progress <= 50 && targetProgress >= 51) {
      score += 360;
    }

    // 5. Landing on a safe star or start cell
    if (targetGlobalIdx !== null && SAFE_TRACK_INDICES.has(targetGlobalIdx)) {
      score += 220;
    }

    // 6. Leaving a safe cell slightly discouraged unless capturing or entering home
    const currentGlobalIdx = getGlobalTrackIndex(botColor, token.progress);
    if (currentGlobalIdx !== null && SAFE_TRACK_INDICES.has(currentGlobalIdx)) {
      score -= 60;
    }

    // 7. Escaping danger if an opponent is within 1..6 steps behind
    if (currentGlobalIdx !== null && !SAFE_TRACK_INDICES.has(currentGlobalIdx)) {
      const threatened = Object.values(state.tokens).some((other) => {
        if (other.color === botColor) return false;
        const oppIdx = getGlobalTrackIndex(other.color, other.progress);
        if (oppIdx === null) return false;
        const dist = (currentGlobalIdx - oppIdx + 52) % 52;
        return dist >= 1 && dist <= 6;
      });
      if (threatened) {
        score += 180;
      }
    }

    // 8. Slight preference for advancing the leading token
    score += Math.max(0, targetProgress) * 2;

    // 9. Avoid stepping directly onto an opponent's start cell if they have tokens in base
    if (targetGlobalIdx !== null) {
      for (const oppColor of state.activeColors) {
        if (oppColor === botColor) continue;
        if (targetGlobalIdx === START_TRACK_INDEX[oppColor]) {
          score -= 10;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  return bestId;
}

export function getStandings(state: MatchState): StandingEntry[] {
  const entries = state.activeColors.map((color) => {
    const colorTokens = Object.values(state.tokens).filter((t) => t.color === color);
    const finishedCount = colorTokens.filter((t) => t.progress === 56).length;
    const totalProgress = colorTokens.reduce(
      (sum, t) => sum + (t.progress < 0 ? 0 : t.progress),
      0
    );
    return {
      rank: 1,
      color,
      name: state.seats[color].name,
      kind: state.seats[color].kind,
      finishedCount,
      totalProgress,
      captures: state.capturesByColor[color] ?? 0,
    };
  });

  entries.sort((a, b) => {
    const aOrder = state.finishOrder.indexOf(a.color);
    const bOrder = state.finishOrder.indexOf(b.color);
    if (aOrder !== -1 && bOrder !== -1) return aOrder - bOrder;
    if (aOrder !== -1) return -1;
    if (bOrder !== -1) return 1;
    if (b.finishedCount !== a.finishedCount) return b.finishedCount - a.finishedCount;
    return b.totalProgress - a.totalProgress;
  });

  return entries.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
}
