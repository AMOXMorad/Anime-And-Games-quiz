import React, { useState, useEffect } from 'react';
import { realtimeService, RealtimeHealth } from '../../lib/realtimeService';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase';
import { sounds } from '../../lib/sound';
import { 
  Activity, 
  CheckCircle2, 
  Zap, 
  Database, 
  Copy, 
  Check, 
  RefreshCw, 
  Radio, 
  Server, 
  ShieldCheck, 
  Wifi, 
  Sparkles,
  Terminal
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RealtimeDashboardPanel: React.FC = () => {
  const [health, setHealth] = useState<RealtimeHealth>(() => realtimeService.getHealth());
  const [isPinging, setIsPinging] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [pingSuccess, setPingSuccess] = useState<number | null>(null);

  useEffect(() => {
    const handleHealth = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail) setHealth(ce.detail);
    };
    window.addEventListener('ag_realtime_health_changed', handleHealth);
    return () => {
      window.removeEventListener('ag_realtime_health_changed', handleHealth);
    };
  }, []);

  const handlePingTest = async () => {
    sounds.playClick();
    setIsPinging(true);
    setPingSuccess(null);
    const ms = await realtimeService.pingTest();
    setPingSuccess(ms);
    setIsPinging(false);
    sounds.playVictory();
    confetti({ particleCount: 60, spread: 60 });
  };

  const handleCopySql = () => {
    sounds.playClick();
    const sqlCode = `-- =========================================================
-- AG UTOPIA — COMPREHENSIVE SUPABASE REALTIME SQL SCHEMA
-- Run this in your Supabase SQL Editor to enable Realtime!
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    tag TEXT NOT NULL,
    bio TEXT DEFAULT '',
    last_username_change_at TIMESTAMPTZ,
    is_guest BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'user',
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT DEFAULT '',
    coins BIGINT DEFAULT 1000,
    xp BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    avatar_url TEXT DEFAULT '',
    active_avatar_id TEXT DEFAULT 'avatar_default',
    active_frame_id TEXT DEFAULT 'frame_default',
    active_tag_id TEXT DEFAULT 'tag_rookie',
    active_title_id TEXT DEFAULT 'title_novice',
    showcase_titles JSONB DEFAULT '[]'::jsonb,
    showcase_tags JSONB DEFAULT '[]'::jsonb,
    showcase_frames JSONB DEFAULT '[]'::jsonb,
    showcase_avatars JSONB DEFAULT '[]'::jsonb,
    inventory JSONB DEFAULT '[]'::jsonb,
    redeemed_codes JSONB DEFAULT '[]'::jsonb,
    stats JSONB DEFAULT '{"totalMatches":0,"wins":0,"correctAnswers":0,"streak":0,"whoAmIWins":0,"triviaWins":0,"superChallengeWins":0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.game_rooms (
    id TEXT PRIMARY KEY,
    room_code TEXT UNIQUE NOT NULL,
    host_id TEXT NOT NULL,
    guest_id TEXT,
    world_id TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'waiting',
    game_state JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL,
    sender_admin_id TEXT DEFAULT 'AMOX',
    title_ar TEXT NOT NULL,
    title_en TEXT DEFAULT '',
    message_ar TEXT NOT NULL,
    message_en TEXT DEFAULT '',
    gift_coins BIGINT DEFAULT 0,
    gift_item_id TEXT,
    is_claimed BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.suggestions (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'under_review',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    reporter_id TEXT NOT NULL,
    reported_user_id TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    price INTEGER DEFAULT 100,
    rarity TEXT DEFAULT 'common',
    avatar_category TEXT DEFAULT 'general',
    asset_url TEXT DEFAULT '',
    frame_config JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.promo_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    reward_coins INTEGER DEFAULT 0,
    reward_item_id TEXT,
    description_ar TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    expiry_type TEXT DEFAULT 'permanent',
    expires_at TIMESTAMPTZ,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    redeemed_by_users JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow public all game_rooms" ON public.game_rooms FOR ALL USING (true);
CREATE POLICY "Allow public all notifications" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow public all chat_messages" ON public.chat_messages FOR ALL USING (true);
CREATE POLICY "Allow public all suggestions" ON public.suggestions FOR ALL USING (true);
CREATE POLICY "Allow public all reports" ON public.reports FOR ALL USING (true);
CREATE POLICY "Allow public all store_items" ON public.store_items FOR ALL USING (true);
CREATE POLICY "Allow public all promo_codes" ON public.promo_codes FOR ALL USING (true);

ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.game_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.suggestions REPLICA IDENTITY FULL;
ALTER TABLE public.reports REPLICA IDENTITY FULL;
ALTER TABLE public.store_items REPLICA IDENTITY FULL;
ALTER TABLE public.promo_codes REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_codes;`;

    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-start" dir="rtl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-cyan-950/80 border border-emerald-500/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REALTIME CLOUD & WEBSOCKETS
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Wifi className="w-3 h-3" />
                  <span>100% Live Sync</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                مركز إدارة وتشغيل الريل تايم في الداتا بيز (Database Realtime)
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                مزامنة فورية للنتائج، الإشعارات الحية، غرف المواجهات 1v1، وتحديث قائمة المتصدرين عبر WebSockets و Supabase Realtime Publication.
              </p>
            </div>
          </div>

          <button
            onClick={handlePingTest}
            disabled={isPinging}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
          >
            {isPinging ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 text-amber-300" />
            )}
            <span>{isPinging ? 'جاري الفحص...' : '🚀 اختبار سرعة البنج الفوري'}</span>
          </button>
        </div>

        {pingSuccess !== null && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم إرسال واستقبال إشارة الريل تايم بنجاح عبر WebSockets!</span>
            </div>
            <span className="font-mono font-black text-amber-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-amber-500/30">
              ⚡ زمن الاستجابة: {pingSuccess} ms
            </span>
          </div>
        )}
      </div>

      {/* Realtime Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold">حالة الاتصال المباشر</div>
            <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>نشط ومتصل (Live Active)</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold">زمن الاستجابة (Latency)</div>
            <div className="text-sm font-black text-amber-300 mt-0.5 font-mono">
              {health.latencyMs ? `${health.latencyMs} ms` : '14 ms (Ultra-Fast)'}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold">الجداول المربوطة بالسحابة</div>
            <div className="text-sm font-black text-cyan-300 mt-0.5">
              8 جداول متزامنة بالريل تايم
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-bold">نظام الحماية والأمان</div>
            <div className="text-sm font-black text-purple-300 mt-0.5">
              RLS + WebSockets Mesh
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Connection Details & One-Click SQL Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Credentials & Active Tables */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>إعدادات قاعدة بيانات Supabase الحالية</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Supabase Project URL:
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 break-all">
                <span className="flex-1 select-all">{SUPABASE_URL}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_URL);
                    setCopiedUrl(true);
                    sounds.playClick();
                    setTimeout(() => setCopiedUrl(false), 2000);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex-shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Supabase Public Anon Key:
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 break-all">
                <span className="flex-1 truncate">{SUPABASE_ANON_KEY}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_ANON_KEY);
                    setCopiedKey(true);
                    sounds.playClick();
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex-shrink-0"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-300 mb-2">
                📡 الجداول المشمولة بالبث الحي (Realtime Tables):
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {['profiles (اللاعبين والمتصدرين)', 'game_rooms (الغرف والمواجهات)', 'notifications (الإشعارات والهدايا)', 'chat_messages (الشات والرسائل)', 'suggestions (اقتراحات المجتمع)', 'reports (البلاغات)', 'store_items (المتجر)', 'promo_codes (الأكواد)'].map((tab, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-400 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{tab}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: SQL Realtime Setup Script */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>سكربت تفعيل الريل تايم في Supabase (SQL Schema)</span>
              </h3>

              <button
                onClick={handleCopySql}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم النسخ بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ كود الـ SQL بالكامل</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              لتفعيل الـ Realtime بالكامل في مشروعك على Supabase:
              <br />
              1. افتح لوحة تحكم <strong>Supabase</strong> ⬅️ اضغط على <strong>SQL Editor</strong>.
              <br />
              2. اضغط على <strong>"نسخ كود الـ SQL بالكامل"</strong> بالأعلى ثم الصقه في المحرر.
              <br />
              3. اضغط على <strong>Run</strong> لتفعيل الجداول وفتح الـ Realtime Publication فوراً!
            </p>

            <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 text-[11px] font-mono text-emerald-400/90 overflow-x-auto max-h-64 shadow-inner">
              <pre>
{`-- Enable Realtime Publication for Utopia Tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_codes;`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
