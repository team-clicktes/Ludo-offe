import React, { useEffect, useState } from 'react';
import { Award, Check, Lock, Sparkles, Trophy, X } from 'lucide-react';
import {
  ACHIEVEMENTS,
  DAILY_REWARD_AMOUNTS,
  FREE_COINS_AMOUNT,
  PAID_SPIN_COST,
  SPIN_PRIZES,
  TROPHIES,
  VIDEO_EARN_AMOUNT,
  calculateLevelInfo,
  canClaimDailyReward,
  canFreeSpinToday,
  getFreeCoinsRemainingMs,
} from '../game/progression';
import { AppLanguage, HomeTab, PlayerProfileStats } from '../game/types';
import { TRANSLATIONS } from '../i18n/translations';

interface RewardsViewProps {
  profile: PlayerProfileStats;
  language: AppLanguage;
  onClaimDaily: () => void;
  onClaimFreeCoins: () => void;
  onSpinComplete: (prizeCoins: number, wasFree: boolean) => void;
  onWatchVideoEarn: () => void;
  onClaimAchievement: (id: string, rewardCoins: number, rewardXp: number) => void;
  onOpenProfile: () => void;
  onNavigateTab: (tab: HomeTab) => void;
}

function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  profile,
  language,
  onClaimDaily,
  onClaimFreeCoins,
  onSpinComplete,
  onWatchVideoEarn,
  onClaimAchievement,
  onOpenProfile,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[language];
  const levelInfo = calculateLevelInfo(profile.xp);

  const [nowMs, setNowMs] = useState(() => Date.now());
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rewardBanner, setRewardBanner] = useState<string | null>(null);
  const [watchingAd, setWatchingAd] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const showBanner = (msg: string) => {
    setRewardBanner(msg);
    window.setTimeout(() => {
      setRewardBanner((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const dailyReady = canClaimDailyReward(profile, new Date(nowMs));
  const nextDailyIndex = profile.dailyStreak % 7;
  const freeRemainingMs = getFreeCoinsRemainingMs(profile, nowMs);
  const freeReady = freeRemainingMs === 0;
  const freeSpinAvailable = canFreeSpinToday(profile, new Date(nowMs));
  const canAffordPaidSpin = profile.coins >= PAID_SPIN_COST;

  const claimableAchievementsCount = ACHIEVEMENTS.filter((ach) => {
    const val = Math.min(ach.target, ach.getValue(profile));
    return val >= ach.target && !profile.claimedAchievements.includes(ach.id);
  }).length;

  const handleDailyClick = () => {
    if (!dailyReady) return;
    const amt = DAILY_REWARD_AMOUNTS[nextDailyIndex];
    onClaimDaily();
    showBanner(`+${amt} Daily Coins!`);
  };

  const handleFreeCoinsClick = () => {
    if (!freeReady) return;
    onClaimFreeCoins();
    showBanner(`+${FREE_COINS_AMOUNT} Free Coins!`);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (!freeSpinAvailable && !canAffordPaidSpin) {
      showBanner(`Need ${PAID_SPIN_COST} coins to spin!`);
      return;
    }

    const prizeIdx = Math.floor(Math.random() * SPIN_PRIZES.length);
    const prize = SPIN_PRIZES[prizeIdx];
    const extraDeg = 5 * 360 + prizeIdx * 45 + 22;

    setIsSpinning(true);
    setWheelRotation((prev) => prev + extraDeg);

    setTimeout(() => {
      setIsSpinning(false);
      onSpinComplete(prize, freeSpinAvailable);
      showBanner(`+${prize} Coins Won!`);
    }, 1500);
  };

  const handleStartVideoShowcase = () => {
    if (watchingAd) return;
    setWatchingAd(true);
    setWatchProgress(0);
    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      setWatchProgress(Math.min(100, step * 20));
      if (step >= 5) {
        window.clearInterval(interval);
        setWatchingAd(false);
        setWatchProgress(0);
        onWatchVideoEarn();
        showBanner(`+${VIDEO_EARN_AMOUNT} Video Coins!`);
      }
    }, 240);
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <h1 className="sr-only">{t.rewardsTitle}</h1>

      {/* Exact User-Provided 9:16 Rewards & Trophies PNG */}
      <img
        src="/assets/aistudio/file_0000000011f88211b5d5825e56a7cce8_a3f12ecf.png"
        alt="LUDO STAR Rewards & Trophies"
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

      {/* Live Coins Capsule matching PNG top-right */}
      <button
        type="button"
        data-testid="home-coin-counter"
        onClick={() => onNavigateTab('shop')}
        aria-label={`Coins: ${profile.coins}. Tap to visit Shop`}
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

      {/* Daily Rewards Streak Badge ("Day X/7 >") */}
      {nextDailyIndex !== 0 && (
        <div
          className="absolute left-[77.5%] top-[15.9%] w-[16.8%] h-[3.2%] rounded-full flex items-center justify-center text-[10px] font-black text-indigo-950 pointer-events-none shadow"
          style={{
            background: 'linear-gradient(180deg, #fde047 0%, #f59e0b 100%)',
          }}
        >
          Day {nextDailyIndex + 1}/7 ›
        </div>
      )}

      {/* 7 Daily Reward Tiles Highlight / Claimed Markers */}
      <div className="absolute left-[7.3%] top-[19.8%] w-[85.4%] h-[8.9%] grid grid-cols-7 gap-[1.3%] pointer-events-none">
        {DAILY_REWARD_AMOUNTS.map((_, idx) => {
          const isPast = idx < nextDailyIndex;
          const isCurrent = idx === nextDailyIndex;
          return (
            <div
              key={idx}
              className={`relative rounded-lg transition-all ${
                isCurrent && dailyReady && idx > 0
                  ? 'ring-2 ring-amber-300 shadow-[0_0_12px_rgba(253,224,71,0.9)]'
                  : isPast
                    ? 'bg-[#091230]/55 ring-1 ring-emerald-400/75'
                    : ''
              }`}
            >
              {isPast && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white text-white flex items-center justify-center shadow">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Daily Claim Button Hotspot */}
      <button
        type="button"
        data-testid="claim-daily-btn"
        disabled={!dailyReady}
        onClick={handleDailyClick}
        aria-label={
          dailyReady
            ? `${t.claim} +${DAILY_REWARD_AMOUNTS[nextDailyIndex]} Coins`
            : `${t.claimed} Today`
        }
        className={`absolute left-[20.3%] top-[29.2%] w-[59.4%] h-[6.1%] rounded-full flex items-center justify-center gap-1.5 text-xs font-black transition-all ${
          dailyReady
            ? nextDailyIndex === 0
              ? 'bg-transparent text-transparent cursor-pointer'
              : 'btn-emerald-3d text-white cursor-pointer'
            : 'bg-[#101342] border-2 border-emerald-400/60 text-emerald-300 shadow-inner cursor-default'
        }`}
      >
        {dailyReady ? (
          nextDailyIndex > 0 ? (
            <span className="drop-shadow">
              {t.claim} +{DAILY_REWARD_AMOUNTS[nextDailyIndex]} Coins
            </span>
          ) : null
        ) : (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.claimed} Today</span>
          </>
        )}
      </button>

      {/* Free Coins (+60 Claim) Hotspot */}
      <button
        type="button"
        data-testid="claim-free-coins-btn"
        disabled={!freeReady}
        onClick={handleFreeCoinsClick}
        aria-label={
          freeReady ? `+${FREE_COINS_AMOUNT} ${t.claim}` : formatCountdown(freeRemainingMs)
        }
        className={`absolute left-[6.4%] top-[51.7%] w-[39.2%] h-[5.1%] rounded-full flex items-center justify-center text-xs font-black tabular-nums transition-all ${
          freeReady
            ? 'bg-transparent text-transparent cursor-pointer'
            : 'bg-[#101342] border-2 border-amber-300/50 text-amber-200 shadow-inner cursor-default'
        }`}
      >
        {!freeReady && <span>{formatCountdown(freeRemainingMs)}</span>}
      </button>

      {/* Watch Video & Earn (+120 Earn) Hotspot */}
      <button
        type="button"
        data-testid="watch-video-btn"
        disabled={watchingAd}
        onClick={handleStartVideoShowcase}
        aria-label={
          watchingAd
            ? `Watching offline showcase ${watchProgress}%`
            : `+${VIDEO_EARN_AMOUNT} Earn`
        }
        className={`absolute left-[54.4%] top-[51.7%] w-[39.2%] h-[5.1%] rounded-full flex items-center justify-center text-xs font-black tabular-nums transition-all ${
          watchingAd
            ? 'bg-[#101342] border-2 border-amber-300/70 text-amber-200 shadow-inner cursor-default'
            : 'bg-transparent text-transparent cursor-pointer'
        }`}
      >
        {watchingAd && (
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            {watchProgress}%
          </span>
        )}
      </button>

      {/* Animated Rotating Spin Gleam Overlay over Wheel when Spinning */}
      {isSpinning && (
        <div
          aria-hidden="true"
          className="absolute left-[9.8%] top-[63.5%] w-[37.4%] aspect-square rounded-full pointer-events-none"
          style={{
            transform: `rotate(${wheelRotation}deg)`,
            transition: 'transform 1.45s cubic-bezier(0.15, 0.85, 0.2, 1)',
            background:
              'conic-gradient(from 0deg, rgba(253,224,71,0.55) 0deg 35deg, transparent 40deg 180deg, rgba(255,255,255,0.45) 180deg 215deg, transparent 220deg 360deg)',
            boxShadow: '0 0 24px rgba(253,224,71,0.85)',
          }}
        />
      )}

      {/* Wheel Center SPIN Hub Hotspot */}
      <button
        type="button"
        disabled={isSpinning}
        onClick={handleSpin}
        aria-label="Spin Wheel"
        className="absolute left-[22.4%] top-[71.0%] w-[12.2%] h-[6.8%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      />

      {/* Free Spin Yellow Button Hotspot */}
      <button
        type="button"
        data-testid="spin-wheel-btn"
        disabled={isSpinning}
        onClick={handleSpin}
        aria-label={
          isSpinning ? 'Spinning' : freeSpinAvailable ? t.spinNow : t.spinFor
        }
        className={`absolute left-[52.8%] top-[76.2%] w-[38.2%] h-[6.4%] rounded-full flex items-center justify-center text-xs font-black transition-all ${
          isSpinning
            ? 'bg-amber-400/90 text-indigo-950 cursor-default'
            : freeSpinAvailable
              ? 'bg-transparent text-transparent cursor-pointer'
              : 'bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-amber-200 text-indigo-950 shadow-md cursor-pointer'
        }`}
      >
        {isSpinning ? (
          <span>Spinning...</span>
        ) : !freeSpinAvailable ? (
          <span>{t.spinFor}</span>
        ) : null}
      </button>

      {/* Achievements | View All > Hotspot Bar */}
      <button
        type="button"
        data-testid="open-achievements-btn"
        onClick={() => setShowAchievementsModal(true)}
        aria-label={`${t.achievements} - View All`}
        className="absolute left-[2.8%] top-[84.5%] w-[94.4%] h-[5.3%] rounded-2xl bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      >
        {claimableAchievementsCount > 0 && (
          <span className="absolute right-[21%] top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-full bg-rose-500 border border-white text-[10px] font-black text-white shadow animate-pulse">
            {claimableAchievementsCount}
          </span>
        )}
      </button>

      {/* Celebratory Reward Toast Banner */}
      {rewardBanner && (
        <div
          role="status"
          className="absolute left-1/2 -translate-x-1/2 top-[35.5%] z-30 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-2 border-white text-indigo-950 text-xs font-black whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.65)]"
        >
          ✨ {rewardBanner}
        </div>
      )}

      {/* Bottom 5-Tab Navigation Hotspots over PNG Nav Bar */}
      <nav aria-label="Lobby Navigation">
        <button
          type="button"
          data-testid="nav-tab-home"
          onClick={() => onNavigateTab('home')}
          aria-label={t.tabHome}
          className="absolute left-[0.5%] top-[90.5%] w-[19.8%] h-[9.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-rewards"
          onClick={() => onNavigateTab('rewards')}
          aria-label={t.tabRewards}
          className="absolute left-[20.3%] top-[90.5%] w-[19.8%] h-[9.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-shop"
          onClick={() => onNavigateTab('shop')}
          aria-label={t.tabShop}
          className="absolute left-[40.1%] top-[90.5%] w-[19.8%] h-[9.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-stats"
          onClick={() => onNavigateTab('stats')}
          aria-label={t.tabStats}
          className="absolute left-[59.9%] top-[90.5%] w-[19.8%] h-[9.5%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-settings"
          onClick={() => onNavigateTab('settings')}
          aria-label={t.tabSettings}
          className="absolute left-[79.7%] top-[90.5%] w-[19.8%] h-[9.5%] bg-transparent cursor-pointer"
        />
      </nav>

      {/* Interactive Achievements & Trophies Modal inside 9:16 Stage */}
      {showAchievementsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${t.achievements} & ${t.trophies}`}
          className="absolute inset-0 z-40 bg-indigo-950/90 backdrop-blur-sm p-3.5 flex flex-col"
        >
          <div className="royal-card rounded-2xl flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-amber-300/30 shrink-0">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-300" />
                <h2 className="font-display font-black text-base text-amber-300">
                  {t.achievements} &amp; {t.trophies}
                </h2>
              </div>
              <button
                type="button"
                data-testid="close-achievements-btn"
                onClick={() => setShowAchievementsModal(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-lg bg-indigo-900 border border-white/15 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              {/* Achievements List */}
              <section className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-200">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>{t.achievements}</span>
                </div>
                {ACHIEVEMENTS.map((ach) => {
                  const val = Math.min(ach.target, ach.getValue(profile));
                  const completed = val >= ach.target;
                  const claimed = profile.claimedAchievements.includes(ach.id);
                  const pct = Math.round((val / ach.target) * 100);
                  return (
                    <div
                      key={ach.id}
                      className="rounded-xl bg-indigo-950/80 border border-white/10 p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {language === 'ur' ? ach.titleUr : ach.title}
                        </div>
                        <div className="text-[11px] text-indigo-200/75 truncate">
                          {language === 'ur' ? ach.descUr : ach.desc}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-indigo-900 overflow-hidden">
                            <div
                              className="h-full bg-amber-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-amber-200 tabular-nums">
                            {val}/{ach.target}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!completed || claimed}
                        onClick={() =>
                          onClaimAchievement(ach.id, ach.rewardCoins, ach.rewardXp)
                        }
                        className={`h-9 px-3 rounded-lg text-[11px] font-extrabold shrink-0 ${
                          claimed
                            ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-400/30'
                            : completed
                              ? 'btn-gold-3d cursor-pointer'
                              : 'bg-indigo-900/60 text-indigo-300/60 border border-white/10'
                        }`}
                      >
                        {claimed ? t.claimed : `+${ach.rewardCoins}`}
                      </button>
                    </div>
                  );
                })}
              </section>

              {/* Trophies Cabinet */}
              <section className="flex flex-col gap-2 pb-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-200">
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>{t.trophies}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {TROPHIES.map((tr) => {
                    const unlocked = tr.isUnlocked(profile);
                    return (
                      <div
                        key={tr.id}
                        className={`rounded-xl p-2.5 border flex items-center gap-2 ${
                          unlocked
                            ? 'bg-amber-400/10 border-amber-300/60'
                            : 'bg-indigo-950/65 border-white/10 opacity-75'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/25"
                          style={{ backgroundColor: unlocked ? tr.accent : '#1e1b4b' }}
                        >
                          {unlocked ? (
                            <Trophy className="w-4 h-4 text-white drop-shadow" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-indigo-300/60" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-extrabold text-white truncate">
                            {language === 'ur' ? tr.nameUr : tr.name}
                          </div>
                          <div className="text-[10px] text-indigo-200/75 truncate">
                            {language === 'ur' ? tr.requirementUr : tr.requirement}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
