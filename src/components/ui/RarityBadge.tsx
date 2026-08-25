import React from 'react';
import { ItemRarity } from '../../types';
import { useI18n } from '../../lib/i18n';

interface RarityBadgeProps {
  rarity: ItemRarity;
}

export const RarityBadge: React.FC<RarityBadgeProps> = ({ rarity }) => {
  const { lang } = useI18n();

  const RARITY_CONFIG = {
    common: {
      text: { ar: 'شائع', en: 'Common' },
      style: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    rare: {
      text: { ar: 'نادر', en: 'Rare' },
      style: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
    },
    epic: {
      text: { ar: 'أسطوري', en: 'Epic' },
      style: 'bg-purple-950/80 text-purple-400 border-purple-800/60 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
    },
    legendary: {
      text: { ar: 'خرافي', en: 'Legendary' },
      style: 'bg-amber-950/80 text-amber-300 border-amber-600/80 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'
    }
  };

  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;

  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${config.style}`}>
      {config.text[lang]}
    </span>
  );
};
