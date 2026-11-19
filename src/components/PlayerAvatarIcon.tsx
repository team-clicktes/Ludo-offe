import React from 'react';
import { Crown, Shield, Star, Trophy } from 'lucide-react';

interface PlayerAvatarIconProps {
  avatarId: string;
  className?: string;
}

export const PlayerAvatarIcon: React.FC<PlayerAvatarIconProps> = ({
  avatarId,
  className = 'w-5 h-5',
}) => {
  switch (avatarId) {
    case 'star':
      return <Star className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'trophy':
      return <Trophy className={className} />;
    case 'crown':
    default:
      return <Crown className={className} />;
  }
};
