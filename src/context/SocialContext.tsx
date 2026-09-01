import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Friendship, ChatMessage, UserNotification, Suggestion, Report, StoreItem } from '../types';
import { useAuth } from './AuthContext';
import { sounds } from '../lib/sound';
import { realtimeService } from '../lib/realtimeService';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface SocialContextType {
  friends: Friendship[];
  notifications: UserNotification[];
  suggestions: Suggestion[];
  reports: Report[];
  activeChatFriend: Friendship | null;
  chatMessages: ChatMessage[];
  unreadCount: number;
  openChat: (friend: Friendship) => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  sendFriendRequest: (tagOrName: string) => { success: boolean; message: string };
  respondFriendRequest: (friendshipId: string, accept: boolean) => void;
  claimNotificationGift: (notificationId: string) => void;
  submitSuggestion: (category: 'world' | 'mode' | 'shop' | 'feature', title: string, details: string) => void;
  upvoteSuggestion: (id: string) => void;
  submitReport: (type: 'player_report' | 'bug_report' | 'question_error', title: string, details: string, reportedUserId?: string) => void;
  // Admin Methods
  adminSendGift: (userId: string, coins: number, title_ar: string, title_en: string, msg_ar: string, msg_en: string, item?: StoreItem) => void;
  adminBroadcastNotification: (title_ar: string, title_en: string, msg_ar: string, msg_en: string, coins?: number, item?: StoreItem, targetUserId?: string) => void;
  adminDeleteNotification: (notificationId: string) => void;
  adminBanUser: (userId: string, reason: string) => void;
  adminResolveReport: (reportId: string) => void;
  adminUpdateSuggestionStatus: (id: string, status: 'under_review' | 'planned' | 'implemented' | 'declined') => void;
}

