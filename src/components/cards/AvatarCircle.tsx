import { useState } from 'react';
import type { User } from '../../data/mock';

const sizes = {
  sm: 'w-[22px] h-[22px] text-[9px]',
  md: 'w-[28px] h-[28px] text-[11px]',
  lg: 'w-[44px] h-[44px] text-[15px]',
  xl: 'w-[80px] h-[80px] text-[24px]',
};

export default function AvatarCircle({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const [imgError, setImgError] = useState(false);
  const showImage = user.avatar && !imgError;

  return (
    <div className={`${sizes[size]} rounded-full bg-surface-2 flex items-center justify-center font-medium text-ink-3 overflow-hidden flex-shrink-0`}>
      {showImage ? (
        <img
          src={user.avatar}
          alt={user.displayName}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{user.displayName.charAt(0)}</span>
      )}
    </div>
  );
}
