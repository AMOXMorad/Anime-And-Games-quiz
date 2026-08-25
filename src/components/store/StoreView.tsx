import React, { useState, useEffect } from 'react';
import { StoreItem, ItemType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { RarityBadge } from '../ui/RarityBadge';
import { ShoppingBag, Coins, Check, Sparkles, Crown, Shield, Eye } from 'lucide-react';

export const INITIAL_STORE_ITEMS: StoreItem[] = [
  // Frames
  {
    id: 'frame_default',
    type: 'frame',
    name_ar: 'إطار البداية',
    name_en: 'Initiate Frame',
    description_ar: 'الإطار الافتراضي لكل نينجا وجيمر في يوتوبيا',
    description_en: 'Default frame for every challenger in Utopia',
    price: 0,
    rarity: 'common',
    is_active: true
  },
  {
    id: 'frame_sharingan',
    type: 'frame',
    name_ar: 'إطار الشارينغان الناري',
    name_en: 'Flame Sharingan Frame',
    description_ar: 'إطار متوهج بنيران وعراقة عشيرة الأوتشيها',
    description_en: 'Blazing frame radiating the ancient power of the Sharingan',
    price: 300,
    rarity: 'epic',
    is_active: true
  },
  {
    id: 'frame_curse_flame',
    type: 'frame',
    name_ar: 'هالة عودة الموت البنفسجية',
    name_en: 'Re:Zero Witch Aura Frame',
    description_ar: 'هالة ساحرة ومظلمة تفيض بقوة غامضة من الساحرات',
    description_en: 'Dark bewitching aura filled with mysterious miasma',
    price: 350,
    rarity: 'epic',
    is_active: true
  },
  {
    id: 'frame_cyber_neon',
    type: 'frame',
    name_ar: 'إطار السايبربانك النيون',
    name_en: 'Cyber Neon Frame',
    description_ar: 'تصميم رقمي مستقبلي لعشاق ألعاب الخيال العلمي',
    description_en: 'Futuristic digital neon border for sci-fi enthusiasts',
    price: 250,
    rarity: 'rare',
    is_active: true
  },
  {
    id: 'frame_gold_royalty',
    type: 'frame',
    name_ar: 'الإطار الذهبي الملكي',
    name_en: 'Golden Sovereign Frame',
    description_ar: 'إطار ذهبي نقي مخصص لكبار المتصدرين',
    description_en: 'Pure gold frame forged for supreme champions',
    price: 500,
    rarity: 'legendary',
    is_active: true
  },
  {
    id: 'frame_chaos_vortex',
    type: 'frame',
    name_ar: 'إطار دوامة الفوضى الكونية',
    name_en: 'Chaos Cosmic Frame',
    description_ar: 'إطار كوني ناصع ينبض بطاقة الفوضى المطلقة',
    description_en: 'Cosmic pulsating border bursting with chaotic energy',
    price: 750,
    rarity: 'legendary',
    is_active: true
  },
  {
    id: 'frame_founder_exclusive',
    type: 'frame',
    name_ar: 'إطار مؤسس يوتوبيا',
    name_en: 'The Grand Founder Frame',
    description_ar: 'إطار فخم وحصري للأدمن والمؤسس',
    description_en: 'Exclusive leadership aura for the Founder and Admin',
    price: 9999,
    rarity: 'legendary',
    is_active: true
  },

  // Name Tags / Badges
  {
    id: 'tag_rookie',
    type: 'tag',
    name_ar: 'شارة المبتدئ',
    name_en: 'Rookie Tag',
    description_ar: 'شارة البداية لكل لاعب',
    description_en: 'Starting challenger badge',
    price: 0,
    rarity: 'common',
    asset_url: '🔰',
    is_active: true
  },
  {
    id: 'tag_shinobi_flame',
    type: 'tag',
    name_ar: 'لهب الشينوبي',
    name_en: 'Shinobi Flame',
    description_ar: 'تاج لهب النار لعشاق عالم النينجا',
    description_en: 'Fire flame tag for the ninja realm lovers',
    price: 150,
    rarity: 'rare',
    asset_url: '🔥',
    is_active: true
  },
  {
    id: 'tag_lightning_godspeed',
    type: 'tag',
    name_ar: 'صاعقة البرق',
    name_en: 'Thunder Lightning',
    description_ar: 'شارة السرعة الخاطفة',
    description_en: 'Godspeed thunder badge',
    price: 200,
    rarity: 'rare',
    asset_url: '⚡',
    is_active: true
  },
  {
    id: 'tag_rezero_apple',
    type: 'tag',
    name_ar: 'تفاحة الأببا',
    name_en: 'Appa of Lugnica',
    description_ar: 'رمز تجار العاصمة في ريزيرو',
    description_en: 'The iconic Appa fruit symbol from Lugnica',
    price: 180,
    rarity: 'rare',
    asset_url: '🍎',
    is_active: true
  },
  {
    id: 'tag_king_crown',
    type: 'tag',
    name_ar: 'تاج الملك الفاخر',
    name_en: 'Sovereign Crown',
    description_ar: 'تاج ذهبي ملكي يوضع بجانب الاسم',
    description_en: 'Royal golden crown placed beside your name',
    price: 400,
    rarity: 'epic',
    asset_url: '👑',
    is_active: true
  },
  {
    id: 'tag_cosmic_star',
    type: 'tag',
    name_ar: 'نجم الفوضى اللامع',
    name_en: 'Cosmic Chaos Star',
    description_ar: 'شارة الفوضى الكونية المشعة',
    description_en: 'Radiant cosmic star badge',
    price: 500,
    rarity: 'legendary',
    asset_url: '🌟',
    is_active: true
  },
  {
    id: 'tag_founder_trident',
    type: 'tag',
    name_ar: 'شارة المشرف العام',
    name_en: 'Founder Trident',
    description_ar: 'شارة التاج والصولجان الملكي للمؤسس',
    description_en: 'Founder insignia & royal trident',
    price: 9999,
    rarity: 'legendary',
    asset_url: '🔱',
    is_active: true
  },

  // Titles
  {
    id: 'title_novice',
    type: 'title',
    name_ar: 'متحدي يوتوبيا',
    name_en: 'Utopia Challenger',
    description_ar: 'اللقب الأولي لكل لاعب جديد',
    description_en: 'Initial title for every newcomer',
    price: 0,
    rarity: 'common',
    is_active: true
  },
  {
    id: 'title_ninja_leaf',
    type: 'title',
    name_ar: 'نينجا كونوها',
    name_en: 'Leaf Village Ninja',
    description_ar: 'أحد شينوبي قرية الورق المخفية',
    description_en: 'A proud shinobi of the Hidden Leaf',
    price: 100,
    rarity: 'common',
    is_active: true
  },
  {
    id: 'title_death_return',
    type: 'title',
    name_ar: 'العائد من الموت',
    name_en: 'Return by Death',
    description_ar: 'من يتحدى المصير مراراً وتكراراً',
    description_en: 'The one who defies fate again and again',
    price: 250,
    rarity: 'rare',
    is_active: true
  },
  {
    id: 'title_king_shinobi',
    type: 'title',
    name_ar: 'ملك الشينوبي الحقيقي',
    name_en: 'The True King of Shinobi',
    description_ar: 'سيد ومحترف عالم ناروتو بلا منازع',
    description_en: 'Undisputed master of the Naruto universe',
    price: 600,
    rarity: 'epic',
    is_active: true
  },
  {
    id: 'title_king_rezero',
    type: 'title',
    name_ar: 'ملك ريزيرو الحقيقي',
    name_en: 'The True King of Re:Zero',
    description_ar: 'سيد ومحترف عالم ريزيرو وكافة خفاياه',
    description_en: 'Undisputed master of the Re:Zero universe',
    price: 600,
    rarity: 'epic',
    is_active: true
  },
  {
    id: 'title_king_gaming',
    type: 'title',
    name_ar: 'ملك الجيمنج الحقيقي',
    name_en: 'The True King of Gaming',
    description_ar: 'بطل عوالم الألعاب التنافسية',
    description_en: 'Supreme champion of the gaming realms',
    price: 600,
    rarity: 'epic',
    is_active: true
  },
  {
    id: 'title_ultimate_universe',
    type: 'title',
    name_ar: 'سلطان العوالم الأعظم',
    name_en: 'The Ultimate King of the Universe',
    description_ar: 'اللقب الأسطوري الأعلى لمن يتقن عالم الفوضى الكوني',
    description_en: 'The highest mythical title for the master of Chaos Realm',
    price: 1200,
    rarity: 'legendary',
    is_active: true
  },
  {
    id: 'title_founder',
    type: 'title',
    name_ar: 'مؤسس يوتوبيا',
    name_en: 'The Grand Founder',
    description_ar: 'اللقب الحصري لمنشئ ومطور المنصة',
    description_en: 'Exclusive title for the Platform Founder & Admin',
    price: 9999,
    rarity: 'legendary',
    is_active: true
  }
];

export const StoreView: React.FC = () => {
  const { profile, inventory, buyItem, equipItem } = useAuth();
  const { lang, t } = useI18n();

  const [activeTab, setActiveTab] = useState<ItemType>('frame');
  const [storeItems, setStoreItems] = useState<StoreItem[]>(INITIAL_STORE_ITEMS);
  const [previewItem, setPreviewItem] = useState<StoreItem | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Load custom store items from localStorage if updated by Admin JSON upload
  useEffect(() => {
    const customItems = localStorage.getItem('ag_utopia_custom_store_items');
    if (customItems) {
      try {
        const parsed = JSON.parse(customItems);
        setStoreItems(parsed);
      } catch (e) {}
    }
  }, []);

  const filteredItems = storeItems.filter(item => item.type === activeTab && item.is_active);

  const handleBuy = (item: StoreItem) => {
    const res = buyItem(item);
    if (res.success) {
      setPurchaseMessage({ text: t('purchaseSuccess'), isError: false });
      // Auto equip
      equipItem(item.id, item.type);
    } else {
      setPurchaseMessage({ text: t('notEnoughCoins'), isError: true });
    }
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  const handleEquip = (item: StoreItem) => {
    equipItem(item.id, item.type);
  };

  // Compute preview active state
  const previewFrameId =
    previewItem?.type === 'frame' ? previewItem.id : profile?.active_frame_id || 'frame_default';
  const previewTag =
    previewItem?.type === 'tag'
      ? previewItem.asset_url
      : storeItems.find(i => i.id === profile?.active_tag_id)?.asset_url || '🔰';
  const previewTitle =
    previewItem?.type === 'title'
      ? lang === 'ar' ? previewItem.name_ar : previewItem.name_en
      : storeItems.find(i => i.id === profile?.active_title_id)?.[lang === 'ar' ? 'name_ar' : 'name_en'] || t('title_novice');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Header Banner & Live Avatar Fitting Room */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Title & Tagline */}
          <div className="text-center md:text-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/40 text-purple-300 font-bold text-xs mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('storeTitle')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
              تخصيص الهوية والمقتنيات الملكية
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {t('storeSubtitle')}
            </p>
          </div>

          {/* Live Fitting Room (Avatar Preview) */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
            <AvatarWithFrame frameId={previewFrameId} size="xl" />
            <div className="text-start">
              <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                <span>{profile?.username}</span>
                <span className="text-base">{previewTag}</span>
              </div>
              <div className="text-xs text-purple-400 font-semibold mb-1">
                {previewTitle}
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-cyan-400" />
                معاينة مباشرة للتجهيز
              </span>
            </div>
          </div>

        </div>

        {purchaseMessage && (
          <div className={`mt-4 p-3 rounded-xl text-center text-xs font-bold ${
            purchaseMessage.isError ? 'bg-rose-950 border border-rose-500 text-rose-300' : 'bg-emerald-950 border border-emerald-500 text-emerald-300'
          }`}>
            {purchaseMessage.text}
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <button
          onClick={() => { setActiveTab('frame'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'frame'
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{t('frames')}</span>
        </button>

        <button
          onClick={() => { setActiveTab('tag'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'tag'
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>{t('tags')}</span>
        </button>

        <button
          onClick={() => { setActiveTab('title'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'title'
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('titles')}</span>
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredItems.map(item => {
          const isOwned = inventory.includes(item.id);
          const isEquipped =
            item.type === 'frame'
              ? profile?.active_frame_id === item.id
              : item.type === 'tag'
              ? profile?.active_tag_id === item.id
              : profile?.active_title_id === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setPreviewItem(item)}
              onMouseLeave={() => setPreviewItem(null)}
              className="bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                {/* Card Top: Rarity & Tag */}
                <div className="flex items-center justify-between mb-3">
                  <RarityBadge rarity={item.rarity} />
                  {item.asset_url && item.type === 'tag' && (
                    <span className="text-2xl">{item.asset_url}</span>
                  )}
                </div>

                {/* Frame Preview / Name */}
                {item.type === 'frame' && (
                  <div className="py-4 flex justify-center">
                    <AvatarWithFrame frameId={item.id} size="lg" />
                  </div>
                )}

                <h3 className="font-bold text-base text-white mb-1 group-hover:text-purple-300 transition-colors">
                  {lang === 'ar' ? item.name_ar : item.name_en}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                  {lang === 'ar' ? item.description_ar : item.description_en}
                </p>
              </div>

              {/* Card Bottom: Price & Button */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 font-black text-amber-400 text-sm">
                  {item.price === 0 ? (
                    <span className="text-emerald-400 font-bold text-xs">مجاني</span>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>{item.price}</span>
                    </>
                  )}
                </div>

                {isEquipped ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
                    <Check className="w-3.5 h-3.5" />
                    {t('equipped')}
                  </span>
                ) : isOwned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-white font-bold text-xs transition-all shadow-md"
                  >
                    {t('equip')}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('buyNow')}</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
