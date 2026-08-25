import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { StoreItem, Profile } from '../../types';
import { INITIAL_STORE_ITEMS } from '../store/StoreView';
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
  Check
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

  const [activeTab, setActiveTab] = useState<'users' | 'gifts' | 'store' | 'reports' | 'suggestions'>('users');
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => {
    const saved = localStorage.getItem('ag_utopia_custom_store_items');
    return saved ? JSON.parse(saved) : INITIAL_STORE_ITEMS;
  });

  // Demo user management state
  const [usersList, setUsersList] = useState<Profile[]>([
    {
      id: 'usr_sasuke',
      username: 'Sasuke_Uchiha',
      tag: '1042',
      is_guest: false,
      role: 'user',
      is_banned: false,
      coins: 1400,
      xp: 2800,
      level: 15,
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
      xp: 1800,
      level: 11,
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

  // Gift sender form
  const [giftTargetUser, setGiftTargetUser] = useState<string>('all');
  const [giftCoins, setGiftCoins] = useState<number>(500);
  const [giftTitleAr, setGiftTitleAr] = useState<string>('🎁 مكافأة خاصة من الإدارة');
  const [giftTitleEn, setGiftTitleEn] = useState<string>('🎁 Special Reward from Administration');
  const [giftMsgAr, setGiftMsgAr] = useState<string>('تهانينا! تقديراً لمشاركتك الفعالة وتألقك في يوتوبيا، تم إرسال هذه المكافأة لحسابك.');
  const [giftMsgEn, setGiftMsgEn] = useState<string>('Congratulations! As a token of appreciation for your active gameplay, enjoy this gift.');
  const [giftFeedback, setGiftFeedback] = useState<string | null>(null);

  // New Store Item form
  const [newItemType, setNewItemType] = useState<'frame' | 'tag' | 'title'>('frame');
  const [newItemNameAr, setNewItemNameAr] = useState('');
  const [newItemNameEn, setNewItemNameEn] = useState('');
  const [newItemDescAr, setNewItemDescAr] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(250);
  const [newItemRarity, setNewItemRarity] = useState<'common' | 'rare' | 'epic' | 'legendary'>('rare');
  const [newItemAsset, setNewItemAsset] = useState('');

  // Handle gift sending
  const handleSendGift = (e: React.FormEvent) => {
    e.preventDefault();
    adminSendGift(
      giftTargetUser,
      giftCoins,
      giftTitleAr,
      giftTitleEn,
      giftMsgAr,
      giftMsgEn
    );
    setGiftFeedback('تم إرسال الهدية بنجاح إلى صندوق إشعارات اللاعبين!');
    sounds.playVictory();
    confetti({ particleCount: 70, spread: 60 });
    setTimeout(() => setGiftFeedback(null), 3000);
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

  // Add Item to Store
  const handleAddStoreItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemNameAr.trim() || !newItemNameEn.trim()) return;

    const item: StoreItem = {
      id: `${newItemType}_${Date.now()}`,
      type: newItemType,
      name_ar: newItemNameAr,
      name_en: newItemNameEn,
      description_ar: newItemDescAr || 'عنصر حصري جديد في متجر يوتوبيا',
      description_en: 'New exclusive item in Utopia Store',
      price: newItemPrice,
      rarity: newItemRarity,
      asset_url: newItemAsset || (newItemType === 'tag' ? '👑' : ''),
      is_active: true
    };

    const updated = [item, ...storeItems];
    setStoreItems(updated);
    localStorage.setItem('ag_utopia_custom_store_items', JSON.stringify(updated));
    setNewItemNameAr('');
    setNewItemNameEn('');
    setNewItemDescAr('');
    sounds.playVictory();
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
          setStoreItems(merged);
          localStorage.setItem('ag_utopia_custom_store_items', JSON.stringify(merged));
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
    downloadAnchor.setAttribute('download', 'ag_utopia_store_items.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Admin Hero Header */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border border-rose-500/40 p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 text-center md:text-start">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse">
              <ShieldAlert className="w-9 h-9 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/60 border border-rose-400/40 text-rose-300 font-black text-xs mb-1.5">
                🔱 THE GRAND FOUNDER CONTROL PANEL
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                لوحة تحكم المشرف العام والمؤسس
              </h1>
              <p className="text-xs text-slate-300">
                التحكم الكامل بقاعدة البيانات، اللاعبين، إرسال الهدايا المخصصة، وإدارة المتجر والبلاغات
              </p>
            </div>
          </div>

          {/* Quick Stats Counter */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center text-xs">
            <div className="px-3">
              <div className="font-black text-white text-base">{usersList.length + 1}</div>
              <span className="text-slate-400 text-[10px]">اللاعبين</span>
            </div>
            <div className="px-3 border-x border-slate-800">
              <div className="font-black text-amber-400 text-base">{storeItems.length}</div>
              <span className="text-slate-400 text-[10px]">عناصر المتجر</span>
            </div>
            <div className="px-3">
              <div className="font-black text-rose-400 text-base">{reports.length}</div>
              <span className="text-slate-400 text-[10px]">البلاغات</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => { setActiveTab('users'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>إدارة اللاعبين والداتا بيز</span>
        </button>

        <button
          onClick={() => { setActiveTab('gifts'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gifts' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>إرسال هدايا ومكافآت مخصصة</span>
        </button>

        <button
          onClick={() => { setActiveTab('store'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'store' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>إدارة المتجر واستيراد الـ JSON</span>
        </button>

        <button
          onClick={() => { setActiveTab('reports'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reports' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bug className="w-4 h-4" />
          <span>مركز البلاغات ({reports.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('suggestions'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'suggestions' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>اقتراحات المجتمع ({suggestions.length})</span>
        </button>
      </div>

      {/* TAB 1: User Management */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white mb-4">قائمة اللاعبين المسجلين في قاعدة البيانات:</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3 text-start">اللاعب</th>
                  <th className="p-3 text-start">التاغ</th>
                  <th className="p-3 text-start">الرصيد</th>
                  <th className="p-3 text-start">المستوى والـ XP</th>
                  <th className="p-3 text-start">الحالة</th>
                  <th className="p-3 text-end">إجراءات وتحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <span>{u.username}</span>
                      {u.is_banned && (
                        <span className="text-[10px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded-full border border-rose-800">
                          محظور (Banned)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-purple-400 font-bold">#{u.tag}</td>
                    <td className="p-3 font-black text-amber-400">{u.coins} Coins</td>
                    <td className="p-3 text-slate-300">Lv.{u.level} ({u.xp} XP)</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_banned ? 'bg-rose-900/60 text-rose-300' : 'bg-emerald-900/60 text-emerald-300'
                      }`}>
                        {u.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-end space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => handleAddCoinsToUser(u.id, 500)}
                        className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg font-bold text-[11px] transition-all"
                        title="منح 500 كوينز"
                      >
                        +500 🪙
                      </button>

                      <button
                        onClick={() => handleToggleBan(u.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                          u.is_banned
                            ? 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white'
                            : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white'
                        }`}
                      >
                        {u.is_banned ? 'إلغاء الحظر' : 'حظر (Ban)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Custom Gifts Sender */}
      {activeTab === 'gifts' && (
        <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <span>نظام إرسال الهدايا والمكافآت المخصصة للاعبين</span>
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            ستصل الهدية فوراً لصندوق إشعارات اللاعب مع زر تفاعلي لاستلام المكافأة ومؤثرات الاحتفال.
          </p>

          {giftFeedback && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold text-center animate-fadeIn">
              {giftFeedback}
            </div>
          )}

          <form onSubmit={handleSendGift} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">المستلم:</label>
              <select
                value={giftTargetUser}
                onChange={e => setGiftTargetUser(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                <option value="all">🌟 جميع اللاعبين في المنصة (Broadcast Gift)</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.username} (#{u.tag})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">عدد العملات المرفقة (Coins):</label>
              <input
                type="number"
                value={giftCoins}
                onChange={e => setGiftCoins(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                min="0"
                step="50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">عنوان الإشعار (عربي):</label>
                <input
                  type="text"
                  value={giftTitleAr}
                  onChange={e => setGiftTitleAr(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">عنوان الإشعار (English):</label>
                <input
                  type="text"
                  value={giftTitleEn}
                  onChange={e => setGiftTitleEn(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">الرسالة المخصصة (عربي):</label>
              <textarea
                value={giftMsgAr}
                onChange={e => setGiftMsgAr(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all"
            >
              🎁 إرسال الهدية الآن
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Store Management & JSON Uploader */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          
          {/* JSON Batch Import / Export Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>ميزة استيراد وتصدير ملفات العناصر (JSON Batch Manager)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                ارفع ملف <code className="text-purple-400">items.json</code> لإضافة دفعة عناصر جديدة للمتجر بضغطة زر، أو قم بتحميل الملف الحالي.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                <span>رفع ملف items.json</span>
                <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
              </label>

              <button
                onClick={handleExportJson}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>تصدير JSON</span>
              </button>
            </div>
          </div>

          {/* Quick Add Single Item */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>إضافة عنصر جديد يدوياً:</span>
            </h4>

            <form onSubmit={handleAddStoreItem} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">النوع:</label>
                <select
                  value={newItemType}
                  onChange={e => setNewItemType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="frame">🖼️ إطار بروفايل (Frame)</option>
                  <option value="tag">👑 تاج / شارة اسم (Tag)</option>
                  <option value="title">📜 لقب (Title)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">الاسم (العربي):</label>
                <input
                  type="text"
                  value={newItemNameAr}
                  onChange={e => setNewItemNameAr(e.target.value)}
                  placeholder="مثال: إطار التنين الأزرق"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">الاسم (English):</label>
                <input
                  type="text"
                  value={newItemNameEn}
                  onChange={e => setNewItemNameEn(e.target.value)}
                  placeholder="e.g. Azure Dragon Frame"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">السعر (Coins):</label>
                <input
                  type="number"
                  value={newItemPrice}
                  onChange={e => setNewItemPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">الندرة:</label>
                <select
                  value={newItemRarity}
                  onChange={e => setNewItemRarity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="common">شائع (Common)</option>
                  <option value="rare">نادر (Rare)</option>
                  <option value="epic">أسطوري (Epic)</option>
                  <option value="legendary">خرافي (Legendary)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">أيقونة الشارة / الأصول:</label>
                <input
                  type="text"
                  value={newItemAsset}
                  onChange={e => setNewItemAsset(e.target.value)}
                  placeholder="رمز مثل 🐉 أو رابط صورة"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  حفظ وإضافة للمتجر
                </button>
              </div>
            </form>
          </div>

          {/* Current Items List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="font-bold text-sm text-white mb-4">العناصر المتاحة بالمتجر ({storeItems.length}):</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {storeItems.map(item => (
                <div key={item.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-white">{item.name_ar}</div>
                    <span className="text-[10px] text-amber-400 font-bold">{item.price} Coins</span>
                  </div>
                  <span className="text-xs">{item.asset_url || (item.type === 'frame' ? '🖼️' : '📜')}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: Reports Center */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white">مركز البلاغات والأخطاء الواردة:</h3>

          {reports.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              🎉 لا توجد بلاغات مفتوحة حالياً! المنصة تعمل بكفاءة تامة.
            </div>
          ) : (
            reports.map(rep => (
              <div key={rep.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                      {rep.type}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(rep.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{rep.title}</h4>
                  <p className="text-xs text-slate-300">{rep.details}</p>
                </div>

                <button
                  onClick={() => adminResolveReport(rep.id)}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  إغلاق وحل البلاغ
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: Suggestions Hub */}
      {activeTab === 'suggestions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-white">متابعة ومكافأة اقتراحات اللاعبين:</h3>

          <div className="space-y-3">
            {suggestions.map(s => (
              <div key={s.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                      {s.category}
                    </span>
                    <span className="text-xs text-purple-400 font-bold">👍 {s.upvotes} صوت</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{s.title}</h4>
                  <p className="text-xs text-slate-300">{s.details}</p>
                </div>

                <div className="flex flex-col gap-1.5 text-end">
                  <select
                    value={s.status}
                    onChange={e => adminUpdateSuggestionStatus(s.id, e.target.value as any)}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="under_review">قيد المراجعة</option>
                    <option value="planned">مخطط للتنفيذ</option>
                    <option value="implemented">تم التطبيق ✅</option>
                    <option value="declined">مرفوض</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
