import React, { useState } from 'react';
import { StoreItem, Profile } from '../../../types';
import { useI18n } from '../../../lib/i18n';
import { sounds } from '../../../lib/sound';
import { X, Crown, Star, Save } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  ownedTags: StoreItem[];
  onEquip: (itemId: string) => void;
  onToggleShowcase: (itemId: string) => void;
}

export const TagModal: React.FC<TagModalProps> = ({
  isOpen,
  onClose,
  profile,
  ownedTags,
  onEquip,
  onToggleShowcase
}) => {
  const { lang } = useI18n();
  const [selectedId, setSelectedId] = useState<string>(profile.active_tag_id || ownedTags[0]?.id || '');

  if (!isOpen) return null;

  const currentSelectedTag = ownedTags.find(t => t.id === selectedId) || ownedTags[0];
  const previewEmoji = currentSelectedTag?.asset_url || '🔰';

  const handleSave = () => {
    if (currentSelectedTag) {
      onEquip(currentSelectedTag.id);
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
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">اختيار وتجهيز الشارة والتاج (الوسام)</h3>
              <p className="text-xs text-slate-400">اختر الوسام المميز ليظهر بجانب اسمك في البروفايل وقوائم الصدارة</p>
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
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border-b border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
              {previewEmoji}
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-400 block mb-0.5">معاينة مباشرة بجانب اسمك:</span>
              <div className="flex items-center gap-2">
                <span className="text-xl">{previewEmoji}</span>
                <span className="font-black text-base text-white">{profile.username}</span>
                <span className="text-xs text-slate-400 font-bold">#{profile.tag}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {currentSelectedTag ? (lang === 'ar' ? currentSelectedTag.name_ar : currentSelectedTag.name_en) : ''}
              </p>
            </div>
          </div>

          <div className="text-end">
            <span className="text-xs text-slate-400 font-bold block">الممتلكات:</span>
            <span className="text-sm font-black text-amber-400">{ownedTags.length} شارة</span>
          </div>
        </div>

        {/* Tags Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {ownedTags.map(tag => {
            const isSelected = selectedId === tag.id;
            const isEquipped = profile.active_tag_id === tag.id;
            const isShowcased = profile.showcase_tags.includes(tag.id);

            return (
              <div
                key={tag.id}
                onClick={() => {
                  setSelectedId(tag.id);
                  sounds.playClick();
                }}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer relative group ${
                  isSelected
                    ? 'bg-amber-950/70 border-amber-400 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.4)] ring-2 ring-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {/* Showcase Star Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleShowcase(tag.id);
                  }}
                  className={`absolute top-2 end-2 p-1 rounded-lg transition-colors z-10 ${
                    isShowcased ? 'text-amber-400 bg-amber-950/80 border border-amber-500/40' : 'text-slate-600 hover:text-slate-300 bg-slate-900/60'
                  }`}
                  title={isShowcased ? 'معروض في البروفايل' : 'إضافة للمعرض'}
                >
                  <Star className={`w-3 h-3 ${isShowcased ? 'fill-amber-400' : ''}`} />
                </button>

                <span className="text-4xl py-1 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform">
                  {tag.asset_url}
                </span>

                <div className="text-center w-full">
                  <div className="text-xs font-bold line-clamp-1">{lang === 'ar' ? tag.name_ar : tag.name_en}</div>
                  {isEquipped ? (
                    <span className="text-[10px] text-amber-400 font-bold block mt-0.5">✓ النشط حالياً</span>
                  ) : isSelected ? (
                    <span className="text-[10px] text-white font-bold block mt-0.5">محدد للتجهيز</span>
                  ) : (
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300 block mt-0.5">انقر للاختيار</span>
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
            className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>حفظ وتجهيز الشارة</span>
          </button>
        </div>

      </div>
    </div>
  );
};
