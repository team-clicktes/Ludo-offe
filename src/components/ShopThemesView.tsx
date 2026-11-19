import React, { useState } from 'react';
import { Check, Palette, Sparkles, X } from 'lucide-react';
import { BOARD_THEMES, DICE_SKINS, calculateLevelInfo } from '../game/progression';
import {
  AppLanguage,
  BoardThemeId,
  DiceSkinId,
  HomeTab,
  PlayerProfileStats,
} from '../game/types';
import { TRANSLATIONS } from '../i18n/translations';

interface ShopThemesViewProps {
  profile: PlayerProfileStats;
  language: AppLanguage;
  onSelectOrBuyTheme: (id: BoardThemeId, price: number) => void;
  onSelectOrBuyDice: (id: DiceSkinId, price: number) => void;
  onOpenProfile: () => void;
  onNavigateTab: (tab: HomeTab) => void;
}

const THEME_LAYOUT: Record<
  BoardThemeId,
  { card: string; btn: string }
> = {
  royal: {
    card: 'left-[4.2%] top-[28.2%] w-[44.8%] h-[17.3%]',
    btn: 'left-[7.6%] top-[40.4%] w-[38.0%] h-[4.5%]',
  },
  emerald: {
    card: 'left-[51.0%] top-[28.2%] w-[44.8%] h-[17.3%]',
    btn: 'left-[54.4%] top-[40.4%] w-[38.0%] h-[4.5%]',
  },
  crimson: {
    card: 'left-[4.2%] top-[46.8%] w-[44.8%] h-[17.3%]',
    btn: 'left-[7.6%] top-[59.0%] w-[38.0%] h-[4.5%]',
  },
  obsidian: {
    card: 'left-[51.0%] top-[46.8%] w-[44.8%] h-[17.3%]',
    btn: 'left-[54.4%] top-[59.0%] w-[38.0%] h-[4.5%]',
  },
};

const DICE_LAYOUT: Record<
  DiceSkinId,
  { card: string; btn: string }
> = {
  ivory: {
    card: 'left-[3.6%] top-[71.0%] w-[30.2%] h-[15.2%]',
    btn: 'left-[6.2%] top-[81.3%] w-[25.0%] h-[3.8%]',
  },
  gold: {
    card: 'left-[34.9%] top-[71.0%] w-[30.2%] h-[15.2%]',
    btn: 'left-[37.5%] top-[81.3%] w-[25.0%] h-[3.8%]',
  },
  sapphire: {
    card: 'left-[66.2%] top-[71.0%] w-[30.2%] h-[15.2%]',
    btn: 'left-[68.8%] top-[81.3%] w-[25.0%] h-[3.8%]',
  },
};

