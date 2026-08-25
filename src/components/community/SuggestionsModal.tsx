import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { X, Lightbulb, ThumbsUp, Plus, CheckCircle, Sparkles, Filter } from 'lucide-react';

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ isOpen, onClose }) => {
  const { suggestions, submitSuggestion, upvoteSuggestion } = useSocial();
  const { t } = useI18n();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [category, setCategory] = useState<'world' | 'mode' | 'shop' | 'feature'>('world');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;

    submitSuggestion(category, title.trim(), details.trim());
    setTitle('');
    setDetails('');
    setIsAdding(false);
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 3000);
  };

  const filteredSuggestions = selectedFilter === 'all'
    ? suggestions
    : suggestions.filter(s => s.category === selectedFilter);

  const CATEGORY_LABELS: Record<string, string> = {
    world: '🌍 طلب عالم جديد',
    mode: '🎮 فكرة مود لعب',
    shop: '🛍️ متجر وتخصيص',
    feature: '⚙️ تحسينات عامة'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => { onClose(); sounds.playClick(); }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{t('communitySuggestions')}</h3>
              <span className="text-xs text-slate-400">شاركنا أفكارك لتطوير AG Utopia وصوت لاقتراحات المجتمع</span>
            </div>
          </div>
          <button
            onClick={() => { onClose(); sounds.playClick(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold text-center animate-fadeIn">
            🎉 شكراً لك! تم تقديم اقتراحك بنجاح للمجتمع والإدارة.
          </div>
        )}

        {/* Filter & Add New Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 flex-shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pe-1">
            {['all', 'world', 'mode', 'shop', 'feature'].map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedFilter(cat); sounds.playClick(); }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === cat
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'الكل' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <button
            onClick={() => { setIsAdding(!isAdding); sounds.playClick(); }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'إلغاء' : 'تقديم اقتراح'}</span>
          </button>
        </div>

        {/* Add Suggestion Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 flex-shrink-0 animate-fadeIn">
            <h4 className="text-xs font-bold text-amber-300">أضف فكرتك لتطوير المنصة:</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="عنوان الاقتراح (مثال: إضافة عالم ون بيس)"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                required
              />

              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="world">🌍 طلب عالم جديد (أنمي / لعبة)</option>
                <option value="mode">🎮 مود وتحدي لعب جديد</option>
                <option value="shop">🛍️ إطارات وألقاب للمتجر</option>
                <option value="feature">⚙️ ميزة عامة في الموقع</option>
              </select>
            </div>

            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="اشرح فكرتك بالتفصيل..."
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              required
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md"
              >
                نشر الاقتراح
              </button>
            </div>
          </form>
        )}

        {/* Suggestions Feed */}
        <div className="overflow-y-auto space-y-3 flex-1 pe-1">
          {filteredSuggestions.map(s => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                    {CATEGORY_LABELS[s.category] || s.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    s.status === 'implemented'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : s.status === 'planned'
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {s.status === 'implemented' ? '✅ تم التطبيق' : s.status === 'planned' ? '🚀 مخطط للتنفيذ' : '🟡 قيد المراجعة'}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.details}</p>
              </div>

              {/* Upvote Button */}
              <button
                onClick={() => upvoteSuggestion(s.id)}
                className={`flex flex-col items-center justify-center p-2.5 px-3 rounded-2xl border transition-all ${
                  s.has_voted
                    ? 'bg-purple-950 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 mb-0.5 ${s.has_voted ? 'fill-current' : ''}`} />
                <span className="font-black text-xs">{s.upvotes}</span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
