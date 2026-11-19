import React, { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { calculateLevelInfo } from '../game/progression';
import { AppLanguage, HomeTab, PlayerProfileStats, SettingsState } from '../game/types';
import { TRANSLATIONS } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallControl';

interface SettingsViewProps {
  profile: PlayerProfileStats;
  settings: SettingsState;
  onToggleSetting: (
    key: 'soundEnabled' | 'musicEnabled' | 'vibrationEnabled' | 'fastBot'
  ) => void;
  onChangeLanguage: (lang: AppLanguage) => void;
  onOpenHowToPlay: () => void;
  onOpenPrivacyPolicy: () => void;
  onResetGame: () => void;
  onOpenProfile: () => void;
  onNavigateTab: (tab: HomeTab) => void;
}

const TOGGLE_ROWS: Array<{
  key: 'musicEnabled' | 'soundEnabled' | 'vibrationEnabled' | 'fastBot';
  rowTop: string;
  pillTop: string;
  labelKey: 'musicLabel' | 'soundLabel' | 'vibrationLabel' | 'fastBotLabel';
}> = [
  {
    key: 'musicEnabled',
    rowTop: 'top-[22.2%]',
    pillTop: 'top-[23.3%]',
    labelKey: 'musicLabel',
  },
  {
    key: 'soundEnabled',
    rowTop: 'top-[29.4%]',
    pillTop: 'top-[30.5%]',
    labelKey: 'soundLabel',
  },
  {
    key: 'vibrationEnabled',
    rowTop: 'top-[36.6%]',
    pillTop: 'top-[37.7%]',
    labelKey: 'vibrationLabel',
  },
  {
    key: 'fastBot',
    rowTop: 'top-[43.8%]',
    pillTop: 'top-[44.9%]',
    labelKey: 'fastBotLabel',
  },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  settings,
  onToggleSetting,
  onChangeLanguage,
  onOpenHowToPlay,
  onOpenPrivacyPolicy,
  onResetGame,
  onOpenProfile,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[settings.language];
  const levelInfo = calculateLevelInfo(profile.xp);

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => {
      setNotice((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const handleResetClick = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      window.setTimeout(() => setConfirmingReset(false), 3500);
    } else {
      setConfirmingReset(false);
      onResetGame();
      showToast(
        settings.language === 'ur' ? 'گیم کا ڈیٹا ری سیٹ ہو گیا!' : 'Game data reset!'
      );
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <h1 className="sr-only">{t.settingsTitle}</h1>

      {/* Exact User-Provided 9:16 Settings PNG */}
      <img
        src="/assets/aistudio/file_00000000022c82118584f02db2010b3f_93e85e32.png"
        alt="LUDO STAR Settings"
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
      <PWAInstallButton
        language={settings.language}
        className="absolute left-[41.8%] top-[1.4%] w-[15.6%] h-[4.6%] z-20 shadow-lg"
      />

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

      {/* Top-Right Settings Gear */}
      <button
        type="button"
        data-testid="top-settings-btn"
        onClick={() => onNavigateTab('settings')}
        aria-label={t.settings}
        className="absolute left-[87.5%] top-[1%] w-[10.5%] h-[6%] rounded-xl bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      />

      {/* 4 Live Toggle Rows (Music, Sound, Vibration, Fast CPU Turns) */}
      {TOGGLE_ROWS.map((row) => {
        const active = settings[row.key];
        const label = t[row.labelKey];
        return (
          <button
            key={row.key}
            type="button"
            role="switch"
            aria-checked={active}
            aria-label={label}
            data-testid={`toggle-${row.key}`}
            onClick={() => onToggleSetting(row.key)}
            className={`absolute left-[4.8%] ${row.rowTop} w-[90.4%] h-[6.8%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300`}
          >
            {/* Live Glossy Switch Pill matching PNG switches */}
            <span
              className={`absolute right-[2.2%] top-[16%] w-[20.6%] h-[68%] rounded-full border-2 flex items-center px-1 transition-all shadow-inner ${
                active
                  ? 'bg-gradient-to-b from-lime-400 to-green-600 border-lime-200 justify-between'
                  : 'bg-gradient-to-b from-slate-500 to-slate-700 border-slate-300 justify-between'
              }`}
            >
              {active ? (
                <>
                  <span className="text-[11px] font-black text-white pl-1.5 drop-shadow">
                    ON
                  </span>
                  <span className="w-5 h-5 rounded-full bg-gradient-to-b from-white to-slate-200 border border-slate-300 shadow" />
                </>
              ) : (
                <>
                  <span className="w-5 h-5 rounded-full bg-gradient-to-b from-white to-slate-200 border border-slate-300 shadow" />
                  <span className="text-[11px] font-black text-white pr-1 drop-shadow">
                    OFF
                  </span>
                </>
              )}
            </span>
          </button>
        );
      })}

      {/* Language Selector Row */}
      <button
        type="button"
        data-testid="language-selector-btn"
        onClick={() => setShowLangMenu((prev) => !prev)}
        aria-label={`${t.languageLabel}: ${
          settings.language === 'ur' ? 'اردو' : 'English'
        }`}
        aria-expanded={showLangMenu}
        className="absolute left-[4.8%] top-[51.0%] w-[90.4%] h-[6.8%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      >
        {settings.language === 'ur' && (
          <span
            className="absolute right-[2.2%] top-[14%] w-[31.4%] h-[72%] rounded-full border-2 border-amber-200 flex items-center justify-between px-2.5 text-xs font-black text-indigo-950 shadow"
            style={{
              background: 'linear-gradient(180deg, #fde047 0%, #f59e0b 100%)',
            }}
          >
            <span>🇵🇰 اردو</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Language Dropdown Popover */}
      {showLangMenu && (
        <div
          role="menu"
          className="absolute right-[6.5%] top-[58.0%] z-30 w-36 rounded-xl bg-indigo-950 border-2 border-amber-300 p-1 shadow-[0_12px_28px_rgba(0,0,0,0.75)] flex flex-col gap-1"
        >
          <button
            type="button"
            role="menuitem"
            data-testid="lang-en-btn"
            onClick={() => {
              onChangeLanguage('en');
              setShowLangMenu(false);
            }}
            className={`w-full px-3 py-2 rounded-lg text-xs font-extrabold text-left flex items-center justify-between cursor-pointer ${
              settings.language === 'en'
                ? 'bg-amber-400 text-indigo-950'
                : 'text-white hover:bg-indigo-900'
            }`}
          >
            <span>English</span>
            {settings.language === 'en' && <span>✓</span>}
          </button>
          <button
            type="button"
            role="menuitem"
            data-testid="lang-ur-btn"
            onClick={() => {
              onChangeLanguage('ur');
              setShowLangMenu(false);
            }}
            className={`w-full px-3 py-2 rounded-lg text-xs font-extrabold text-left flex items-center justify-between cursor-pointer ${
              settings.language === 'ur'
                ? 'bg-amber-400 text-indigo-950'
                : 'text-white hover:bg-indigo-900'
            }`}
          >
            <span>اردو</span>
            {settings.language === 'ur' && <span>✓</span>}
          </button>
        </div>
      )}

      {/* How to Play Hotspot */}
      <button
        type="button"
        data-testid="settings-howto-btn"
        onClick={onOpenHowToPlay}
        aria-label={t.howToPlay}
        className="absolute left-[2.8%] top-[60.8%] w-[94.4%] h-[7.2%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      />

      {/* Privacy Policy Hotspot */}
      <button
        type="button"
        data-testid="settings-privacy-btn"
        onClick={onOpenPrivacyPolicy}
        aria-label={t.privacyPolicy}
        className="absolute left-[2.8%] top-[69.0%] w-[94.4%] h-[7.2%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      />

      {/* Reset Game Hotspot (2-step confirmation) */}
      <button
        type="button"
        data-testid="reset-game-btn"
        onClick={handleResetClick}
        aria-label={confirmingReset ? t.confirmReset : t.resetGame}
        className={`absolute left-[2.8%] top-[77.2%] w-[94.4%] h-[7.2%] rounded-full flex items-center justify-center gap-2 text-xs font-black cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-amber-300 ${
          confirmingReset
            ? 'bg-gradient-to-b from-red-500 to-red-700 border-2 border-amber-300 text-white shadow-[0_0_18px_rgba(239,68,68,0.85)]'
            : 'bg-transparent text-transparent'
        }`}
      >
        {confirmingReset && (
          <>
            <RotateCcw className="w-4 h-4" />
            <span>{t.confirmReset}</span>
          </>
        )}
      </button>

      {/* Status Toast Banner */}
      {notice && (
        <div
          role="status"
          className="absolute left-1/2 -translate-x-1/2 top-[59.0%] z-30 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-2 border-white text-indigo-950 text-xs font-black whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.65)]"
        >
          ✨ {notice}
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
