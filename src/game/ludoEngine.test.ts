import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAIN_TRACK_COORDS,
  SAFE_TRACK_INDICES,
  START_TRACK_INDEX,
  getGlobalTrackIndex,
} from './boardGeometry';
import {
  applyTokenMove,
  chooseBotToken,
  createInitialMatch,
  getCurrentPlayerColor,
  getLegalTokenIds,
  getStandings,
  resolveDiceRoll,
} from './ludoEngine';

test('board geometry has 52 unique outer track cells and 8 safe indices', () => {
  assert.equal(MAIN_TRACK_COORDS.length, 52);
  const unique = new Set(MAIN_TRACK_COORDS.map((c) => `${c.row},${c.col}`));
  assert.equal(unique.size, 52);
  assert.equal(SAFE_TRACK_INDICES.size, 8);
});

test('2-player setup uses opposing diagonal red and yellow corners', () => {
  const match = createInitialMatch(2, { yellow: 'bot' });
  assert.deepEqual(match.activeColors, ['red', 'yellow']);
  assert.equal(Object.keys(match.tokens).length, 8);
  assert.equal(match.seats.yellow.kind, 'bot');
  assert.equal(match.seats.red.kind, 'human');
});

test('token can leave home base ONLY when rolling a 6', () => {
  const match = createInitialMatch(2);
  assert.deepEqual(getLegalTokenIds(match.tokens, 'red', 5), []);
  assert.equal(getLegalTokenIds(match.tokens, 'red', 6).length, 4);

  // Rolling 4 passes turn to Yellow
  const roll4 = resolveDiceRoll(match, 4);
  assert.equal(roll4.hasLegalMoves, false);
  assert.equal(getCurrentPlayerColor(roll4.nextState), 'yellow');

  // Rolling 6 allows Red to select a token
  const roll6 = resolveDiceRoll(match, 6);
  assert.equal(roll6.hasLegalMoves, true);
  assert.equal(roll6.nextState.phase, 'SELECT_TOKEN');
  assert.equal(roll6.nextState.legalTokenIds.length, 4);
});

test('extra turn is granted after rolling 6 and moving out of home', () => {
  const match = createInitialMatch(2);
  const { nextState: afterRoll } = resolveDiceRoll(match, 6);
  const { nextState: afterMove, result } = applyTokenMove(afterRoll, 'red-0');

  assert.equal(result.toProgress, 0);
  assert.equal(result.extraTurn, true);
  assert.equal(getCurrentPlayerColor(afterMove), 'red');
  assert.equal(afterMove.phase, 'WAIT_ROLL');
});

test('triple 6 forfeits turn and passes to next player', () => {
  let state = createInitialMatch(3);
  // First 6 -> move token out
  state = resolveDiceRoll(state, 6).nextState;
  state = applyTokenMove(state, 'red-0').nextState;
  assert.equal(state.consecutiveSixes, 1);

  // Second 6 -> move token forward 6
  state = resolveDiceRoll(state, 6).nextState;
  state = applyTokenMove(state, 'red-0').nextState;
  assert.equal(state.consecutiveSixes, 2);

  // Third 6 -> forfeit turn to Green!
  const thirdRoll = resolveDiceRoll(state, 6);
  assert.equal(thirdRoll.threeSixesForfeit, true);
  assert.equal(getCurrentPlayerColor(thirdRoll.nextState), 'green');
  assert.equal(thirdRoll.nextState.consecutiveSixes, 0);
});

test('capturing opponent on non-safe cell sends opponent home and awards bonus turn', () => {
  const match = createInitialMatch(2);
  // Place Red at progress 4 (track index 4, unsafe) and Yellow at progress 30 (track index (26+30)%52 = 4)
  // Actually let's place Yellow at track index 5 => Yellow progress = (5 - 26 + 52) % 52 = 31
  match.tokens['red-0'].progress = 2; // global index 2
  match.tokens['yellow-0'].progress = 31; // global index (26+31)%52 = 5 (unsafe)

  assert.equal(getGlobalTrackIndex('yellow', 31), 5);
  assert.equal(SAFE_TRACK_INDICES.has(5), false);

  const rolled = resolveDiceRoll(match, 3).nextState;
  const { nextState, result } = applyTokenMove(rolled, 'red-0');

  assert.equal(result.toProgress, 5);
  assert.equal(result.capturedTokens.length, 1);
  assert.equal(result.capturedTokens[0].id, 'yellow-0');
  assert.equal(nextState.tokens['yellow-0'].progress, -1);
  assert.equal(result.extraTurn, true);
  assert.equal(getCurrentPlayerColor(nextState), 'red');
  assert.equal(nextState.capturesByColor.red, 1);
});

test('safe cells protect opponent tokens from capture', () => {
  const match = createInitialMatch(2);
  // Track index 8 is a Star safe cell
  // Red progress 8 => global 8. Yellow progress for global 8 => (8 - 26 + 52) % 52 = 34
  match.tokens['red-0'].progress = 5;
  match.tokens['yellow-0'].progress = 34;

  assert.equal(getGlobalTrackIndex('yellow', 34), 8);
  assert.equal(SAFE_TRACK_INDICES.has(8), true);

  const rolled = resolveDiceRoll(match, 3).nextState;
  const { nextState, result } = applyTokenMove(rolled, 'red-0');

  assert.equal(result.capturedTokens.length, 0);
  assert.equal(nextState.tokens['yellow-0'].progress, 34);
  assert.equal(result.extraTurn, false);
  assert.equal(getCurrentPlayerColor(nextState), 'yellow');
});

test('exact roll required to reach goal 56 and finishing all 4 tokens declares winner', () => {
  const match = createInitialMatch(2);
  match.tokens['red-0'].progress = 56;
  match.tokens['red-1'].progress = 56;
  match.tokens['red-2'].progress = 56;
  match.tokens['red-3'].progress = 54;

  // Rolling 3 overshoots 56 -> no legal move
  assert.deepEqual(getLegalTokenIds(match.tokens, 'red', 3), []);

  // Rolling 2 reaches 56 -> wins the game!
  const rolled = resolveDiceRoll(match, 2).nextState;
  const { nextState, result } = applyTokenMove(rolled, 'red-3');

  assert.equal(result.reachedGoal, true);
  assert.equal(result.winner, 'red');
  assert.equal(nextState.phase, 'GAME_OVER');
  assert.equal(nextState.winner, 'red');

  const standings = getStandings(nextState);
  assert.equal(standings[0].color, 'red');
  assert.equal(standings[0].finishedCount, 4);
});

test('computer AI prefers capturing or reaching goal over passive move', () => {
  const match = createInitialMatch(2, { yellow: 'bot' });
  match.currentTurnIndex = 1; // Yellow's turn
  match.tokens['yellow-0'].progress = 53; // needs 3 to finish (56)
  match.tokens['yellow-1'].progress = 10; // safe backup
  match.tokens['red-0'].progress = 10; // global 10

  const rolled = resolveDiceRoll(match, 3).nextState;
  const chosen = chooseBotToken(rolled);
  assert.equal(chosen, 'yellow-0');

  // Verify start index symmetry
  assert.equal(START_TRACK_INDEX.red, 0);
  assert.equal(START_TRACK_INDEX.green, 13);
  assert.equal(START_TRACK_INDEX.yellow, 26);
  assert.equal(START_TRACK_INDEX.blue, 39);
});
