import React from 'react';
import { Bot, User } from 'lucide-react';
import { PLAYER_THEME } from '../game/boardGeometry';
import { PlayerColor, PlayerSeat, Token } from '../game/types';

interface PlayerPodProps {
  seat: PlayerSeat;
  tokens: Token[];
  isCurrentTurn: boolean;
  align?: 'left' | 'right';
}

export const PlayerPod: React.FC<PlayerPodProps> = ({
  seat,
  tokens,
  isCurrentTurn,
  align = 'left',
}) => {
  const theme = PLAYER_THEME[seat.color];
  const finishedCount = tokens.filter((t) => t.progress === 56).length;

  if (!seat.active) {
    return (
      <div className="h-[46px] rounded-xl border border-white/10 bg-indigo-950/35 px-3 flex items-center justify-center text-xs text-indigo-300/45">
        Open Seat
      </div>
    );
  }

  return (
    <div
      data-testid={`player-pod-${seat.color}`}
      data-active-turn={isCurrentTurn ? 'true' : 'false'}
      className={`h-[48px] rounded-xl px-2.5 flex items-center gap-2 transition-all duration-200 ${
        align === 'right' ? 'flex-row-reverse text-right' : 'flex-row text-left'
      } ${
        isCurrentTurn
          ? 'border-2 border-amber-300 scale-[1.03]'
          : 'border border-white/15 opacity-85'
      }`}
      style={{
        background: isCurrentTurn
          ? `linear-gradient(135deg, ${theme.dark}, #1e1b4b)`
          : 'linear-gradient(135deg, rgba(30,27,75,0.88), rgba(17,14,54,0.92))',
        boxShadow: isCurrentTurn
          ? `0 0 18px ${theme.glow}, inset 0 1px 2px rgba(255,255,255,0.35)`
          : '0 4px 10px rgba(0,0,0,0.3)',
      }}
    >
      {/* Glossy 3D Avatar Medallion */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/50 shadow-inner"
        style={{
          background: `linear-gradient(145deg, ${theme.light}, ${theme.primary}, ${theme.dark})`,
        }}
      >
        {seat.kind === 'bot' ? (
          <Bot className="w-4 h-4 text-white drop-shadow" />
        ) : (
          <User className="w-4 h-4 text-white drop-shadow" />
        )}
      </div>

      {/* Name + Finished Token Pips */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 justify-between">
          <span className="text-xs font-bold text-white truncate leading-tight">
            {seat.name}
          </span>
        </div>
        <div
          className={`flex items-center gap-1 mt-1 ${
            align === 'right' ? 'justify-end' : 'justify-start'
          }`}
          aria-label={`${finishedCount} of 4 tokens home`}
        >
          {[0, 1, 2, 3].map((pip) => (
            <span
              key={pip}
              className="w-2.5 h-2.5 rounded-full border border-white/40 transition-colors"
              style={{
                backgroundColor: pip < finishedCount ? '#fde047' : 'rgba(255,255,255,0.12)',
                boxShadow: pip < finishedCount ? '0 0 6px #facc15' : 'none',
              }}
            />
          ))}
          <span className="text-[10px] font-semibold text-amber-200/90 tabular-nums ml-1">
            {finishedCount}/4
          </span>
        </div>
      </div>
    </div>
  );
};
