import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { X, Bug, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportedUserId }) => {
  const { submitReport } = useSocial();
  const { t } = useI18n();

  const [type, setType] = useState<'player_report' | 'bug_report' | 'question_error'>(
    reportedUserId ? 'player_report' : 'bug_report'
  );
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;

    submitReport(type, title.trim(), details.trim(), reportedUserId);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={() => { onClose(); sounds.playClick(); }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        
        {/* Close Button */}
        <button
          onClick={() => { onClose(); sounds.playClick(); }}
          className="absolute top-4 end-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400">
            <Bug className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{t('reportTitle')}</h3>
            <span className="text-xs text-slate-400">ساعدنا في تحسين المنصة والحفاظ على بيئة تنافسية نظيفة</span>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-white">{t('reportSubmitted')}</h4>
            <p className="text-xs text-slate-400">تم تسجيل البلاغ وسيتولى فريق الإدارة والمشرف العام مراجعته فوراً.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Report Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">نوع البلاغ:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType('player_report')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                    type === 'player_report'
                      ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  👤 إبلاغ عن لاعب
                </button>

                <button
                  type="button"
                  onClick={() => setType('bug_report')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                    type === 'bug_report'
                      ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🐞 خطأ برمجي (Bug)
                </button>

                <button
                  type="button"
                  onClick={() => setType('question_error')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                    type === 'question_error'
                      ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  ❓ خطأ في سؤال
                </button>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">عنوان المشكلة / السبب:</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: الإجابة في سؤال كاكاشي غير دقيقة، أو تعليق في الشات..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">التفاصيل والشرح:</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="اكتب كل التفاصيل التي تساعدنا في الوصول للمشكلة وحلها..."
                rows={4}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 resize-none"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{t('reportSubmit')}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
