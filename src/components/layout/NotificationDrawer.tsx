import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { X, Gift, Sparkles, Coins, CheckCircle, ShieldCheck } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, claimNotificationGift } = useSocial();
  const { lang, t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => { onClose(); sounds.playClick(); }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 end-0 max-w-full flex">
        <div className="w-screen max-w-md bg-slate-900 border-s border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{t('notifications')}</h3>
                  <span className="text-xs text-slate-400">AG Utopia Rewards & Updates</span>
                </div>
              </div>
              <button
                onClick={() => { onClose(); sounds.playClick(); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="mt-4 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)] pe-1">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  {t('noNotifications')}
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      notif.is_claimed
                        ? 'bg-slate-950/40 border-slate-800 opacity-75'
                        : 'bg-gradient-to-b from-purple-950/40 to-slate-950 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {lang === 'ar' ? notif.title_ar : notif.title_en}
                      </h4>
                      {notif.sender_admin_id && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {lang === 'ar' ? notif.message_ar : notif.message_en}
                    </p>

                    {/* Gift Claim Section */}
                    {notif.gift_coins > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                          <Coins className="w-4 h-4" />
                          <span>+{notif.gift_coins} Coins</span>
                        </div>

                        {notif.is_claimed ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t('owned')}
                          </span>
                        ) : (
                          <button
                            onClick={() => claimNotificationGift(notif.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all animate-bounce"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            {t('claimGift')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 pt-4 border-t border-slate-800">
            AG Utopia Cloud System • Realtime Sync
          </div>
        </div>
      </div>
    </div>
  );
};
