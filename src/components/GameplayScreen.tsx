import React from 'react';
import { Bot, Crown, User } from 'lucide-react';
import { PLAYER_THEME } from '../game/boardGeometry';
import { getCurrentPlayerColor } from '../game/ludoEngine';
import { calculateLevelInfo } from '../game/progression';
import {
  BoardThemeId,
  DiceSkinId,
  MatchState,
  PlayerColor,
  PlayerSeat,
  SettingsState,
  Token,
} from '../game/types';
import { Dice3D } from './Dice3D';
import { LudoBoard3D } from './LudoBoard3D';

interface GameplayScreenProps {
  match: MatchState;
  playerName: string;
  xp: number;
  coins: number;
  settings: SettingsState;
  boardThemeId: BoardThemeId;
  diceSkinId: DiceSkinId;
  isRolling: boolean;
  displayDice: number | null;
  captureFlashCell: { x: number; y: number } | null;
  onRollDice: () => void;
  onTokenClick: (tokenId: string) => void;
  onGoHome: () => void;
  onRestart: () => void;
  onPause: () => void;
  onOpenProfile: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

const POD_BG: Record<PlayerColor, string> = {
  red: 'linear-gradient(180deg, #b91c1c 0%, #7f1d1d 100%)',
  green: 'linear-gradient(180deg, #15803d 0%, #14532d 100%)',
  blue: 'linear-gradient(180deg, #1d4ed8 0%, #1e3a8a 100%)',
  yellow: 'linear-gradient(180deg, #ca8a04 0%, #854d0e 100%)',
};

function SeatOverlayContent({
  seat,
  tokens,
  isCurrentTurn,
  align,
}: {
  seat: PlayerSeat;
  tokens: Token[];
  isCurrentTurn: boolean;
  align: 'left' | 'right';
}) {
  const finishedCount = tokens.filter((t) => t.progress === 56).length;
  const theme = PLAYER_THEME[seat.color];

  return (
    <div
      className={`w-full h-full rounded-xl px-1.5 py-0.5 flex flex-col justify-center ${
        align === 'right' ? 'items-end text-right' : 'items-start text-left'
      }`}
      style={{
        background: seat.active
          ? POD_BG[seat.color]
          : 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
      }}
    >
      <div
        className={`flex items-center gap-1 max-w-full ${
          align === 'right' ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {seat.active && (
          <span
            className="w-3 h-3 rounded-full flex items-center justify-center shrink-0 border border-white/60"
            style={{ backgroundColor: theme.primary }}
          >
            {seat.kind === 'bot' ? (
              <Bot className="w-2 h-2 text-white" />
            ) : (
              <User className="w-2 h-2 text-white" />
            )}
          </span>
        )}
        <span className="text-[10.5px] font-extrabold text-white truncate drop-shadow leading-tight">
          {seat.active ? seat.name : 'Open Seat'}
        </span>
      </div>

      {/* Live 4-Token Home Progress Pips */}
      <div
        className={`flex items-center gap-0.5 mt-1 ${
          align === 'right' ? 'justify-end' : 'justify-start'
        }`}
        aria-label={seat.active ? `${finishedCount} of 4 tokens home` : 'Inactive seat'}
      >
        {seat.active ? (
          <>
            {[0, 1, 2, 3].map((pip) => {
              const isHome = pip < finishedCount;
              return (
                <span
                  key={pip}
                  className="w-2.5 h-2.5 rounded-full border border-white/80 shadow-inner transition-transform shrink-0"
                  style={{
                    background: isHome
                      ? '#fde047'
                      : `radial-gradient(circle at 35% 30%, ${theme.light}, ${theme.primary}, ${theme.dark})`,
                    boxShadow: isHome
                      ? '0 0 6px #fde047'
                      : 'inset 0 -1px 2px rgba(0,0,0,0.45)',
                    transform: isCurrentTurn && !isHome ? 'scale(1.06)' : undefined,
                  }}
                />
              );
            })}
            <span className="text-[9px] font-black text-amber-200 tabular-nums ml-0.5 shrink-0">
              {finishedCount}/4
            </span>
          </>
        ) : (
          <span className="text-[9px] font-semibold text-indigo-300/80">Inactive</span>
        )}
      </div>
    </div>
  );
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  match,
  playerName,
  xp,
  coins,
  boardThemeId,
  diceSkinId,
  isRolling,
  displayDice,
  captureFlashCell,
  onRollDice,
  onTokenClick,
  onGoHome,
  onRestart,
  onPause,
  onOpenProfile,
}) => {
  const levelInfo = calculateLevelInfo(xp);
  const currentColor = getCurrentPlayerColor(match);
  const currentSeat = match.seats[currentColor];
  const currentTheme = PLAYER_THEME[currentColor];

  const canHumanRoll =
    match.phase === 'WAIT_ROLL' && !isRolling && currentSeat.kind === 'human';

  const getTokensFor = (color: PlayerColor): Token[] =>
    Object.values(match.tokens).filter((t) => t.color === color);

  const rollBtnLabel = isRolling
    ? 'Rolling...'
    : match.phase === 'SELECT_TOKEN'
      ? currentSeat.kind === 'bot'
        ? 'CPU Moving...'
        : `Tap Pawn (${match.diceValue})`
      : currentSeat.kind === 'bot'
        ? `${currentSeat.name}...`
        : 'Roll Dice';

  const turnPillText =
    match.phase === 'SELECT_TOKEN' && currentSeat.kind === 'human'
      ? `Move Pawn (${match.diceValue})`
      : match.phase === 'GAME_OVER'
        ? 'Match Over!'
        : `${currentSeat.name}'s Turn`;

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* Exact User-Provided 9:16 Gameplay Frame PNG */}
      <img
        src="/assets/aistudio/file_0000000098348211b642e2ac1c048c5b_50780140.png"
        alt="LUDO STAR Gameplay Board Backdrop"
        className="w-full h-full object-fill pointer-events-none select-none block"
      />

      {/* Top-Left Live Player Profile Pill */}
      <button
        type="button"
        data-testid="gameplay-profile-btn"
        onClick={onOpenProfile}
        aria-label={`Player Profile: ${playerName}, Level ${levelInfo.level}`}
        className="absolute left-[1.8%] top-[0.6%] w-[39.5%] h-[7.6%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 z-20"
      >
        <div
          className="absolute left-[44%] top-[10%] w-[51%] h-[82%] rounded-r-full flex flex-col justify-center px-1.5 text-left"
          style={{
            background: 'linear-gradient(180deg, #1b1e63 0%, #0f1244 100%)',
          }}
        >
          <span className="text-[11px] font-extrabold text-white truncate leading-tight">
            {playerName}
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

      {/* Top-Right Live Coin Counter Capsule */}
      <div
        data-testid="coin-counter"
        aria-label={`Coins: ${coins.toLocaleString()}`}
        className="absolute left-[58%] top-[1.2%] w-[28.2%] h-[5.6%] rounded-full pointer-events-none z-20"
      >
        <span
          className="absolute left-[29%] top-[16%] w-[44%] h-[68%] flex items-center justify-center text-xs font-black text-white tabular-nums rounded"
          style={{ background: '#0c0d36' }}
        >
          {coins.toLocaleString()}
        </span>
      </div>

      {/* Top-Right Settings / Pause Gear Hotspot */}
      <button
        type="button"
        data-testid="gameplay-settings-btn"
        onClick={onPause}
        aria-label="Game Menu & Audio Settings"
        className="absolute left-[87.5%] top-[1%] w-[10.5%] h-[6%] rounded-xl bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 z-20"
      />

      {/* TOP-LEFT POD: RED (Player 1) */}
      <div
        data-testid="player-pod-red"
        data-active-turn={currentColor === 'red' && match.phase !== 'GAME_OVER' ? 'true' : 'false'}
        className={`absolute left-[1.2%] top-[16.4%] w-[34.2%] h-[9.2%] rounded-2xl transition-all duration-200 z-10 ${
          currentColor === 'red' && match.phase !== 'GAME_OVER'
            ? 'ring-3 ring-amber-300 shadow-[0_0_20px_rgba(253,224,71,0.95)] scale-[1.02]'
            : ''
        }`}
      >
        <div className="absolute left-[39.5%] top-[8%] w-[58.5%] h-[84%] rounded-xl overflow-hidden">
          <SeatOverlayContent
            seat={match.seats.red}
            tokens={getTokensFor('red')}
            isCurrentTurn={currentColor === 'red' && match.phase !== 'GAME_OVER'}
            align="left"
          />
        </div>
      </div>

      {/* TOP-RIGHT POD: GREEN */}
      <div
        data-testid="player-pod-green"
        data-active-turn={currentColor === 'green' && match.phase !== 'GAME_OVER' ? 'true' : 'false'}
        className={`absolute left-[64.6%] top-[16.4%] w-[34.2%] h-[9.2%] rounded-2xl transition-all duration-200 z-10 ${
          currentColor === 'green' && match.phase !== 'GAME_OVER'
            ? 'ring-3 ring-amber-300 shadow-[0_0_20px_rgba(253,224,71,0.95)] scale-[1.02]'
            : ''
        }`}
      >
        <div className="absolute left-[2.0%] top-[8%] w-[58.5%] h-[84%] rounded-xl overflow-hidden">
          <SeatOverlayContent
            seat={match.seats.green}
            tokens={getTokensFor('green')}
            isCurrentTurn={currentColor === 'green' && match.phase !== 'GAME_OVER'}
            align="right"
          />
        </div>
      </div>

      {/* CENTERPIECE: LIVE 15x15 3D LUDO BOARD (Covering Static PNG Pawns Cleanly) */}
      <div className="absolute left-[0.8%] top-[26.8%] w-[98.4%] h-[42.9%] z-20">
        <LudoBoard3D
          match={match}
          currentColor={currentColor}
          boardThemeId={boardThemeId}
          fillContainer
          onTokenClick={onTokenClick}
          captureFlashCell={captureFlashCell}
        />
      </div>

      {/* BOTTOM-LEFT POD: BLUE */}
      <div
        data-testid="player-pod-blue"
        data-active-turn={currentColor === 'blue' && match.phase !== 'GAME_OVER' ? 'true' : 'false'}
        className={`absolute left-[1.2%] top-[70.4%] w-[34.2%] h-[9.2%] rounded-2xl transition-all duration-200 z-10 ${
          currentColor === 'blue' && match.phase !== 'GAME_OVER'
            ? 'ring-3 ring-amber-300 shadow-[0_0_20px_rgba(253,224,71,0.95)] scale-[1.02]'
            : ''
        }`}
      >
        <div className="absolute left-[39.5%] top-[8%] w-[58.5%] h-[84%] rounded-xl overflow-hidden">
          <SeatOverlayContent
            seat={match.seats.blue}
            tokens={getTokensFor('blue')}
            isCurrentTurn={currentColor === 'blue' && match.phase !== 'GAME_OVER'}
            align="left"
          />
        </div>
      </div>

      {/* BOTTOM-RIGHT POD: YELLOW + LIVE TURN PILL (Masks Baked Crown & Turn Pill Cleanly) */}
      <div
        data-testid="player-pod-yellow"
        data-active-turn={currentColor === 'yellow' && match.phase !== 'GAME_OVER' ? 'true' : 'false'}
        className={`absolute left-[64.8%] top-[70.0%] w-[34.2%] h-[6.2%] rounded-xl border-2 overflow-hidden shadow-lg transition-all duration-200 z-20 ${
          currentColor === 'yellow' && match.phase !== 'GAME_OVER'
            ? 'border-amber-200 ring-2 ring-amber-300 shadow-[0_0_18px_rgba(253,224,71,0.95)] scale-[1.02]'
            : 'border-amber-400/80'
        }`}
      >
        <SeatOverlayContent
          seat={match.seats.yellow}
          tokens={getTokensFor('yellow')}
          isCurrentTurn={currentColor === 'yellow' && match.phase !== 'GAME_OVER'}
          align="right"
        />
      </div>

      {/* Live Turn Status Pill (Directly below Yellow Pod, above Roll Dice row) */}
      <div
        data-testid="turn-status"
        aria-live="polite"
        className="absolute left-[64.8%] top-[76.4%] w-[34.2%] h-[5.3%] rounded-full border-2 border-amber-300 flex items-center justify-center gap-1.5 px-2 shadow-[0_4px_12px_rgba(0,0,0,0.55)] z-20"
        style={{
          background: 'linear-gradient(180deg, #4c1d95 0%, #2e1065 100%)',
        }}
      >
        <Crown
          className="w-3.5 h-3.5 shrink-0"
          style={{ color: currentTheme.light }}
        />
        <span className="text-[11px] font-black text-amber-200 truncate tracking-tight">
          {turnPillText}
        </span>
      </div>

      {/* CENTER ANIMATED 3D DICE OVER GLOWING BLUE AURA */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[72.7%] z-30 flex items-center justify-center">
        <Dice3D
          value={displayDice ?? match.diceValue}
          isRolling={isRolling}
          canRoll={canHumanRoll}
          activeColor={currentColor}
          diceSkinId={diceSkinId}
          compact
          onRoll={onRollDice}
        />
      </div>

      {/* PRIMARY GREEN "ROLL DICE" BUTTON */}
      <button
        type="button"
        data-testid="roll-dice-btn"
        onClick={onRollDice}
        disabled={!canHumanRoll}
        className={`absolute left-[31.8%] top-[81.7%] w-[36.4%] h-[6.4%] rounded-full font-display font-black text-sm tracking-wide flex items-center justify-center border-2 transition-all z-30 ${
          canHumanRoll
            ? 'btn-emerald-3d border-amber-200 cursor-pointer shadow-[0_4px_0_#055226,0_8px_18px_rgba(0,0,0,0.45)]'
            : 'bg-indigo-950/95 border-amber-300/40 text-amber-100/90 cursor-default shadow-md'
        }`}
      >
        <span className="truncate px-2">{rollBtnLabel}</span>
      </button>

      {/* BOTTOM 4 ACTION BUTTON HOTSPOTS MATCHING PNG */}
      <button
        type="button"
        data-testid="gameplay-home-btn"
        onClick={onGoHome}
        aria-label="Home"
        className="absolute left-[3.0%] top-[89.2%] w-[16.4%] h-[9.0%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 z-20"
      />
      <button
        type="button"
        data-testid="gameplay-menu-btn"
        onClick={onPause}
        aria-label="Menu"
        className="absolute left-[20.4%] top-[89.2%] w-[16.4%] h-[9.0%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 z-20"
      />
      <button
        type="button"
        data-testid="gameplay-restart-btn"
        onClick={onRestart}
        aria-label="Restart Match"
        className="absolute left-[65.8%] top-[89.2%] w-[16.4%] h-[9.0%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 z-20"
      />
      <button
        type="button"
        data-testid="gameplay-pause-btn"
        onClick={onPause}
        aria-label="Pause"
        className="absolute left-[83.0%] top-[89.2%] w-[16.4%] h-[9.0%] rounded-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-300 z-20"
      />
    </div>
  );
};
