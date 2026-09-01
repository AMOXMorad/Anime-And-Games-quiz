import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { Suggestion, SuggestionReaction } from '../../types';
import { 
  Lightbulb, 
  Plus, 
  Sparkles, 
  Flame, 
  Heart, 
  ThumbsUp, 
  Rocket, 
  Pin, 
  Trash2, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Hammer, 
  XCircle, 
  Send, 
  Globe, 
  Gamepad2, 
  ShoppingBag, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

const REACTION_CONFIG: { type: SuggestionReaction; emoji: string; label_ar: string; label_en: string; color: string }[] = [
  { type: 'heart', emoji: '❤️', label_ar: 'أعجبني جداً', label_en: 'Love', color: 'text-rose-400 bg-rose-950/40 border-rose-500/30' },
  { type: 'fire', emoji: '🔥', label_ar: 'حماسي', label_en: 'Hype', color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' },
  { type: 'like', emoji: '👍', label_ar: 'موافق', label_en: 'Like', color: 'text-sky-400 bg-sky-950/40 border-sky-500/30' },
  { type: 'idea', emoji: '💡', label_ar: 'فكرة رائعة', label_en: 'Great Idea', color: 'text-yellow-400 bg-yellow-950/40 border-yellow-500/30' },
  { type: 'rocket', emoji: '🚀', label_ar: 'نحتاجها فوراً', label_en: 'Must Have', color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30' },
];

const STATUS_CONFIG: Record<string, { label_ar: string; label_en: string; bg: string; text: string; icon: React.ReactNode }> = {
  under_review: {
    label_ar: 'قيد الدراسة والفرز',
    label_en: 'Under Review',
    bg: 'bg-amber-950/60 border-amber-500/40',
    text: 'text-amber-400',
    icon: <Clock className="w-3.5 h-3.5" />
  },
  approved: {
    label_ar: 'تمت الموافقة 🌟',
    label_en: 'Approved',
    bg: 'bg-emerald-950/60 border-emerald-500/40',
    text: 'text-emerald-400',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />
  },
  in_progress: {
    label_ar: 'قيد التطوير 🛠️',
    label_en: 'In Progress',
    bg: 'bg-indigo-950/60 border-indigo-500/40',
    text: 'text-indigo-400',
    icon: <Hammer className="w-3.5 h-3.5" />
  },
  implemented: {
    label_ar: 'تم التنفيذ والتطبيق 🎉',
    label_en: 'Implemented',
    bg: 'bg-purple-950/60 border-purple-500/40',
    text: 'text-purple-400',
    icon: <Sparkles className="w-3.5 h-3.5" />
  },
  declined: {
    label_ar: 'غير مناسب حالياً',
    label_en: 'Declined',
    bg: 'bg-rose-950/60 border-rose-500/40',
    text: 'text-rose-400',
    icon: <XCircle className="w-3.5 h-3.5" />
  }
};

export const SuggestionsView: React.FC = () => {
  const { 
    suggestions, 
    reactToSuggestion, 
    submitSuggestion, 
    adminUpdateSuggestionStatus, 
    adminDeleteSuggestion 
  } = useSocial();
  const { profile } = useAuth();
  const { theme } = useTheme();
  const { lang, t } = useI18n();
  const isLight = theme === 'light';
  const isAdmin = profile?.role === 'admin';

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'reactions' | 'newest'>('reactions');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // New Suggestion Form State
  const [formCategory, setFormCategory] = useState<'world' | 'mode' | 'shop' | 'feature'>('world');
  const [formTitle, setFormTitle] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  // Admin Response Editor State
  const [editingAdminRespId, setEditingAdminRespId] = useState<string | null>(null);
  const [adminRespText, setAdminRespText] = useState<string>('');

  const handleCreateSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDetails.trim()) {
      setFormFeedback('⚠️ يرجى ملء عنوان وتفاصيل الاقتراح');
      return;
    }

    const res = submitSuggestion(formCategory, formTitle, formDetails);
    if (res.success) {
      setFormFeedback(res.message);
      setFormTitle('');
      setFormDetails('');
      setTimeout(() => {
        setFormFeedback(null);
        setShowSubmitModal(false);
      }, 1800);
    }
  };

  const handleSaveAdminResponse = (sugId: string, currentStatus: any) => {
    adminUpdateSuggestionStatus(sugId, currentStatus, adminRespText.trim());
    setEditingAdminRespId(null);
    setAdminRespText('');
  };

  // Filter & Sort suggestions
  const filteredSuggestions = suggestions
    .filter(s => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
      return true;
    })
    .sort((a, b) => {
      // Pinned always on top
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      if (sortBy === 'reactions') {
        const votesA = a.upvotes || 0;
        const votesB = b.upvotes || 0;
        return votesB - votesA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl mb-8 relative overflow-hidden transition-all ${
        isLight
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-yellow-500/10 border-amber-300'
          : 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border-amber-500/30'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>صوت مجتمع يوتوبيا وأفكار اللاعبين</span>
            </div>
            <h1 className={`text-2xl sm:text-4xl font-black mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              اقتراحات وتطوير المنصة 💡
            </h1>
            <p className={`text-xs sm:text-sm max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              شارك أفكارك لعوالم جديدة، أطوار لعب، أو ميزات تود رؤيتها. تفاعل وصوت مع أفكار باقي اللاعبين وتابع ردود الإدارة المباشرة عليها!
            </p>
          </div>

          <button
            type="button"
            onClick={() => { setShowSubmitModal(true); sounds.playClick(); }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>شارك فكرتك أو اقتراحك</span>
          </button>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className={`p-4 rounded-2xl border mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-lg'
      }`}>
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'كافة التصنيفات', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
            { id: 'world', label: 'عوالم جديدة 🌍', icon: <Globe className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: 'mode', label: 'أطوار وألعاب 🎮', icon: <Gamepad2 className="w-3.5 h-3.5 text-purple-400" /> },
            { id: 'shop', label: 'المتجر والعناصر 🛍️', icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> },
            { id: 'feature', label: 'ميزات عامة 💡', icon: <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> },
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { setSelectedCategory(cat.id); sounds.playClick(); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-black shadow-md font-black'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Status & Sort */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-800' 
                : 'bg-slate-950 border-slate-700 text-slate-200'
            }`}
          >
            <option value="all">كل الحالات ({suggestions.length})</option>
            <option value="under_review">قيد الدراسة والفرز ⏳</option>
            <option value="approved">تمت الموافقة 🌟</option>
            <option value="in_progress">قيد التطوير 🛠️</option>
            <option value="implemented">تم التطبيق والتنفيذ 🎉</option>
            <option value="declined">مرفوض ❌</option>
          </select>

          {/* Sort By */}
          <div className={`flex items-center rounded-xl p-0.5 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => { setSortBy('reactions'); sounds.playClick(); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                sortBy === 'reactions'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>الأعلى تفاعلاً</span>
            </button>

            <button
              type="button"
              onClick={() => { setSortBy('newest'); sounds.playClick(); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                sortBy === 'newest'
                  ? 'bg-amber-500 text-black shadow-sm font-black'
                  : isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>الأحدث</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filteredSuggestions.length === 0 ? (
          <div className={`py-16 text-center rounded-3xl border ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-900/50 border-slate-800 text-slate-400'
          }`}>
            <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
            <h3 className="text-base font-bold text-slate-300">لا توجد اقتراحات مطابقة لهذا الفلتر</h3>
            <p className="text-xs text-slate-500 mt-1">كن أول من يشارك فكرة جديدة عبر الزر بالأعلى!</p>
          </div>
        ) : (
          filteredSuggestions.map(sug => {
            const statusInfo = STATUS_CONFIG[sug.status] || STATUS_CONFIG.under_review;
            const currentUserId = profile?.id || 'anon_guest';
            const userReaction = sug.user_reactions?.[currentUserId];

            return (
              <div
                key={sug.id}
                className={`p-5 sm:p-6 rounded-3xl border transition-all relative ${
                  sug.is_pinned
                    ? isLight
                      ? 'bg-amber-50/80 border-amber-300 shadow-md ring-2 ring-amber-400/30'
                      : 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/40 shadow-xl ring-1 ring-amber-500/30'
                    : isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-lg'
                }`}
              >
                {/* Pinned Badge */}
                {sug.is_pinned && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 font-black text-[10px] mb-3">
                    <Pin className="w-3 h-3 text-amber-400 rotate-45" />
                    <span>مثبت في قمة الاقتراحات من الإدارة</span>
                  </div>
                )}

                {/* Top Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {/* Category Tag */}
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-800 border border-slate-700 text-slate-300">
                      {sug.category === 'world' ? '🌍 عالم جديد' : sug.category === 'mode' ? '🎮 طور لعبة' : sug.category === 'shop' ? '🛍️ متجر وعناصر' : '💡 ميزة عامة'}
                    </span>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border ${statusInfo.bg} ${statusInfo.text}`}>
                      {statusInfo.icon}
                      <span>{statusInfo.label_ar}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {new Date(sug.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Title & Details */}
                <h3 className={`text-base sm:text-lg font-black mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {sug.title}
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed mb-4 whitespace-pre-line ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  {sug.details}
                </p>

                {/* Official Admin Response Box */}
                {sug.admin_response && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-950 border border-purple-500/40 text-purple-200 text-xs shadow-md">
                    <div className="flex items-center gap-2 font-black text-amber-400 text-[11px] mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>رد الإدارة والمشرف العام (AMOX):</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-200">
                      {sug.admin_response}
                    </p>
                  </div>
                )}

                {/* Interactive Reactions Bar & Admin Quick Toolbar */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  
                  {/* Reaction Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {REACTION_CONFIG.map(r => {
                      const count = (sug.reactions as any)?.[r.type] || 0;
                      const isActive = userReaction === r.type;

                      return (
                        <button
                          key={r.type}
                          type="button"
                          onClick={() => reactToSuggestion(sug.id, r.type)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer transform active:scale-90 ${
                            isActive
                              ? `${r.color} shadow-md ring-1 ring-white/20 font-black scale-105`
                              : isLight
                              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                              : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-400'
                          }`}
                          title={`${r.label_ar}`}
                        >
                          <span className="text-sm">{r.emoji}</span>
                          <span className="text-[11px] font-black">{count > 0 ? count : ''}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ADMIN EXCLUSIVE ACTION PANEL */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 flex-wrap justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      {/* Status Selector */}
                      <select
                        value={sug.status}
                        onChange={e => adminUpdateSuggestionStatus(sug.id, e.target.value as any)}
                        className="py-1 px-2 rounded-xl text-[11px] font-black bg-slate-950 border border-purple-500/50 text-purple-300 outline-none cursor-pointer"
                      >
                        <option value="under_review">⏳ قيد الدراسة</option>
                        <option value="approved">🌟 موافقة</option>
                        <option value="in_progress">🛠️ قيد التطوير</option>
                        <option value="implemented">🎉 تم التطبيق</option>
                        <option value="declined">❌ رفض</option>
                      </select>

                      {/* Add/Edit Response Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAdminRespId(sug.id);
                          setAdminRespText(sug.admin_response || '');
                        }}
                        className="p-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 transition-colors"
                        title="إضافة أو تعديل رد الإدارة"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Pin Toggle */}
                      <button
                        type="button"
                        onClick={() => adminUpdateSuggestionStatus(sug.id, sug.status, sug.admin_response, !sug.is_pinned)}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          sug.is_pinned
                            ? 'bg-amber-950 border-amber-500 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title={sug.is_pinned ? 'إلغاء التثبيت' : 'تثبيت في القمة'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف الاقتراح: "${sug.title}"؟`)) {
                            adminDeleteSuggestion(sug.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/40 text-rose-300 transition-colors"
                        title="حذف الاقتراح نهائياً"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline Admin Response Editor Modal/Box */}
                {isAdmin && editingAdminRespId === sug.id && (
                  <div className="mt-4 p-4 rounded-2xl bg-purple-950/90 border border-purple-500/60 shadow-xl animate-fadeIn">
                    <label className="block text-xs font-black text-purple-200 mb-2">
                      كتابة الرد الرسمي للإدارة والمشرف العام:
                    </label>
                    <textarea
                      rows={2}
                      value={adminRespText}
                      onChange={e => setAdminRespText(e.target.value)}
                      placeholder="اكتب ردك للاعبين هنا (مثال: تم اعتماد الفكرة وسيتم إدراجها بالتحديث القادم)..."
                      className="w-full p-2.5 rounded-xl bg-black/80 border border-purple-500/40 text-white text-xs outline-none focus:border-amber-400 mb-3"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingAdminRespId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveAdminResponse(sug.id, sug.status)}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-md"
                      >
                        حفظ الرد ونشره
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* NEW SUGGESTION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowSubmitModal(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">طرح فكرة أو اقتراح جديد 💡</h3>
                <p className="text-xs text-slate-400">شارك فكرتك ليراها المشرف العام ويتفاعل معها المجتمع</p>
              </div>
            </div>

            {formFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-black text-center animate-fadeIn">
                {formFeedback}
              </div>
            )}

            <form onSubmit={handleCreateSuggestion} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">التصنيف:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'world', label: '🌍 عالم جديد' },
                    { id: 'mode', label: '🎮 طور وتحدي جديد' },
                    { id: 'shop', label: '🛍️ متجر وعناصر' },
                    { id: 'feature', label: '💡 ميزة وتحسين عام' },
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormCategory(c.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        formCategory === c.id
                          ? 'bg-amber-500 text-black border-amber-400 font-black'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان الفكرة:</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="مثال: إضافة عالم ون بيس أو طور الرانكد السريع..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الشرح والتفاصيل:</label>
                <textarea
                  rows={4}
                  value={formDetails}
                  onChange={e => setFormDetails(e.target.value)}
                  placeholder="اشرح فكرتك بالتفصيل، ما هي الشخصيات، الأسئلة، أو الآلية المقترحة..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>نشر الاقتراح الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
