import React from 'react';
import { getRankTier } from '../../lib/ranks';
import { useI18n } from '../../lib/i18n';

interface LevelBadgeProps {
  level: number;
  role?: string;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  role,
  showName = false,
  size = 'md'
}) => {
  const { lang } = useI18n();
  const tier = getRankTier(level, role);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full bg-slate-800/90 border border-slate-700/60 font-semibold ${tier.color} ${sizeClasses[size]}`}>
      <span>{tier.badge}</span>
      <span>Lv.{level}</span>
      {showName && (
        <span className="text-slate-300 font-normal border-s border-slate-700 ps-1.5">
          {tier.name[lang]}
        </span>
      )}
    </div>
  );
};
