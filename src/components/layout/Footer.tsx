import React from 'react';
import { useI18n } from '../../lib/i18n';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../lib/sound';
import { Bug, Lightbulb, Shield } from 'lucide-react';

interface FooterProps {
  openReportModal: () => void;
  openSuggestionsModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ openReportModal, openSuggestionsModal }) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <footer className={`mt-20 border-t py-8 text-xs transition-colors ${
      isLight 
        ? 'border-slate-200 bg-slate-50/90 text-slate-600' 
        : 'border-slate-800/80 bg-black/80 text-slate-400'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Brand info */}
        <div className="flex items-center gap-3">
          <img src="/A.png" alt="AG Utopia" className="h-8 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
          <span>•</span>
          <span className={isLight ? 'text-slate-700 font-semibold' : 'text-slate-400'}>
            © 2026 {t('appTagline')}
          </span>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => { openSuggestionsModal(); sounds.playClick(); }}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight ? 'text-slate-600 hover:text-amber-600 font-medium' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('communitySuggestions')}</span>
          </button>

          <button
            type="button"
            onClick={() => { openReportModal(); sounds.playClick(); }}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLight ? 'text-slate-600 hover:text-rose-600 font-medium' : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <Bug className="w-3.5 h-3.5 text-rose-500" />
            <span>{t('reportBug')}</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>شبكة يوتوبيا المباشرة (Active 🟢)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

