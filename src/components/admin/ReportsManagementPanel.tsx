import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { sounds } from '../../lib/sound';
import { Report } from '../../types';
import { 
  Bug, 
  HelpCircle, 
  UserX, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Coins, 
  Gift, 
  Search, 
  AlertTriangle, 
  MessageSquare, 
  Filter,
  Check,
  X
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  open: { label: 'قيد الانتظار ⏳', bg: 'bg-amber-950/60 border-amber-500/40', text: 'text-amber-400', icon: <Clock className="w-3.5 h-3.5" /> },
  investigating: { label: 'جاري الفحص 🔍', bg: 'bg-sky-950/60 border-sky-500/40', text: 'text-sky-400', icon: <Search className="w-3.5 h-3.5" /> },
  resolved: { label: 'تم الحل والتنفيذ ✅', bg: 'bg-emerald-950/60 border-emerald-500/40', text: 'text-emerald-400', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  dismissed: { label: 'تم التجاهل ❌', bg: 'bg-slate-900 border-slate-700', text: 'text-slate-400', icon: <X className="w-3.5 h-3.5" /> }
};

export const ReportsManagementPanel: React.FC = () => {
  const { reports, adminUpdateReportStatus, adminDeleteReport } = useSocial();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reward Modal State
  const [rewardingReport, setRewardingReport] = useState<Report | null>(null);
  const [rewardAmount, setRewardAmount] = useState<number>(200);
  const [rewardNote, setRewardNote] = useState<string>('شكراً لك على الإبلاغ ومساعدتنا في تحسين يوتوبيا!');
  const [rewardSuccessMsg, setRewardSuccessMsg] = useState<string | null>(null);

  // Admin Note Editor
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const filteredReports = reports.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDetails = r.details.toLowerCase().includes(q);
      const matchReporter = r.reporter_profile?.username.toLowerCase().includes(q) || r.reporter_id.includes(q);
      if (!matchTitle && !matchDetails && !matchReporter) return false;
    }
    return true;
  });

  const pendingCount = reports.filter(r => r.status === 'open' || r.status === 'investigating').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  const handleGrantReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardingReport) return;

    adminUpdateReportStatus(
      rewardingReport.id,
      'resolved',
      rewardNote,
      rewardAmount
    );

    setRewardSuccessMsg(`🎉 تم إرسال ${rewardAmount} كوينز للاعب بنجاح مع رسالة الشكر!`);
    setTimeout(() => {
      setRewardSuccessMsg(null);
      setRewardingReport(null);
    }, 1800);
  };

  const handleSaveNote = (reportId: string, currentStatus: any) => {
    adminUpdateReportStatus(reportId, currentStatus, noteText.trim());
    setEditingNoteId(null);
    setNoteText('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-bold">إجمالي البلاغات</span>
            <span className="text-xl font-black text-white">{reports.length} بلاغ</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-bold">قيد الفحص والمراجعة</span>
            <span className="text-xl font-black text-amber-400">{pendingCount} معلق</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-bold">تم حلها وإغلاقها</span>
            <span className="text-xl font-black text-emerald-400">{resolvedCount} تم الحل</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث في عنوان البلاغ، التفاصيل، أو اسم اللاعب..."
            className="w-full ps-9 pe-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-rose-500"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold outline-none cursor-pointer"
        >
          <option value="all">كل أنواع البلاغات</option>
          <option value="bug_report">🐞 أخطاء برمجية (Bugs)</option>
          <option value="question_error">❓ أخطاء في الأسئلة والتحديات</option>
          <option value="player_report">👤 إبلاغ عن سلوك لاعب</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold outline-none cursor-pointer"
        >
          <option value="all">كل الحالات</option>
          <option value="open">قيد الانتظار ⏳</option>
          <option value="investigating">جاري الفحص 🔍</option>
          <option value="resolved">تم الحل ✅</option>
          <option value="dismissed">تم التجاهل ❌</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">صندوق البلاغات نظيف! لا توجد شكاوى مطابقة</h3>
            <p className="text-xs text-slate-500 mt-1">أي بلاغ يرسله اللاعبون من زر الفوتر سيظهر هنا فوراً بالريل تايم.</p>
          </div>
        ) : (
          filteredReports.map(rep => {
            const statusInfo = STATUS_MAP[rep.status] || STATUS_MAP.open;

            return (
              <div
                key={rep.id}
                className={`p-5 rounded-2xl border transition-all ${
                  rep.status === 'open'
                    ? 'bg-slate-900/95 border-rose-500/40 shadow-lg ring-1 ring-rose-500/20'
                    : rep.status === 'investigating'
                    ? 'bg-slate-900/90 border-sky-500/40 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 opacity-90'
                }`}
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {/* Type Tag */}
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1">
                      {rep.type === 'bug_report' ? (
                        <>
                          <Bug className="w-3 h-3 text-rose-400" />
                          <span>خطأ برمجي (Bug)</span>
                        </>
                      ) : rep.type === 'question_error' ? (
                        <>
                          <HelpCircle className="w-3 h-3 text-amber-400" />
                          <span>خطأ في سؤال / إجابة</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3 text-purple-400" />
                          <span>إبلاغ عن لاعب</span>
                        </>
                      )}
                    </span>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1 ${statusInfo.bg} ${statusInfo.text}`}>
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </span>

                    {rep.reward_coins && (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        <span>تمت مكافأته بـ {rep.reward_coins} كوينز</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>المرسل: <strong className="text-cyan-400 font-bold">{rep.reporter_profile?.username || rep.reporter_id}</strong></span>
                    <span>•</span>
                    <span>{new Date(rep.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>

                {/* Title & Details */}
                <h4 className="text-sm font-black text-white mb-1.5 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{rep.title}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 whitespace-pre-line mb-3">
                  {rep.details}
                </p>

                {/* Admin Note if present */}
                {rep.admin_note && (
                  <div className="mb-3 p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-[11px] text-purple-200">
                    <span className="font-bold text-amber-400 block mb-0.5">ملاحظة الأدمن:</span>
                    <span>{rep.admin_note}</span>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-bold">تغيير الحالة:</span>
                    <select
                      value={rep.status}
                      onChange={e => adminUpdateReportStatus(rep.id, e.target.value as any)}
                      className="py-1 px-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="open">قيد الانتظار ⏳</option>
                      <option value="investigating">جاري الفحص 🔍</option>
                      <option value="resolved">تم الحل ✅</option>
                      <option value="dismissed">تجاهل ❌</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Reward Reporter */}
                    {rep.reporter_id && rep.reporter_id !== 'anon' && (
                      <button
                        type="button"
                        onClick={() => {
                          setRewardingReport(rep);
                          sounds.playClick();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>مكافأة اللاعب بالكوينز</span>
                      </button>
                    )}

                    {/* Note editor toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(editingNoteId === rep.id ? null : rep.id);
                        setNoteText(rep.admin_note || '');
                      }}
                      className="p-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 transition-colors"
                      title="إضافة ملاحظة إدارية داخلية"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('هل تريد حذف هذا البلاغ نهائياً؟')) {
                          adminDeleteReport(rep.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/40 text-rose-300 transition-colors"
                      title="حذف البلاغ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Note Editor */}
                {editingNoteId === rep.id && (
                  <div className="mt-3 p-3 rounded-xl bg-purple-950/90 border border-purple-500/50 animate-fadeIn">
                    <input
                      type="text"
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="أدخل ملاحظتك هنا (مثل: تم تعديل السؤال في شيت الإكسيل)..."
                      className="w-full p-2 rounded-lg bg-black/80 border border-purple-500/40 text-white text-xs outline-none mb-2"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNote(rep.id, rep.status)}
                        className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg shadow-md"
                      >
                        حفظ الملاحظة
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* REWARD REPORTER MODAL */}
      {rewardingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setRewardingReport(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">منح مكافأة كوينز للمُبلغ 🎁</h3>
                <p className="text-xs text-slate-400">اللاعب: {rewardingReport.reporter_profile?.username || rewardingReport.reporter_id}</p>
              </div>
            </div>

            {rewardSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-black text-center animate-fadeIn">
                {rewardSuccessMsg}
              </div>
            )}

            <form onSubmit={handleGrantReward} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">قيمة المكافأة (كوينز):</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[100, 250, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRewardAmount(amt)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        rewardAmount === amt
                          ? 'bg-amber-500 text-black border-amber-400 font-black'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {amt} 🪙
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={rewardAmount}
                  onChange={e => setRewardAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-black text-xs outline-none"
                  min={10}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رسالة الشكر المرفقة في صندوق إشعاراته:</label>
                <textarea
                  rows={3}
                  value={rewardNote}
                  onChange={e => setRewardNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRewardingReport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>إرسال المكافأة وإغلاق البلاغ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