const SocialContext = createContext<SocialContextType | null>(null);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateCoins } = useAuth();
  
  // Seed demo friends
  const [friends, setFriends] = useState<Friendship[]>([
    {
      id: 'fr_1',
      user_id: 'current',
      friend_id: 'demo_itachi',
      status: 'accepted',
      created_at: new Date().toISOString(),
      friend_profile: {
        id: 'demo_itachi',
        username: 'Itachi_Uchiha',
        tag: '1042',
        is_guest: false,
        role: 'user',
        is_banned: false,
        coins: 1400,
        xp: 1200,
        level: 14,
        active_frame_id: 'frame_sharingan',
        active_tag_id: 'tag_shinobi_flame',
        active_title_id: 'title_king_shinobi',
        showcase_titles: ['title_king_shinobi', 'title_ninja_leaf'],
        showcase_tags: ['tag_shinobi_flame', 'tag_king_crown'],
        showcase_frames: ['frame_sharingan', 'frame_gold_royalty'],
        stats: { totalMatches: 48, wins: 40, correctAnswers: 320, streak: 12, whoAmIWins: 14, triviaWins: 16, superChallengeWins: 10 },
        created_at: new Date().toISOString()
      }
    },
    {
      id: 'fr_2',
      user_id: 'current',
      friend_id: 'demo_rem',
      status: 'accepted',
      created_at: new Date().toISOString(),
      friend_profile: {
        id: 'demo_rem',
        username: 'Rem_Maid',
        tag: '7789',
        is_guest: false,
        role: 'user',
        is_banned: false,
        coins: 800,
        xp: 900,
        level: 11,
        active_frame_id: 'frame_curse_flame',
        active_tag_id: 'tag_rezero_apple',
        active_title_id: 'title_death_return',
        showcase_titles: ['title_death_return'],
        showcase_tags: ['tag_rezero_apple'],
        showcase_frames: ['frame_curse_flame'],
        stats: { totalMatches: 30, wins: 22, correctAnswers: 190, streak: 5, whoAmIWins: 8, triviaWins: 9, superChallengeWins: 5 },
        created_at: new Date().toISOString()
      }
    }
  ]);

  // Notifications (Pure dynamic from admin / custom notifications)
  const [notifications, setNotifications] = useState<UserNotification[]>(() => {
    try {
      const claimedIds: string[] = JSON.parse(localStorage.getItem('ag_utopia_claimed_notifs') || '[]');
      const customNotifs: UserNotification[] = JSON.parse(localStorage.getItem('ag_utopia_custom_notifications') || '[]');
      
      return customNotifs.map(n => ({
        ...n,
        is_claimed: claimedIds.includes(n.id) || !!n.is_claimed,
        is_read: claimedIds.includes(n.id) || !!n.is_read
      }));
    } catch (e) {
      return [];
    }
  });

  // Community Suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: 'sug_1',
      user_id: 'user_1',
      category: 'world',
      title: 'إضافة عالم Attack on Titan (هجوم العمالقة)',
      details: 'نطلب إضافة عالم إيرين وليفاي والعمالقة التسعة مع أسئلة وتريفيا ممتعة.',
      upvotes: 42,
      status: 'planned',
      created_at: new Date().toISOString()
    },
    {
      id: 'sug_2',
      user_id: 'user_2',
      category: 'world',
      title: 'إضافة عالم الألعاب: Elden Ring & Dark Souls',
      details: 'عالم السولز والزعماء الأسطوريين مثل مالينيا ورادان.',
      upvotes: 28,
      status: 'under_review',
      created_at: new Date().toISOString()
    },
    {
      id: 'sug_3',
      user_id: 'user_3',
      category: 'mode',
      title: 'مود بطولة خروج المغلوب لـ 8 لاعبين',
      details: 'نظام Tournament بنظام الشجرة وتصفيات بين 8 متنافسين.',
      upvotes: 19,
      status: 'under_review',
      created_at: new Date().toISOString()
    }
  ]);

  // Reports
  const [reports, setReports] = useState<Report[]>([]);

  // Direct Chat
  const [activeChatFriend, setActiveChatFriend] = useState<Friendship | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Initialize Realtime Service and Listen to Live Streams
  useEffect(() => {
    realtimeService.init();

    const handleIncomingNotif = (e: Event) => {
      const customEvent = e as CustomEvent;
      const payload = customEvent.detail;
      const record = payload?.new || payload;
      if (record && record.title_ar) {
        setNotifications(prev => {
          if (prev.some(n => n.id === record.id)) return prev;
          return [record, ...prev];
        });
        sounds.playClaim();
      }
    };

    const handleIncomingChat = (e: Event) => {
      const customEvent = e as CustomEvent;
      const payload = customEvent.detail;
      const msg: ChatMessage = payload?.new || payload;
      if (msg && msg.content) {
        setChatMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        sounds.playTimerTick();
      }
    };

    window.addEventListener('ag_realtime_notification', handleIncomingNotif);
    window.addEventListener('ag_realtime_chat', handleIncomingChat);

    return () => {
      window.removeEventListener('ag_realtime_notification', handleIncomingNotif);
      window.removeEventListener('ag_realtime_chat', handleIncomingChat);
    };
  }, []);

  const openChat = (friend: Friendship) => {
    setActiveChatFriend(friend);
    sounds.playClick();
  };

  const closeChat = () => {
    setActiveChatFriend(null);
  };

  const sendMessage = (content: string) => {
    if (!content.trim() || !activeChatFriend || !profile) return;
    const newMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      sender_id: profile.id,
      receiver_id: activeChatFriend.friend_id,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newMsg]);
    sounds.playClick();

    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: 'msg_reply_' + Math.random().toString(36).substring(2, 9),
        sender_id: activeChatFriend.friend_id,
        receiver_id: profile.id,
        content: `تحياتي يا صديقي! هل أنت جاهز لتحدي سوبر 1v1 في عالم الفوضى؟ 🔥`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, replyMsg]);
      sounds.playTimerTick();
    }, 1500);
  };

  const sendFriendRequest = (tagOrName: string): { success: boolean; message: string } => {
    if (!tagOrName.trim()) return { success: false, message: 'يرجى إدخال اسم أو تاغ صالح' };
    sounds.playClick();
    return { success: true, message: 'تم إرسال طلب الصداقة بنجاح!' };
  };

  const respondFriendRequest = (friendshipId: string, accept: boolean) => {
    setFriends(prev =>
      prev.map(f => (f.id === friendshipId ? { ...f, status: accept ? 'accepted' : 'declined' } : f))
    );
    sounds.playClick();
  };

  const claimNotificationGift = (notificationId: string) => {
    const notif = notifications.find(n => n.id === notificationId);
    if (!notif || notif.is_claimed) return;

    if (notif.gift_coins > 0) {
      updateCoins(notif.gift_coins);
    }

    // Persist claim in localStorage
    try {
      const claimedIds: string[] = JSON.parse(localStorage.getItem('ag_utopia_claimed_notifs') || '[]');
      if (!claimedIds.includes(notificationId)) {
        claimedIds.push(notificationId);
        localStorage.setItem('ag_utopia_claimed_notifs', JSON.stringify(claimedIds));
      }
    } catch (e) {
      console.error(e);
    }

    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, is_claimed: true, is_read: true } : n))
    );
    sounds.playClaim();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 }
    });
  };

  const submitSuggestion = (category: 'world' | 'mode' | 'shop' | 'feature', title: string, details: string) => {
    const newSug: Suggestion = {
      id: 'sug_' + Math.random().toString(36).substring(2, 9),
      user_id: profile?.id || 'anon',
      category,
      title,
      details,
      upvotes: 1,
      status: 'under_review',
      created_at: new Date().toISOString(),
      user_profile: profile || undefined,
      has_voted: true
    };
    setSuggestions(prev => [newSug, ...prev]);
    sounds.playVictory();
  };

  const upvoteSuggestion = (id: string) => {
    setSuggestions(prev =>
      prev.map(s => {
        if (s.id === id) {
          const hasVoted = s.has_voted;
          return {
            ...s,
            upvotes: hasVoted ? s.upvotes - 1 : s.upvotes + 1,
            has_voted: !hasVoted
          };
        }
        return s;
      })
    );
    sounds.playClick();
  };

  const submitReport = (type: 'player_report' | 'bug_report' | 'question_error', title: string, details: string, reportedUserId?: string) => {
    const newRep: Report = {
      id: 'rep_' + Math.random().toString(36).substring(2, 9),
      reporter_id: profile?.id || 'anon',
      reported_user_id: reportedUserId,
      type,
      title,
      details,
      status: 'open',
      created_at: new Date().toISOString(),
      reporter_profile: profile || undefined
    };
    setReports(prev => [newRep, ...prev]);
    sounds.playWrong();
  };

  // Admin Methods
  const adminSendGift = (
    userId: string,
    coins: number,
    title_ar: string,
    title_en: string,
    msg_ar: string,
    msg_en: string,
    item?: StoreItem
  ) => {
    const newNotif: UserNotification = {
      id: 'notif_gift_' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      sender_admin_id: profile?.id || 'admin',
      title_ar,
      title_en,
      message_ar: msg_ar,
      message_en: msg_en,
      gift_coins: coins,
      gift_item_id: item?.id,
      gift_item: item,
      is_claimed: false,
      is_read: false,
      created_at: new Date().toISOString()
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Persist custom notification in localStorage
    try {
      const customNotifs: UserNotification[] = JSON.parse(localStorage.getItem('ag_utopia_custom_notifications') || '[]');
      customNotifs.unshift(newNotif);
      localStorage.setItem('ag_utopia_custom_notifications', JSON.stringify(customNotifs.slice(0, 50)));
    } catch (e) {
      console.error(e);
    }

    sounds.playClaim();
    confetti({ particleCount: 100, spread: 80 });
  };

  const adminBroadcastNotification = (
    title_ar: string,
    title_en: string,
    msg_ar: string,
    msg_en: string,
    coins: number = 0,
    item?: StoreItem,
    targetUserId: string = 'all'
  ) => {
    const newNotif: UserNotification = {
      id: 'notif_broadcast_' + Math.random().toString(36).substring(2, 9),
      user_id: targetUserId,
      sender_admin_id: profile?.id || 'admin',
      title_ar,
      title_en,
      message_ar: msg_ar,
      message_en: msg_en,
      gift_coins: coins,
      gift_item_id: item?.id,
      gift_item: item,
      is_claimed: false,
      is_read: false,
      created_at: new Date().toISOString()
    };

    setNotifications(prev => [newNotif, ...prev]);

    // 1. Broadcast instantly to all live connected players
    realtimeService.broadcast('notification', newNotif);

    // 2. Persist to Supabase Database if online
    try {
      supabase.from('notifications').insert([{
        id: newNotif.id,
        user_id: newNotif.user_id,
        sender_admin_id: newNotif.sender_admin_id,
        title_ar: newNotif.title_ar,
        title_en: newNotif.title_en,
        message_ar: newNotif.message_ar,
        message_en: newNotif.message_en,
        gift_coins: newNotif.gift_coins,
        gift_item_id: newNotif.gift_item_id,
        is_claimed: false,
        is_read: false
      }]).then(({ error }) => {
        if (error) console.warn('Supabase notification insert fallback to local:', error.message);
      });
    } catch (e) {}

    try {
      const customNotifs: UserNotification[] = JSON.parse(localStorage.getItem('ag_utopia_custom_notifications') || '[]');
      customNotifs.unshift(newNotif);
      localStorage.setItem('ag_utopia_custom_notifications', JSON.stringify(customNotifs.slice(0, 100)));
    } catch (e) {
      console.error(e);
    }

    sounds.playVictory();
    confetti({ particleCount: 100, spread: 80 });
  };

  const adminDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    try {
      const customNotifs: UserNotification[] = JSON.parse(localStorage.getItem('ag_utopia_custom_notifications') || '[]');
      const filtered = customNotifs.filter(n => n.id !== notificationId);
      localStorage.setItem('ag_utopia_custom_notifications', JSON.stringify(filtered));
    } catch (e) {
      console.error(e);
    }
    sounds.playClick();
  };

  const adminBanUser = (userId: string, reason: string) => {
    sounds.playWrong();
    alert(`تم حظر المستخدم ${userId} بنجاح! السبب: ${reason}`);
  };

  const adminResolveReport = (reportId: string) => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, status: 'resolved' } : r))
    );
    sounds.playClick();
  };

  const adminUpdateSuggestionStatus = (id: string, status: 'under_review' | 'planned' | 'implemented' | 'declined') => {
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, status } : s))
    );
    sounds.playClick();
  };

  const unreadCount = notifications.filter(n => !n.is_claimed || !n.is_read).length;

  return (
    <SocialContext.Provider
      value={{
        friends,
        notifications,
        suggestions,
        reports,
        activeChatFriend,
        chatMessages,
        unreadCount,
        openChat,
        closeChat,
        sendMessage,
        sendFriendRequest,
        respondFriendRequest,
        claimNotificationGift,
        submitSuggestion,
        upvoteSuggestion,
        submitReport,
        adminSendGift,
        adminBroadcastNotification,
        adminDeleteNotification,
        adminBanUser,
        adminResolveReport,
        adminUpdateSuggestionStatus
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocial must be used inside SocialProvider');
  return ctx;
};
