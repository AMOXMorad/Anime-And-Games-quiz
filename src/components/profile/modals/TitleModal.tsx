import React, { useState } from 'react';
import { StoreItem, Profile } from '../../../types';
import { useI18n } from '../../../lib/i18n';
import { sounds } from '../../../lib/sound';
import { X, Sparkles, Star, Save } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  ownedTitles: StoreItem[];
  onEquip: (itemId: string) => void;
  onToggleShowcase: (itemId: string) => void;
}

export const TitleModal: React.FC<TitleModalProps> = ({
  isOpen,
  onClose,
  profile,
  ownedTitles,
  onEquip,
  onToggleShowcase
}) => {
  const { lang } = useI18n();
  const [selectedId, setSelectedId] = useState<string>(profile.active_title_id || ownedTitles[0]?.id || '');

  if (!isOpen) return null;

  const currentSelectedTitle = ownedTitles.find(t => t.id === selectedId) || ownedTitles[0];

  const handleSave = () => {
    if (currentSelectedTitle) {
      onEquip(currentSelectedTitle.id);
      sounds.playVictory();
      confetti({ particleCount: 50, spread: 60 });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-500/40 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">اختيار وتجهيز اللقب الفخري</h3>
              <p className="text-xs text-slate-400">اختر اللقب الفخري الذي يمثل أسلوبك وقوتك في عالم يوتوبيا</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/30 border-b border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-3xl shadow-inner">
              📜
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-400 block mb-0.5">معاينة مباشرة للقب في بروفايلك:</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 text-xs font-black shadow-sm">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{currentSelectedTitle ? (lang === 'ar' ? currentSelectedTitle.name_ar : currentSelectedTitle.name_en) : 'لقب مخصص'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {currentSelectedTitle ? (lang === 'ar' ? currentSelectedTitle.description_ar : currentSelectedTitle.description_en) : ''}
              </p>
            </div>
          </div>

          <div className="text-end">
            <span className="text-xs text-slate-400 font-bold block">الممتلكات:</span>
            <span className="text-sm font-black text-indigo-400">{ownedTitles.length} لقب</span>
          </div>
        </div>

        {/* Titles Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {ownedTitles.map(title => {
            const isSelected = selectedId === title.id;
            const isEquipped = profile.active_title_id === title.id;
            const isShowcased = profile.showcase_titles.includes(title.id);

            return (
              <div
                key={title.id}
                onClick={() => {
                  setSelectedId(title.id);
                  sounds.playClick();
                }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer relative group ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-400 text-indigo-200 shadow-[0_0_18px_rgba(99,102,241,0.4)] ring-2 ring-indigo-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📜</span>
                  <div>
                    <div className="text-xs sm:text-sm font-black text-white">{lang === 'ar' ? title.name_ar : title.name_en}</div>
                    <div className="text-[11px] text-slate-400">{lang === 'ar' ? title.description_ar : title.description_en}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Showcase Star Toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleShowcase(title.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isShowcased ? 'text-amber-400 bg-amber-950/80 border border-amber-500/40' : 'text-slate-600 hover:text-slate-300 bg-slate-900/60'
                    }`}
                    title={isShowcased ? 'معروض في البروفايل' : 'إضافة للمعرض'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isShowcased ? 'fill-amber-400' : ''}`} />
                  </button>

                  {isEquipped ? (
                    <span className="text-xs text-indigo-400 font-bold bg-indigo-950 px-2.5 py-1 rounded-xl border border-indigo-500/40">✓ النشط</span>
                  ) : isSelected ? (
                    <span className="text-xs text-white font-bold bg-indigo-600 px-2.5 py-1 rounded-xl">محدد للتجهيز</span>
                  ) : (
                    <span className="text-xs text-slate-500 group-hover:text-slate-300">اختيار</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
          >
            إلغاء
          </button>

          <button
            onClick={handleSave}
            className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ وتجهيز اللقب</span>
          </button>
        </div>

      </div>
    </div>
  );
};
