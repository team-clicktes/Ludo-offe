import React from 'react';
import {
  HOME_LANE_COORDS,
  HOME_YARD_POSITIONS,
  MAIN_TRACK_COORDS,
  PLAYER_THEME,
  STAR_TRACK_INDICES,
  START_TRACK_INDEX,
  getTokenBoardPoint,
  getTokenCellKey,
} from '../game/boardGeometry';
import { BOARD_THEMES } from '../game/progression';
import { BoardThemeId, MatchState, PlayerColor, Token } from '../game/types';

interface LudoBoard3DProps {
  match: MatchState;
  currentColor: PlayerColor;
  boardThemeId?: BoardThemeId;
  fillContainer?: boolean;
  onTokenClick: (tokenId: string) => void;
  captureFlashCell?: { x: number; y: number } | null;
}

const COLOR_HEX: Record<PlayerColor, { bg: string; light: string; dark: string }> = {
  red: { bg: '#ef4444', light: '#fca5a5', dark: '#991b1b' },
  green: { bg: '#22c55e', light: '#86efac', dark: '#166534' },
  yellow: { bg: '#facc15', light: '#fef08a', dark: '#a16207' },
  blue: { bg: '#3b82f6', light: '#93c5fd', dark: '#1e40af' },
};

function StarSvg({ color = '#94a3b8' }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className="w-[62%] h-[62%]" aria-hidden="true">
      <polygon
        points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6"
        fill={color}
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Pawn3DSvg({ color, isSelectable }: { color: PlayerColor; isSelectable: boolean }) {
  const c = COLOR_HEX[color];
  return (
    <svg
      viewBox="0 0 40 48"
      className="w-full h-full drop-shadow-[0_3px_4px_rgba(0,0,0,0.55)]"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`pawnHead-${color}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor={c.light} />
          <stop offset="72%" stopColor={c.bg} />
          <stop offset="100%" stopColor={c.dark} />
        </radialGradient>
        <linearGradient id={`pawnBody-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.light} />
          <stop offset="48%" stopColor={c.bg} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
      </defs>

      {/* Outer selection halo */}
      {isSelectable && (
        <ellipse
          cx="20"
          cy="41"
          rx="16"
          ry="5.5"
          fill="none"
          stroke="#fde047"
          strokeWidth="3"
        />
      )}

      {/* Ground shadow */}
      <ellipse cx="20" cy="43" rx="12" ry="3.6" fill="rgba(0,0,0,0.35)" />

      {/* Sculpted pawn base & skirt */}
      <path
        d="M8 40 C8 34 12 24 15 20 L25 20 C28 24 32 34 32 40 C32 42.5 26.5 44 20 44 C13.5 44 8 42.5 8 40 Z"
        fill={`url(#pawnBody-${color})`}
        stroke="#ffffff"
        strokeWidth="1.8"
      />

      {/* Collar ring */}
      <ellipse cx="20" cy="20" rx="6.5" ry="2.2" fill="#fef9c3" opacity="0.85" />

      {/* Glossy spherical head */}
      <circle
        cx="20"
        cy="13"
        r="9.2"
        fill={`url(#pawnHead-${color})`}
        stroke="#ffffff"
        strokeWidth="1.8"
      />

      {/* Specular shine */}
      <ellipse cx="16.8" cy="9.5" rx="3" ry="1.8" transform="rotate(-25 16.8 9.5)" fill="#ffffff" opacity="0.82" />
    </svg>
  );
}

