import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACHIEVEMENTS,
  BOARD_THEMES,
  DAILY_REWARD_AMOUNTS,
  TROPHIES,
  calculateLevelInfo,
  canClaimDailyReward,
  canFreeSpinToday,
  getFreeCoinsRemainingMs,
  getLocalDateKey,
} from './progression';
import { PlayerProfileStats } from './types';

function makeProfile(overrides: Partial<PlayerProfileStats> = {}): PlayerProfileStats {
  return {
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
    ...overrides,
  };
}

test('XP and Level scaling advances cleanly across thresholds', () => {
  const lv1 = calculateLevelInfo(0);
  assert.equal(lv1.level, 1);
  assert.equal(lv1.xpForNextLevel, 100);
  assert.equal(lv1.progressPct, 0);

  // 100 XP reaches Level 2 (next level needs 150)
  const lv2 = calculateLevelInfo(100);
  assert.equal(lv2.level, 2);
  assert.equal(lv2.currentXpInLevel, 0);
  assert.equal(lv2.xpForNextLevel, 150);

  // 100 + 150 = 250 XP reaches Level 3
  const lv3 = calculateLevelInfo(275);
  assert.equal(lv3.level, 3);
  assert.equal(lv3.currentXpInLevel, 25);
});

test('Daily reward and free spin enforce once-per-day local date checks', () => {
  const now = new Date('2026-11-18T10:00:00Z');
  const todayKey = getLocalDateKey(now);

  const fresh = makeProfile();
  assert.equal(canClaimDailyReward(fresh, now), true);
  assert.equal(canFreeSpinToday(fresh, now), true);

  const claimed = makeProfile({
    lastDailyClaimDate: todayKey,
    lastFreeSpinDate: todayKey,
  });
  assert.equal(canClaimDailyReward(claimed, now), false);
  assert.equal(canFreeSpinToday(claimed, now), false);
  assert.equal(DAILY_REWARD_AMOUNTS.length, 7);
});

test('Free coins cooldown returns 0 when ready and positive ms while cooling down', () => {
  const nowMs = 1_700_000_000_000;
  const ready = makeProfile({ lastFreeCoinsAt: 0 });
  assert.equal(getFreeCoinsRemainingMs(ready, nowMs), 0);

  const recent = makeProfile({ lastFreeCoinsAt: nowMs - 60_000 });
  assert.ok(getFreeCoinsRemainingMs(recent, nowMs) > 0);
});

test('Achievements and Trophies unlock based on real player stats', () => {
  const starter = makeProfile();
  assert.equal(TROPHIES[0].isUnlocked(starter), false);

  const veteran = makeProfile({
    gamesPlayed: 4,
    gamesWon: 3,
    totalCaptures: 6,
    totalGoals: 12,
    xp: 750,
  });
  assert.equal(TROPHIES[0].isUnlocked(veteran), true);
  assert.equal(TROPHIES[1].isUnlocked(veteran), true);
  assert.equal(ACHIEVEMENTS.find((a) => a.id === 'captures_5')!.getValue(veteran), 6);
  assert.equal(BOARD_THEMES.length, 4);
});
