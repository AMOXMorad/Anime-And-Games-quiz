import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { StoreItem, UserNotification } from '../../types';
import { INITIAL_STORE_ITEMS, getActiveStoreItems } from '../store/StoreView';
import { 
  Bell, 
  Send, 
  Gift, 
  Coins, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Radio, 
  ShoppingBag,
  Megaphone
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NotificationBroadcaster: React.FC = () => {
  const { notifications, adminBroadcastNotification, adminDeleteNotification } = useSocial();
  const { lang, t } = useI18n();

  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [titleAr, setTitleAr] = useState<string>('');
  const [titleEn, setTitleEn] = useState<string>('');
  const [msgAr, setMsgAr] = useState<string>('');
  const [msgEn, setMsgEn] = useState<string>('');
  const [coinsGift, setCoinsGift] = useState<number>(0);
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  const [feedback, setFeedback] = useState<string | null>(null);

  const availableItems = getActiveStoreItems();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim() || !msgAr.trim()) {
      setFeedback('يرجى كتابة عنوان ورسالة الإشعار بالعربية على الأقل.');
      sounds.playWrong();
      return;
    }

    const selectedItem = availableItems.find(i => i.id === selectedItemId);
    const finalTarget = targetType === 'all' ? 'all' : targetUserId.trim() || 'all';

    adminBroadcastNotification(
      titleAr.trim(),
      titleEn.trim() || titleAr.trim(),
      msgAr.trim(),
      msgEn.trim() || msgAr.trim(),
      coinsGift > 0 ? coinsGift : 0,
      selectedItem,
      finalTarget
    );

    sounds.playVictory();
    confetti({ particleCount: 120, spread: 80 });
    setFeedback('🎉 تم إرسال الإشعار وبثه بنجاح لجميع اللاعبين!');

    // Reset Form
    setTitleAr('');
    setTitleEn('');
    setMsgAr('');
    setMsgEn('');
    setCoinsGift(0);
    setSelectedItemId('');
  };

  return (
    <div className="space-y-8 animate-fadeIn text-start">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/80 via-black to-rose-950/80 border border-amber-500/40 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-black text-amber-300 mb-2">
          <Megaphone className="w-4 h-4 text-amber-400" />
          <span>مركز بث الإشعارات الحية والرسائل الإدارية</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
          إرسال إشعارات رسمية وهدايا للاعبين
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          جميع الإشعارات في الموقع تصدر الآن من طرف الأدمن فقط بشكل ديناميكي. يمكنك إرسال إعلانات عامة أو مكافآت عملات أو عناصر متجر للمستخدمين.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Broadcast Form */}
      <form onSubmit={handleSend} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Target Selector */}
        <div>
          <label className="block text-xs font-black text-slate-300 mb-2">نطاق الاستهداف:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTargetType('all')}
              className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                targetType === 'all'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>بث عام لجميع اللاعبين (Broadcast to All)</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('specific')}
              className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                targetType === 'specific'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>لاعب محدد (Specific User ID / Tag)</span>
            </button>
          </div>
        </div>

        {targetType === 'specific' && (
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">معرف اللاعب (User ID or Tag):</label>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="مثال: demo_itachi أو #1042"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
            />
          </div>
        )}

        {/* Titles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الإشعار (عربي) *</label>
            <input
              type="text"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder="مثال: 🎁 مكافأة صيانة وتحديث المنصة"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الإشعار (إنجليزي)</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Maintenance Bonus & New Worlds"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-bold"
            />
          </div>
        </div>

        {/* Messages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">نص الرسالة (عربي) *</label>
            <textarea
              rows={3}
              value={msgAr}
              onChange={(e) => setMsgAr(e.target.value)}
              placeholder="اكتب تفاصيل الإشعار أو التهنئة للاعبين..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">نص الرسالة (إنجليزي)</label>
            <textarea
              rows={3}
              value={msgEn}
              onChange={(e) => setMsgEn(e.target.value)}
              placeholder="Notification details in English..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white outline-none resize-none"
            />
          </div>
        </div>

        {/* Gift Attachments (Coins / Item) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>مكافأة عملات يوتوبيا (Coins):</span>
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={coinsGift}
              onChange={(e) => setCoinsGift(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2 text-xs font-bold text-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-300 mb-1 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              <span>إرفاق عنصر متجر مجاني (اختياري):</span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
            >
              <option value="">بدون عنصر (لا شيء)</option>
              {availableItems.map(item => (
                <option key={item.id} value={item.id}>
                  [{item.type}] {item.name_ar} ({item.name_en})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-xs rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Send className="w-4 h-4" />
          <span>بث وإرسال الإشعار فوراً</span>
        </button>

      </form>

      {/* Sent Notifications List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>سجل الإشعارات المرسلة الحالية ({notifications.length})</span>
        </h3>

        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            لا توجد إشعارات نشطة حالياً.
          </p>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                <div className="text-xs space-y-1">
                  <div className="font-black text-white flex items-center gap-2">
                    <span>{n.title_ar}</span>
                    {n.gift_coins && n.gift_coins > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-500/30 text-[10px]">
                        +{n.gift_coins} 🪙
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs">{n.message_ar}</p>
                  <div className="text-[10px] text-slate-500">المستهدف: {n.user_id === 'all' ? 'جميع اللاعبين' : n.user_id}</div>
                </div>

                <button
                  onClick={() => adminDeleteNotification(n.id)}
                  className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-600/30 transition-all flex-shrink-0"
                  title="حذف الإشعار"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