export const ShopThemesView: React.FC<ShopThemesViewProps> = ({
  profile,
  language,
  onSelectOrBuyTheme,
  onSelectOrBuyDice,
  onOpenProfile,
  onNavigateTab,
}) => {
  const t = TRANSLATIONS[language];
  const levelInfo = calculateLevelInfo(profile.xp);

  const [focusSection, setFocusSection] = useState<'themes' | 'dice'>('themes');
  const [shopNotice, setShopNotice] = useState<string | null>(null);
  const [showSpecialModal, setShowSpecialModal] = useState(false);

  const showToast = (msg: string) => {
    setShopNotice(msg);
    window.setTimeout(() => {
      setShopNotice((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const handleThemeClick = (id: BoardThemeId, price: number, name: string) => {
    const owned = profile.unlockedThemes.includes(id);
    const equipped = profile.equippedTheme === id;
    if (equipped) {
      showToast(`${name} is already equipped`);
      return;
    }
    if (!owned && profile.coins < price) {
      showToast(`Need ${price} coins! Visit Rewards to earn more.`);
      return;
    }
    onSelectOrBuyTheme(id, price);
    showToast(owned ? `${name} equipped!` : `Unlocked & equipped ${name}!`);
  };

  const handleDiceClick = (id: DiceSkinId, price: number, name: string) => {
    const owned = profile.unlockedDice.includes(id);
    const equipped = profile.equippedDice === id;
    if (equipped) {
      showToast(`${name} is already equipped`);
      return;
    }
    if (!owned && profile.coins < price) {
      showToast(`Need ${price} coins! Visit Rewards to earn more.`);
      return;
    }
    onSelectOrBuyDice(id, price);
    showToast(owned ? `${name} equipped!` : `Unlocked & equipped ${name}!`);
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <h1 className="sr-only">{t.shopTitle}</h1>

      {/* Exact User-Provided 9:16 Shop PNG */}
      <img
        src="/assets/aistudio/file_00000000a1ac8211a25307a661efe878_40ab8f44.png"
        alt="LUDO STAR Shop"
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

      {/* 4 Category Pills: Themes | Dice Styles | Coins | Special */}
      <button
        type="button"
        onClick={() => {
          setFocusSection('themes');
          showToast('Select a Board Theme below');
        }}
        aria-label="Themes"
        className={`absolute left-[2.2%] top-[17.6%] w-[23.6%] h-[4.8%] rounded-full cursor-pointer transition-all ${
          focusSection === 'themes'
            ? 'bg-transparent'
            : 'bg-[#1a0a4a]/65 ring-1 ring-white/20'
        }`}
      />
      <button
        type="button"
        onClick={() => {
          setFocusSection('dice');
          showToast('Select a 3D Dice Style below');
        }}
        aria-label="Dice Styles"
        className={`absolute left-[26.6%] top-[17.6%] w-[23.6%] h-[4.8%] rounded-full cursor-pointer transition-all ${
          focusSection === 'dice'
            ? 'ring-2 ring-amber-300 bg-amber-400/20 shadow-[0_0_12px_rgba(253,224,71,0.85)]'
            : 'bg-transparent'
        }`}
      />
      <button
        type="button"
        onClick={() => onNavigateTab('rewards')}
        aria-label="Free Coins"
        className="absolute left-[50.8%] top-[17.6%] w-[23.2%] h-[4.8%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      />
      <button
        type="button"
        data-testid="shop-special-btn"
        onClick={() => setShowSpecialModal(true)}
        aria-label="Special Collection"
        className="absolute left-[74.6%] top-[17.6%] w-[23.2%] h-[4.8%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300"
      />

      {/* Active Board Themes Section Highlight when Dice tab is NOT focused */}
      {focusSection === 'dice' && (
        <div
          aria-hidden="true"
          className="absolute left-[2.2%] top-[69.8%] w-[95.6%] h-[17.4%] rounded-2xl ring-2 ring-amber-300/90 shadow-[0_0_20px_rgba(253,224,71,0.55)] pointer-events-none"
        />
      )}

      {/* 4 Board Theme Cards & Buttons */}
      {BOARD_THEMES.map((theme) => {
        const layout = THEME_LAYOUT[theme.id];
        const owned = profile.unlockedThemes.includes(theme.id);
        const equipped = profile.equippedTheme === theme.id;
        const themeLabel = language === 'ur' ? theme.nameUr : theme.name;

        return (
          <React.Fragment key={theme.id}>
            {/* Card Selection Glow / Mask */}
            <div
              onClick={() => handleThemeClick(theme.id, theme.price, themeLabel)}
              className={`absolute ${layout.card} rounded-2xl cursor-pointer transition-all ${
                equipped
                  ? theme.id === 'royal'
                    ? 'ring-2 ring-amber-200/80'
                    : 'ring-3 ring-amber-300 shadow-[0_0_18px_rgba(253,224,71,0.9)]'
                  : theme.id === 'royal'
                    ? 'bg-[#120d3d]/20'
                    : ''
              }`}
            >
              {/* Mask baked-in Royal Indigo checkmark & "Equipped" pill if another theme is equipped */}
              {theme.id === 'royal' && !equipped && (
                <>
                  <div
                    className="absolute right-[2.2%] top-[3.8%] w-[13%] h-[18%] rounded-full bg-[#24125c]"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-[1.2%] top-[18.5%] px-2 py-0.5 rounded-full bg-[#1e155c] border border-amber-300/45 text-[9px] font-extrabold text-amber-200 shadow"
                    aria-hidden="true"
                  >
                    Owned
                  </div>
                </>
              )}

              {/* Equipped check badge for non-royal themes */}
              {theme.id !== 'royal' && equipped && (
                <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}
            </div>

            {/* Theme Buy / Equip Action Button */}
            <button
              type="button"
              data-testid={`theme-btn-${theme.id}`}
              onClick={() => handleThemeClick(theme.id, theme.price, themeLabel)}
              aria-label={`${themeLabel} - ${
                equipped ? t.equipped : owned ? t.equip : `${theme.price} Coins`
              }`}
              className={`absolute ${layout.btn} rounded-full flex items-center justify-center gap-1 text-xs font-black cursor-pointer transition-all ${
                theme.id === 'royal'
                  ? equipped
                    ? 'bg-transparent text-transparent'
                    : 'btn-royal-3d text-amber-200 border border-amber-300/70'
                  : equipped
                    ? 'bg-emerald-600 border-2 border-emerald-200 text-white shadow'
                    : owned
                      ? 'bg-[#1e2268] border-2 border-amber-300/80 text-amber-200 shadow'
                      : 'bg-transparent text-transparent'
              }`}
            >
              {theme.id === 'royal' ? (
                !equipped ? (
                  <span>{t.equip}</span>
                ) : null
              ) : equipped ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{t.equipped}</span>
                </>
              ) : owned ? (
                <span>{t.equip}</span>
              ) : null}
            </button>
          </React.Fragment>
        );
      })}

      {/* 3D Dice Style Cards & Buttons */}
      {DICE_SKINS.map((skin) => {
        const layout = DICE_LAYOUT[skin.id];
        const owned = profile.unlockedDice.includes(skin.id);
        const equipped = profile.equippedDice === skin.id;
        const skinLabel = language === 'ur' ? skin.nameUr : skin.name;

        return (
          <React.Fragment key={skin.id}>
            <div
              onClick={() => handleDiceClick(skin.id, skin.price, skinLabel)}
              className={`absolute ${layout.card} rounded-xl cursor-pointer transition-all ${
                equipped
                  ? skin.id === 'ivory'
                    ? ''
                    : 'ring-2 ring-amber-300 shadow-[0_0_16px_rgba(253,224,71,0.9)]'
                  : ''
              }`}
            >
              {skin.id !== 'ivory' && equipped && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center shadow">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
              {skin.id === 'ivory' && !equipped && (
                <div
                  className="absolute right-[0.8%] top-[16.5%] w-[28%] h-[23%] rounded-full bg-[#1b1256]"
                  aria-hidden="true"
                />
              )}
            </div>

            <button
              type="button"
              data-testid={`dice-skin-btn-${skin.id}`}
              onClick={() => handleDiceClick(skin.id, skin.price, skinLabel)}
              aria-label={`${skinLabel} - ${
                equipped ? t.equipped : owned ? t.equip : `${skin.price} Coins`
              }`}
              className={`absolute ${layout.btn} rounded-full flex items-center justify-center gap-1 text-[11px] font-black cursor-pointer transition-all ${
                skin.id === 'ivory'
                  ? equipped
                    ? 'bg-transparent text-transparent'
                    : 'bg-[#1e2268] border-2 border-amber-300/80 text-amber-200 shadow'
                  : equipped
                    ? 'bg-emerald-600 border-2 border-emerald-200 text-white shadow'
                    : owned
                      ? 'bg-[#1e2268] border-2 border-amber-300/80 text-amber-200 shadow'
                      : 'bg-transparent text-transparent'
              }`}
            >
              {skin.id === 'ivory' ? (
                !equipped ? (
                  <span>{t.equip}</span>
                ) : null
              ) : equipped ? (
                <>
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{t.equipped}</span>
                </>
              ) : owned ? (
                <span>{t.equip}</span>
              ) : null}
            </button>
          </React.Fragment>
        );
      })}

      {/* Status Toast Banner */}
      {shopNotice && (
        <div
          role="status"
          className="absolute left-1/2 -translate-x-1/2 top-[44.5%] z-30 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-2 border-white text-indigo-950 text-xs font-black whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.65)]"
        >
          ✨ {shopNotice}
        </div>
      )}

      {/* Bottom 5-Tab Navigation Hotspots over PNG Nav Bar */}
      <nav aria-label="Lobby Navigation">
        <button
          type="button"
          data-testid="nav-tab-home"
          onClick={() => onNavigateTab('home')}
          aria-label={t.tabHome}
          className="absolute left-[0.5%] top-[90.2%] w-[19.8%] h-[9.8%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-rewards"
          onClick={() => onNavigateTab('rewards')}
          aria-label={t.tabRewards}
          className="absolute left-[20.3%] top-[90.2%] w-[19.8%] h-[9.8%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-shop"
          onClick={() => onNavigateTab('shop')}
          aria-label={t.tabShop}
          className="absolute left-[40.1%] top-[89.2%] w-[19.8%] h-[10.8%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-stats"
          onClick={() => onNavigateTab('stats')}
          aria-label={t.tabStats}
          className="absolute left-[59.9%] top-[90.2%] w-[19.8%] h-[9.8%] bg-transparent cursor-pointer"
        />
        <button
          type="button"
          data-testid="nav-tab-settings"
          onClick={() => onNavigateTab('settings')}
          aria-label={t.tabSettings}
          className="absolute left-[79.7%] top-[90.2%] w-[19.8%] h-[9.8%] bg-transparent cursor-pointer"
        />
      </nav>

      {/* Special Royal Collection Overview Modal */}
      {showSpecialModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Special Royal Collection"
          className="absolute inset-0 z-40 bg-indigo-950/90 backdrop-blur-sm p-3.5 flex items-center justify-center"
        >
          <div className="royal-card rounded-2xl w-full p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h2 className="font-display font-black text-base text-amber-300">
                  Royal Collection
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSpecialModal(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-lg bg-indigo-900 border border-white/15 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl bg-indigo-950/80 border border-amber-300/30 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Palette className="w-5 h-5 text-amber-300" />
                <div>
                  <div className="text-xs font-extrabold text-white">
                    Themes Unlocked: {profile.unlockedThemes.length}/{BOARD_THEMES.length}
                  </div>
                  <div className="text-[11px] text-indigo-200/80">
                    Dice Unlocked: {profile.unlockedDice.length}/{DICE_SKINS.length}
                  </div>
                </div>
              </div>
              <span className="text-xs font-black text-amber-300 tabular-nums">
                {profile.coins.toLocaleString()} Coins
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSpecialModal(false);
                  onOpenProfile();
                }}
                className="btn-royal-3d h-11 rounded-xl text-xs font-extrabold text-amber-200 cursor-pointer"
              >
                Change Avatar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSpecialModal(false);
                  onNavigateTab('rewards');
                }}
                className="btn-gold-3d h-11 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Earn Free Coins
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
