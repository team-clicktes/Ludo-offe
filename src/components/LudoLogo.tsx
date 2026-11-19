import React from 'react';

interface LudoLogoProps {
  compact?: boolean;
}

export const LudoLogo: React.FC<LudoLogoProps> = ({ compact = false }) => {
  return (
    <div className={`flex flex-col items-center select-none ${compact ? 'scale-90' : ''}`}>
      {/* Golden Crown & Four Gem Stars */}
      <svg
        viewBox="0 0 260 118"
        className={compact ? 'w-44 h-auto drop-shadow-[0_6px_14px_rgba(250,204,21,0.45)]' : 'w-60 h-auto drop-shadow-[0_10px_22px_rgba(250,204,21,0.45)]'}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="crownGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff7b2" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="crownRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="bannerRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="55%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>

        {/* Decorative twinkle stars */}
        <polygon points="36,34 39,42 47,45 39,48 36,56 33,48 25,45 33,42" fill="#fde047" />
        <polygon points="224,34 227,42 235,45 227,48 224,56 221,48 213,45 221,42" fill="#fde047" />

        {/* Royal 3D Crown */}
        <path
          d="M72 64 L62 24 L98 44 L130 14 L162 44 L198 24 L188 64 Z"
          fill="url(#crownGold)"
          stroke="#fef9c3"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Crown base band */}
        <rect
          x="70"
          y="60"
          width="120"
          height="14"
          rx="6"
          fill="url(#crownRim)"
          stroke="#78350f"
          strokeWidth="2.5"
        />
        {/* Crown tip pearls */}
        <circle cx="62" cy="22" r="6" fill="#fef08a" stroke="#b45309" strokeWidth="2" />
        <circle cx="130" cy="12" r="7.5" fill="#fef08a" stroke="#b45309" strokeWidth="2" />
        <circle cx="198" cy="22" r="6" fill="#fef08a" stroke="#b45309" strokeWidth="2" />

        {/* Four Ludo Color Gems inside the Crown */}
        <circle cx="94" cy="67" r="5" fill="#ef4444" stroke="#fff" strokeWidth="1.2" />
        <circle cx="118" cy="67" r="5" fill="#22c55e" stroke="#fff" strokeWidth="1.2" />
        <circle cx="142" cy="67" r="5" fill="#facc15" stroke="#fff" strokeWidth="1.2" />
        <circle cx="166" cy="67" r="5" fill="#3b82f6" stroke="#fff" strokeWidth="1.2" />

        {/* Ribbon Banner */}
        <path
          d="M28 76 Q130 68 232 76 L220 108 Q130 100 40 108 Z"
          fill="url(#bannerRed)"
          stroke="#fde047"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <text
          x="130"
          y="96"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="24"
          fontWeight="900"
          letterSpacing="3"
          style={{
            fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
            filter: 'drop-shadow(0px 2px 1px rgba(0,0,0,0.6))',
          }}
        >
          LUDO STAR
        </text>
      </svg>
    </div>
  );
};
