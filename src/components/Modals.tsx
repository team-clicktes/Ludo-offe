import React, { useState } from 'react';
import {
  Award,
  Check,
  Coins,
  Crown,
  Home,
  Music,
  Play,
  RotateCcw,
  Shield,
  Trophy,
  Volume2,
  X,
} from 'lucide-react';
import { PLAYER_THEME } from '../game/boardGeometry';
import { AVATAR_OPTIONS, calculateLevelInfo } from '../game/progression';
import {
  AppLanguage,
  PlayerProfileStats,
  SettingsState,
  StandingEntry,
} from '../game/types';
import { TRANSLATIONS } from '../i18n/translations';
import { PlayerAvatarIcon } from './PlayerAvatarIcon';

interface ModalShellProps {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({ title, onClose, children }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label={title}
    className="absolute inset-0 z-50 bg-indigo-950/80 flex items-center justify-center p-4"
  >
    <div className="royal-card w-full max-w-[360px] rounded-2xl p-4 flex flex-col gap-3 max-h-[88%] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-amber-300/25 pb-2.5">
        <h2 className="font-display font-black text-lg text-amber-300 tracking-wide">
          {title}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="w-10 h-10 rounded-xl bg-indigo-900/80 border border-white/20 flex items-center justify-center text-white hover:bg-indigo-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {children}
    </div>
  </div>
);

/* ---------------- PLAYER PROFILE MODAL ---------------- */
interface PlayerProfileModalProps {
  profile: PlayerProfileStats;
  language: AppLanguage;
  onSave: (playerName: string, avatarId: string) => void;
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  profile,
  language,
  onSave,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const [nameInput, setNameInput] = useState(profile.playerName);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId);
  const levelInfo = calculateLevelInfo(profile.xp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameInput.trim() || 'Player 1';
    onSave(cleaned.slice(0, 18), selectedAvatar);
  };

  return (
    <ModalShell title={t.playerProfile} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Level & XP Summary */}
        <div className="rounded-xl bg-indigo-950/80 border border-amber-300/35 p-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 border-2 border-amber-100 flex items-center justify-center text-indigo-950 shrink-0">
            <PlayerAvatarIcon avatarId={selectedAvatar} className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-300">
                {t.levelLabel} {levelInfo.level} · {levelInfo.title}
              </span>
              <span className="text-[11px] font-bold text-amber-200 tabular-nums">
                {profile.coins.toLocaleString()} Coins
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-indigo-900 overflow-hidden mt-1.5">
              <div
                className="h-full bg-amber-400"
                style={{ width: `${levelInfo.progressPct}%` }}
              />
            </div>
            <div className="text-[10px] text-indigo-200/75 mt-1 tabular-nums">
              {levelInfo.currentXpInLevel} / {levelInfo.xpForNextLevel} XP to next level
            </div>
          </div>
        </div>

        {/* Player Name Input */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-amber-200">{t.playerName}</span>
          <input
            type="text"
            maxLength={18}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Enter player name"
            className="h-11 rounded-xl bg-indigo-950/90 border border-indigo-400/45 px-3 text-sm font-bold text-white focus:outline-none focus:border-amber-300"
          />
        </label>

        {/* Avatar Badge Picker */}
        <div>
          <span className="text-xs font-bold text-amber-200 block mb-1.5">
            Avatar Crest
          </span>
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_OPTIONS.map((opt) => {
              const selected = selectedAvatar === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedAvatar(opt.id)}
                  className={`h-12 rounded-xl flex flex-col items-center justify-center border cursor-pointer ${
                    selected
                      ? 'btn-gold-3d'
                      : 'bg-indigo-950/75 border-white/15 text-indigo-200'
                  }`}
                >
                  <PlayerAvatarIcon avatarId={opt.id} className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          data-testid="save-profile-btn"
          className="btn-emerald-3d w-full h-11 rounded-xl font-extrabold text-sm flex items-center justify-center gap-1.5 cursor-pointer mt-1"
        >
          <Check className="w-4 h-4" />
          {t.saveProfile}
        </button>
      </form>
    </ModalShell>
  );
};

/* ---------------- PRIVACY POLICY MODAL ---------------- */
export const PrivacyPolicyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <ModalShell title="Privacy Policy" onClose={onClose}>
      <div className="flex flex-col gap-2.5 text-xs text-indigo-100/90 leading-relaxed">
        <div className="rounded-xl bg-indigo-950/70 border border-indigo-400/25 p-3 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            <strong>100% Offline Privacy:</strong> LUDO STAR runs completely offline on
            your device. We do not collect, track, upload, or share any personal
            information.
          </p>
        </div>
        <div className="rounded-xl bg-indigo-950/70 border border-indigo-400/25 p-3">
          <p>
            <strong>Local Storage Only:</strong> Your Player Name, Level, Coins,
            Themes, Match History, and Settings are stored strictly in your browser
            device storage (`localStorage`) and can be cleared anytime via Reset Game.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="btn-gold-3d w-full h-11 rounded-xl font-extrabold text-sm cursor-pointer"
      >
        Close
      </button>
    </ModalShell>
  );
};

