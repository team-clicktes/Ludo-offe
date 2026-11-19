import React from 'react';
import { PLAYER_THEME } from '../game/boardGeometry';
import { DICE_SKINS } from '../game/progression';
import { DiceSkinId, PlayerColor } from '../game/types';

interface Dice3DProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  activeColor: PlayerColor;
  diceSkinId?: DiceSkinId;
  compact?: boolean;
  onRoll: () => void;
}

const PIP_LAYOUTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DiceFacePips({
  face,
  pipColor,
  aceColor,
  compact = false,
}: {
  face: number;
  pipColor: string;
  aceColor: string;
  compact?: boolean;
}) {
  const active = PIP_LAYOUTS[face] ?? PIP_LAYOUTS[1];
  return (
    <div className={`grid grid-cols-3 grid-rows-3 w-full h-full ${compact ? 'p-2 gap-0.5' : 'p-2.5 gap-1'}`}>
      {Array.from({ length: 9 }).map((_, idx) => {
        const visible = active.includes(idx);
        return (
          <div key={idx} className="flex items-center justify-center">
            {visible && (
              <span
                className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full block shadow-[inset_0_2px_3px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.5)]`}
                style={{ backgroundColor: face === 1 ? aceColor : pipColor }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const FACE_TRANSFORMS: Record<number, string> = {
  1: 'rotateX(0deg) rotateY(0deg)',
  2: 'rotateX(-90deg) rotateY(0deg)',
  3: 'rotateX(0deg) rotateY(-90deg)',
  4: 'rotateX(0deg) rotateY(90deg)',
  5: 'rotateX(90deg) rotateY(0deg)',
  6: 'rotateX(180deg) rotateY(0deg)',
};

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  canRoll,
  activeColor,
  diceSkinId = 'ivory',
  compact = false,
  onRoll,
}) => {
  const shownFace = value ?? 5;
  const theme = PLAYER_THEME[activeColor];
  const skin = DICE_SKINS.find((s) => s.id === diceSkinId) ?? DICE_SKINS[0];
  const half = compact ? 27 : 29;

  const faceStyleBase: React.CSSProperties = {
    background: skin.faceBg,
  };

  return (
    <button
      type="button"
      onClick={onRoll}
      disabled={!canRoll || isRolling}
      aria-label={canRoll ? 'Tap dice to roll' : `Dice showing ${shownFace}`}
      data-testid="dice-button"
      className={`relative ${
        compact ? 'w-[68px] h-[68px]' : 'w-[76px] h-[76px]'
      } rounded-2xl flex items-center justify-center shrink-0 transition-transform focus-visible:outline-2 focus-visible:outline-amber-300 ${
        canRoll && !isRolling
          ? 'cursor-pointer hover:scale-105 active:scale-95'
          : 'cursor-default'
      }`}
      style={{
        background: canRoll
          ? `radial-gradient(circle at 50% 50%, ${theme.glow}, #0f172a 78%)`
          : 'radial-gradient(circle at 50% 50%, #1e40af 0%, #0f172a 80%)',
        border: canRoll ? '2px solid #fde047' : '1.5px solid rgba(147, 197, 253, 0.7)',
        boxShadow: canRoll
          ? `0 0 22px ${theme.glow}, 0 0 18px rgba(56, 189, 248, 0.75)`
          : '0 0 16px rgba(56, 189, 248, 0.55), inset 0 2px 6px rgba(0,0,0,0.45)',
      }}
    >
      <div className={`dice-scene ${compact ? 'w-[54px] h-[54px]' : 'w-[58px] h-[58px]'} relative`}>
        <div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-11 h-2.5 rounded-full bg-black/45 blur-[2px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className={`dice-cube ${isRolling ? 'rolling' : ''}`}
          style={{
            transform: isRolling ? undefined : FACE_TRANSFORMS[shownFace],
          }}
        >
          <div
            className="dice-face"
            style={{ ...faceStyleBase, transform: `rotateY(0deg) translateZ(${half}px)` }}
          >
            <DiceFacePips face={1} pipColor={skin.pipColor} aceColor={skin.aceColor} compact={compact} />
          </div>
          <div
            className="dice-face"
            style={{ ...faceStyleBase, transform: `rotateX(180deg) translateZ(${half}px)` }}
          >
            <DiceFacePips face={6} pipColor={skin.pipColor} aceColor={skin.aceColor} compact={compact} />
          </div>
          <div
            className="dice-face"
            style={{ ...faceStyleBase, transform: `rotateY(90deg) translateZ(${half}px)` }}
          >
            <DiceFacePips face={3} pipColor={skin.pipColor} aceColor={skin.aceColor} compact={compact} />
          </div>
          <div
            className="dice-face"
            style={{ ...faceStyleBase, transform: `rotateY(-90deg) translateZ(${half}px)` }}
          >
            <DiceFacePips face={4} pipColor={skin.pipColor} aceColor={skin.aceColor} compact={compact} />
          </div>
          <div
            className="dice-face"
            style={{ ...faceStyleBase, transform: `rotateX(90deg) translateZ(${half}px)` }}
          >
            <DiceFacePips face={2} pipColor={skin.pipColor} aceColor={skin.aceColor} compact={compact} />
          </div>
          <div
            className="dice-face"
            style={{ ...faceStyleBase, transform: `rotateX(-90deg) translateZ(${half}px)` }}
          >
            <DiceFacePips face={5} pipColor={skin.pipColor} aceColor={skin.aceColor} compact={compact} />
          </div>
        </div>
      </div>
    </button>
  );
};
