import React, { useState, useEffect } from 'react';
import { useAuth, INITIAL_PROMO_CODES } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { StoreItem, Profile, UnlockType, PromoCode, PromoExpiryType, ItemRarity, WorldCategory, WORLD_CATEGORIES } from '../../types';
import { INITIAL_STORE_ITEMS, getActiveStoreItems } from '../store/StoreView';
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
  AlertCircle,
  Link,
  UploadCloud,
  FileImage,
  X,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminPanel: React.FC = () => {
  const { 
    profile, 
    updateCoins, 
    deleteUserFromDatabase, 
    adminRemoveItemFromUser, 
    adminAddItemToUser, 
    adminGetUserInventory 
  } = useAuth();
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
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => getActiveStoreItems());

  // User Profile & Inventory Inspector Modal State
  const [inspectingUser, setInspectingUser] = useState<Profile | null>(null);
  const [inspectInvFilter, setInspectInvFilter] = useState<'all' | 'avatar' | 'frame' | 'tag' | 'title'>('all');
  const [inspectFeedback, setInspectFeedback] = useState<string | null>(null);
  const [itemToGrantId, setItemToGrantId] = useState<string>('');

  // Promo codes list state
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('ag_utopia_promo_codes');
      return saved ? JSON.parse(saved) : INITIAL_PROMO_CODES;
    } catch (e) {
      return INITIAL_PROMO_CODES;
    }
  });

  // Real Registered players list from database
  const [usersList, setUsersList] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem('ag_utopia_registered_users');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // In-Browser Item Creator Form State
  const [newItemType, setNewItemType] = useState<'avatar' | 'frame' | 'tag' | 'title'>('avatar');
  const [newItemNameAr, setNewItemNameAr] = useState('');
  const [newItemNameEn, setNewItemNameEn] = useState('');
  const [newItemDescAr, setNewItemDescAr] = useState('');
  const [newItemDescEn, setNewItemDescEn] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(300);
  const [newItemRarity, setNewItemRarity] = useState<'common' | 'rare' | 'epic' | 'legendary'>('epic');
  const [newItemAsset, setNewItemAsset] = useState('');
  const [imageSourceMode, setImageSourceMode] = useState<'upload' | 'url'>('upload');
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [newItemWorldCat, setNewItemWorldCat] = useState<WorldCategory>('general');
  const [managerWorldFilter, setManagerWorldFilter] = useState<WorldCategory>('all');
  const [newItemUnlockType, setNewItemUnlockType] = useState<UnlockType>('store');
  const [newItemReqLevel, setNewItemReqLevel] = useState<number>(10);
  const [newItemRedeemCode, setNewItemRedeemCode] = useState<string>('UTOPIA2026');
  const [createdFeedback, setCreatedFeedback] = useState<string | null>(null);

  // Frame Adjustment Tool State (Scaling, inner avatar fit, offsets)
  const [frameScale, setFrameScale] = useState<number>(1.35);
  const [avatarScale, setAvatarScale] = useState<number>(0.85);
  const [frameOffsetX, setFrameOffsetX] = useState<number>(0);
  const [frameOffsetY, setFrameOffsetY] = useState<number>(0);

  // Full Edit Modal State
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [editNameAr, setEditNameAr] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editDescAr, setEditDescAr] = useState('');
  const [editDescEn, setEditDescEn] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editRarity, setEditRarity] = useState<ItemRarity>('common');
  const [editWorldCat, setEditWorldCat] = useState<WorldCategory>('general');
  const [editAsset, setEditAsset] = useState('');
  const [editImageMode, setEditImageMode] = useState<'upload' | 'url'>('url');
  const [editLocalFile, setEditLocalFile] = useState<string | null>(null);
  const [editUnlockType, setEditUnlockType] = useState<UnlockType>('store');
  const [editReqLevel, setEditReqLevel] = useState<number>(10);
  const [editRedeemCode, setEditRedeemCode] = useState<string>('');
  const [editFrameScale, setEditFrameScale] = useState<number>(1.35);
  const [editAvatarScale, setEditAvatarScale] = useState<number>(0.85);
  const [editFrameOffsetX, setEditFrameOffsetX] = useState<number>(0);
  const [editFrameOffsetY, setEditFrameOffsetY] = useState<number>(0);
  const [editModalFeedback, setEditModalFeedback] = useState<string | null>(null);
  const [savedRowFeedback, setSavedRowFeedback] = useState<Record<string, boolean>>({});
  const [inlinePriceDrafts, setInlinePriceDrafts] = useState<Record<string, number>>({});

  // Helper to handle and optimize local image file uploads (PNG / JPG / WebP)
  const handleImageFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP)!');
      return;
    }

    setLocalFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400; // 400x400 crisp HD for web avatars/frames
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/png', 0.92);
          setNewItemAsset(optimizedDataUrl);
        } else {
          setNewItemAsset(e.target?.result as string);
        }
        sounds.playClaim();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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

  // Save Store Items to LocalStorage and notify all components
  const saveStoreItems = (items: StoreItem[]) => {
    setStoreItems(items);
    localStorage.setItem('ag_utopia_custom_store_items', JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('ag_store_updated', { detail: items }));
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
      world_category: newItemWorldCat,
      avatar_category: (newItemWorldCat as any),
      unlock_type: newItemUnlockType,
      required_level: newItemUnlockType === 'level' ? newItemReqLevel : undefined,
      redeem_code: newItemUnlockType === 'code' ? newItemRedeemCode.trim().toUpperCase() : undefined,
      frame_config: newItemType === 'frame' ? {
        scale: frameScale,
        avatar_scale: avatarScale,
        offset_x: frameOffsetX,
        offset_y: frameOffsetY
      } : undefined,
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

  // Open Edit Modal for a Store Item
  const handleOpenEditModal = (item: StoreItem) => {
    setEditingItem(item);
    setEditNameAr(item.name_ar);
    setEditNameEn(item.name_en);
    setEditDescAr(item.description_ar);
    setEditDescEn(item.description_en);
    setEditPrice(item.price);
    setEditRarity(item.rarity);
    setEditWorldCat(item.world_category || (item.avatar_category as any) || 'general');
    setEditAsset(item.asset_url || '');
    setEditImageMode('url');
    setEditLocalFile(null);
    setEditUnlockType(item.unlock_type || 'store');
    setEditReqLevel(item.required_level || 10);
    setEditRedeemCode(item.redeem_code || '');
    setEditFrameScale(item.frame_config?.scale ?? 1.35);
    setEditAvatarScale(item.frame_config?.avatar_scale ?? 0.85);
    setEditFrameOffsetX(item.frame_config?.offset_x ?? 0);
    setEditFrameOffsetY(item.frame_config?.offset_y ?? 0);
    setEditModalFeedback(null);
    sounds.playClick();
  };

  // Upload handler for edit modal
  const handleEditImageFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WebP)!');
      return;
    }

    setEditLocalFile(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/png', 0.92);
          setEditAsset(optimizedDataUrl);
        } else {
          setEditAsset(e.target?.result as string);
        }
        sounds.playClaim();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save changes from Edit Modal
  const handleSaveEditItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingItem || !editNameAr.trim() || !editNameEn.trim()) return;

    const updatedItem: StoreItem = {
      ...editingItem,
      name_ar: editNameAr.trim(),
      name_en: editNameEn.trim(),
      description_ar: editDescAr.trim(),
      description_en: editDescEn.trim(),
      price: editUnlockType === 'code' || editUnlockType === 'gift' ? 0 : Math.max(0, editPrice),
      rarity: editRarity,
      world_category: editWorldCat,
      avatar_category: (editWorldCat as any),
      asset_url: editAsset.trim() || editingItem.asset_url,
      unlock_type: editUnlockType,
      required_level: editUnlockType === 'level' ? editReqLevel : undefined,
      redeem_code: editUnlockType === 'code' ? editRedeemCode.trim().toUpperCase() : undefined,
      frame_config: editingItem.type === 'frame' ? {
        scale: editFrameScale,
        avatar_scale: editAvatarScale,
        offset_x: editFrameOffsetX,
        offset_y: editFrameOffsetY
      } : editingItem.frame_config
    };

    const updatedList = storeItems.map(i => i.id === editingItem.id ? updatedItem : i);
    saveStoreItems(updatedList);

    setEditModalFeedback('🎉 تم حفظ وتحديث العنصر بنجاح في المتجر!');
    sounds.playVictory();
    confetti({ particleCount: 70, spread: 60 });

    setTimeout(() => {
      setEditingItem(null);
      setEditModalFeedback(null);
    }, 1500);
  };

  // Save inline price (on Enter key or Save button click)
  const handleSaveInlinePrice = (itemId: string, newPrice?: number) => {
    const targetPrice = newPrice !== undefined ? newPrice : (inlinePriceDrafts[itemId] ?? storeItems.find(i => i.id === itemId)?.price ?? 0);
    const updated = storeItems.map(i => (i.id === itemId ? { ...i, price: Math.max(0, targetPrice) } : i));
    saveStoreItems(updated);
    sounds.playClaim();

    setSavedRowFeedback(prev => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      setSavedRowFeedback(prev => ({ ...prev, [itemId]: false }));
    }, 2500);
  };

  // Quick Price Edit in Store Manager
  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    setInlinePriceDrafts(prev => ({ ...prev, [itemId]: Math.max(0, newPrice) }));
    const updated = storeItems.map(i => (i.id === itemId ? { ...i, price: Math.max(0, newPrice) } : i));
    saveStoreItems(updated);
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
      const deletedIds: string[] = JSON.parse(localStorage.getItem('ag_utopia_deleted_item_ids') || '[]');
      if (!deletedIds.includes(itemId)) {
        deletedIds.push(itemId);
        localStorage.setItem('ag_utopia_deleted_item_ids', JSON.stringify(deletedIds));
      }
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
    setUsersList(prev => {
      const updated = prev.map(u => (u.id === userId ? { ...u, coins: u.coins + amount } : u));
      try {
        localStorage.setItem('ag_utopia_registered_users', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    sounds.playClaim();
  };

  // Permanently delete user from database
  const handleDeleteUserPermanently = (userId: string, username: string) => {
    if (userId === profile?.id || username.toUpperCase() === 'AMOX') {
      alert('⚠️ لا يمكن حذف حساب المؤسس والأدمن الرئيسي!');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف حساب اللاعب [${username}] نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      const res = deleteUserFromDatabase(userId);
      if (res.success) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        if (inspectingUser?.id === userId) setInspectingUser(null);
        sounds.playWrong();
        alert(res.message);
      } else {
        alert(res.message);
      }
    }
  };

  // Open User Profile & Inventory Inspector Modal
  const handleOpenInspector = (user: Profile) => {
    setInspectingUser(user);
    setInspectFeedback(null);
    setItemToGrantId('');
    setInspectInvFilter('all');
    sounds.playClick();
  };

  // Revoke/Delete owned item from a user
  const handleRevokeItemFromUser = (userId: string, itemId: string, itemName: string) => {
    if (confirm(`هل أنت متأكد من سحب وحذف عنصر [${itemName}] من مخزون هذا اللاعب نهائياً؟`)) {
      const res = adminRemoveItemFromUser(userId, itemId);
      if (res.success) {
        setInspectFeedback(res.message);
        try {
          const savedUsers: Profile[] = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
          setUsersList(savedUsers);
          const updatedUser = savedUsers.find(u => u.id === userId);
          if (updatedUser) setInspectingUser(updatedUser);
        } catch (e) {}
      } else {
        alert(res.message);
      }
    }
  };

  // Grant an item directly to a user
  const handleGrantItemToUser = (userId: string) => {
    if (!itemToGrantId) return;
    const itemObj = storeItems.find(i => i.id === itemToGrantId);
    const res = adminAddItemToUser(userId, itemToGrantId);
    if (res.success) {
      setInspectFeedback(`🎁 تم منح عنصر [${itemObj?.name_ar || itemToGrantId}] للاعب بنجاح!`);
      try {
        const savedUsers: Profile[] = JSON.parse(localStorage.getItem('ag_utopia_registered_users') || '[]');
        setUsersList(savedUsers);
        const updatedUser = savedUsers.find(u => u.id === userId);
        if (updatedUser) setInspectingUser(updatedUser);
      } catch (e) {}
      setItemToGrantId('');
      confetti({ particleCount: 60, spread: 60 });
    } else {
      alert(res.message);
    }
  };

  // Modify user coins inside inspector
  const handleModifyUserCoins = (userId: string, delta: number) => {
    setUsersList(prev => {
      const updated = prev.map(u => (u.id === userId ? { ...u, coins: Math.max(0, u.coins + delta) } : u));
      try {
        localStorage.setItem('ag_utopia_registered_users', JSON.stringify(updated));
      } catch (e) {}
      const cur = updated.find(u => u.id === userId);
      if (cur) setInspectingUser(cur);
      return updated;
    });
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

              {/* World / Universe Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>عالم الأنمي والألعاب التابع له العنصر (World / Anime Universe):</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {WORLD_CATEGORIES.filter(w => w.id !== 'all').map(w => {
                    const isSelected = newItemWorldCat === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => { setNewItemWorldCat(w.id); sounds.playClick(); }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border text-center ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md ring-1 ring-purple-300'
                            : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-base">{w.icon}</span>
                        <span>{w.name_ar}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Source Selection: Upload File vs Direct Link */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <label className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>صورة وتصميم العنصر (Image / PNG Asset) *:</span>
                  </label>

                  {/* Mode Switch Tabs */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => { setImageSourceMode('upload'); sounds.playClick(); }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        imageSourceMode === 'upload'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>📁 رفع من الجهاز</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setImageSourceMode('url'); sounds.playClick(); }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        imageSourceMode === 'url'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>🔗 رابط مباشر / إيموجي</span>
                    </button>
                  </div>
                </div>

                {/* Option 1: Upload from Device */}
                {imageSourceMode === 'upload' ? (
                  <div className="space-y-2 animate-fadeIn">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFileUpload(file);
                      }}
                      className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center transition-all cursor-pointer ${
                        isDragging 
                          ? 'border-rose-500 bg-rose-950/40' 
                          : newItemAsset && localFileName
                          ? 'border-emerald-500/50 bg-emerald-950/20'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileUpload(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />

                      {newItemAsset && localFileName ? (
                        <div className="flex items-center justify-between gap-3 bg-slate-950/90 border border-emerald-500/40 p-3 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-emerald-400 flex-shrink-0">
                              <img src={newItemAsset} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-start">
                              <div className="flex items-center gap-1 text-xs font-bold text-emerald-300">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>تم رفع وتجهيز الصورة بنجاح!</span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-xs">{localFileName}</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewItemAsset('');
                              setLocalFileName(null);
                              sounds.playClick();
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-600/40 text-rose-300"
                            title="إزالة الصورة"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              اضغط لاختيار صورة PNG من جهازك أو اسحب الملف هنا
                            </span>
                            <span className="text-[11px] text-slate-400">
                              يدعم PNG شفافة، JPG، WebP (يتم التحسين تلقائياً بدقة HD فائقة)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Option 2: Direct URL / Emoji */
                  <div className="space-y-2 animate-fadeIn">
                    <div className="relative">
                      <Link className="absolute start-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={newItemAsset}
                        onChange={e => {
                          setNewItemAsset(e.target.value);
                          setLocalFileName(null);
                        }}
                        placeholder="https://i.imgur.com/your_image.png أو رابط مباشر أو 👑"
                        className="w-full ps-9 pe-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      💡 يمكنك لصق رابط مباشر من Imgur، Discord، AniList، أو إيموجي للتاج مثل 👑.
                    </p>
                  </div>
                )}
              </div>

              {/* Interactive Frame Adjuster Controls */}
              {newItemType === 'frame' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-black text-purple-300">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span>🎛️ أداة ضبط ومحاذاة الإطار على الأفاتار (Frame Adjuster):</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      عدّل القيم لتطابق الإطار مع الصورة بدقة 100%
                    </span>
                  </div>

                  {/* Sliders Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. Frame Scale */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">🔍 تكبير/تصغير الإطار (Frame Zoom):</span>
                        <span className="text-amber-400 font-mono font-bold">{Math.round(frameScale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="2.2"
                        step="0.05"
                        value={frameScale}
                        onChange={(e) => setFrameScale(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    {/* 2. Avatar Inner Scale */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">🎯 احتواء الأفاتار الداخلي (Avatar Fit):</span>
                        <span className="text-cyan-400 font-mono font-bold">{Math.round(avatarScale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.0"
                        step="0.02"
                        value={avatarScale}
                        onChange={(e) => setAvatarScale(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>

                    {/* 3. Offset X */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">↔️ إزاحة أفقية (Offset X):</span>
                        <span className="text-purple-300 font-mono font-bold">{frameOffsetX}px</span>
                      </div>
                      <input
                        type="range"
                        min="-30"
                        max="30"
                        step="1"
                        value={frameOffsetX}
                        onChange={(e) => setFrameOffsetX(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* 4. Offset Y */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-bold">↕️ إزاحة رأسية (Offset Y):</span>
                        <span className="text-purple-300 font-mono font-bold">{frameOffsetY}px</span>
                      </div>
                      <input
                        type="range"
                        min="-30"
                        max="30"
                        step="1"
                        value={frameOffsetY}
                        onChange={(e) => setFrameOffsetY(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-bold me-1">خيارات سريعة:</span>
                    <button
                      type="button"
                      onClick={() => { setFrameScale(1.35); setAvatarScale(0.85); setFrameOffsetX(0); setFrameOffsetY(0); sounds.playClick(); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-400 text-[11px] text-slate-300 font-bold"
                    >
                      🎯 ضبط قياسي (Standard 85%)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFrameScale(1.5); setAvatarScale(0.78); setFrameOffsetX(0); setFrameOffsetY(0); sounds.playClick(); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-400 text-[11px] text-slate-300 font-bold"
                    >
                      ⭕ إطار عريض (Thick 78%)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFrameScale(1.2); setAvatarScale(0.95); setFrameOffsetX(0); setFrameOffsetY(0); sounds.playClick(); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-400 text-[11px] text-slate-300 font-bold"
                    >
                      🌟 إطار نحيف (Slim 95%)
                    </button>
                  </div>
                </div>
              )}

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
                  <div className="space-y-2 animate-fadeIn">
                    <label className="block text-xs font-bold text-cyan-300 mb-1">
                      المستوى المطلوب لفتح العنصر مجاناً (Free at Level):
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
                    <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200">
                      💡 <strong>نظام الفتح المجاني والشراء المبكر:</strong> عندما يصل اللاعب للمستوى <strong>{newItemReqLevel}</strong> سيحصل على العنصر <strong>مجاناً (0 كوينز)</strong>. وإذا أراد اقتناءه قبل الوصول لهذا المستوى، يمكنه شراؤه مبكراً بسعر <strong>{newItemPrice} عملة</strong>.
                    </div>
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
                    <div className="py-2 flex justify-center">
                      <AvatarWithFrame
                        avatarUrl={profile?.avatar_url || 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png'}
                        frameAssetUrl={newItemAsset || undefined}
                        frameId={newItemAsset ? undefined : 'frame_founder_exclusive'}
                        frameConfig={{
                          scale: frameScale,
                          avatar_scale: avatarScale,
                          offset_x: frameOffsetX,
                          offset_y: frameOffsetY
                        }}
                        size="xl"
                      />
                    </div>
                  ) : newItemType === 'tag' ? (
                    <div className="py-2 flex justify-center items-center">
                      {newItemAsset && (newItemAsset.startsWith('data:image') || newItemAsset.startsWith('http')) ? (
                        <img src={newItemAsset} alt="Tag" className="w-12 h-12 object-contain drop-shadow-md" />
                      ) : (
                        <span className="text-4xl">{newItemAsset || '👑'}</span>
                      )}
                    </div>
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

          {/* World Category Filter in Store Manager */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-4 border-b border-slate-800/80 scrollbar-none">
            <span className="text-xs text-slate-400 font-bold me-1 flex-shrink-0">فرز العالم:</span>
            {WORLD_CATEGORIES.map(w => {
              const isSelected = managerWorldFilter === w.id;
              const count = w.id === 'all' 
                ? storeItems.length 
                : storeItems.filter(i => (i.world_category || (i.avatar_category as any) || 'general') === w.id).length;
              return (
                <button
                  key={w.id}
                  onClick={() => { setManagerWorldFilter(w.id); sounds.playClick(); }}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  <span>{w.icon}</span>
                  <span>{w.name_ar.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
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
                {storeItems
                  .filter(item => {
                    if (managerWorldFilter === 'all') return true;
                    const itemWorld = item.world_category || (item.avatar_category as any) || 'general';
                    return itemWorld === managerWorldFilter;
                  })
                  .map(item => {
                    const itemWorld = item.world_category || (item.avatar_category as any) || 'general';
                    const worldMeta = WORLD_CATEGORIES.find(w => w.id === itemWorld);
                    return (
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
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-slate-400">{item.name_en} • <span className="uppercase text-purple-400">{item.type}</span></span>
                            {worldMeta && worldMeta.id !== 'all' && (
                              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border flex items-center gap-0.5 ${worldMeta.badge_color}`}>
                                <span>{worldMeta.icon}</span>
                                <span>{worldMeta.name_ar.split(' ')[0]}</span>
                              </span>
                            )}
                          </div>
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
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            min={0}
                            value={inlinePriceDrafts[item.id] !== undefined ? inlinePriceDrafts[item.id] : item.price}
                            onChange={e => handleUpdatePrice(item.id, Number(e.target.value))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveInlinePrice(item.id, Number((e.target as HTMLInputElement).value));
                              }
                            }}
                            className="w-20 py-1.5 px-2 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg text-amber-300 font-bold text-xs focus:outline-none transition-all"
                            title="اضغط Enter أو زر الحفظ لتأكيد السعر"
                          />
                        </div>

                        {/* Save Button */}
                        <button
                          type="button"
                          onClick={() => handleSaveInlinePrice(item.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            savedRowFeedback[item.id]
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                              : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                          }`}
                          title="حفظ السعر (Enter)"
                        >
                          {savedRowFeedback[item.id] ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        
                        {savedRowFeedback[item.id] && (
                          <span className="text-[10px] font-black text-emerald-400 animate-fadeIn whitespace-nowrap">
                            تم الحفظ ✓
                          </span>
                        )}
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-600/40 text-indigo-300 transition-colors"
                          title="تعديل العنصر بالكامل"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 text-rose-300 transition-colors"
                          title="حذف العنصر"
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
                  <tr key={u.id} className="hover:bg-slate-950/60 transition-colors">
                    <td className="py-3">
                      <div 
                        onClick={() => handleOpenInspector(u)}
                        className="flex items-center gap-2.5 cursor-pointer group"
                        title="انقر لفحص بروفايل ومخزون اللاعب"
                      >
                        <AvatarWithFrame avatarUrl={u.avatar_url} frameId={u.active_frame_id} size="sm" />
                        <div>
                          <div className="font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                            <span>{u.username}</span>
                            {u.role === 'admin' && <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-500/40">أدمن</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <span className="font-mono text-cyan-400 font-bold">#{u.tag}</span>
                    </td>

                    <td className="py-3">
                      <span className="font-bold text-white">Lv. {u.level}</span>
                    </td>

                    <td className="py-3">
                      <span className="font-bold text-amber-400">{u.coins.toLocaleString()} كوينز</span>
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
                          onClick={() => handleOpenInspector(u)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                          title="فتح بروفايل اللاعب وإدارة مخزونه وعناصره"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>بروفايل ومخزون</span>
                        </button>
                        <button
                          onClick={() => handleAddCoinsToUser(u.id, 500)}
                          className="px-2 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 text-amber-300 text-[10px] font-bold cursor-pointer"
                          title="إضافة 500 كوينز"
                        >
                          +500 🪙
                        </button>
                        <button
                          onClick={() => handleToggleBan(u.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            u.is_banned
                              ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {u.is_banned ? 'إلغاء الحظر' : 'حظر 🚫'}
                        </button>
                        <button
                          onClick={() => handleDeleteUserPermanently(u.id, u.username)}
                          className="px-2 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-600/60 text-rose-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                          title="حذف اللاعب نهائياً من قاعدة البيانات"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>حذف نهائي</span>
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

      {/* ============================================================== */}
      {/* EDIT STORE ITEM MODAL                                          */}
      {/* ============================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-black text-white">تعديل بيانات عنصر المتجر: {editingItem.name_ar}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editModalFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-black text-center animate-fadeIn">
                {editModalFeedback}
              </div>
            )}

            <form onSubmit={handleSaveEditItem} className="space-y-4">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الاسم بالعربي *</label>
                  <input
                    type="text"
                    required
                    value={editNameAr}
                    onChange={e => setEditNameAr(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الاسم بالإنجليزي *</label>
                  <input
                    type="text"
                    required
                    value={editNameEn}
                    onChange={e => setEditNameEn(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Price, Rarity & World Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">السعر بالعملات (Coins) *</label>
                  <input
                    type="number"
                    min={0}
                    value={editPrice}
                    onChange={e => setEditPrice(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">درجة الندرة (Rarity)</label>
                  <select
                    value={editRarity}
                    onChange={e => setEditRarity(e.target.value as any)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="common">شائع (Common)</option>
                    <option value="rare">نادر (Rare)</option>
                    <option value="epic">أسطوري (Epic)</option>
                    <option value="legendary">خرافي (Legendary)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عالم العنصر (Universe)</label>
                  <select
                    value={editWorldCat}
                    onChange={e => setEditWorldCat(e.target.value as any)}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-purple-300 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    {WORLD_CATEGORIES.filter(w => w.id !== 'all').map(w => (
                      <option key={w.id} value={w.id}>
                        {w.icon} {w.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Asset Upload / URL */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">صورة / تصميم العنصر (PNG Asset):</label>
                  <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditImageMode('upload')}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        editImageMode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      📁 رفع
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditImageMode('url')}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        editImageMode === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      🔗 رابط
                    </button>
                  </div>
                </div>

                {editImageMode === 'upload' ? (
                  <div className="border border-dashed border-slate-700 rounded-xl p-3 text-center bg-slate-900/50">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleEditImageFileUpload(file);
                      }}
                      className="text-xs text-slate-400"
                    />
                    {editLocalFile && (
                      <div className="text-[11px] text-emerald-400 font-bold mt-1">✓ {editLocalFile}</div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editAsset}
                    onChange={e => setEditAsset(e.target.value)}
                    placeholder="رابط الصورة أو إيموجي..."
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              {/* Frame Adjuster (if item is frame) */}
              {editingItem.type === 'frame' && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-3">
                  <div className="text-xs font-black text-indigo-300">🎛️ ضبط ومحاذاة الإطار (Frame Adjuster):</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>تكبير الإطار:</span>
                        <span className="font-bold text-amber-400">{Math.round(editFrameScale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="2.2"
                        step="0.05"
                        value={editFrameScale}
                        onChange={e => setEditFrameScale(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-900 rounded accent-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>احتواء الأفاتار:</span>
                        <span className="font-bold text-cyan-400">{Math.round(editAvatarScale * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.0"
                        step="0.02"
                        value={editAvatarScale}
                        onChange={e => setEditAvatarScale(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-900 rounded accent-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الوصف بالعربي</label>
                  <textarea
                    rows={2}
                    value={editDescAr}
                    onChange={e => setEditDescAr(e.target.value)}
                    className="w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الوصف بالإنجليزي</label>
                  <textarea
                    rows={2}
                    value={editDescEn}
                    onChange={e => setEditDescEn(e.target.value)}
                    className="w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Unlock Type in Edit Modal */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300">طريقة وشروط فتح العنصر:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'store', label: '🛒 متجر عادي' },
                    { id: 'level', label: '🔓 مجاني عند مستوى' },
                    { id: 'code', label: '🔑 كود ترويجي' },
                    { id: 'gift', label: '🎁 هدية مؤسس' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setEditUnlockType(m.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all ${
                        editUnlockType === m.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {editUnlockType === 'level' && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="block text-xs font-bold text-cyan-300">المستوى المطلوب للاستلام المجاني:</label>
                    <input
                      type="number"
                      min={2}
                      max={100}
                      value={editReqLevel}
                      onChange={e => setEditReqLevel(Number(e.target.value))}
                      className="w-full py-1.5 px-3 bg-slate-900 border border-cyan-500/50 rounded-xl text-xs font-bold text-cyan-400 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">
                      ⚡ سيحصل عليه اللاعب مجاناً (0 عملات) عند وصوله لهذا المستوى، أو يمكنه شراؤه مبكراً بسعر <strong>{editPrice} كوينز</strong>.
                    </p>
                  </div>
                )}

                {editUnlockType === 'code' && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-bold text-amber-300 mb-1">الكود السري للاسترداد:</label>
                    <input
                      type="text"
                      value={editRedeemCode}
                      onChange={e => setEditRedeemCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SPECIAL_CODE"
                      className="w-full py-1.5 px-3 bg-slate-900 border border-amber-500/50 rounded-xl text-xs font-mono font-bold text-amber-400 uppercase focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>💾 حفظ التعديلات فوراً (Enter)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADMIN USER PROFILE & INVENTORY INSPECTOR MODAL                 */}
      {/* ============================================================== */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#050811] border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-7 max-w-3xl w-full shadow-[0_0_40px_rgba(6,182,212,0.35)] max-h-[92vh] flex flex-col my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>فحص بروفايل ومخزون اللاعب:</span>
                    <span className="text-cyan-400 font-mono">{inspectingUser.username}</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">تحكم كامل بالبيانات، الرصيد، والمقتنيات مع إمكانية سحب وحذف أي عنصر</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inspect Feedback Banner */}
            {inspectFeedback && (
              <div className="mb-4 p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-black text-center shadow-lg animate-fadeIn flex-shrink-0">
                {inspectFeedback}
              </div>
            )}

            <div className="overflow-y-auto space-y-6 pe-1 scrollbar-thin">
              
              {/* Profile Hero Header Card */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4 text-center sm:text-start">
                  <AvatarWithFrame 
                    avatarUrl={inspectingUser.avatar_url} 
                    frameId={inspectingUser.active_frame_id} 
                    size="lg" 
                  />
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h4 className="text-xl font-black text-white">{inspectingUser.username}</h4>
                      <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                        #{inspectingUser.tag}
                      </span>
                      {inspectingUser.role === 'admin' && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50">
                          مشرف عام
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <span className="text-xs font-bold text-amber-400">Lv. {inspectingUser.level}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 font-mono">ID: {inspectingUser.id}</span>
                    </div>
                    {inspectingUser.bio && (
                      <p className="text-xs text-slate-300 italic bg-slate-900/80 p-2 rounded-xl border border-slate-800 mt-2 max-w-md">
                        "{inspectingUser.bio}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Coins & Actions in Inspector */}
                <div className="flex flex-col items-center sm:items-end gap-2">
                  <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/40 px-4 py-2 rounded-2xl shadow-sm">
                    <Coins className="w-5 h-5 text-amber-400 animate-spin-slow" />
                    <span className="font-black text-amber-300 text-base">{inspectingUser.coins.toLocaleString()} كوينز</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleModifyUserCoins(inspectingUser.id, 500)}
                      className="px-2.5 py-1 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-600/50 text-amber-300 text-xs font-bold cursor-pointer transition-all"
                    >
                      +500 🪙
                    </button>
                    <button
                      onClick={() => handleModifyUserCoins(inspectingUser.id, -500)}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-all"
                    >
                      -500 🪙
                    </button>
                  </div>
                </div>
              </div>

              {/* Battle Stats 4-Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-lg font-black text-white">{inspectingUser.stats?.totalMatches || 0}</div>
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">إجمالي المباريات</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-lg font-black text-emerald-400">{inspectingUser.stats?.wins || 0}</div>
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">مرات الفوز</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-lg font-black text-cyan-400">{inspectingUser.stats?.correctAnswers || 0}</div>
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">الإجابات الصحيحة</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-lg font-black text-amber-400">{inspectingUser.stats?.streak || 0} 🔥</div>
                  <div className="text-[10px] text-slate-400 font-bold mt-0.5">ستريك الفوز</div>
                </div>
              </div>

              {/* INVENTORY & OWNED ITEMS MANAGER SECTION */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎒</span>
                    <h4 className="font-black text-sm text-white">
                      المقتنيات والعناصر المملوكة للاعب ({adminGetUserInventory(inspectingUser.id).length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">يمكنك سحب وحذف أي عنصر من حسابه فوراً بنقرة واحدة</span>
                </div>

                {/* Inventory Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'avatar', label: '👤 الأفاتار' },
                    { id: 'frame', label: '🛡️ الإطارات' },
                    { id: 'tag', label: '👑 التيجان' },
                    { id: 'title', label: '✨ الألقاب' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setInspectInvFilter(tab.id as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        inspectInvFilter === tab.id
                          ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Items List */}
                {(() => {
                  const userInvIds = adminGetUserInventory(inspectingUser.id);
                  const userOwnedItems = storeItems.filter(item => userInvIds.includes(item.id));
                  const displayedItems = userOwnedItems.filter(item => {
                    if (inspectInvFilter === 'all') return true;
                    return item.type === inspectInvFilter;
                  });

                  if (displayedItems.length === 0) {
                    return (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        لا توجد عناصر مملوكة في هذا التصنيف.
                      </div>
                    );
                  }

                  const defaultItemIds = ['avatar_default', 'frame_default', 'tag_rookie', 'title_novice'];

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pe-1 scrollbar-thin">
                      {displayedItems.map(item => {
                        const isEquipped = 
                          inspectingUser.active_avatar_id === item.id ||
                          inspectingUser.active_frame_id === item.id ||
                          inspectingUser.active_tag_id === item.id ||
                          inspectingUser.active_title_id === item.id;
                        const isDefault = defaultItemIds.includes(item.id);

                        return (
                          <div 
                            key={item.id}
                            className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {item.type === 'avatar' && item.asset_url ? (
                                  <img src={item.asset_url} alt="" className="w-full h-full object-cover" />
                                ) : item.type === 'tag' && item.asset_url ? (
                                  <span className="text-lg">{item.asset_url}</span>
                                ) : (
                                  <Sparkles className="w-4 h-4 text-amber-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-white text-xs truncate">{item.name_ar}</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <RarityBadge rarity={item.rarity} />
                                  {isEquipped && (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                                      مجهّز حالياً
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Revoke Button */}
                            {isDefault ? (
                              <span className="text-[10px] text-slate-500 font-bold flex-shrink-0">أساسي</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRevokeItemFromUser(inspectingUser.id, item.id, item.name_ar)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-300 hover:text-rose-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm flex-shrink-0"
                                title="سحب وحذف العنصر من اللاعب"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                <span>حذف من اللاعب</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Grant Item directly from Store */}
                <div className="pt-4 border-t border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    🎁 منح عنصر جديد من المتجر لحساب هذا اللاعب:
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={itemToGrantId}
                      onChange={e => setItemToGrantId(e.target.value)}
                      className="flex-1 py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">-- اختر عنصراً لمنحه للاعب --</option>
                      {storeItems
                        .filter(i => !adminGetUserInventory(inspectingUser.id).includes(i.id))
                        .map(i => (
                          <option key={i.id} value={i.id}>
                            {i.type === 'avatar' ? '👤' : i.type === 'frame' ? '🛡️' : i.type === 'tag' ? '👑' : '✨'} {i.name_ar} ({i.rarity})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={!itemToGrantId}
                      onClick={() => handleGrantItemToUser(inspectingUser.id)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>منح الآن</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleBan(inspectingUser.id);
                    setInspectingUser(prev => prev ? { ...prev, is_banned: !prev.is_banned } : null);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    inspectingUser.is_banned
                      ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50'
                      : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-500/50'
                  }`}
                >
                  {inspectingUser.is_banned ? 'إلغاء حظر الحساب' : 'حظر الحساب 🚫'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteUserPermanently(inspectingUser.id, inspectingUser.username)}
                  className="px-3 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الحساب نهائياً</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