/* ---------------- HOW TO PLAY MODAL ---------------- */
export const HowToPlayModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const rules = [
    {
      title: '1. Leave Home on a 6',
      desc: 'Roll a 6 to move one of your tokens from the colored home yard onto its start square.',
    },
    {
      title: '2. Bonus Rolls',
      desc: 'Rolling a 6, capturing an opponent, or reaching the center crown grants an extra roll! Rolling three 6s in a row forfeits the turn.',
    },
    {
      title: '3. Capture Opponents',
      desc: 'Land on an opponent token outside a safe cell to send it back to their home yard and earn +25 coins.',
    },
    {
      title: '4. Safe Star Squares',
      desc: 'Colored start squares and star squares protect all tokens on them from being captured.',
    },
    {
      title: '5. Win the Crown',
      desc: 'Guide all 4 tokens clockwise around the board, up your colored home lane, and into the center crown by exact roll.',
    },
  ];

  return (
    <ModalShell title="How to Play" onClose={onClose}>
      <div className="flex flex-col gap-2.5 text-left">
        {rules.map((r) => (
          <div
            key={r.title}
            className="rounded-xl bg-indigo-950/70 border border-indigo-400/25 p-2.5"
          >
            <h3 className="text-xs font-extrabold text-amber-300 mb-0.5">{r.title}</h3>
            <p className="text-xs text-indigo-100/90 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="btn-gold-3d w-full h-11 rounded-xl font-extrabold text-sm cursor-pointer mt-1"
      >
        Got It!
      </button>
    </ModalShell>
  );
};

/* ---------------- PAUSE MODAL ---------------- */
interface PauseModalProps {
  settings: SettingsState;
  onResume: () => void;
  onRestart: () => void;
  onQuitHome: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  settings,
  onResume,
  onRestart,
  onQuitHome,
  onToggleSound,
  onToggleMusic,
}) => {
  return (
    <ModalShell title="Game Paused">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onToggleSound}
          className="btn-royal-3d h-11 rounded-xl text-xs font-bold text-amber-100 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-amber-300" />
          Sound: {settings.soundEnabled ? 'ON' : 'OFF'}
        </button>
        <button
          type="button"
          onClick={onToggleMusic}
          className="btn-royal-3d h-11 rounded-xl text-xs font-bold text-amber-100 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Music className="w-4 h-4 text-amber-300" />
          Music: {settings.musicEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="flex flex-col gap-2.5 pt-1">
        <button
          type="button"
          onClick={onResume}
          className="btn-emerald-3d w-full h-12 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          Resume Game
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="btn-gold-3d w-full h-11 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Restart Match
        </button>
        <button
          type="button"
          onClick={onQuitHome}
          className="btn-royal-3d w-full h-11 rounded-xl font-bold text-sm text-indigo-100 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4 text-amber-300" />
          New Game / Home
        </button>
      </div>
    </ModalShell>
  );
};

/* ---------------- VICTORY CELEBRATION MODAL ---------------- */
interface VictoryModalProps {
  standings: StandingEntry[];
  matchCoinsEarned: number;
  xpEarned: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  standings,
  matchCoinsEarned,
  xpEarned,
  onPlayAgain,
  onGoHome,
}) => {
  const winner = standings[0];
  const winnerTheme = PLAYER_THEME[winner.color];

  const confettiColors = ['#ef4444', '#22c55e', '#facc15', '#3b82f6', '#f472b6', '#ffffff'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Victory Celebration"
      data-testid="victory-modal"
      className="absolute inset-0 z-50 bg-indigo-950/85 flex items-center justify-center p-4 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="confetti-piece absolute top-0 w-2.5 h-4 rounded-sm"
            style={{
              left: `${(i * 4.2) % 98}%`,
              backgroundColor: confettiColors[i % confettiColors.length],
              animationDelay: `${(i * 0.14) % 1.8}s`,
            }}
          />
        ))}
      </div>

      <div className="royal-card w-full max-w-[360px] rounded-3xl p-5 flex flex-col items-center gap-3 relative z-10 border-2 border-amber-300">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-amber-200 shadow-lg"
          style={{
            background: `linear-gradient(145deg, ${winnerTheme.light}, ${winnerTheme.primary}, ${winnerTheme.dark})`,
          }}
        >
          <Trophy className="w-9 h-9 text-amber-200 drop-shadow" />
        </div>

        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-300 flex items-center justify-center gap-1">
            <Crown className="w-3.5 h-3.5" />
            Match Champion
          </div>
          <h2 className="font-display font-black text-2xl text-white mt-0.5">
            {winner.name} Wins!
          </h2>
        </div>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-400/15 border border-amber-300/50">
          <Coins className="w-4 h-4 text-amber-300" />
          <span className="text-sm font-extrabold text-amber-200 tabular-nums">
            +{matchCoinsEarned} Coins · +{xpEarned} XP
          </span>
        </div>

        <div className="w-full flex flex-col gap-1.5 my-1">
          {standings.map((entry) => {
            const theme = PLAYER_THEME[entry.color];
            return (
              <div
                key={entry.color}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                  entry.rank === 1
                    ? 'bg-amber-400/15 border-amber-300/60'
                    : 'bg-indigo-950/70 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-amber-300 tabular-nums w-5">
                    #{entry.rank}
                  </span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/80"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="text-xs font-bold text-white">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-indigo-200 tabular-nums">
                  <span className="flex items-center gap-0.5">
                    <Award className="w-3 h-3 text-amber-300" />
                    {entry.finishedCount}/4
                  </span>
                  <span>· {entry.captures} KO</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
          <button
            type="button"
            onClick={onGoHome}
            className="btn-royal-3d h-12 rounded-xl font-bold text-sm text-amber-100 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="btn-emerald-3d h-12 rounded-xl font-extrabold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
