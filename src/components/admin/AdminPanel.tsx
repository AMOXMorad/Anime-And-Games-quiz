import React, { useState, useEffect } from 'react';
import { useAuth, INITIAL_PROMO_CODES } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { StoreItem, Profile, UnlockType, PromoCode, PromoExpiryType } from '../../types';
import { INITIAL_STORE_ITEMS } from '../store/StoreView';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { RarityBadge } from '../ui/RarityBadge';
import { 
  ShieldAlert, 
  Users, 
  Gift, 
  ShoppingBag, 
  Bug, 
  Lightbulb, 
  Upload, 
  Download, 
  Ban, 
  CheckCircle, 
  Plus, 
  Coins, 
  Sparkles, 
  Trash2, 
  Edit, 
  Check,
  Wand2,
  Lock,
  KeyRound,
  Eye,
  Send,
  Sliders,
  Tag,
  Copy,
  Calendar,
  Clock,
  Flame,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminPanel: React.FC = () => {
  const { profile, updateCoins } = useAuth();
  const { 
    reports, 
    suggestions, 
    adminSendGift, 
    adminBanUser, 
    adminResolveReport, 
    adminUpdateSuggestionStatus 
  } = useSocial();
  const { lang, t } = useI18n();

  const [activeTab, setActiveTab] = useState<'create_item' | 'promo_codes' | 'store_manager' | 'gifts' | 'users'>('create_item');
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => {
    const saved = localStorage.getItem('ag_utopia_custom_store_items');
    return saved ? JSON.parse(saved) : INITIAL_STORE_ITEMS;
  });

  // Promo codes list state
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('ag_utopia_promo_codes');
      return saved ? JSON.parse(saved) : INITIAL_PROMO_CODES;
    } catch (e) {
      return INITIAL_PROMO_CODES;
    }
  });

  // Registered players list
  const [usersList, setUsersList] = useState<Profile[]>([
    {
      id: 'usr_sasuke',
      username: 'Sasuke_Uchiha',
      tag: '1042',
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 1400,
      xp: 1200,
      level: 14,
      avatar_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b13-SISLEw1oAD7a.png',
      active_avatar_id: 'avatar_sasuke_lightning',
      active_frame_id: 'frame_sharingan',
      active_tag_id: 'tag_shinobi_flame',
      active_title_id: 'title_king_shinobi',
      showcase_titles: ['title_king_shinobi'],
      showcase_tags: ['tag_shinobi_flame'],
      showcase_frames: ['frame_sharingan'],
      stats: { totalMatches: 35, wins: 28, correctAnswers: 240, streak: 6, whoAmIWins: 10, triviaWins: 12, superChallengeWins: 6 },
      created_at: new Date().toISOString()
    },
    {
      id: 'usr_rem',
      username: 'Rem_Maid',
      tag: '7789',
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 900,
      xp: 850,
      level: 11,
      avatar_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b88575-Ayu8UPDA8NS6.png',
      active_avatar_id: 'avatar_rem_demon',
      active_frame_id: 'frame_curse_flame',
      active_tag_id: 'tag_rezero_apple',
      active_title_id: 'title_death_return',
      showcase_titles: ['title_death_return'],
      showcase_tags: ['tag_rezero_apple'],
      showcase_frames: ['frame_curse_flame'],
      stats: { totalMatches: 22, wins: 17, correctAnswers: 140, streak: 3, whoAmIWins: 5, triviaWins: 7, superChallengeWins: 5 },
      created_at: new Date().toISOString()
    }
  ]);

  // In-Browser Item Creator Form State
  const [newItemType, setNewItemType] = useState<'avatar' | 'frame' | 'tag' | 'title'>('avatar');
  const [newItemNameAr, setNewItemNameAr] = useState('');
  const [newItemNameEn, setNewItemNameEn] = useState('');
  const [newItemDescAr, setNewItemDescAr] = useState('');
  const [newItemDescEn, setNewItemDescEn] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(300);
  const [newItemRarity, setNewItemRarity] = useState<'common' | 'rare' | 'epic' | 'legendary'>('epic');
  const [newItemAsset, setNewItemAsset] = useState('');
  const [newItemAvatarCat, setNewItemAvatarCat] = useState<'naruto' | 'rezero' | 'games' | 'chaos'>('naruto');
  const [newItemUnlockType, setNewItemUnlockType] = useState<UnlockType>('store');
  const [newItemReqLevel, setNewItemReqLevel] = useState<number>(10);
  const [newItemRedeemCode, setNewItemRedeemCode] = useState<string>('UTOPIA2026');
  const [createdFeedback, setCreatedFeedback] = useState<string | null>(null);

  // Promo Code Generator Form State
  const [newPromoCode, setNewPromoCode] = useState<string>('');
  const [newPromoCoins, setNewPromoCoins] = useState<number>(300);
  const [newPromoItemId, setNewPromoItemId] = useState<string>('');
  const [newPromoExpiryType, setNewPromoExpiryType] = useState<PromoExpiryType>('permanent');
  const [newPromoExpiresAt, setNewPromoExpiresAt] = useState<string>('2026-12-31');
  const [newPromoMaxUses, setNewPromoMaxUses] = useState<number>(10);
  const [newPromoDescAr, setNewPromoDescAr] = useState<string>('');
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Gift sender form state
  const [giftTargetUser, setGiftTargetUser] = useState<string>('all');
  const [giftCoins, setGiftCoins] = useState<number>(250);
  const [giftSelectedItemId, setGiftSelectedItemId] = useState<string>('');
  const [giftTitleAr, setGiftTitleAr] = useState<string>('🎁 هدية ملكية خاصة من مؤسس يوتوبيا');
  const [giftTitleEn, setGiftTitleEn] = useState<string>('🎁 Special Royal Gift from The Grand Founder');
  const [giftMsgAr, setGiftMsgAr] = useState<string>('تهانينا! تقديراً لمشاركتك الفعالة وتألقك في يوتوبيا، تم إرسال هذه المكافأة الحصرية لحسابك.');
  const [giftMsgEn, setGiftMsgEn] = useState<string>('Congratulations! As a token of appreciation for your achievements, enjoy this exclusive gift.');
  const [giftFeedback, setGiftFeedback] = useState<string | null>(null);

  // Save Store Items to LocalStorage
  const saveStoreItems = (items: StoreItem[]) => {
    setStoreItems(items);
    localStorage.setItem('ag_utopia_custom_store_items', JSON.stringify(items));
  };

  // Save Promo Codes to LocalStorage
  const savePromoCodes = (codes: PromoCode[]) => {
    setPromoCodes(codes);
    localStorage.setItem('ag_utopia_promo_codes', JSON.stringify(codes));
  };

  // Add Item to Store
  const handleAddStoreItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemNameAr.trim() || !newItemNameEn.trim()) return;

    const item: StoreItem = {
      id: `${newItemType}_${Date.now()}`,
      type: newItemType,
      name_ar: newItemNameAr.trim(),
      name_en: newItemNameEn.trim(),
      description_ar: newItemDescAr.trim() || 'عنصر حصري مصمم من قبل المؤسس',
      description_en: newItemDescEn.trim() || 'Exclusive item designed by The Grand Founder',
      price: newItemUnlockType === 'code' || newItemUnlockType === 'gift' ? 0 : newItemPrice,
      rarity: newItemRarity,
      asset_url: newItemAsset.trim() || (newItemType === 'tag' ? '👑' : 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png'),
      avatar_category: newItemType === 'avatar' ? newItemAvatarCat : undefined,
      unlock_type: newItemUnlockType,
      required_level: newItemUnlockType === 'level' ? newItemReqLevel : undefined,
      redeem_code: newItemUnlockType === 'code' ? newItemRedeemCode.trim().toUpperCase() : undefined,
      is_active: true
    };

    const updated = [item, ...storeItems];
    saveStoreItems(updated);

    // If item has a promo code, also register it in PromoCodes list
    if (newItemUnlockType === 'code' && newItemRedeemCode.trim()) {
      const codeStr = newItemRedeemCode.trim().toUpperCase();
      const newPromoObj: PromoCode = {
        id: 'promo_' + Date.now(),
        code: codeStr,
        reward_coins: 0,
        reward_item_id: item.id,
        reward_item: item,
        description_ar: `كود لفتح العنصر الحصري: ${item.name_ar}`,
        description_en: `Promo code to unlock: ${item.name_en}`,
        expiry_type: 'permanent',
        current_uses: 0,
        redeemed_by_users: [],
        is_active: true,
        created_at: new Date().toISOString()
      };
      savePromoCodes([newPromoObj, ...promoCodes]);
    }

    setCreatedFeedback(`🎉 تم إنشاء وإضافة العنصر (${item.name_ar}) إلى المتجر بنجاح!`);
    sounds.playVictory();
    confetti({ particleCount: 90, spread: 80 });

    // Reset Form
    setNewItemNameAr('');
    setNewItemNameEn('');
    setNewItemDescAr('');
    setNewItemDescEn('');
    setNewItemAsset('');
    setTimeout(() => setCreatedFeedback(null), 4000);
  };

  // Add New Promo Code Handler
  const handleCreatePromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    const cleanCode = newPromoCode.trim().toUpperCase();
    const existing = promoCodes.find(p => p.code.toUpperCase() === cleanCode);
    if (existing) {
      alert('هذا الكود موجود بالفعل! يرجى اختيار رمز كود آخر.');
      return;
    }

    const attachedItem = storeItems.find(i => i.id === newPromoItemId);

    const promo: PromoCode = {
      id: 'promo_' + Date.now(),
      code: cleanCode,
      reward_coins: newPromoCoins,
      reward_item_id: newPromoItemId || undefined,
      reward_item: attachedItem,
      description_ar: newPromoDescAr.trim() || `كود ترويجي بقيمة ${newPromoCoins} كوينز`,
      description_en: `Promo code reward`,
      expiry_type: newPromoExpiryType,
      expires_at: newPromoExpiryType === 'date_limited' ? newPromoExpiresAt : undefined,
      max_uses: newPromoExpiryType === 'uses_limited' ? newPromoMaxUses : undefined,
      current_uses: 0,
      redeemed_by_users: [],
      is_active: true,
      created_at: new Date().toISOString()
    };

    const updated = [promo, ...promoCodes];
    savePromoCodes(updated);

    setPromoFeedback(`🎉 تم إنشاء الكود الترويجي [${promo.code}] بنجاح!`);
    sounds.playVictory();
    confetti({ particleCount: 80, spread: 70 });

    // Reset
    setNewPromoCode('');
    setNewPromoDescAr('');
    setTimeout(() => setPromoFeedback(null), 4000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    sounds.playClick();
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTogglePromoActive = (promoId: string) => {
    const updated = promoCodes.map(p => (p.id === promoId ? { ...p, is_active: !p.is_active } : p));
    savePromoCodes(updated);
    sounds.playClick();
  };

  const handleDeletePromo = (promoId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكود الترويجي؟')) {
      const updated = promoCodes.filter(p => p.id !== promoId);
      savePromoCodes(updated);
      sounds.playClick();
    }
  };

  // Quick Price Edit in Store Manager
  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    const updated = storeItems.map(i => (i.id === itemId ? { ...i, price: Math.max(0, newPrice) } : i));
    saveStoreItems(updated);
    sounds.playClick();
  };

  // Toggle Item Active
  const handleToggleItemActive = (itemId: string) => {
    const updated = storeItems.map(i => (i.id === itemId ? { ...i, is_active: !i.is_active } : i));
    saveStoreItems(updated);
    sounds.playClick();
  };

  // Delete Item
  const handleDeleteItem = (itemId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر من المتجر؟')) {
      const updated = storeItems.filter(i => i.id !== itemId);
      saveStoreItems(updated);
      sounds.playClick();
    }
  };

  // Handle gift sending
  const handleSendGift = (e: React.FormEvent) => {
    e.preventDefault();
    const attachedItem = storeItems.find(i => i.id === giftSelectedItemId);
    adminSendGift(
      giftTargetUser,
      giftCoins,
      giftTitleAr,
      giftTitleEn,
      giftMsgAr,
      giftMsgEn,
      attachedItem
    );
    setGiftFeedback('تم إرسال الهدية بنجاح إلى صندوق إشعارات اللاعبين مع زر Claim الاحتفالي!');
    sounds.playVictory();
    confetti({ particleCount: 90, spread: 80 });
    setTimeout(() => setGiftFeedback(null), 4000);
  };

  // Toggle user ban
  const handleToggleBan = (userId: string) => {
    setUsersList(prev =>
      prev.map(u => (u.id === userId ? { ...u, is_banned: !u.is_banned } : u))
    );
    sounds.playClick();
  };

  // Add Coins to User in DB
  const handleAddCoinsToUser = (userId: string, amount: number) => {
    setUsersList(prev =>
      prev.map(u => (u.id === userId ? { ...u, coins: u.coins + amount } : u))
    );
    sounds.playClaim();
  };

  // Upload JSON Batch File for Store Items
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const merged = [...json, ...storeItems];
          saveStoreItems(merged);
          sounds.playVictory();
          confetti({ particleCount: 80, spread: 70 });
          alert(`✅ تم استيراد وإضافة ${json.length} عنصر جديد إلى المتجر بنجاح!`);
        } else {
          alert('الملف يجب أن يحتوي على مصفوفة (Array) من عناصر المتجر.');
        }
      } catch (err) {
        alert('خطأ في قراءة ملف الـ JSON!');
      }
    };
    reader.readAsText(file);
  };

  // Export Store Items as JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(storeItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ag_utopia_store_items_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sounds.playClick();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-purple-950/90 border-2 border-rose-500/50 p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/60 border border-rose-400/40 text-rose-300 font-bold text-xs mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>THE GRAND FOUNDER CONTROL CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              لوحة تحكم المشرف العام والمؤسس (AMOX)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              تصميم الأفاتارات بالـ PNG، توليد الأكواد الترويجية المحددة، إدارة المتجر، وتوزيع المكافآت
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-lg transition-all">
              <Upload className="w-4 h-4" />
              <span>استيراد JSON</span>
              <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
            </label>

            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تصدير JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => { setActiveTab('create_item'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'create_item'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg ring-2 ring-rose-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wand2 className="w-4 h-4 text-amber-300" />
          <span>🎨 استوديو تصميم العناصر (PNG Studio)</span>
        </button>

        <button
          onClick={() => { setActiveTab('promo_codes'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'promo_codes'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-lg ring-2 ring-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span>🔑 منشئ ومدير الأكواد الترويجية ({promoCodes.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('store_manager'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'store_manager'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>إدارة أسعار وعناصر المتجر ({storeItems.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('gifts'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gifts'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>إرسال هدايا ومكافآت للاعبين</span>
        </button>

        <button
          onClick={() => { setActiveTab('users'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>إدارة اللاعبين وقاعدة البيانات</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: IN-BROWSER ITEM DESIGNER & CREATOR                      */}
      {/* ============================================================== */}
      {activeTab === 'create_item' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Creator Form */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
              <Wand2 className="w-5 h-5 text-rose-400" />
              <h3 className="text-lg font-black text-white">تصميم عنصر جديد للمتجر مباشرة</h3>
            </div>

            {createdFeedback && (
              <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-black text-center shadow-lg animate-fadeIn">
                {createdFeedback}
              </div>
            )}

            <form onSubmit={handleAddStoreItem} className="space-y-4">
              
              {/* Item Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">نوع العنصر:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'avatar', label: '👤 صورة أفاتار' },
                    { id: 'frame', label: '🛡️ إطار بروفايل' },
                    { id: 'tag', label: '👑 شارة / تاج' },
                    { id: 'title', label: '✨ لقب تنافسي' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewItemType(t.id as any)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all ${
                        newItemType === t.id
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Names (AR & EN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم بالعربي *</label>
                  <input
                    type="text"
                    required
                    value={newItemNameAr}
                    onChange={e => setNewItemNameAr(e.target.value)}
                    placeholder="مثال: ناروتو شوغون الذهبي"
                    className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الاسم بالإنجليزي *</label>
                  <input
                    type="text"
                    required
                    value={newItemNameEn}
                    onChange={e => setNewItemNameEn(e.target.value)}
                    placeholder="e.g. Golden Shogun Naruto"
                    className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Image URL / Asset PNG Link */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رابط الصورة (PNG / Image URL) أو إيموجي للتاج:
                </label>
                <input
                  type="text"
                  value={newItemAsset}
                  onChange={e => setNewItemAsset(e.target.value)}
                  placeholder="https://i.imgur.com/your_image.png أو رابط مباشر أو 👑"
                  className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 يمكنك وضع رابط أي صورة PNG صممتها على جهازك ورفعتها على موقع مثل Imgur أو Discord أو سيرفرك.
                </p>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الوصف بالعربي</label>
                  <textarea
                    rows={2}
                    value={newItemDescAr}
                    onChange={e => setNewItemDescAr(e.target.value)}
                    placeholder="وصف مميز يوضح قوة وجمال العنصر..."
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الوصف بالإنجليزي</label>
                  <textarea
                    rows={2}
                    value={newItemDescEn}
                    onChange={e => setNewItemDescEn(e.target.value)}
                    placeholder="Short description in English..."
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Rarity & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">درجة الندرة (Rarity)</label>
                  <select
                    value={newItemRarity}
                    onChange={e => setNewItemRarity(e.target.value as any)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="common">شائع (Common - رمادي)</option>
                    <option value="rare">نادر (Rare - أزرق)</option>
                    <option value="epic">أسطوري (Epic - بنفسجي)</option>
                    <option value="legendary">خرافي (Legendary - ذهبي متوهج)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">السعر بالعملات (Coins)</label>
                  <input
                    type="number"
                    min={0}
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(Number(e.target.value))}
                    className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* UNLOCK CONDITION */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30">
                <label className="block text-xs font-black text-rose-300 mb-2">
                  🔒 طريقة الحصول على العنصر وشروط الفتح:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { id: 'store', label: '🛒 شراء عادي بالكوينز' },
                    { id: 'code', label: '🔑 كود ترويجي حصري' },
                    { id: 'level', label: '🏆 شرط مستوى محدد' },
                    { id: 'gift', label: '🎁 هدية من المؤسس فقط' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setNewItemUnlockType(m.id as any)}
                      className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                        newItemUnlockType === m.id
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {newItemUnlockType === 'code' && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-bold text-amber-300 mb-1">
                      الكود السري للاسترداد (Promo Code):
                    </label>
                    <input
                      type="text"
                      required
                      value={newItemRedeemCode}
                      onChange={e => setNewItemRedeemCode(e.target.value.toUpperCase())}
                      placeholder="مثال: SHOGUN2026 أو SPECIAL_VIP"
                      className="w-full py-2 px-3 bg-slate-900 border border-amber-500/50 rounded-xl text-xs font-black text-amber-400 uppercase tracking-widest focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      💡 صالح للاستخدام مرة واحدة لكل حساب ومتاح عبر خانة استرداد الأكواد في المتجر!
                    </p>
                  </div>
                )}

                {newItemUnlockType === 'level' && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-bold text-cyan-300 mb-1">
                      المستوى المطلوب لفتح العنصر (Level Required):
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={100}
                      required
                      value={newItemReqLevel}
                      onChange={e => setNewItemReqLevel(Number(e.target.value))}
                      className="w-full py-2 px-3 bg-slate-900 border border-cyan-500/50 rounded-xl text-xs font-black text-cyan-400 focus:outline-none"
                    />
                  </div>
                )}

                {newItemUnlockType === 'gift' && (
                  <p className="text-xs text-rose-300 font-semibold animate-fadeIn">
                    🎁 هذا العنصر سيظهر في المتجر كـ (حصري كهدية من المؤسس) وترسله أنت فقط للاعبين من تبويب الهدايا.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-[0_0_25px_rgba(225,29,72,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة العنصر للمتجر فوراً 🚀</span>
              </button>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-purple-400 mb-4 pb-2 border-b border-slate-800">
                <Eye className="w-4 h-4" />
                <span>معاينة حية لشكل البطاقة في المتجر</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <RarityBadge rarity={newItemRarity} />
                  {newItemUnlockType === 'code' ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <KeyRound className="w-3 h-3" />
                      PROMO CODE
                    </span>
                  ) : newItemUnlockType === 'level' ? (
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Lv. {newItemReqLevel}
                    </span>
                  ) : null}
                </div>

                <div className="py-4 flex justify-center">
                  {newItemType === 'avatar' ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.5)] bg-slate-900">
                      <img 
                        src={newItemAsset || 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png'} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png'; }}
                      />
                    </div>
                  ) : newItemType === 'frame' ? (
                    <AvatarWithFrame frameId="frame_founder_exclusive" size="lg" />
                  ) : newItemType === 'tag' ? (
                    <span className="text-4xl">{newItemAsset || '👑'}</span>
                  ) : (
                    <span className="text-sm font-black text-amber-400">✨ {newItemNameAr || 'اللقب الأسطوري'}</span>
                  )}
                </div>

                <h4 className="font-black text-base text-white text-center mb-1">
                  {newItemNameAr || 'اسم العنصر بالعربي'}
                </h4>
                <div className="text-[11px] text-slate-400 text-center mb-4 line-clamp-2">
                  {newItemDescAr || 'وصف العنصر كما سيظهر للاعبين...'}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-black text-amber-400 text-xs">
                    <Coins className="w-4 h-4" />
                    <span>{newItemUnlockType === 'code' || newItemUnlockType === 'gift' ? 'مجاني / حصري' : newItemPrice}</span>
                  </div>

                  <span className="text-[10px] font-bold bg-purple-600 text-white px-3 py-1 rounded-xl">
                    معاينة الشراء
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              📌 يتم حفظ هذا العنصر فوراً في قاعدة بيانات المتجر ويصبح متاحاً لجميع اللاعبين على الموقع!
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PROMO CODES GENERATOR & MANAGER                         */}
      {/* ============================================================== */}
      {activeTab === 'promo_codes' && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Create Promo Code Card */}
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
              <KeyRound className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-lg font-black text-white">توليد وإنشاء كود ترويجي جديد (Promo Code Generator)</h3>
                <p className="text-xs text-slate-400">
                  حدد مدة الصلاحية، عدد المستخدمين الأقصى، أو اجعله كوداً أحادياً للاستخدام مرة واحدة فقط
                </p>
              </div>
            </div>

            {promoFeedback && (
              <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-black text-center shadow-lg animate-fadeIn">
                {promoFeedback}
              </div>
            )}

            <form onSubmit={handleCreatePromoCode} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Code String */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1.5">رمز الكود الترويجي *</label>
                  <input
                    type="text"
                    required
                    value={newPromoCode}
                    onChange={e => setNewPromoCode(e.target.value.toUpperCase())}
                    placeholder="مثال: UTOPIA_SUMMER أو AMOX50"
                    className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-black text-amber-400 uppercase tracking-wider focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Reward Coins */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">العملات الممنوحة (Coins)</label>
                  <input
                    type="number"
                    min={0}
                    value={newPromoCoins}
                    onChange={e => setNewPromoCoins(Number(e.target.value))}
                    className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Attach Store Item */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">إرفاق عنصر من المتجر (اختياري)</label>
                  <select
                    value={newPromoItemId}
                    onChange={e => setNewPromoItemId(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">عملات فقط (بدون عنصر)</option>
                    {storeItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.type === 'avatar' ? '👤' : item.type === 'frame' ? '🛡️' : item.type === 'tag' ? '👑' : '✨'} {item.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Expiration Rules (دائم / تاريخ / عدد مستخدمين) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="block text-xs font-black text-amber-300 mb-2">
                  ⏳ نظام الصلاحية وعدد مرات الاستخدام:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {[
                    { id: 'permanent', label: '♾️ دائم (لكل لاعب مرة)', desc: 'لا ينتهي أبداً ومتاح للجميع' },
                    { id: 'date_limited', label: '📅 محدد بتاريخ انتهاء', desc: 'ينتهي في يوم/تاريخ محدد' },
                    { id: 'uses_limited', label: '🔢 محدد بعدد مستخدمين', desc: 'لأول X لاعبين أو استخدام وحيد' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setNewPromoExpiryType(m.id as any)}
                      className={`p-3 rounded-xl text-start transition-all border ${
                        newPromoExpiryType === m.id
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-black text-white mb-0.5">{m.label}</div>
                      <div className="text-[10px] text-slate-400">{m.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Conditional Expiry Fields */}
                {newPromoExpiryType === 'date_limited' && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-bold text-slate-300 mb-1">تاريخ الانتهاء (Expiration Date):</label>
                    <input
                      type="date"
                      required
                      value={newPromoExpiresAt}
                      onChange={e => setNewPromoExpiresAt(e.target.value)}
                      className="py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                {newPromoExpiryType === 'uses_limited' && (
                  <div className="animate-fadeIn space-y-2">
                    <label className="block text-xs font-bold text-slate-300">أقصى عدد مستخدمين (Max Redemptions):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        required
                        value={newPromoMaxUses}
                        onChange={e => setNewPromoMaxUses(Number(e.target.value))}
                        className="w-32 py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                      />
                      <span className="text-xs text-slate-400">
                        {newPromoMaxUses === 1 ? '🔥 كود أحادي (مستخدم واحد فقط ثم يحترق)' : `لأول ${newPromoMaxUses} مستخدمين`}
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">وصف الكود أو المناسبة:</label>
                <input
                  type="text"
                  value={newPromoDescAr}
                  onChange={e => setNewPromoDescAr(e.target.value)}
                  placeholder="مثال: كود احتفال إطلاق الموسم الأول / كود حصري لليوتيوب"
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-5 h-5" />
                <span>تفعيل ونشر الكود الترويجي فوراً 🚀</span>
              </button>

            </form>
          </div>

          {/* Active Promo Codes Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white">قائمة الأكواد الترويجية وإحصائيات الاستخدام</h3>
                <p className="text-xs text-slate-400">تتبع عدد الذين استردوا كل كود وحالته</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 text-xs font-bold">
                إجمالي الأكواد: {promoCodes.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold">
                    <th className="pb-3 text-start">رمز الكود</th>
                    <th className="pb-3 text-start">المكافأة الممنوحة</th>
                    <th className="pb-3 text-start">نوع الصلاحية</th>
                    <th className="pb-3 text-start">الاستخدامات</th>
                    <th className="pb-3 text-start">الحالة</th>
                    <th className="pb-3 text-end">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {promoCodes.map(promo => {
                    const isDateExpired = promo.expiry_type === 'date_limited' && promo.expires_at && new Date() > new Date(promo.expires_at);
                    const isUsesExceeded = (promo.expiry_type === 'uses_limited' || promo.max_uses) && promo.max_uses && promo.current_uses >= promo.max_uses;

                    return (
                      <tr key={promo.id} className="hover:bg-slate-950/40 transition-colors">
                        
                        {/* Code String */}
                        <td className="py-3 font-mono font-black text-amber-400 text-sm">
                          <div className="flex items-center gap-1.5">
                            <span>{promo.code}</span>
                            <button
                              onClick={() => handleCopyCode(promo.code)}
                              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                              title="نسخ الكود"
                            >
                              {copiedCode === promo.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="text-[10px] font-sans text-slate-400 font-normal mt-0.5">{promo.description_ar}</div>
                        </td>

                        {/* Rewards */}
                        <td className="py-3">
                          <div className="space-y-0.5">
                            {promo.reward_coins > 0 && (
                              <div className="flex items-center gap-1 font-bold text-amber-300">
                                <Coins className="w-3.5 h-3.5" />
                                <span>+{promo.reward_coins} كوينز</span>
                              </div>
                            )}
                            {promo.reward_item && (
                              <div className="text-[11px] font-bold text-purple-300">
                                🎁 {promo.reward_item.name_ar}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Expiry Type */}
                        <td className="py-3">
                          {promo.expiry_type === 'permanent' ? (
                            <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                              ♾️ دائم
                            </span>
                          ) : promo.expiry_type === 'date_limited' ? (
                            <span className={`font-bold px-2 py-0.5 rounded border ${
                              isDateExpired ? 'bg-rose-950 text-rose-300 border-rose-500/40' : 'bg-indigo-950 text-indigo-300 border-indigo-500/40'
                            }`}>
                              📅 حتى {promo.expires_at}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                              🔢 أقصى {promo.max_uses} مستخدم
                            </span>
                          )}
                        </td>

                        {/* Usage Counter */}
                        <td className="py-3">
                          <span className="font-bold text-white">
                            {promo.current_uses} {promo.max_uses ? `/ ${promo.max_uses}` : 'مستخدم'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3">
                          {isDateExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-500/40">
                              انتهت الصلاحية
                            </span>
                          ) : isUsesExceeded ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-500/40">
                              مستنفد بالكامل
                            </span>
                          ) : promo.is_active ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                              نشط وجاهز
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              معطل
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleTogglePromoActive(promo.id)}
                              className={`px-2 py-1 rounded text-[10px] font-bold ${
                                promo.is_active ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              {promo.is_active ? 'إيقاف' : 'تفعيل'}
                            </button>
                            <button
                              onClick={() => handleDeletePromo(promo.id)}
                              className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-600/40"
                              title="حذف الكود"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: STORE MANAGER                                           */}
      {/* ============================================================== */}
      {activeTab === 'store_manager' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white">إدارة وتعديل أسعار عناصر المتجر</h3>
              <p className="text-xs text-slate-400">تحكم بالأسعار، إيقاف أو تفعيل العناصر، وحذف العناصر القديمة</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-bold">
              إجمالي العناصر: {storeItems.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 text-start">العنصر والنوع</th>
                  <th className="pb-3 text-start">الندرة</th>
                  <th className="pb-3 text-start">طريقة الفتح</th>
                  <th className="pb-3 text-start">السعر الحالي (Coins)</th>
                  <th className="pb-3 text-start">الحالة</th>
                  <th className="pb-3 text-end">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {storeItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                    
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {item.type === 'avatar' && item.asset_url ? (
                            <img src={item.asset_url} alt="" className="w-full h-full object-cover" />
                          ) : item.type === 'tag' && item.asset_url ? (
                            <span className="text-base">{item.asset_url}</span>
                          ) : (
                            <Sparkles className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{item.name_ar}</div>
                          <div className="text-[10px] text-slate-400">{item.name_en} • <span className="uppercase text-purple-400">{item.type}</span></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <RarityBadge rarity={item.rarity} />
                    </td>

                    <td className="py-3">
                      {item.unlock_type === 'code' ? (
                        <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                          كود: {item.redeem_code}
                        </span>
                      ) : item.unlock_type === 'level' ? (
                        <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                          مستوى: {item.required_level}
                        </span>
                      ) : item.unlock_type === 'gift' ? (
                        <span className="text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-500/30">
                          هدية مؤسس
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold">متجر عادي</span>
                      )}
                    </td>

                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={e => handleUpdatePrice(item.id, Number(e.target.value))}
                          className="w-20 py-1 px-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
                        />
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    </td>

                    <td className="py-3">
                      <button
                        onClick={() => handleToggleItemActive(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                          item.is_active
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {item.is_active ? 'مفعل بالمتجر' : 'معطل مخفي'}
                      </button>
                    </td>

                    <td className="py-3 text-end">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 text-rose-300 transition-colors"
                        title="حذف العنصر"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: GIFTS DISPATCHER                                        */}
      {/* ============================================================== */}
      {activeTab === 'gifts' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
            <Gift className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-lg font-black text-white">إرسال هدايا ومكافآت احتفالية للمستخدمين</h3>
              <p className="text-xs text-slate-400">تصل الهدية مباشرة لصندوق إشعارات اللاعب مع أنيميشن Claim واحتفال بالكونفيتي</p>
            </div>
          </div>

          {giftFeedback && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-black text-center shadow-lg animate-fadeIn">
              {giftFeedback}
            </div>
          )}

          <form onSubmit={handleSendGift} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">المستلم:</label>
              <select
                value={giftTargetUser}
                onChange={e => setGiftTargetUser(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">📢 بث عام لجميع اللاعبين (All Players)</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>
                    👤 {u.username} (#{u.tag})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">العملات المرفقة (Coins):</label>
                <div className="relative">
                  <Coins className="absolute start-3 top-2.5 w-4 h-4 text-amber-400" />
                  <input
                    type="number"
                    min={0}
                    value={giftCoins}
                    onChange={e => setGiftCoins(Number(e.target.value))}
                    className="w-full ps-9 pe-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">إرفاق عنصر من المتجر (اختياري):</label>
                <select
                  value={giftSelectedItemId}
                  onChange={e => setGiftSelectedItemId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">بدون عنصر (عملات فقط)</option>
                  {storeItems.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.type === 'avatar' ? '👤' : i.type === 'frame' ? '🛡️' : i.type === 'tag' ? '👑' : '✨'} {i.name_ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان الإشعار بالعربي:</label>
              <input
                type="text"
                required
                value={giftTitleAr}
                onChange={e => setGiftTitleAr(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نص الرسالة الاحتفالية:</label>
              <textarea
                rows={3}
                required
                value={giftMsgAr}
                onChange={e => setGiftMsgAr(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>إرسال الهدية فوراً 🎁</span>
            </button>

          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: USERS & DATABASE MANAGEMENT                             */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white">إدارة اللاعبين وقاعدة البيانات</h3>
              <p className="text-xs text-slate-400">تعديل الأرصدة، المستويات، حظر المخالفين، ومنح الرتب</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 text-start">اللاعب</th>
                  <th className="pb-3 text-start">التاغ</th>
                  <th className="pb-3 text-start">المستوى</th>
                  <th className="pb-3 text-start">الكوينز</th>
                  <th className="pb-3 text-start">الحالة</th>
                  <th className="pb-3 text-end">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <AvatarWithFrame avatarUrl={u.avatar_url} frameId={u.active_frame_id} size="sm" />
                        <div>
                          <div className="font-bold text-white">{u.username}</div>
                          <div className="text-[10px] text-slate-500">{u.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <span className="font-mono text-purple-400 font-bold">#{u.tag}</span>
                    </td>

                    <td className="py-3">
                      <span className="font-bold text-white">Lv. {u.level}</span>
                    </td>

                    <td className="py-3">
                      <span className="font-bold text-amber-400">{u.coins} كوينز</span>
                    </td>

                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        u.is_banned ? 'bg-rose-950 text-rose-400 border border-rose-500/40' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {u.is_banned ? 'محظور' : 'نشط'}
                      </span>
                    </td>

                    <td className="py-3 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAddCoinsToUser(u.id, 500)}
                          className="px-2 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 text-amber-300 text-[10px] font-bold"
                          title="إضافة 500 كوينز"
                        >
                          +500 🪙
                        </button>
                        <button
                          onClick={() => handleToggleBan(u.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                            u.is_banned
                              ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {u.is_banned ? 'إلغاء الحظر' : 'حظر 🚫'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
