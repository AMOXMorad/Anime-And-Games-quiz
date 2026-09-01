import React, { useState, useEffect } from 'react';
import { StoreItem, ItemType, WorldCategory, WORLD_CATEGORIES } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { RarityBadge } from '../ui/RarityBadge';
import { 
  ShoppingBag, 
  Coins, 
  Check, 
  Sparkles, 
  Crown, 
  Shield, 
  Eye, 
  User, 
  KeyRound, 
  Lock, 
  Gift,
  ArrowRight
} from 'lucide-react';

export const INITIAL_STORE_ITEMS: StoreItem[] = [
  // ==========================================
  // 1. OFFICIAL CHARACTER AVATARS (صور شخصيات الأنمي الرسمية)
  // ==========================================
  {
    id: 'avatar_default',
    type: 'avatar',
    name_ar: 'ناروتو أوزوماكي (Naruto Uzumaki)',
    name_en: 'Naruto Uzumaki Avatar',
    description_ar: 'الصورة الرسمية لبطل الشينوبي وجينشوريكي الكيوبي ناروتو أوزوماكي',
    description_en: 'Official portrait of the Hero of the Leaf, Naruto Uzumaki',
    price: 0,
    rarity: 'common',
    avatar_category: 'naruto',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png',
    is_active: true
  },
  {
    id: 'avatar_naruto_sage',
    type: 'avatar',
    name_ar: 'ناروتو - نمط الناسك (Sage Naruto)',
    name_en: 'Sage Naruto Avatar',
    description_ar: 'بورتريه ناروتو في نمط ناسك الضفادع مع عيون الضفدع الذهبية',
    description_en: 'Official portrait of Sage Mode Naruto Uzumaki',
    price: 250,
    rarity: 'epic',
    avatar_category: 'naruto',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png',
    is_active: true
  },
  {
    id: 'avatar_itachi_crow',
    type: 'avatar',
    name_ar: 'إيتاتشي أوتشيها (Itachi Uchiha)',
    name_en: 'Itachi Uchiha Avatar',
    description_ar: 'الصورة الرسمية لعبقري الأوتشيها وعضو الأكاتسكي الأسطوري إيتاتشي',
    description_en: 'Official portrait of Itachi Uchiha with Sharingan eyes',
    price: 350,
    rarity: 'legendary',
    avatar_category: 'naruto',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b14-9Kb1E5oel1ke.png',
    is_active: true
  },
  {
    id: 'avatar_sasuke_lightning',
    type: 'avatar',
    name_ar: 'ساسكي أوتشيها (Sasuke Uchiha)',
    name_en: 'Sasuke Uchiha Avatar',
    description_ar: 'الصورة الرسمية لساسكي شينوبي الظلال والمانغيكيو شارينغان',
    description_en: 'Official portrait of Sasuke Uchiha',
    price: 300,
    rarity: 'epic',
    avatar_category: 'naruto',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b13-SISLEw1oAD7a.png',
    is_active: true
  },
  {
    id: 'avatar_madara_void',
    type: 'avatar',
    name_ar: 'مادارا أوتشيها (Madara Uchiha)',
    name_en: 'Madara Uchiha Avatar',
    description_ar: 'الصورة الرسمية لأسطورة الحرب وقائد ومؤسس الأوتشيها مادارا',
    description_en: 'Official portrait of the legendary Madara Uchiha',
    price: 450,
    rarity: 'legendary',
    avatar_category: 'naruto',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b53901-HnRKSoHMG5Vg.png',
    is_active: true
  },
  {
    id: 'avatar_kakashi_shadow',
    type: 'avatar',
    name_ar: 'كاكاشي هاتاكي (Kakashi Hatake)',
    name_en: 'Kakashi Hatake Avatar',
    description_ar: 'الصورة الرسمية للنينجا الناسخ والهوكاجي السادس كاكاشي',
    description_en: 'Official portrait of the Copy Ninja Kakashi Hatake',
    price: 280,
    rarity: 'epic',
    avatar_category: 'naruto',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b85-mkVBh2yjxjmx.png',
    is_active: true
  },
  {
    id: 'avatar_minato',
    type: 'avatar',
    name_ar: 'ميناتو ناميكازي (Minato Namikaze)',
    name_en: 'Minato Namikaze Avatar',
    description_ar: 'الصورة الرسمية للوميض الأصفر والهوكاجي الرابع ميناتو',
    description_en: 'Official portrait of the Yellow Flash Minato Namikaze',
    price: 380,
    rarity: 'legendary',
    avatar_category: 'naruto',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b2535-Xq9WKNPJQEt3.png',
    is_active: true
  },
  {
    id: 'avatar_jiraiya',
    type: 'avatar',
    name_ar: 'جيرايا الناسك (Jiraiya Toad Sage)',
    name_en: 'Jiraiya Toad Sage Avatar',
    description_ar: 'الصورة الرسمية للناسك الأسطوري ومعلم الهوكاجي جيرايا بشعره الأبيض',
    description_en: 'Official portrait of the Legendary Sannin Jiraiya',
    price: 300,
    rarity: 'epic',
    avatar_category: 'naruto',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b2423-RO5MyoXSA9OL.png',
    is_active: true
  },
  {
    id: 'avatar_gaara',
    type: 'avatar',
    name_ar: 'غارا كازيكاجي الرمال (Gaara)',
    name_en: 'Gaara Sand Kazekage Avatar',
    description_ar: 'الصورة الرسمية للكازيكاجي الخامس وسيد رمال قرية الرمل غارا',
    description_en: 'Official portrait of the Fifth Kazekage Gaara',
    price: 260,
    rarity: 'rare',
    avatar_category: 'naruto',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b1662-4E5J0LX9jZKZ.png',
    is_active: true
  },
  {
    id: 'avatar_subaru_void',
    type: 'avatar',
    name_ar: 'ناتسوكي سوبارو (Subaru Natsuki)',
    name_en: 'Subaru Natsuki Avatar',
    description_ar: 'الصورة الرسمية لفارس إيميليا والعائد من الموت ناتسوكي سوبارو',
    description_en: 'Official portrait of Subaru Natsuki from Re:Zero',
    price: 250,
    rarity: 'rare',
    avatar_category: 'rezero',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b88573-F8yMTK9GhnTA.png',
    is_active: true
  },
  {
    id: 'avatar_emilia_frost',
    type: 'avatar',
    name_ar: 'إيميليا (Emilia Silver Princess)',
    name_en: 'Emilia Silver Princess Avatar',
    description_ar: 'الصورة الرسمية لنصف الإلف الفضية ومرشحة العرش إيميليا',
    description_en: 'Official portrait of the Silver Half-Elf Emilia',
    price: 320,
    rarity: 'epic',
    avatar_category: 'rezero',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b88572-IzTwXEHSobRs.jpg',
    is_active: true
  },
  {
    id: 'avatar_rem_demon',
    type: 'avatar',
    name_ar: 'ريم الخادمة (Rem Maid & Oni)',
    name_en: 'Rem Maid & Oni Avatar',
    description_ar: 'الصورة الرسمية لخادمة قصر روزوال ومحاربة الأوني ريم',
    description_en: 'Official portrait of Rem from Re:Zero',
    price: 380,
    rarity: 'legendary',
    avatar_category: 'rezero',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b88575-Ayu8UPDA8NS6.png',
    is_active: true
  },
  {
    id: 'avatar_ram',
    type: 'avatar',
    name_ar: 'رام التوأم الوردي (Ram)',
    name_en: 'Ram Twin Maid Avatar',
    description_ar: 'الصورة الرسمية لخادمة قصر روزوال الكبرى وأخت ريم التوأم',
    description_en: 'Official portrait of Ram from Re:Zero',
    price: 280,
    rarity: 'epic',
    avatar_category: 'rezero',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b88576-NWkotUiJ3mK3.png',
    is_active: true
  },
  {
    id: 'avatar_echidna_tea',
    type: 'avatar',
    name_ar: 'إيكيدنا ساحرة الجشع (Echidna)',
    name_en: 'Echidna Witch of Greed Avatar',
    description_ar: 'الصورة الرسمية لساحرة الجشع وصاحبة قلعة الأحلام إيكيدنا',
    description_en: 'Official portrait of Echidna the Witch of Greed',
    price: 350,
    rarity: 'epic',
    avatar_category: 'rezero',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b129330-ZUtYw4n7N0uH.png',
    is_active: true
  },
  {
    id: 'avatar_beatrice',
    type: 'avatar',
    name_ar: 'بياتريس حارسة المكتبة (Beatrice)',
    name_en: 'Beatrice Great Spirit Avatar',
    description_ar: 'الصورة الرسمية للروح العظمى بياتريس حارسة المكتبة المحرمة',
    description_en: 'Official portrait of Great Spirit Beatrice',
    price: 320,
    rarity: 'epic',
    avatar_category: 'rezero',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b90181-wRPm0OEaucmw.png',
    is_active: true
  },
  {
    id: 'avatar_reinhard',
    type: 'avatar',
    name_ar: 'راينهارد قديس السيف (Reinhard)',
    name_en: 'Reinhard Sword Saint Avatar',
    description_ar: 'الصورة الرسمية لقديس السيف وفارس الفرسان الأقوى راينهارد',
    description_en: 'Official portrait of Sword Saint Reinhard van Astrea',
    price: 400,
    rarity: 'legendary',
    avatar_category: 'rezero',
    asset_url: 'https://s4.anilist.co/file/anilistcdn/character/large/b88577-oKKnibqGgSSD.png',
    is_active: true
  },

  // ==========================================
  // 2. FRAMES (إطارات البروفايل)
  // ==========================================
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
    unlock_type: 'level',
    required_level: 10,
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
    unlock_type: 'level',
    required_level: 25,
    is_active: true
  },
  {
    id: 'frame_founder_exclusive',
    type: 'frame',
    name_ar: 'إطار مؤسس يوتوبيا',
    name_en: 'The Grand Founder Frame',
    description_ar: 'إطار فخم وحصري للأدمن والمؤسس',
    description_en: 'Exclusive leadership aura for the Founder and Admin',
    price: 0,
    rarity: 'legendary',
    unlock_type: 'gift',
    is_active: true
  },

  // ==========================================
  // 3. NAME TAGS / BADGES (التيجان والشارات)
  // ==========================================
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
    unlock_type: 'level',
    required_level: 15,
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
    unlock_type: 'level',
    required_level: 30,
    is_active: true
  },
  {
    id: 'tag_founder_trident',
    type: 'tag',
    name_ar: 'شارة المشرف العام',
    name_en: 'Founder Trident',
    description_ar: 'شارة التاج والصولجان الملكي للمؤسس',
    description_en: 'Founder insignia & royal trident',
    price: 0,
    rarity: 'legendary',
    asset_url: '🔱',
    unlock_type: 'gift',
    is_active: true
  },

  // ==========================================
  // 4. TITLES (الألقاب التنافسية)
  // ==========================================
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
    world_category: 'naruto',
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
    world_category: 'rezero',
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
    world_category: 'naruto',
    unlock_type: 'level',
    required_level: 20,
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
    world_category: 'rezero',
    unlock_type: 'level',
    required_level: 20,
    is_active: true
  },
  {
    id: 'title_founder',
    type: 'title',
    name_ar: 'مؤسس يوتوبيا',
    name_en: 'The Grand Founder',
    description_ar: 'اللقب الحصري لمنشئ ومطور المنصة',
    description_en: 'Exclusive title for the Platform Founder & Admin',
    price: 0,
    rarity: 'legendary',
    world_category: 'general',
    unlock_type: 'gift',
    is_active: true
  }
];

