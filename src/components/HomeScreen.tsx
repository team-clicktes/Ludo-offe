import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { getActiveColorsForCount } from '../game/ludoEngine';
import { calculateLevelInfo } from '../game/progression';
import {
  HomeTab,
  MatchState,
  PlayerColor,
  PlayerCount,
  PlayerKind,
  PlayerProfileStats,
} from '../game/types';
import { PWAInstallButton } from './PWAInstallControl';

interface HomeScreenProps {
  profile: PlayerProfileStats;
  playerCount: PlayerCount;
  seatKinds: Record<PlayerColor, PlayerKind>;
  savedMatch: MatchState | null;
  onSelectPlayerCount: (count: PlayerCount) => void;
  onApplyPreset: (mode: 'pass-and-play' | 'vs-computer') => void;
  onStartGame: () => void;
  onResumeSaved: () => void;
  onOpenHowToPlay: () => void;
  onOpenProfile: () => void;
  onNavigateTab: (tab: HomeTab) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  playerCount,
  seatKinds,
  savedMatch,
  onSelectPlayerCount,
  onApplyPreset,
  onStartGame,
  onResumeSaved,
  onOpenHowToPlay,
  onOpenProfile,
  onNavigateTab,
}) => {
  const [notice, setNotice] = useState<string | null>(null);
  const levelInfo = calculateLevelInfo(profile.xp);
  const activeColors = getActiveColorsForCount(playerCount);
  const allOpponentsBots = activeColors
    .filter((c) => c !== 'red')
    .every((c) => seatKinds[c] === 'bot');

  const handleResumeClick = () => {
    if (savedMatch) {
      onResumeSaved();
    } else {
      setNotice('No saved match yet — tap PLAY OFFLINE to start!');
      window.setTimeout(() => setNotice(null), 2400);
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <h1 className="sr-only">LUDO STAR</h1>

      {/* Exact User-Provided 9:16 Home Screen PNG */}
      <img
        src="/assets/aistudio/file_00000000893c8211b8d12116f4913b2a_ec4d1d0f.png"
        alt="LUDO STAR Home Screen"
        className="w-full h-full object-fill pointer-events-none select-none block"
      />

      {/* Live Player Profile Name / Level Overlay matching PNG top-left pill */}
      <button
        type="button"
        data-testid="player-profile-btn"
        onClick={onOpenProfile}
        aria-label={`Player Profile: ${profile.playerName}, Level ${levelInfo.level}`}
        className="absolute left-[1.8%] top-[0.6%] w-[39.5%] h-[7.6%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      >
        <div
          className="absolute left-[46%] top-[14%] w-[46%] h-[68%] rounded-r-full flex flex-col justify-center px-1.5 text-left"
          style={{
            background: 'linear-gradient(180deg, #1b1e63 0%, #0f1244 100%)',
          }}
        >
          <span className="text-[11px] font-extrabold text-white truncate leading-tight">
            {profile.playerName}
          </span>
          <span className="text-[10px] font-bold text-amber-200 leading-tight tabular-nums">
            Lv. {levelInfo.level}
          </span>
          <span className="w-full h-1.5 rounded-full bg-indigo-950 border border-amber-300/40 overflow-hidden mt-0.5">
            <span
              className="block h-full bg-amber-400"
              style={{ width: `${Math.max(8, levelInfo.progressPct)}%` }}
            />
          </span>
        </div>
      </button>

      {/* In-App PWA Install Button in Header Gap */}
      <PWAInstallButton className="absolute left-[41.8%] top-[1.4%] w-[15.6%] h-[4.6%] z-20 shadow-lg" />

      {/* Live Coins + Green Plus Button matching PNG top-right coin capsule */}
      <button
        type="button"
        data-testid="home-coin-counter"
        onClick={() => onNavigateTab('rewards')}
        aria-label={`Coins: ${profile.coins}. Tap to earn free coins`}
        className="absolute left-[58%] top-[1.2%] w-[28.2%] h-[5.6%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      >
        <span
          className="absolute left-[29%] top-[16%] w-[44%] h-[68%] flex items-center justify-center text-xs font-black text-white tabular-nums rounded"
          style={{ background: '#0c0d36' }}
        >
          {profile.coins.toLocaleString()}
        </span>
      </button>

      {/* Top-Right Settings Gear Hotspot */}
      <button
        type="button"
        data-testid="top-settings-btn"
        onClick={() => onNavigateTab('settings')}
        aria-label="Settings"
        className="absolute left-[87.5%] top-[1%] w-[10.5%] h-[6%] rounded-xl bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      />

      {/* SELECT PLAYERS: Pass & Play / vs Computer Toggle Hotspots */}
      <button
        type="button"
        onClick={() => onApplyPreset('pass-and-play')}
        aria-label="Pass & Play"
        aria-pressed={!allOpponentsBots}
        className={`absolute left-[53.2%] top-[36.1%] w-[20.2%] h-[4.5%] rounded-full cursor-pointer transition-all ${
          !allOpponentsBots
            ? 'ring-2 ring-amber-200 shadow-[0_0_12px_rgba(253,224,71,0.75)]'
            : 'bg-indigo-950/45'
        }`}
      />
      <button
        type="button"
        onClick={() => onApplyPreset('vs-computer')}
        aria-label="vs Computer"
        aria-pressed={allOpponentsBots}
        className={`absolute left-[73.6%] top-[36.1%] w-[21.6%] h-[4.5%] rounded-full cursor-pointer transition-all ${
          allOpponentsBots
            ? 'ring-2 ring-amber-300 bg-amber-400/20 shadow-[0_0_14px_rgba(253,224,71,0.9)]'
            : 'bg-transparent'
        }`}
      />

      {/* 2x2 Player Mode Card Hotspots over PNG */}
      <button
        type="button"
        onClick={() => onSelectPlayerCount(2)}
        aria-label="2 Players"
        aria-pressed={playerCount === 2}
        className={`absolute left-[6.2%] top-[41.4%] w-[43.2%] h-[12.4%] rounded-2xl cursor-pointer transition-all ${
          playerCount === 2
            ? 'ring-3 ring-amber-300 shadow-[0_0_20px_rgba(253,224,71,0.95)]'
            : 'bg-transparent'
        }`}
      >
        {playerCount === 2 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-300 text-indigo-950 flex items-center justify-center shadow">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onSelectPlayerCount(3)}
        aria-label="3 Players"
        aria-pressed={playerCount === 3}
        className={`absolute left-[50.8%] top-[41.4%] w-[43.2%] h-[12.4%] rounded-2xl cursor-pointer transition-all ${
          playerCount === 3
            ? 'ring-3 ring-amber-300 shadow-[0_0_20px_rgba(253,224,71,0.95)]'
            : 'bg-transparent'
        }`}
      >
        {playerCount === 3 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-300 text-indigo-950 flex items-center justify-center shadow">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onSelectPlayerCount(4)}
        aria-label="4 Players"
        aria-pressed={playerCount === 4}
        className={`absolute left-[6.2%] top-[54.6%] w-[43.2%] h-[12.4%] rounded-2xl cursor-pointer transition-all ${
          playerCount === 4
            ? 'ring-3 ring-amber-300 shadow-[0_0_20px_rgba(253,224,71,0.95)]'
            : 'bg-transparent'
        }`}
      >
        {playerCount === 4 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-300 text-indigo-950 flex items-center justify-center shadow">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onApplyPreset(allOpponentsBots ? 'pass-and-play' : 'vs-computer')}
        aria-label="Player vs Computer"
        aria-pressed={allOpponentsBots}
        className={`absolute left-[50.8%] top-[54.6%] w-[43.2%] h-[12.4%] rounded-2xl cursor-pointer transition-all ${
          allOpponentsBots
            ? 'ring-3 ring-amber-300 shadow-[0_0_20px_rgba(253,224,71,0.95)]'
            : 'bg-transparent'
        }`}
      >
        {allOpponentsBots && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-300 text-indigo-950 flex items-center justify-center shadow">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        )}
      </button>

      {/* PLAY OFFLINE Primary Button Hotspot */}
      <button
        type="button"
        data-start="true"
        onClick={onStartGame}
        aria-label="PLAY OFFLINE"
        className="absolute left-[9.2%] top-[70.1%] w-[81.6%] h-[8.4%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      />

      {/* Resume Saved Match Hotspot */}
      <button
        type="button"
        onClick={handleResumeClick}
        aria-label="Resume Saved Match"
        className="absolute left-[5.5%] top-[79.2%] w-[45.2%] h-[6.8%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      />

      {/* How to Play Hotspot */}
      <button
        type="button"
        onClick={onOpenHowToPlay}
        aria-label="How to Play"
        className="absolute left-[52.4%] top-[79.2%] w-[42.2%] h-[6.8%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      />

      {/* Temporary Toast when tapping Resume without a saved match */}
      {notice && (
        <div
          role="status"
          className="absolute left-1/2 -translate-x-1/2 top-[67%] z-30 px-3.5 py-1.5 rounded-xl bg-indigo-950/95 border border-amber-300 text-[11px] font-bold text-amber-200 whitespace-nowrap shadow-lg"
        >
          {notice}
        </div>
      )}

      {/* Bottom 5-Tab Navigation Hotspots over PNG Nav Bar */}
      <nav aria-label="Lobby Navigation">
        <button
          type="button"
          data-testid="nav-tab-home"
          onClick={() => onNavigateTab('home')}
          aria-label="Home"
          className="absolute left-[0.5%] top-[88.2%] w-[19.8%] h-[11.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-rewards"
          onClick={() => onNavigateTab('rewards')}
          aria-label="Rewards"
          className="absolute left-[20.3%] top-[88.2%] w-[19.8%] h-[11.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-shop"
          onClick={() => onNavigateTab('shop')}
          aria-label="Shop"
          className="absolute left-[40.1%] top-[88.2%] w-[19.8%] h-[11.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-stats"
          onClick={() => onNavigateTab('stats')}
          aria-label="Stats"
          className="absolute left-[59.9%] top-[88.2%] w-[19.8%] h-[11.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-settings"
          onClick={() => onNavigateTab('settings')}
          aria-label="Settings"
          className="absolute left-[79.7%] top-[88.2%] w-[19.8%] h-[11.5%] bg-transparent cursor-pointer"
        />
      </nav>
    </div>
  );
};