export const LudoBoard3D: React.FC<LudoBoard3DProps> = ({
  match,
  currentColor,
  boardThemeId = 'royal',
  fillContainer = false,
  onTokenClick,
  captureFlashCell,
}) => {
  const boardTheme = BOARD_THEMES.find((t) => t.id === boardThemeId) ?? BOARD_THEMES[0];
  const allTokens = Object.values(match.tokens);

  // Group co-located tokens for neat visual fanning
  const cellGroups: Record<string, Token[]> = {};
  for (const t of allTokens) {
    const key = getTokenCellKey(t);
    if (!cellGroups[key]) cellGroups[key] = [];
    cellGroups[key].push(t);
  }

  // Build lookup maps for track and lane cell styling
  const trackMap = new Map<string, number>();
  MAIN_TRACK_COORDS.forEach((coord, idx) => {
    trackMap.set(`${coord.row},${coord.col}`, idx);
  });

  const laneMap = new Map<string, PlayerColor>();
  (['red', 'green', 'yellow', 'blue'] as PlayerColor[]).forEach((color) => {
    HOME_LANE_COORDS[color].forEach((coord) => {
      laneMap.set(`${coord.row},${coord.col}`, color);
    });
  });

  const startIndexToColor: Record<number, PlayerColor> = {
    [START_TRACK_INDEX.red]: 'red',
    [START_TRACK_INDEX.green]: 'green',
    [START_TRACK_INDEX.yellow]: 'yellow',
    [START_TRACK_INDEX.blue]: 'blue',
  };

  // Directional arrows on the 4 outer-track entry cells leading into each colored home stretch
  const homeEntryArrows: Record<string, { color: string; rotate: number }> = {
    '7,0': { color: COLOR_HEX.red.bg, rotate: 0 },
    '0,7': { color: COLOR_HEX.green.bg, rotate: 90 },
    '7,14': { color: COLOR_HEX.yellow.bg, rotate: 180 },
    '14,7': { color: COLOR_HEX.blue.bg, rotate: 270 },
  };

  return (
    <div
      data-testid="ludo-board"
      style={{
        background: boardTheme.frameGradient,
        boxShadow: `0 12px 26px rgba(0, 0, 0, 0.55), 0 4px 0 ${boardTheme.frameShadow}, inset 0 2px 3px rgba(255, 251, 235, 0.85)`,
      }}
      className={`ludo-board-frame w-full ${
        fillContainer ? 'h-full rounded-[20px] p-[2.1%]' : 'aspect-square rounded-[22px] p-2 sm:p-2.5'
      } relative select-none`}
    >
      {/* Inner recessed 15x15 board surface */}
      <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-100 relative shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] border-2 border-amber-200/85">
        {/* 15x15 Track Grid Cells (only non-base, non-center cells need grid tiles, bases & center rendered as crisp 3D blocks) */}
        <div
          className="grid w-full h-full"
          style={{
            gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
          }}
        >
          {Array.from({ length: 225 }).map((_, i) => {
            const row = Math.floor(i / 15);
            const col = i % 15;
            const key = `${row},${col}`;

            // Skip inside 6x6 corner bases and 3x3 center goal (rendered below cleanly)
            const inTopLeft = row < 6 && col < 6;
            const inTopRight = row < 6 && col > 8;
            const inBottomLeft = row > 8 && col < 6;
            const inBottomRight = row > 8 && col > 8;
            const inCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;

            if (inTopLeft || inTopRight || inBottomLeft || inBottomRight || inCenter) {
              return <div key={key} className="pointer-events-none" />;
            }

            const trackIdx = trackMap.get(key);
            const laneColor = laneMap.get(key);
            const startColor = trackIdx !== undefined ? startIndexToColor[trackIdx] : undefined;
            const isStar = trackIdx !== undefined && STAR_TRACK_INDICES.has(trackIdx);

            let bgStyle: React.CSSProperties = {
              background: 'linear-gradient(145deg, #ffffff 0%, #e2e8f0 100%)',
            };

            if (startColor) {
              const c = COLOR_HEX[startColor];
              bgStyle = {
                background: `linear-gradient(145deg, ${c.light} 0%, ${c.bg} 70%, ${c.dark} 100%)`,
              };
            } else if (laneColor) {
              const c = COLOR_HEX[laneColor];
              bgStyle = {
                background: `linear-gradient(145deg, ${c.light} 0%, ${c.bg} 75%, ${c.dark} 100%)`,
              };
            }

            const entryArrow = homeEntryArrows[key];

            return (
              <div
                key={key}
                style={bgStyle}
                className="border-[0.5px] border-slate-400/70 flex items-center justify-center relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.65)]"
              >
                {(startColor || isStar) && (
                  <StarSvg color={startColor ? 'rgba(255,255,255,0.92)' : '#94a3b8'} />
                )}
                {entryArrow && (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-[56%] h-[56%]"
                    style={{ transform: `rotate(${entryArrow.rotate}deg)` }}
                    aria-hidden="true"
                  >
                    <path
                      d="M4 12 H17 M12 6 L19 12 L12 18"
                      fill="none"
                      stroke={entryArrow.color}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* 4 Colored 3D Home Bases */}
        {(
          [
            { color: 'red' as PlayerColor, pos: 'top-0 left-0' },
            { color: 'green' as PlayerColor, pos: 'top-0 right-0' },
            { color: 'blue' as PlayerColor, pos: 'bottom-0 left-0' },
            { color: 'yellow' as PlayerColor, pos: 'bottom-0 right-0' },
          ] as const
        ).map(({ color, pos }) => {
          const c = COLOR_HEX[color];
          const isTurn = currentColor === color && match.phase !== 'GAME_OVER';
          const isActivePlayer = match.activeColors.includes(color);
          return (
            <div
              key={color}
              className={`absolute ${pos} w-[40%] h-[40%] p-[6.5%] transition-all duration-300`}
              style={{
                background: isActivePlayer
                  ? `linear-gradient(145deg, ${c.light} 0%, ${c.bg} 45%, ${c.dark} 100%)`
                  : `linear-gradient(145deg, ${c.bg} 0%, ${c.dark} 100%)`,
                boxShadow: isTurn
                  ? `inset 0 0 0 3px #fde047, inset 0 0 18px rgba(255,255,255,0.5)`
                  : 'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 6px rgba(0,0,0,0.28)',
              }}
            >
              {/* Recessed glossy white yard card */}
              <div className="w-full h-full rounded-[16%] bg-gradient-to-br from-white via-slate-50 to-slate-200 shadow-[inset_0_3px_6px_rgba(0,0,0,0.22),0_3px_8px_rgba(0,0,0,0.25)] border-2 border-white/90 relative">
                {/* 4 Recessed Circular Token Sockets */}
                {HOME_YARD_POSITIONS[color].map((pt, idx) => {
                  // Convert board 0..15 coordinates into percentage inside this 6x6 base
                  const baseColOffset = color === 'green' || color === 'yellow' ? 9 : 0;
                  const baseRowOffset = color === 'blue' || color === 'yellow' ? 9 : 0;
                  const innerPctX = ((pt.x - baseColOffset - 0.975) / 4.05) * 100;
                  const innerPctY = ((pt.y - baseRowOffset - 0.975) / 4.05) * 100;
                  return (
                    <div
                      key={idx}
                      className="absolute w-[29%] h-[29%] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.35)] border border-white"
                      style={{
                        left: `${innerPctX}%`,
                        top: `${innerPctY}%`,
                        background: `radial-gradient(circle at 35% 35%, ${c.light}, ${c.bg})`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Center 3x3 Home Goal Crown */}
        <div className="absolute left-[40%] top-[40%] w-[20%] h-[20%] overflow-hidden border border-amber-300 shadow-[inset_0_0_8px_rgba(0,0,0,0.35)]">
          <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
            {/* Left Red Triangle */}
            <polygon points="0,0 50,50 0,100" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
            {/* Top Green Triangle */}
            <polygon points="0,0 100,0 50,50" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
            {/* Right Yellow Triangle */}
            <polygon points="100,0 100,100 50,50" fill="#facc15" stroke="#fff" strokeWidth="1.5" />
            {/* Bottom Blue Triangle */}
            <polygon points="0,100 100,100 50,50" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
            {/* Center Crown Medallion */}
            <circle cx="50" cy="50" r="18" fill="#1e1b4b" stroke="#fde047" strokeWidth="3" />
            <path
              d="M40 55 L38 44 L45 49 L50 40 L55 49 L62 44 L60 55 Z"
              fill="#fde047"
            />
          </svg>
        </div>

        {/* Capture Impact Burst Effect */}
        {captureFlashCell && (
          <div
            className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-amber-300/70 animate-ping"
            style={{
              left: `${(captureFlashCell.x / 15) * 100}%`,
              top: `${(captureFlashCell.y / 15) * 100}%`,
            }}
          />
        )}

        {/* 3D Animated Tokens Layer */}
        {allTokens.map((token) => {
          const point = getTokenBoardPoint(token);
          const cellKey = getTokenCellKey(token);
          const group = cellGroups[cellKey] ?? [token];
          const groupIndex = group.findIndex((t) => t.id === token.id);
          const count = group.length;

          // Subtle radial fanning if multiple tokens occupy the same square
          let offsetX = 0;
          let offsetY = 0;
          if (count > 1 && token.progress >= 0) {
            const angle = (groupIndex / count) * Math.PI * 2;
            const radius = token.progress === 56 ? 0.16 : 0.22;
            offsetX = Math.cos(angle) * radius;
            offsetY = Math.sin(angle) * radius;
          }

          const isLegal =
            match.phase === 'SELECT_TOKEN' &&
            match.legalTokenIds.includes(token.id) &&
            match.seats[currentColor]?.kind === 'human';

          const sizePct = count > 1 && token.progress >= 0 ? 5.6 : 6.8;
          const leftPct = ((point.x + offsetX) / 15) * 100;
          const topPct = ((point.y + offsetY) / 15) * 100;

          return (
            <button
              key={token.id}
              type="button"
              disabled={!isLegal}
              onClick={() => isLegal && onTokenClick(token.id)}
              data-testid={`token-${token.id}`}
              data-progress={token.progress}
              data-legal={isLegal ? 'true' : 'false'}
              aria-label={`${PLAYER_THEME[token.color].label} token ${token.index + 1}${
                isLegal ? ' (movable)' : ''
              }`}
              className={`absolute flex items-center justify-center p-0 border-0 bg-transparent transition-[left,top] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-amber-300 ${
                isLegal ? 'token-selectable cursor-pointer z-40' : 'cursor-default z-20'
              }`}
                style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${sizePct}%`,
                aspectRatio: '40 / 48',
                transform: isLegal
                  ? undefined
                  : token.progress < 0
                    ? 'translate(-50%, -53%)'
                    : 'translate(-50%, -62%)',
              }}
            >
              <Pawn3DSvg color={token.color} isSelectable={isLegal} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