export const getActiveStoreItems = (): StoreItem[] => {
  try {
    const deletedIds = new Set<string>(JSON.parse(localStorage.getItem('ag_utopia_deleted_item_ids') || '[]'));
    const saved = localStorage.getItem('ag_utopia_custom_store_items');
    if (saved) {
      const parsed: StoreItem[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(item => !deletedIds.has(item.id));
      }
    }
    return INITIAL_STORE_ITEMS.filter(item => !deletedIds.has(item.id));
  } catch (e) {
    return INITIAL_STORE_ITEMS;
  }
};

export const StoreView: React.FC = () => {
  const { profile, inventory, buyItem, equipItem, redeemPromoCode } = useAuth();
  const { lang, t } = useI18n();

  const [activeTab, setActiveTab] = useState<ItemType>('avatar');
  const [worldFilter, setWorldFilter] = useState<WorldCategory>('all');
  
  // Load initial + custom store items
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => getActiveStoreItems());

  // Listen for real-time store updates from AdminPanel
  useEffect(() => {
    const syncStore = () => {
      setStoreItems(getActiveStoreItems());
    };
    syncStore();
    window.addEventListener('ag_store_updated', syncStore);
    window.addEventListener('storage', syncStore);
    return () => {
      window.removeEventListener('ag_store_updated', syncStore);
      window.removeEventListener('storage', syncStore);
    };
  }, []);

  const [previewItem, setPreviewItem] = useState<StoreItem | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoFeedback, setPromoFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const filteredItems = storeItems.filter(item => {
    if (item.type !== activeTab || !item.is_active) return false;
    if (worldFilter === 'all') return true;
    const itemWorld = item.world_category || item.avatar_category || 'general';
    return itemWorld === worldFilter;
  });

  const handleBuy = (item: StoreItem) => {
    const res = buyItem(item);
    setPurchaseMessage({ text: res.message, isError: !res.success });
    setTimeout(() => setPurchaseMessage(null), 3500);
  };

  const handleEquip = (item: StoreItem) => {
    equipItem(item.id, item.type, item.asset_url);
  };

  const handleRedeemPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    const res = redeemPromoCode(promoCodeInput, storeItems);
    setPromoFeedback({ text: res.message, isError: !res.success });
    if (res.success) {
      setPromoCodeInput('');
    }
    setTimeout(() => setPromoFeedback(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Fitting Room Interactive Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/60 via-slate-900/90 to-indigo-900/60 border border-purple-500/30 p-6 sm:p-8 mb-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <AvatarWithFrame
                avatarUrl={
                  previewItem?.type === 'avatar' 
                    ? previewItem.asset_url || profile?.avatar_url || 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png'
                    : profile?.avatar_url || 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png'
                }
                frameId={previewItem?.type === 'frame' ? previewItem.id : (profile?.active_frame_id || 'frame_default')}
                frameAssetUrl={previewItem?.type === 'frame' ? previewItem.asset_url : undefined}
                frameConfig={previewItem?.type === 'frame' ? previewItem.frame_config : undefined}
                size="xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  غرفة القياس والتجربة المباشرة
                </span>
                {previewItem && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    معاينة: {lang === 'ar' ? previewItem.name_ar : previewItem.name_en}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                {t('storeTitle')}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md">
                {t('storeSubtitle')}
              </p>
            </div>
          </div>

          {/* User Coins & Promo Code Input */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-inner w-full sm:w-auto justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-amber-400 animate-bounce" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{t('coins')}</div>
                  <div className="text-xl font-black text-amber-400">{profile?.coins ?? 0}</div>
                </div>
              </div>
            </div>

            {/* Quick Promo Box */}
            <form onSubmit={handleRedeemPromo} className="flex items-center gap-1.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <KeyRound className="w-4 h-4 text-amber-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="أدخل الكود (e.g. UTOPIA2026)"
                  className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 uppercase font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={!promoCodeInput.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-slate-950 font-black text-xs transition-all shadow-md flex-shrink-0"
              >
                استرداد
              </button>
            </form>
          </div>
        </div>

        {/* Promo Feedback Toast */}
        {promoFeedback && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-bold text-center border animate-fadeIn ${
            promoFeedback.isError 
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-300' 
              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
          }`}>
            {promoFeedback.text}
          </div>
        )}

        {/* Purchase Feedback Toast */}
        {purchaseMessage && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-bold text-center border animate-fadeIn ${
            purchaseMessage.isError 
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-300' 
              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
          }`}>
            {purchaseMessage.text}
          </div>
        )}
      </div>

      {/* Store Navigation Tabs */}
      <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => { setActiveTab('avatar'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'avatar'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/40'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t('avatars')}</span>
        </button>

        <button
          onClick={() => { setActiveTab('frame'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'frame'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/40'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{t('frames')}</span>
        </button>

        <button
          onClick={() => { setActiveTab('tag'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'tag'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/40'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>{t('tags')}</span>
        </button>

        <button
          onClick={() => { setActiveTab('title'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all ${
            activeTab === 'title'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/40'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('titles')}</span>
        </button>
      </div>

      {/* Universal World Category Filter */}
      <div className="mb-6 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>فرز بحسب عالم الأنمي والألعاب (Universe / World Category):</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {WORLD_CATEGORIES.map(w => {
            const isSelected = worldFilter === w.id;
            return (
              <button
                key={w.id}
                onClick={() => { setWorldFilter(w.id); sounds.playClick(); }}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md ring-1 ring-purple-300'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{w.icon}</span>
                <span>{lang === 'ar' ? w.name_ar : w.name_en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredItems.map(item => {
          const isOwned = inventory.includes(item.id);
          const isEquipped =
            item.type === 'avatar'
              ? profile?.active_avatar_id === item.id
              : item.type === 'frame'
              ? profile?.active_frame_id === item.id
              : item.type === 'tag'
              ? profile?.active_tag_id === item.id
              : profile?.active_title_id === item.id;

          const userLevel = profile?.level || 1;
          const isLevelItem = item.unlock_type === 'level' && !!item.required_level;
          const isLevelEligible = isLevelItem && userLevel >= (item.required_level || 0);
          const isLevelEarly = isLevelItem && userLevel < (item.required_level || 0);
          const isCodeOnly = item.unlock_type === 'code';
          const isGiftOnly = item.unlock_type === 'gift';

          const itemWorld = item.world_category || item.avatar_category || 'general';
          const worldMeta = WORLD_CATEGORIES.find(w => w.id === itemWorld);

          return (
            <div
              key={item.id}
              onMouseEnter={() => setPreviewItem(item)}
              onMouseLeave={() => setPreviewItem(null)}
              className="bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                {/* Card Top: Rarity, World Badge & Unlock Condition */}
                <div className="flex items-center justify-between mb-3 gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <RarityBadge rarity={item.rarity} />
                    {worldMeta && worldMeta.id !== 'all' && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${worldMeta.badge_color}`}>
                        <span>{worldMeta.icon}</span>
                        <span>{lang === 'ar' ? worldMeta.name_ar.split(' ')[0] : worldMeta.name_en.split(' ')[0]}</span>
                      </span>
                    )}
                  </div>
                  
                  {isLevelItem ? (
                    isLevelEligible ? (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        مجاني Lv.{item.required_level}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3 text-cyan-400" />
                        مجاني عند Lv.{item.required_level}
                      </span>
                    )
                  ) : isCodeOnly ? (
                    <span className="text-[10px] font-black text-amber-400 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <KeyRound className="w-3 h-3" />
                      كود ترويجي
                    </span>
                  ) : isGiftOnly ? (
                    <span className="text-[10px] font-black text-rose-400 bg-rose-950/70 border border-rose-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      هدية مؤسس
                    </span>
                  ) : item.asset_url && item.type === 'tag' ? (
                    <span className="text-2xl">{item.asset_url}</span>
                  ) : null}
                </div>

                {/* Avatar Preview */}
                {item.type === 'avatar' && (
                  <div className="py-2 flex justify-center mb-2">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform duration-300 bg-slate-950">
                      <img 
                        src={item.asset_url} 
                        alt={item.name_ar} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Frame Preview */}
                {item.type === 'frame' && (
                  <div className="py-4 flex justify-center">
                    <AvatarWithFrame 
                      avatarUrl={profile?.avatar_url || 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png'} 
                      frameId={item.id} 
                      frameAssetUrl={item.asset_url} 
                      frameConfig={item.frame_config}
                      size="lg" 
                    />
                  </div>
                )}

                <h3 className="font-bold text-base text-white mb-1 group-hover:text-purple-300 transition-colors">
                  {lang === 'ar' ? item.name_ar : item.name_en}
                </h3>

                {/* Level Free Unlock Notice Banner Above Description */}
                {isLevelItem && (
                  <div className="mb-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    {isLevelEligible ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>✨ مؤهل للاستلام مجاناً! (مستواك Lv.{userLevel} ≥ {item.required_level})</span>
                      </div>
                    ) : (
                      <div className="text-cyan-300">
                        <div className="font-bold flex items-center gap-1 text-[11px]">
                          <Lock className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span>يفتح مجاناً عند المستوى {item.required_level}</span>
                        </div>
                        <div className="text-[10px] text-amber-300/90 mt-0.5 font-medium">
                          ⚡ أو يمكنك الشراء المبكر الآن بـ {item.price} عملة
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                  {lang === 'ar' ? item.description_ar : item.description_en}
                </p>
              </div>

              {/* Card Bottom: Price & Button */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 font-black text-sm">
                  {isCodeOnly || isGiftOnly ? (
                    <span className="text-amber-400 font-bold text-xs">حصري</span>
                  ) : isLevelEligible ? (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      مجاني (Lv.{item.required_level})
                    </span>
                  ) : item.price === 0 ? (
                    <span className="text-emerald-400 font-bold text-xs">مجاني</span>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>{item.price}</span>
                    </div>
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
                ) : isCodeOnly ? (
                  <span className="text-[10px] text-amber-400 font-black bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-xl">
                    استرداد بكود
                  </span>
                ) : isGiftOnly ? (
                  <span className="text-[10px] text-rose-400 font-black bg-rose-950/80 border border-rose-500/40 px-2.5 py-1 rounded-xl">
                    هدية مؤسس
                  </span>
                ) : isLevelEligible ? (
                  <button
                    onClick={() => handleBuy(item)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 animate-pulse"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>استلام مجاني</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isLevelEarly ? 'شراء مبكر' : (lang === 'ar' ? 'شراء' : 'Buy')}</span>
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
