import React from 'react';
import { FrameConfig } from '../../types';
import { INITIAL_STORE_ITEMS } from '../store/StoreView';

interface AvatarWithFrameProps {
  avatarUrl?: string;
  frameId?: string;
  frameAssetUrl?: string;
  frameConfig?: FrameConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const SIZE_MAP = {
  sm: 'w-9 h-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px]',
  md: 'w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px]',
  lg: 'w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px]',
  xl: 'w-24 h-24 min-w-[96px] min-h-[96px] max-w-[96px] max-h-[96px]',
  '2xl': 'w-32 h-32 min-w-[128px] min-h-[128px] max-w-[128px] max-h-[128px]'
};

const DEFAULT_AVATAR = 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png';

export const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({
  avatarUrl,
  frameId = 'frame_default',
  frameAssetUrl,
  frameConfig,
  size = 'md',
  className = ''
}) => {
  const sizeClass = SIZE_MAP[size];
  const src = avatarUrl && !avatarUrl.includes('unsplash.com') ? avatarUrl : DEFAULT_AVATAR;

  // Resolve frame PNG asset & custom config
  let resolvedFrameUrl = frameAssetUrl;
  let resolvedConfig: FrameConfig = frameConfig || {
    scale: 1.35,
    avatar_scale: 0.85,
    offset_x: 0,
    offset_y: 0
  };

  if (frameId) {
    try {
      // 1. Check custom items from localStorage
      const customItems = localStorage.getItem('ag_utopia_custom_store_items');
      if (customItems) {
        const parsed = JSON.parse(customItems);
        const match = parsed.find((i: any) => i.id === frameId && i.type === 'frame');
        if (match?.asset_url) {
          // Verify it is not an avatar portrait url mistakenly put as frame
          if (!resolvedFrameUrl) resolvedFrameUrl = match.asset_url;
          if (match.frame_config) {
            resolvedConfig = { ...resolvedConfig, ...match.frame_config };
          }
        }
      }
    } catch (e) {}

    // 2. Also check INITIAL_STORE_ITEMS fallback
    if (!resolvedFrameUrl) {
      const initMatch = INITIAL_STORE_ITEMS.find(i => i.id === frameId && i.type === 'frame');
      if (initMatch?.asset_url) {
        resolvedFrameUrl = initMatch.asset_url;
        if (initMatch.frame_config) {
          resolvedConfig = { ...resolvedConfig, ...initMatch.frame_config };
        }
      }
    }
  }

  const isCustomFrame = !!resolvedFrameUrl;
  const frameScale = resolvedConfig.scale ?? 1.35;
  const avatarScale = isCustomFrame ? (resolvedConfig.avatar_scale ?? 0.85) : 0.84;
  const offsetX = resolvedConfig.offset_x ?? 0;
  const offsetY = resolvedConfig.offset_y ?? 0;

  // Render Built-in Vector Procedural Frames
  const renderBuiltinFrame = () => {
    switch (frameId) {
      case 'frame_founder_exclusive':
      case 'frame_founder_trident':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            {/* Grand Founder Ring & Glow */}
            <div className="w-full h-full rounded-full border-[3px] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.9),inset_0_0_12px_rgba(244,63,94,0.6)] ring-2 ring-rose-500/80 animate-pulse" />
            <span className="absolute -top-2.5 inset-x-0 flex justify-center text-sm filter drop-shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-bounce">
              🔱
            </span>
          </div>
        );

      case 'frame_sharingan':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-[3px] border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.95)] ring-2 ring-red-400/90" />
            {/* Tomoe Accents */}
            <span className="absolute -top-1 start-1 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_red]" />
            <span className="absolute -bottom-1 end-1 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_red]" />
            <span className="absolute top-1/2 -end-1 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_red]" />
          </div>
        );

      case 'frame_curse_flame':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-[3px] border-purple-500 shadow-[0_0_22px_rgba(168,85,247,0.9)] ring-2 ring-fuchsia-400/80 animate-pulse" />
            <span className="absolute -top-2 text-xs filter drop-shadow-[0_0_6px_rgba(168,85,247,0.9)]">
              🔮
            </span>
          </div>
        );

      case 'frame_cyber_neon':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-[3px] border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.9)] ring-2 ring-teal-300/80" />
            <span className="absolute -bottom-2 text-[10px] filter drop-shadow-[0_0_6px_cyan]">
              ⚡
            </span>
          </div>
        );

      case 'frame_gold_royalty':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-[3px] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.95)] ring-2 ring-yellow-200/90" />
            <span className="absolute -top-2.5 inset-x-0 flex justify-center text-xs filter drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]">
              👑
            </span>
          </div>
        );

      case 'frame_chaos_vortex':
        return (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-[3px] border-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.95)] ring-2 ring-sky-300/90 animate-pulse" />
            <span className="absolute -top-2 text-xs filter drop-shadow-[0_0_6px_rgba(99,102,241,0.9)]">
              🌌
            </span>
          </div>
        );

      default:
        return (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-2 border-slate-600/80 shadow-md" />
          </div>
        );
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center aspect-square ${sizeClass} ${className} transition-all duration-300 select-none flex-shrink-0`}>
      
      {/* Inner Circular Avatar Layer (Always strictly circular and scaled) */}
      <div 
        className="w-full h-full aspect-square rounded-full overflow-hidden flex items-center justify-center transition-transform duration-200"
        style={{
          transform: `scale(${avatarScale})`,
          backgroundColor: '#0f172a'
        }}
      >
        <img 
          src={src} 
          alt="Avatar" 
          className="w-full h-full aspect-square object-cover rounded-full pointer-events-none" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
          }}
        />
      </div>

      {/* Custom Overlay PNG Frame Layer OR Built-in Vector Frame */}
      {isCustomFrame ? (
        <img 
          src={resolvedFrameUrl} 
          alt="Custom Frame Overlay" 
          className="absolute inset-0 w-full h-full aspect-square object-contain pointer-events-none z-10 drop-shadow-[0_0_12px_rgba(0,0,0,0.6)] transition-all duration-200" 
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${frameScale})`
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        renderBuiltinFrame()
      )}
    </div>
  );
};
