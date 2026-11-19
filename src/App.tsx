import React, { useCallback, useEffect, useRef, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import { GameplayScreen } from './components/GameplayScreen';
import { HomeScreen } from './components/HomeScreen';
import {
  HowToPlayModal,
  PauseModal,
  PlayerProfileModal,
  PrivacyPolicyModal,
  VictoryModal,
} from './components/Modals';
import { RewardsView } from './components/RewardsView';
import { OfflineReadyBadge } from './components/PWAInstallControl';
import { SettingsView } from './components/SettingsView';
import { ShopThemesView } from './components/ShopThemesView';
import { StatsView } from './components/StatsView';
import { SAFE_TRACK_INDICES, getGlobalTrackIndex, getTokenBoardPoint } from './game/boardGeometry';
import {
  applyTokenMove,
  chooseBotToken,
  createInitialMatch,
  getCurrentPlayerColor,
  getStandings,
  getTokenStepSequence,
  resolveDiceRoll,
  rollDiceValue,
} from './game/ludoEngine';
import {
  BOARD_THEMES,
  DAILY_REWARD_AMOUNTS,
  FREE_COINS_AMOUNT,
  PAID_SPIN_COST,
  VIDEO_EARN_AMOUNT,
  canClaimDailyReward,
  getLocalDateKey,
} from './game/progression';
import {
  AppLanguage,
  AppScreen,
  BoardThemeId,
  DiceSkinId,
  HomeTab,
  MatchState,
  PlayerColor,
  PlayerCount,
  PlayerKind,
  PlayerProfileStats,
  SettingsState,
} from './game/types';
import {
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  loadProfile,
  loadSavedMatch,
  loadSettings,
  saveMatchProgress,
  saveProfile,
  saveSettings,
} from './utils/storage';

const LOBBY_PNG_ASSETS = [
  '/assets/aistudio/file_00000000893c8211b8d12116f4913b2a_ec4d1d0f.png',
  '/assets/aistudio/file_0000000011f88211b5d5825e56a7cce8_a3f12ecf.png',
  '/assets/aistudio/file_00000000a1ac8211a25307a661efe878_40ab8f44.png',
  '/assets/aistudio/file_0000000021008211bf47c43f3cdd40e3_6688e47a.png',
  '/assets/aistudio/file_00000000022c82118584f02db2010b3f_93e85e32.png',
  '/assets/aistudio/file_0000000098348211b642e2ac1c048c5b_50780140.png',
] as const;

const TAB_ORDER: Record<HomeTab, number> = {
  home: 0,
  rewards: 1,
  shop: 2,
  stats: 3,
  settings: 4,
};

export default function App() {
  const [settings, setSettings] = useState<SettingsState>(() => loadSettings());
  const [profile, setProfile] = useState<PlayerProfileStats>(() => loadProfile());
  const [savedMatch, setSavedMatch] = useState<MatchState | null>(() => loadSavedMatch());

  // Lobby navigation & setup state
  const [activeTab, setActiveTab] = useState<HomeTab>('home');
  const [exitingTab, setExitingTab] = useState<HomeTab | null>(null);
  const [tabDirection, setTabDirection] = useState<1 | -1>(1);
  const [hasSwitchedTab, setHasSwitchedTab] = useState(false);
  const tabExitTimerRef = useRef<number | null>(null);
  const [playerCount, setPlayerCount] = useState<PlayerCount>(4);
  const [seatKinds, setSeatKinds] = useState<Record<PlayerColor, PlayerKind>>({
    red: 'human',
    green: 'bot',
    yellow: 'bot',
    blue: 'bot',
  });

  // Active gameplay & modal state
  const [screen, setScreen] = useState<AppScreen>('title');
  const [match, setMatch] = useState<MatchState>(() =>
    createInitialMatch(4, { green: 'bot', yellow: 'bot', blue: 'bot' })
  );
  const [isPaused, setIsPaused] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Animation & match reward tracking
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<number | null>(null);
  const [captureFlashCell, setCaptureFlashCell] = useState<{ x: number; y: number } | null>(null);
  const [matchCoinsEarned, setMatchCoinsEarned] = useState(0);
  const [matchXpEarned, setMatchXpEarned] = useState(0);

  const timersRef = useRef<number[]>([]);
  const isAnimatingRef = useRef(false);

  const activeBoardTheme =
    BOARD_THEMES.find((th) => th.id === profile.equippedTheme) ?? BOARD_THEMES[0];

  const clearPendingTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((tId) => tId !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // Sync Web Audio settings
  useEffect(() => {
    soundEngine.setSoundEnabled(settings.soundEnabled);
    soundEngine.setMusicEnabled(settings.musicEnabled && !isPaused);
    saveSettings(settings);
  }, [settings, isPaused]);

  // Persist profile stats
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  // Persist active match progress whenever match updates during play
  useEffect(() => {
    if (screen === 'playing') {
      saveMatchProgress(match);
      if (match.phase === 'GAME_OVER') {
        setSavedMatch(null);
      } else {
        setSavedMatch(match);
      }
    }
  }, [match, screen]);

  // Sync document.body.dataset.state
  useEffect(() => {
    if (screen === 'title') {
      document.body.dataset.state = 'title';
    } else if (match.phase === 'GAME_OVER') {
      document.body.dataset.state = 'gameover';
    } else if (isPaused) {
      document.body.dataset.state = 'paused';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [screen, isPaused, match.phase]);

  // Preload, pre-decode, and warm CacheStorage for all screen PNGs so offline play is instant
  useEffect(() => {
    for (const src of LOBBY_PNG_ASSETS) {
      const img = new Image();
      img.src = src;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    }

    if (typeof window !== 'undefined' && 'caches' in window) {
      const warmCache = async () => {
        try {
          if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.ready;
          }
          const cache = await caches.open('ludo-static-images');
          await Promise.all(
            LOBBY_PNG_ASSETS.map(async (url) => {
              const existing = await cache.match(url);
              if (!existing) {
                const res = await fetch(url, { cache: 'no-cache' });
                if (res.ok) {
                  await cache.put(url, res);
                }
              }
            })
          );
        } catch {
          // Ignore environments without CacheStorage
        }
      };
      warmCache();
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPendingTimers();
      soundEngine.stopMusicLoop();
    };
  }, [clearPendingTimers]);

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(pattern);
        } catch {
          // Ignore unsupported environments
        }
      }
    },
    [settings.vibrationEnabled]
  );

  const startNewMatch = useCallback(
    (count: PlayerCount = playerCount, kinds: Record<PlayerColor, PlayerKind> = seatKinds) => {
      clearPendingTimers();
      isAnimatingRef.current = false;
      soundEngine.unlock();
      soundEngine.playClick();

      const fresh = createInitialMatch(count, kinds, { red: profile.playerName });
      setMatch(fresh);
      setDisplayDice(null);
      setIsRolling(false);
      setIsPaused(false);
      setMatchCoinsEarned(0);
      setMatchXpEarned(0);
      setCaptureFlashCell(null);
      setScreen('playing');
    },
    [clearPendingTimers, playerCount, seatKinds, profile.playerName]
  );

  // Support ?autostart=1 for instant gameplay entry
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const fresh = createInitialMatch(2, { yellow: 'bot' }, { red: profile.playerName });
      setPlayerCount(2);
      setMatch(fresh);
      setScreen('playing');
    }
  }, [profile.playerName]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        screen === 'title' &&
        activeTab === 'home' &&
        !showHowToPlay &&
        !showPrivacyPolicy &&
        !showProfileModal
      ) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startNewMatch();
        }
      } else if (screen === 'playing' && match.phase !== 'GAME_OVER') {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setIsPaused((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    screen,
    activeTab,
    showHowToPlay,
    showPrivacyPolicy,
    showProfileModal,
    match.phase,
    startNewMatch,
  ]);

  // Animated token movement & rule evaluation
  const executeTokenMove = useCallback(
    (currentState: MatchState, tokenId: string) => {
      const token = currentState.tokens[tokenId];
      if (!token || currentState.diceValue === null) return;

      isAnimatingRef.current = true;
      const steps = getTokenStepSequence(token.progress, currentState.diceValue);
      const stepMs = settings.fastBot ? 60 : 95;

      setMatch((prev) => ({ ...prev, phase: 'MOVING', legalTokenIds: [] }));

      steps.forEach((stepProgress, idx) => {
        scheduleTimer(() => {
          soundEngine.playHop(idx);
          setMatch((prev) => ({
            ...prev,
            tokens: {
              ...prev.tokens,
              [tokenId]: {
                ...prev.tokens[tokenId],
                progress: stepProgress,
              },
            },
          }));
        }, (idx + 1) * stepMs);
      });

      scheduleTimer(() => {
        const { nextState, result } = applyTokenMove(currentState, tokenId);

        if (result.fromProgress === -1 && result.toProgress === 0) {
          soundEngine.playSpawn();
        }

        const isHumanPlayerMove = result.color === 'red';
        let xpGain = 0;

        if (result.capturedTokens.length > 0) {
          soundEngine.playCapture();
          vibrate([40, 30, 70]);
          const flashPoint = getTokenBoardPoint({
            ...token,
            progress: result.toProgress,
          });
          setCaptureFlashCell(flashPoint);
          scheduleTimer(() => setCaptureFlashCell(null), 550);
          if (isHumanPlayerMove) xpGain += 25 * result.capturedTokens.length;
        } else {
          const landedGlobal = getGlobalTrackIndex(result.color, result.toProgress);
          if (landedGlobal !== null && SAFE_TRACK_INDICES.has(landedGlobal)) {
            soundEngine.playSafeLand();
          }
        }

        if (result.reachedGoal) {
          soundEngine.playGoalReach();
          vibrate([30, 40, 60]);
          if (isHumanPlayerMove) xpGain += 30;
        }

        if (result.coinsEarned > 0 && isHumanPlayerMove) {
          setMatchCoinsEarned((c) => c + result.coinsEarned);
        }

        if (result.winner) {
          soundEngine.playVictory();
          vibrate([60, 40, 80, 40, 120]);
          const playerWon = result.winner === 'red';
          const finishXp = playerWon ? 120 : 40;
          xpGain += finishXp;
          const totalMatchCoins = matchCoinsEarned + (isHumanPlayerMove ? result.coinsEarned : 0);

          setMatchXpEarned((x) => x + xpGain);
          setProfile((p) => {
            const nextStreak = playerWon ? p.currentWinStreak + 1 : 0;
            return {
              ...p,
              coins: p.coins + (isHumanPlayerMove ? result.coinsEarned : 0),
              xp: p.xp + xpGain,
              gamesPlayed: p.gamesPlayed + 1,
              gamesWon: playerWon ? p.gamesWon + 1 : p.gamesWon,
              totalCaptures:
                p.totalCaptures +
                (isHumanPlayerMove ? result.capturedTokens.length : 0),
              totalGoals: p.totalGoals + (isHumanPlayerMove && result.reachedGoal ? 1 : 0),
              currentWinStreak: nextStreak,
              bestWinStreak: Math.max(p.bestWinStreak, nextStreak),
              history: [
                {
                  id: currentState.id,
                  dateIso: new Date().toISOString(),
                  playerCount: currentState.playerCount,
                  winnerColor: result.winner!,
                  winnerName: nextState.seats[result.winner!].name,
                  playerWon,
                  captures: nextState.capturesByColor.red ?? 0,
                  coinsEarned: totalMatchCoins,
                },
                ...p.history,
              ].slice(0, 15),
            };
          });
        } else if (
          (result.coinsEarned > 0 && isHumanPlayerMove) ||
          xpGain > 0 ||
          (isHumanPlayerMove && (result.capturedTokens.length > 0 || result.reachedGoal))
        ) {
          setMatchXpEarned((x) => x + xpGain);
          setProfile((p) => ({
            ...p,
            coins: p.coins + (isHumanPlayerMove ? result.coinsEarned : 0),
            xp: p.xp + xpGain,
            totalCaptures:
              p.totalCaptures +
              (isHumanPlayerMove ? result.capturedTokens.length : 0),
            totalGoals: p.totalGoals + (isHumanPlayerMove && result.reachedGoal ? 1 : 0),
          }));
        }

        setMatch(nextState);
        setDisplayDice(null);
        isAnimatingRef.current = false;
      }, (steps.length + 1) * stepMs + 40);
    },
    [matchCoinsEarned, scheduleTimer, settings.fastBot, vibrate]
  );

  // Dice roll driver
  const triggerDiceRoll = useCallback(
    (stateSnapshot: MatchState) => {
      if (
        stateSnapshot.phase !== 'WAIT_ROLL' ||
        isRolling ||
        isAnimatingRef.current ||
        isPaused
      ) {
        return;
      }

      soundEngine.unlock();
      soundEngine.playDiceRoll();
      isAnimatingRef.current = true;
      setIsRolling(true);

      const finalValue = rollDiceValue();
      const rollDuration =
        settings.fastBot &&
        stateSnapshot.seats[getCurrentPlayerColor(stateSnapshot)].kind === 'bot'
          ? 220
          : 360;

      if (finalValue === 6) {
        vibrate(30);
      }

      scheduleTimer(() => {
        setIsRolling(false);
        setDisplayDice(finalValue);

        const { nextState, hasLegalMoves, threeSixesForfeit } = resolveDiceRoll(
          stateSnapshot,
          finalValue
        );

        if (!hasLegalMoves || threeSixesForfeit) {
          soundEngine.playTurnPass();
          setMatch({
            ...stateSnapshot,
            diceValue: finalValue,
            statusMessage: threeSixesForfeit
              ? 'Triple 6! Turn forfeited'
              : `Rolled ${finalValue} · No legal moves`,
          });

          scheduleTimer(() => {
            setMatch(nextState);
            setDisplayDice(null);
            isAnimatingRef.current = false;
          }, settings.fastBot ? 300 : 520);
          return;
        }

        setMatch(nextState);
        isAnimatingRef.current = false;
      }, rollDuration);
    },
    [isRolling, isPaused, scheduleTimer, settings.fastBot, vibrate]
  );

  // Computer AI turn driver
  useEffect(() => {
    if (screen !== 'playing' || isPaused || isRolling || isAnimatingRef.current) return;
    if (match.phase === 'GAME_OVER' || match.phase === 'MOVING') return;

    const currentColor = getCurrentPlayerColor(match);
    const currentSeat = match.seats[currentColor];
    if (currentSeat.kind !== 'bot') return;

    const delay = settings.fastBot ? 210 : 400;

    if (match.phase === 'WAIT_ROLL') {
      const id = scheduleTimer(() => {
        triggerDiceRoll(match);
      }, delay);
      return () => window.clearTimeout(id);
    }

    if (match.phase === 'SELECT_TOKEN') {
      const chosenId = chooseBotToken(match);
      if (chosenId) {
        const id = scheduleTimer(() => {
          executeTokenMove(match, chosenId);
        }, delay);
        return () => window.clearTimeout(id);
      }
    }
  }, [
    screen,
    isPaused,
    isRolling,
    match,
    settings.fastBot,
    scheduleTimer,
    triggerDiceRoll,
    executeTokenMove,
  ]);

  const handleToggleSettingKey = (
    key: 'soundEnabled' | 'musicEnabled' | 'fastBot' | 'vibrationEnabled'
  ) => {
    soundEngine.unlock();
    soundEngine.playClick();
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangeLanguage = (lang: AppLanguage) => {
    soundEngine.playClick();
    setSettings((prev) => ({ ...prev, language: lang }));
  };

  const handleToggleSeatKind = (color: PlayerColor) => {
    if (color === 'red') return;
    soundEngine.playClick();
    setSeatKinds((prev) => ({
      ...prev,
      [color]: prev[color] === 'bot' ? 'human' : 'bot',
    }));
  };

  const handleApplyPreset = (mode: 'pass-and-play' | 'vs-computer') => {
    soundEngine.playClick();
    const target: PlayerKind = mode === 'vs-computer' ? 'bot' : 'human';
    setSeatKinds({
      red: 'human',
      green: target,
      yellow: target,
      blue: target,
    });
  };

  const handleResumeSaved = () => {
    if (!savedMatch) return;
    clearPendingTimers();
    isAnimatingRef.current = false;
    soundEngine.unlock();
    soundEngine.playClick();
    setMatch(savedMatch);
    setPlayerCount(savedMatch.playerCount);
    setDisplayDice(savedMatch.diceValue);
    setIsRolling(false);
    setIsPaused(false);
    setScreen('playing');
  };

  const handleGoHome = () => {
    clearPendingTimers();
    isAnimatingRef.current = false;
    soundEngine.playClick();
    setIsRolling(false);
    setIsPaused(false);
    setScreen('title');
  };

  const handleResetGame = () => {
    soundEngine.playClick();
    saveMatchProgress(null);
    setSavedMatch(null);
    setProfile(DEFAULT_PROFILE);
    setSettings(DEFAULT_SETTINGS);
  };

  // Rewards handlers
  const handleClaimDaily = () => {
    if (!canClaimDailyReward(profile)) return;
    soundEngine.playGoalReach();
    const idx = profile.dailyStreak % 7;
    const reward = DAILY_REWARD_AMOUNTS[idx];
    setProfile((p) => ({
      ...p,
      coins: p.coins + reward,
      xp: p.xp + 30,
      dailyStreak: p.dailyStreak + 1,
      lastDailyClaimDate: getLocalDateKey(),
    }));
  };

  const handleClaimFreeCoins = () => {
    soundEngine.playSpawn();
    setProfile((p) => ({
      ...p,
      coins: p.coins + FREE_COINS_AMOUNT,
      lastFreeCoinsAt: Date.now(),
    }));
  };

  const handleSpinComplete = (prizeCoins: number, wasFree: boolean) => {
    soundEngine.playGoalReach();
    setProfile((p) => ({
      ...p,
      coins: p.coins + prizeCoins - (wasFree ? 0 : PAID_SPIN_COST),
      xp: p.xp + 20,
      totalSpins: p.totalSpins + 1,
      lastFreeSpinDate: wasFree ? getLocalDateKey() : p.lastFreeSpinDate,
    }));
  };

  const handleWatchVideoEarn = () => {
    soundEngine.playGoalReach();
    setProfile((p) => ({
      ...p,
      coins: p.coins + VIDEO_EARN_AMOUNT,
      xp: p.xp + 25,
    }));
  };

  const handleClaimAchievement = (id: string, rewardCoins: number, rewardXp: number) => {
    if (profile.claimedAchievements.includes(id)) return;
    soundEngine.playVictory();
    setProfile((p) => ({
      ...p,
      coins: p.coins + rewardCoins,
      xp: p.xp + rewardXp,
      claimedAchievements: [...p.claimedAchievements, id],
    }));
  };

  // Shop & Themes handlers
  const handleSelectOrBuyTheme = (id: BoardThemeId, price: number) => {
    soundEngine.playClick();
    if (profile.unlockedThemes.includes(id)) {
      setProfile((p) => ({ ...p, equippedTheme: id }));
      return;
    }
    if (profile.coins >= price) {
      soundEngine.playGoalReach();
      setProfile((p) => ({
        ...p,
        coins: p.coins - price,
        unlockedThemes: [...p.unlockedThemes, id],
        equippedTheme: id,
      }));
    }
  };

  const handleSelectOrBuyDice = (id: DiceSkinId, price: number) => {
    soundEngine.playClick();
    if (profile.unlockedDice.includes(id)) {
      setProfile((p) => ({ ...p, equippedDice: id }));
      return;
    }
    if (profile.coins >= price) {
      soundEngine.playGoalReach();
      setProfile((p) => ({
        ...p,
        coins: p.coins - price,
        unlockedDice: [...p.unlockedDice, id],
        equippedDice: id,
      }));
    }
  };

  const handleSaveProfile = (playerName: string, avatarId: string) => {
    soundEngine.playClick();
    setProfile((p) => ({ ...p, playerName, avatarId }));
    setShowProfileModal(false);
  };

  const handleHumanRoll = () => {
    const currentColor = getCurrentPlayerColor(match);
    if (match.seats[currentColor].kind !== 'human') return;
    triggerDiceRoll(match);
  };

  const handleHumanTokenClick = (tokenId: string) => {
    if (match.phase !== 'SELECT_TOKEN' || isAnimatingRef.current || isPaused) return;
    const currentColor = getCurrentPlayerColor(match);
    if (match.seats[currentColor].kind !== 'human') return;
    if (!match.legalTokenIds.includes(tokenId)) return;
    executeTokenMove(match, tokenId);
  };

  const navigateToTab = useCallback(
    (nextTab: HomeTab) => {
      soundEngine.playClick();
      if (nextTab === activeTab) return;
      if (tabExitTimerRef.current !== null) {
        window.clearTimeout(tabExitTimerRef.current);
      }
      setTabDirection(TAB_ORDER[nextTab] >= TAB_ORDER[activeTab] ? 1 : -1);
      setExitingTab(activeTab);
      setHasSwitchedTab(true);
      setActiveTab(nextTab);
      tabExitTimerRef.current = window.setTimeout(() => {
        setExitingTab(null);
        tabExitTimerRef.current = null;
      }, 175);
    },
    [activeTab]
  );

  const renderLobbyTab = (tab: HomeTab) => {
    if (tab === 'home') {
      return (
        <HomeScreen
          profile={profile}
          playerCount={playerCount}
          seatKinds={seatKinds}
          savedMatch={savedMatch}
          onSelectPlayerCount={(count) => {
            soundEngine.playClick();
            setPlayerCount(count);
          }}
          onApplyPreset={handleApplyPreset}
          onStartGame={() => startNewMatch()}
          onResumeSaved={handleResumeSaved}
          onOpenHowToPlay={() => {
            soundEngine.playClick();
            setShowHowToPlay(true);
          }}
          onOpenProfile={() => {
            soundEngine.playClick();
            setShowProfileModal(true);
          }}
          onNavigateTab={navigateToTab}
        />
      );
    }
    if (tab === 'rewards') {
      return (
        <RewardsView
          profile={profile}
          language={settings.language}
          onClaimDaily={handleClaimDaily}
          onClaimFreeCoins={handleClaimFreeCoins}
          onSpinComplete={handleSpinComplete}
          onWatchVideoEarn={handleWatchVideoEarn}
          onClaimAchievement={handleClaimAchievement}
          onOpenProfile={() => {
            soundEngine.playClick();
            setShowProfileModal(true);
          }}
          onNavigateTab={navigateToTab}
        />
      );
    }
    if (tab === 'shop') {
      return (
        <ShopThemesView
          profile={profile}
          language={settings.language}
          onSelectOrBuyTheme={handleSelectOrBuyTheme}
          onSelectOrBuyDice={handleSelectOrBuyDice}
          onOpenProfile={() => {
            soundEngine.playClick();
            setShowProfileModal(true);
          }}
          onNavigateTab={navigateToTab}
        />
      );
    }
    if (tab === 'stats') {
      return (
        <StatsView
          profile={profile}
          language={settings.language}
          onEditProfile={() => {
            soundEngine.playClick();
            setShowProfileModal(true);
          }}
          onNavigateTab={navigateToTab}
        />
      );
    }
    return (
      <SettingsView
        profile={profile}
        settings={settings}
        onToggleSetting={handleToggleSettingKey}
        onChangeLanguage={handleChangeLanguage}
        onOpenHowToPlay={() => {
          soundEngine.playClick();
          setShowHowToPlay(true);
        }}
        onOpenPrivacyPolicy={() => {
          soundEngine.playClick();
          setShowPrivacyPolicy(true);
        }}
        onResetGame={handleResetGame}
        onOpenProfile={() => {
          soundEngine.playClick();
          setShowProfileModal(true);
        }}
        onNavigateTab={navigateToTab}
      />
    );
  };

  return (
    <main className="ludo-shell-backdrop w-full min-h-screen flex items-center justify-center sm:p-4">
      {/* 9:16 Portrait Mobile Game Stage */}
      <div
        style={{ background: activeBoardTheme.backdropGradient }}
        className="ludo-phone-frame relative w-full h-[100dvh] sm:h-[min(854px,94dvh)] sm:aspect-[9/16] sm:max-w-[440px] sm:rounded-[34px] sm:border-[3px] sm:border-amber-400/75 sm:shadow-[0_24px_60px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col"
      >
        {/* Subtle Ambient Background Sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <span className="bg-star absolute top-[8%] left-[12%] w-1.5 h-1.5 rounded-full bg-amber-200" />
          <span className="bg-star absolute top-[14%] right-[16%] w-2 h-2 rounded-full bg-sky-200" style={{ animationDelay: '0.8s' }} />
          <span className="bg-star absolute bottom-[18%] left-[10%] w-1.5 h-1.5 rounded-full bg-purple-200" style={{ animationDelay: '1.4s' }} />
          <span className="bg-star absolute bottom-[24%] right-[12%] w-1.5 h-1.5 rounded-full bg-amber-200" style={{ animationDelay: '2.1s' }} />
        </div>

        {/* Offline Mode Indicator */}
        <OfflineReadyBadge />

        {screen === 'title' ? (
          <div key="screen-title" className="page-enter-zoom relative w-full h-full overflow-hidden">
            {exitingTab && exitingTab !== activeTab && (
              <div
                key={`exit-${exitingTab}`}
                aria-hidden="true"
                className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${
                  tabDirection >= 0 ? 'page-exit-left' : 'page-exit-right'
                }`}
              >
                {renderLobbyTab(exitingTab)}
              </div>
            )}
            <div
              key={`enter-${activeTab}`}
              className={`absolute inset-0 w-full h-full z-10 ${
                hasSwitchedTab
                  ? tabDirection >= 0
                    ? 'page-enter-right'
                    : 'page-enter-left'
                  : ''
              }`}
            >
              {renderLobbyTab(activeTab)}
            </div>
          </div>
        ) : (
          <div key="screen-playing" className="page-enter-zoom relative w-full h-full">
            <GameplayScreen
              match={match}
              playerName={profile.playerName}
              xp={profile.xp}
              coins={profile.coins}
              settings={settings}
              boardThemeId={profile.equippedTheme}
              diceSkinId={profile.equippedDice}
              isRolling={isRolling}
              displayDice={displayDice}
              captureFlashCell={captureFlashCell}
              onRollDice={handleHumanRoll}
              onTokenClick={handleHumanTokenClick}
              onGoHome={handleGoHome}
              onRestart={() =>
                startNewMatch(match.playerCount, {
                  red: match.seats.red.kind,
                  green: match.seats.green.kind,
                  yellow: match.seats.yellow.kind,
                  blue: match.seats.blue.kind,
                })
              }
              onPause={() => {
                soundEngine.playClick();
                setIsPaused(true);
              }}
              onOpenProfile={() => {
                soundEngine.playClick();
                setShowProfileModal(true);
              }}
              onToggleSound={() => handleToggleSettingKey('soundEnabled')}
              onToggleMusic={() => handleToggleSettingKey('musicEnabled')}
            />
          </div>
        )}

        {/* Modals */}
        {showProfileModal && (
          <PlayerProfileModal
            profile={profile}
            language={settings.language}
            onSave={handleSaveProfile}
            onClose={() => setShowProfileModal(false)}
          />
        )}

        {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}

        {showPrivacyPolicy && (
          <PrivacyPolicyModal onClose={() => setShowPrivacyPolicy(false)} />
        )}

        {isPaused && screen === 'playing' && match.phase !== 'GAME_OVER' && (
          <PauseModal
            settings={settings}
            onResume={() => {
              soundEngine.playClick();
              setIsPaused(false);
            }}
            onRestart={() =>
              startNewMatch(match.playerCount, {
                red: match.seats.red.kind,
                green: match.seats.green.kind,
                yellow: match.seats.yellow.kind,
                blue: match.seats.blue.kind,
              })
            }
            onQuitHome={handleGoHome}
            onToggleSound={() => handleToggleSettingKey('soundEnabled')}
            onToggleMusic={() => handleToggleSettingKey('musicEnabled')}
          />
        )}

        {screen === 'playing' && match.phase === 'GAME_OVER' && match.winner && (
          <VictoryModal
            standings={getStandings(match)}
            matchCoinsEarned={matchCoinsEarned}
            xpEarned={matchXpEarned}
            onPlayAgain={() =>
              startNewMatch(match.playerCount, {
                red: match.seats.red.kind,
                green: match.seats.green.kind,
                yellow: match.seats.yellow.kind,
                blue: match.seats.blue.kind,
              })
            }
            onGoHome={handleGoHome}
          />
        )}
      </div>
    </main>
  );
}
