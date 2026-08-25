import React, { useState, useEffect } from 'react';
import { StoreItem, ItemType } from '../../types';
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
    unlock_type: 'level',
    required_level: 50,
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
    unlock_type: 'gift',
    is_active: true
  }
];

export const StoreView: React.FC = () => {
  const { profile, inventory, buyItem, equipItem, redeemPromoCode } = useAuth();
  const { lang, t } = useI18n();

  const [activeTab, setActiveTab] = useState<ItemType>('avatar');
  const [avatarFilter, setAvatarFilter] = useState<'all' | 'naruto' | 'rezero'>('all');
  
  // Load initial + custom store items
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => {
    try {
      const custom: StoreItem[] = JSON.parse(localStorage.getItem('ag_utopia_custom_store_items') || '[]');
      if (custom.length > 0) {
        // Merge initial with custom
        const existingIds = new Set(INITIAL_STORE_ITEMS.map(i => i.id));
        const newCustom = custom.filter(i => !existingIds.has(i.id));
        return [...INITIAL_STORE_ITEMS, ...newCustom];
      }
      return INITIAL_STORE_ITEMS;
    } catch (e) {
      return INITIAL_STORE_ITEMS;
    }
  });

  const [previewItem, setPreviewItem] = useState<StoreItem | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoFeedback, setPromoFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const filteredItems = storeItems.filter(item => {
    if (item.type !== activeTab || !item.is_active) return false;
    if (activeTab === 'avatar' && avatarFilter !== 'all') {
      return item.avatar_category === avatarFilter;
    }
    return true;
  });

  const handleBuy = (item: StoreItem) => {
    const res = buyItem(item);
    if (res.success) {
      setPurchaseMessage({ text: res.message, isError: false });
      equipItem(item.id, item.type, item.asset_url);
    } else {
      setPurchaseMessage({ text: res.message, isError: true });
    }
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  const handleEquip = (item: StoreItem) => {
    equipItem(item.id, item.type, item.asset_url);
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    const res = redeemPromoCode(promoCodeInput, storeItems);
    setPromoFeedback({ text: res.message, isError: !res.success });
    if (res.success && res.item) {
      equipItem(res.item.id, res.item.type, res.item.asset_url);
      setPromoCodeInput('');
    }
    setTimeout(() => setPromoFeedback(null), 4000);
  };

  const previewAvatarUrl =
    previewItem?.type === 'avatar' ? previewItem.asset_url : profile?.avatar_url;
  const previewFrameId =
    previewItem?.type === 'frame' ? previewItem.id : profile?.active_frame_id || 'frame_default';
  const previewTag =
    previewItem?.type === 'tag'
      ? previewItem.asset_url
      : storeItems.find(i => i.id === profile?.active_tag_id)?.asset_url || '🔰';
  const previewTitle =
    previewItem?.type === 'title'
      ? lang === 'ar' ? previewItem.name_ar : previewItem.name_en
      : storeItems.find(i => i.id === profile?.active_title_id)?.[lang === 'ar' ? 'name_ar' : 'name_en'] || 'متحدي يوتوبيا';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Header Banner & Live Avatar Fitting Room */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Title & Tagline */}
          <div className="text-center md:text-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/40 text-purple-300 font-bold text-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('storeTitle')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
              متجر يوتوبيا الملكي والأفاتارات الحصرية
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              تصفح واقتنِ صور الشخصيات الأصلية بدقة فائقة مع إطارات متوهجة وتيجان الملوك
            </p>
          </div>

          {/* Live Fitting Room (Avatar Preview) */}
          <div className="bg-slate-950/90 border border-purple-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(147,51,234,0.25)]">
            <AvatarWithFrame 
              avatarUrl={previewAvatarUrl} 
              frameId={previewFrameId} 
              size="xl" 
            />
            <div className="text-start">
              <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                <span>{profile?.username}</span>
                <span className="text-base">{previewTag}</span>
              </div>
              <div className="text-xs text-purple-400 font-semibold mb-1">
                {previewTitle}
              </div>
              <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-bold">
                <Eye className="w-3 h-3" />
                معاينة مباشرة للتجهيز
              </span>
            </div>
          </div>

        </div>

        {/* Promo Code Redemption Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 text-center sm:text-start">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>هل تملك كود ترويجي خاص من المشرف؟ استرده هنا:</span>
          </div>

          <form onSubmit={handleRedeemCode} className="flex w-full sm:w-auto gap-2">
            <input
              type="text"
              value={promoCodeInput}
              onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
              placeholder="أدخل الكود (e.g. UTOPIA2026)"
              className="py-1.5 px-3 bg-slate-950 border border-purple-500/40 rounded-xl text-xs font-black text-amber-400 uppercase tracking-wider focus:outline-none focus:border-amber-400 w-full sm:w-48"
            />
            <button
              type="submit"
              disabled={!promoCodeInput.trim()}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
            >
              <span>استرداد</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {promoFeedback && (
          <div className={`mt-3 p-2.5 rounded-xl text-center text-xs font-bold ${
            promoFeedback.isError ? 'bg-rose-950 border border-rose-500 text-rose-300' : 'bg-emerald-950 border border-emerald-500 text-emerald-300'
          }`}>
            {promoFeedback.text}
          </div>
        )}

        {purchaseMessage && (
          <div className={`mt-4 p-3 rounded-xl text-center text-xs font-bold ${
            purchaseMessage.isError ? 'bg-rose-950 border border-rose-500 text-rose-300' : 'bg-emerald-950 border border-emerald-500 text-emerald-300'
          }`}>
            {purchaseMessage.text}
          </div>
        )}
      </div>

      {/* Main Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <button
          onClick={() => { setActiveTab('avatar'); sounds.playClick(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'avatar'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.4)] ring-2 ring-pink-400'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <User className="w-4 h-4 text-pink-300" />
          <span>صور الشخصيات الأصلية (Characters)</span>
          <span className="text-[9px] bg-pink-500/30 text-pink-300 px-1.5 py-0.5 rounded-full font-black">HD</span>
        </button>

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

      {/* Sub-Filters for Character Avatars */}
      {activeTab === 'avatar' && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 animate-fadeIn">
          <span className="text-xs text-slate-400 font-bold me-1">فرز العالم:</span>
          
          {[
            { id: 'all', label: 'الكل (All Characters)' },
            { id: 'naruto', label: '🍥 ناروتو شيبودن' },
            { id: 'rezero', label: '🍎 ريزيرو (Re:Zero)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setAvatarFilter(f.id as any); sounds.playClick(); }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                avatarFilter === f.id
                  ? 'bg-slate-800 text-purple-300 border border-purple-500 shadow-sm'
                  : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

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

          const isLevelLocked = item.unlock_type === 'level' && item.required_level && (profile?.level || 1) < item.required_level;
          const isCodeOnly = item.unlock_type === 'code';
          const isGiftOnly = item.unlock_type === 'gift';

          return (
            <div
              key={item.id}
              onMouseEnter={() => setPreviewItem(item)}
              onMouseLeave={() => setPreviewItem(null)}
              className={`bg-slate-900 border ${
                isLevelLocked ? 'border-slate-800/60 opacity-80' : 'border-slate-800 hover:border-purple-500/60'
              } rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
            >
              <div>
                {/* Card Top: Rarity & Unlock Condition Badge */}
                <div className="flex items-center justify-between mb-3">
                  <RarityBadge rarity={item.rarity} />
                  
                  {isLevelLocked ? (
                    <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Lv. {item.required_level}
                    </span>
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
                  ) : item.type === 'avatar' ? (
                    <span className="text-[10px] font-bold text-pink-400 bg-pink-950/60 border border-pink-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Anime Portrait
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
                  {isCodeOnly || isGiftOnly ? (
                    <span className="text-amber-400 font-bold text-xs">حصري</span>
                  ) : item.price === 0 ? (
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
                ) : isLevelLocked ? (
                  <span className="text-[10px] text-cyan-400 font-black bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1 rounded-xl">
                    مقفول (Lv. {item.required_level})
                  </span>
                ) : isCodeOnly ? (
                  <span className="text-[10px] text-amber-400 font-black bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-xl">
                    استرداد بكود
                  </span>
                ) : isGiftOnly ? (
                  <span className="text-[10px] text-rose-400 font-black bg-rose-950/80 border border-rose-500/40 px-2.5 py-1 rounded-xl">
                    هدية مؤسس
                  </span>
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
