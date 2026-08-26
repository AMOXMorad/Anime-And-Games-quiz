import React, { useState } from 'react';
import { StoreItem, Profile } from '../../../types';
import { useI18n } from '../../../lib/i18n';
import { sounds } from '../../../lib/sound';
import { AvatarWithFrame } from '../../ui/AvatarWithFrame';
import { X, Shield, Star, Save } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FrameModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  ownedFrames: StoreItem[];
  onEquip: (itemId: string) => void;
  onToggleShowcase: (itemId: string) => void;
}

export const FrameModal: React.FC<FrameModalProps> = ({
  isOpen,
  onClose,
  profile,
  ownedFrames,
  onEquip,
  onToggleShowcase
}) => {
  const { lang } = useI18n();
  const [selectedId, setSelectedId] = useState<string>(profile.active_frame_id || ownedFrames[0]?.id || '');

  if (!isOpen) return null;

  const currentSelectedFrame = ownedFrames.find(f => f.id === selectedId) || ownedFrames[0];

  const handleSave = () => {
    if (currentSelectedFrame) {
      onEquip(currentSelectedFrame.id);
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
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">اختيار وتجهيز إطار البروفايل</h3>
              <p className="text-xs text-slate-400">اختر الإطار المتوهج ليحيط بصورتك الشخصية واضغط حفظ</p>
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
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/30 border-b border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 flex-shrink-0 flex items-center justify-center">
              <AvatarWithFrame 
                avatarUrl={profile.avatar_url} 
                frameId={selectedId || profile.active_frame_id} 
                size="lg" 
              />
            </div>
            <div>
              <span className="text-[11px] font-bold text-cyan-400 block mb-0.5">معاينة مباشرة مع صورتك الحالية:</span>
              <h4 className="font-black text-sm text-white">
                {currentSelectedFrame ? (lang === 'ar' ? currentSelectedFrame.name_ar : currentSelectedFrame.name_en) : 'إطار مخصص'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {currentSelectedFrame ? (lang === 'ar' ? currentSelectedFrame.description_ar : currentSelectedFrame.description_en) : ''}
              </p>
              <span className="text-[10px] text-cyan-300 font-bold block mt-1">
                {currentSelectedFrame?.id === profile.active_frame_id ? '✓ الإطار النشط حالياً' : 'انقر على حفظ لتجهيز هذا الإطار'}
              </span>
            </div>
          </div>

          <div className="text-end">
            <span className="text-xs text-slate-400 font-bold block">الممتلكات:</span>
            <span className="text-sm font-black text-cyan-400">{ownedFrames.length} إطار</span>
          </div>
        </div>

        {/* Frames Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {ownedFrames.map(frame => {
            const isSelected = selectedId === frame.id;
            const isEquipped = profile.active_frame_id === frame.id;
            const isShowcased = profile.showcase_frames.includes(frame.id);

            return (
              <div
                key={frame.id}
                onClick={() => {
                  setSelectedId(frame.id);
                  sounds.playClick();
                }}
                className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2.5 cursor-pointer relative group ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-[0_0_18px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {/* Showcase Star Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleShowcase(frame.id);
                  }}
                  className={`absolute top-2 end-2 p-1 rounded-lg transition-colors z-10 ${
                    isShowcased ? 'text-amber-400 bg-amber-950/80 border border-amber-500/40' : 'text-slate-600 hover:text-slate-300 bg-slate-900/60'
                  }`}
                  title={isShowcased ? 'معروض في البروفايل' : 'إضافة للمعرض'}
                >
                  <Star className={`w-3 h-3 ${isShowcased ? 'fill-amber-400' : ''}`} />
                </button>

                <div className="w-16 h-16 aspect-square flex items-center justify-center group-hover:scale-105 transition-transform">
                  <AvatarWithFrame 
                    avatarUrl={profile.avatar_url} 
                    frameId={frame.id} 
                    size="md" 
                  />
                </div>

                <div className="text-center w-full">
                  <div className="text-xs font-bold line-clamp-1">{lang === 'ar' ? frame.name_ar : frame.name_en}</div>
                  {isEquipped ? (
                    <span className="text-[10px] text-cyan-400 font-bold block mt-0.5">✓ النشط حالياً</span>
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
            className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ وتجهيز الإطار</span>
          </button>
        </div>

      </div>
    </div>
  );
};
