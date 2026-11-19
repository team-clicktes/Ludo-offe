import React from 'react';
import { PLAYER_THEME } from '../game/boardGeometry';
import { calculateLevelInfo } from '../game/progression';
import { AppLanguage, HomeTab, PlayerProfileStats } from '../game/types';
import { TRANSLATIONS } from '../i18n/translations';

interface StatsViewProps {
  profile: PlayerProfileStats;
  language: AppLanguage;
  onEditProfile: () => void;
  onNavigateTab: (tab: HomeTab) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  profile,
  language,
  onEditProfile,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[language];
  const levelInfo = calculateLevelInfo(profile.xp);
  const winRate =
    profile.gamesPlayed > 0
      ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100)
      : 0;

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <h1 className="sr-only">{t.statsTitle}</h1>

      {/* Exact User-Provided 9:16 Player Statistics PNG */}
      <img
        src="/assets/aistudio/file_0000000021008211bf47c43f3cdd40e3_6688e47a.png"
        alt="LUDO STAR Player Statistics"
        className="w-full h-full object-fill pointer-events-none select-none block"
      />

      {/* Live Player Profile Name / Level Overlay matching PNG top-left pill */}
      <button
        type="button"
        data-testid="player-profile-btn"
        onClick={onEditProfile}
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

      {/* Live Coins Capsule matching PNG top-right */}
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
        aria-label={t.settings}
        className="absolute left-[87.5%] top-[1%] w-[10.5%] h-[6%] rounded-xl bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      />

      {/* Player Level & XP Banner Interactive Card */}
      <button
        type="button"
        data-testid="stats-profile-card"
        onClick={onEditProfile}
        aria-label={`Edit profile ${profile.playerName}, Level ${levelInfo.level}`}
        className="absolute left-[2.8%] top-[19.3%] w-[94.4%] h-[12.5%] rounded-2xl bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      >
        {/* Live Player Name & XP subtitle patch */}
        <div
          className="absolute left-[24%] top-[16%] w-[51%] h-[54%] flex flex-col justify-center text-left px-1 rounded"
          style={{
            background: 'linear-gradient(180deg, #4b1593 0%, #370f6f 100%)',
          }}
        >
          <div className="text-sm font-black text-white truncate leading-tight">
            {profile.playerName}
          </div>
          <div className="text-[11px] font-bold text-indigo-100/90 truncate tabular-nums mt-0.5">
            {levelInfo.title} · {levelInfo.currentXpInLevel}/{levelInfo.xpForNextLevel} XP
          </div>
        </div>

        {/* Live Level Pill */}
        <div
          className="absolute right-[3.4%] top-[19%] w-[19.5%] h-[27%] rounded-full flex items-center justify-center text-[11px] font-black text-amber-300 tabular-nums border border-amber-300/40"
          style={{ background: '#1e0b52' }}
        >
          {t.levelLabel} {levelInfo.level}
        </div>

        {/* Live XP Fill Bar */}
        <div className="absolute left-[25.2%] top-[72.2%] w-[69.2%] h-[10.5%] rounded-full bg-[#1a0a48] border border-white/15 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-200 transition-all"
            style={{ width: `${Math.max(4, levelInfo.progressPct)}%` }}
          />
        </div>
      </button>

      {/* Row 1 Stat Values: Matches Played | Wins | Win Rate */}
      <div
        data-testid="stat-matches-played"
        className="absolute left-[6.5%] top-[38.8%] w-[23.2%] h-[3.6%] flex items-center justify-center text-lg font-black text-white tabular-nums rounded pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #0333b0 0%, #012892 100%)' }}
      >
        {profile.gamesPlayed}
      </div>
      <div
        data-testid="stat-wins"
        className="absolute left-[38.4%] top-[38.8%] w-[23.2%] h-[3.6%] flex items-center justify-center text-lg font-black text-white tabular-nums rounded pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #0333b0 0%, #012892 100%)' }}
      >
        {profile.gamesWon}
      </div>
      <div
        data-testid="stat-win-rate"
        className="absolute left-[70.3%] top-[38.8%] w-[23.2%] h-[3.6%] flex items-center justify-center text-lg font-black text-white tabular-nums rounded pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #0333b0 0%, #012892 100%)' }}
      >
        {winRate}%
      </div>

      {/* Row 2 Stat Values: Captures | Goals | Best Streak */}
      <div
        data-testid="stat-captures"
        className="absolute left-[6.5%] top-[52.8%] w-[23.2%] h-[3.6%] flex items-center justify-center text-lg font-black text-white tabular-nums rounded pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #2d0d7b 0%, #220863 100%)' }}
      >
        {profile.totalCaptures}
      </div>
      <div
        data-testid="stat-goals"
        className="absolute left-[38.4%] top-[52.8%] w-[23.2%] h-[3.6%] flex items-center justify-center text-lg font-black text-white tabular-nums rounded pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #2d0d7b 0%, #220863 100%)' }}
      >
        {profile.totalGoals}
      </div>
      <div
        data-testid="stat-best-streak"
        className="absolute left-[70.3%] top-[52.8%] w-[23.2%] h-[3.6%] flex items-center justify-center text-lg font-black text-white tabular-nums rounded pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #2d0d7b 0%, #220863 100%)' }}
      >
        {profile.bestWinStreak}
      </div>

      {/* Recent Offline Matches Live List (replaces empty-state graphic only once matches exist) */}
      {profile.history.length > 0 && (
        <div
          data-testid="recent-matches-list"
          className="absolute left-[4.8%] top-[67.0%] w-[90.4%] h-[9.8%] rounded-xl overflow-y-auto px-2 py-1 flex flex-col gap-1 border border-amber-300/25"
          style={{
            background: 'linear-gradient(180deg, #2b0f6b 0%, #190848 100%)',
          }}
        >
          {profile.history.slice(0, 6).map((item) => {
            const theme = PLAYER_THEME[item.winnerColor];
            return (
              <div
                key={item.id}
                className="rounded-lg bg-indigo-950/75 border border-white/10 px-2.5 py-1 flex items-center justify-between shrink-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/75 shrink-0"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div className="min-w-0 flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white truncate">
                      {item.winnerName} Won ({item.playerCount}P)
                    </span>
                    <span className="text-[10px] text-indigo-200/75 shrink-0">
                      · {item.captures} cap
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-amber-300 tabular-nums shrink-0">
                  +{item.coinsEarned}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom 5-Tab Navigation Hotspots over PNG Nav Bar */}
      <nav aria-label="Lobby Navigation">
        <button
          type="button"
          data-testid="nav-tab-home"
          onClick={() => onNavigateTab('home')}
          aria-label={t.tabHome}
          className="absolute left-[0.5%] top-[88.5%] w-[19.8%] h-[11.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-rewards"
          onClick={() => onNavigateTab('rewards')}
          aria-label={t.tabRewards}
          className="absolute left-[20.3%] top-[88.5%] w-[19.8%] h-[11.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-shop"
          onClick={() => onNavigateTab('shop')}
          aria-label={t.tabShop}
          className="absolute left-[40.1%] top-[88.5%] w-[19.8%] h-[11.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-stats"
          onClick={() => onNavigateTab('stats')}
          aria-label={t.tabStats}
          className="absolute left-[59.9%] top-[88.5%] w-[19.8%] h-[11.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-settings"
          onClick={() => onNavigateTab('settings')}
          aria-label={t.tabSettings}
          className="absolute left-[79.7%] top-[88.5%] w-[19.8%] h-[11.5%] bg-transparent cursor-pointer"
        />
      </nav>
    </div>
  );
};
