import React from 'react';

interface AvatarWithFrameProps {
  avatarUrl?: string;
  frameId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const FRAME_STYLES: Record<string, string> = {
  frame_default: 'border-2 border-slate-600',
  frame_sharingan: 'border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] ring-2 ring-red-400',
  frame_curse_flame: 'border-2 border-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.75)] ring-2 ring-fuchsia-400',
  frame_cyber_neon: 'border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.7)] ring-2 ring-teal-300',
  frame_gold_royalty: 'border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.8)] ring-2 ring-yellow-200',
  frame_chaos_vortex: 'border-2 border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.85)] ring-2 ring-sky-300 animate-pulse',
  frame_founder_exclusive: 'border-2 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.9)] ring-4 ring-amber-300 animate-pulse'
};

const SIZE_MAP = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl',
  '2xl': 'w-32 h-32 text-2xl'
};

const DEFAULT_AVATAR = 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png';

export const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({
  avatarUrl,
  frameId = 'frame_default',
  size = 'md',
  className = ''
}) => {
  const frameClass = FRAME_STYLES[frameId] || FRAME_STYLES.frame_default;
  const sizeClass = SIZE_MAP[size];
  const src = avatarUrl && !avatarUrl.includes('unsplash.com') ? avatarUrl : DEFAULT_AVATAR;

  return (
    <div className={`relative inline-block rounded-full p-0.5 ${frameClass} ${className} transition-all duration-300`}>
      <div className={`${sizeClass} rounded-full overflow-hidden bg-slate-900 flex items-center justify-center`}>
        <img 
          src={src} 
          alt="Avatar" 
          className="w-full h-full object-cover" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
          }}
        />
      </div>
    </div>
  );
};
