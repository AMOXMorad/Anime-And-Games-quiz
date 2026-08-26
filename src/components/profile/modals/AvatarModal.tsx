import React, { useState } from 'react';
import { StoreItem, Profile } from '../../../types';
import { useI18n } from '../../../lib/i18n';
import { sounds } from '../../../lib/sound';
import { AvatarWithFrame } from '../../ui/AvatarWithFrame';
import { X, Wand2, Star, Save } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  ownedAvatars: StoreItem[];
  onEquip: (itemId: string, assetUrl: string) => void;
  onToggleShowcase: (itemId: string) => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  profile,
  ownedAvatars,
  onEquip,
  onToggleShowcase
}) => {
  const { lang } = useI18n();
  const [selectedId, setSelectedId] = useState<string>(profile.active_avatar_id || ownedAvatars[0]?.id || '');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'naruto' | 'rezero' | 'games' | 'chaos'>('all');

  if (!isOpen) return null;

  const currentSelectedAvatar = ownedAvatars.find(a => a.id === selectedId) || ownedAvatars.find(a => a.asset_url === profile.avatar_url) || ownedAvatars[0];
  const previewUrl = currentSelectedAvatar?.asset_url || profile.avatar_url;

  const filteredAvatars = ownedAvatars.filter(av => {
    if (categoryFilter === 'all') return true;
    return av.avatar_category === categoryFilter;
  });

  const handleSave = () => {
    if (currentSelectedAvatar) {
      onEquip(currentSelectedAvatar.id, currentSelectedAvatar.asset_url || previewUrl || '');
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
            <div className="p-2 rounded-xl bg-pink-950 border border-pink-500/40 text-pink-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">اختيار وتجهيز صورة الأفاتار</h3>
              <p className="text-xs text-slate-400">اختر صورة البروفايل المفضلة لديك من مقتنياتك واضغط حفظ</p>
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
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-pink-950/30 border-b border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <AvatarWithFrame 
                avatarUrl={previewUrl} 
                frameId={profile.active_frame_id} 
                size="md" 
              />
            </div>
            <div>
              <span className="text-[11px] font-bold text-pink-400 block mb-0.5">معاينة مباشرة مع الإطار الحالي:</span>
              <h4 className="font-black text-sm text-white">
                {currentSelectedAvatar ? (lang === 'ar' ? currentSelectedAvatar.name_ar : currentSelectedAvatar.name_en) : 'أفاتار مخصص'}
              </h4>
              <span className="text-[10px] text-slate-400">
                {currentSelectedAvatar?.id === profile.active_avatar_id || currentSelectedAvatar?.asset_url === profile.avatar_url ? '✓ الأفاتار النشط حالياً' : 'انقر على حفظ لتطبيق هذا الأفاتار'}
              </span>
            </div>
          </div>

          <div className="text-end">
            <span className="text-xs text-slate-400 font-bold block">الممتلكات:</span>
            <span className="text-sm font-black text-pink-400">{ownedAvatars.length} أفاتار</span>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${categoryFilter === 'all' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'}`}
          >
            الكل ({ownedAvatars.length})
          </button>
          <button
            onClick={() => setCategoryFilter('naruto')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${categoryFilter === 'naruto' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'}`}
          >
            🍥 ناروتو شيبودن
          </button>
          <button
            onClick={() => setCategoryFilter('rezero')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${categoryFilter === 'rezero' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'}`}
          >
            🍎 ريزيرو
          </button>
        </div>

        {/* Avatars Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {filteredAvatars.map(av => {
            const isSelected = selectedId === av.id || (selectedId === '' && av.asset_url === profile.avatar_url);
            const isEquipped = profile.active_avatar_id === av.id || profile.avatar_url === av.asset_url;
            const isShowcased = (profile.showcase_avatars || []).includes(av.id);

            return (
              <div
                key={av.id}
                onClick={() => {
                  setSelectedId(av.id);
                  sounds.playClick();
                }}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2.5 cursor-pointer relative group ${
                  isSelected
                    ? 'bg-pink-950/70 border-pink-500 text-pink-200 shadow-[0_0_18px_rgba(219,39,119,0.4)] ring-2 ring-pink-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {/* Showcase Star Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleShowcase(av.id);
                  }}
                  className={`absolute top-2 end-2 p-1 rounded-lg transition-colors z-10 ${
                    isShowcased ? 'text-amber-400 bg-amber-950/80 border border-amber-500/40' : 'text-slate-600 hover:text-slate-300 bg-slate-900/60'
                  }`}
                  title={isShowcased ? 'معروض في البروفايل' : 'إضافة للمعرض'}
                >
                  <Star className={`w-3 h-3 ${isShowcased ? 'fill-amber-400' : ''}`} />
                </button>

                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700 aspect-square group-hover:scale-105 transition-transform">
                  <img src={av.asset_url} alt={av.name_ar} className="w-full h-full object-cover rounded-full" />
                </div>

                <div className="text-center w-full">
                  <div className="text-xs font-bold line-clamp-1">{lang === 'ar' ? av.name_ar : av.name_en}</div>
                  {isEquipped ? (
                    <span className="text-[10px] text-pink-400 font-bold block mt-0.5">✓ النشط حالياً</span>
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
            className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ وتجهيز الأفاتار</span>
          </button>
        </div>

      </div>
    </div>
  );
};
