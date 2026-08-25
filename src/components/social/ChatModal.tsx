import React, { useState } from 'react';
import { Friendship } from '../../types';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { AvatarWithFrame } from '../ui/AvatarWithFrame';
import { X, Send, Swords, Info, MessageSquare } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  friend: Friendship | null;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, friend, onClose }) => {
  const { profile } = useAuth();
  const { chatMessages, sendMessage } = useSocial();
  const { t } = useI18n();

  const [messageInput, setMessageInput] = useState('');

  if (!isOpen || !friend || !friend.friend_profile) return null;

  const friendProfile = friend.friend_profile;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => { onClose(); sounds.playClick(); }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col h-[550px]">
        
        {/* Chat Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AvatarWithFrame frameId={friendProfile.active_frame_id} size="sm" />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                <span>{friendProfile.username}</span>
                <span className="text-xs text-purple-400">#{friendProfile.tag}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">{t('online')}</span>
            </div>
          </div>

          <button
            onClick={() => { onClose(); sounds.playClick(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Day Retention Notice Banner */}
        <div className="bg-purple-950/60 border-b border-purple-500/30 p-2.5 px-4 flex items-center gap-2 text-[11px] text-purple-200">
          <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>{t('chatRetentionNotice')}</span>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/50">
          {chatMessages.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              ابدأ المحادثة الآن مع صديقك! اكتب رسالتك بالأسفل.
            </div>
          ) : (
            chatMessages.map(msg => {
              const isMe = msg.sender_id === profile?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-purple-600 text-white rounded-ee-sm shadow-md'
                        : 'bg-slate-800 text-slate-200 rounded-es-sm border border-slate-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            placeholder={t('typeMessage')}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
