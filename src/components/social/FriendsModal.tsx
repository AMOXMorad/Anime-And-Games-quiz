import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useGame } from '../../context/GameContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { X, Users, Search, MessageSquare, Swords, Check, Trash2, UserPlus, Sparkles } from 'lucide-react';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  openChatForFriend: (friend: any) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({ isOpen, onClose, openChatForFriend }) => {
  const { friends, sendFriendRequest, respondFriendRequest } = useSocial();
  const { startSuperMatchmaking } = useGame();
  const { lang, t } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const res = sendFriendRequest(searchQuery);
    if (res.success) {
      setFeedback('تم إرسال طلب الصداقة بنجاح!');
      setSearchQuery('');
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleQuickChallenge = (friend: any) => {
    sounds.playClick();
    onClose();
    startSuperMatchmaking('chaos_realm', 'medium');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => { onClose(); sounds.playClick(); }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{t('friendsList')}</h3>
              <span className="text-xs text-slate-400">تواصل ونافس أصدقاءك في يوتوبيا</span>
            </div>
          </div>
          <button
            onClick={() => { onClose(); sounds.playClick(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search / Add Friend Bar */}
        <form onSubmit={handleSendRequest} className="mb-6 flex-shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute start-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('searchPlayer')}
              className="w-full ps-10 pe-24 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="absolute end-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('sendRequest')}</span>
            </button>
          </div>
          {feedback && (
            <div className="text-xs text-emerald-400 font-bold mt-2 text-center animate-fadeIn">
              {feedback}
            </div>
          )}
        </form>

        {/* Friends List Container */}
        <div className="overflow-y-auto space-y-3 flex-1 pe-1">
          {friends.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              لم تقم بإضافة أصدقاء بعد. ابحث عن صديقك عبر اسمه والتاغ لإضافته!
            </div>
          ) : (
            friends.map(f => {
              const friendProfile = f.friend_profile;
              if (!friendProfile) return null;

              return (
                <div
                  key={f.id}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <AvatarWithFrame frameId={friendProfile.active_frame_id} size="md" />
                      <span className="absolute bottom-0 end-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                        <span>{friendProfile.username}</span>
                        <span className="text-xs text-purple-400">#{friendProfile.tag}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="text-emerald-400 font-semibold">{t('online')}</span>
                        <span>•</span>
                        <span>Lv.{friendProfile.level}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Chat & 1v1 Challenge */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { onClose(); openChatForFriend(f); }}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 transition-all"
                      title={t('directChat')}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleQuickChallenge(f)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t('quickChallenge')}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
