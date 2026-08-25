import React from 'react';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { Sparkles, Bug, Lightbulb, Shield } from 'lucide-react';

interface FooterProps {
  openReportModal: () => void;
  openSuggestionsModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ openReportModal, openSuggestionsModal }) => {
  const { t } = useI18n();

  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-sm py-8 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Brand info */}
        <div className="flex items-center gap-2">
          <div className="font-black text-white text-sm flex items-center gap-1.5">
            <span>AG UTOPIA</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span>•</span>
          <span>© 2026 {t('appTagline')}</span>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => { openSuggestionsModal(); sounds.playClick(); }}
            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('communitySuggestions')}</span>
          </button>

          <button
            onClick={() => { openReportModal(); sounds.playClick(); }}
            className="flex items-center gap-1.5 hover:text-rose-400 transition-colors"
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('reportBug')}</span>
          </button>

          <div className="flex items-center gap-1 text-slate-500">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>100% Realtime Cloud</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
