import React, { useState, useEffect } from 'react';
import { useI18n } from '../../lib/i18n';
import { sounds } from '../../lib/sound';
import { World, WorldType, Character, TriviaQuestion, TrueFalseQuestion } from '../../types';
import { saveCustomWorld, deleteCustomWorld, getCustomWorlds, clearAllCustomWorlds, BUILT_IN_WORLDS } from '../../data/worlds';
import { downloadWorldExcelTemplate, parseWorldExcelFile, ParsedExcelWorldData } from '../../lib/excelWorldHelper';
import { compressImage } from '../../lib/imageCompressor';
import { isSupabaseConfigured, getSupabaseAnonKey, setCustomSupabaseKey } from '../../lib/supabase';
import { 
  Globe, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Film, 
  Gamepad2, 
  Shield, 
  Palette, 
  Check,
  Eye,
  ArrowRight,
  Layers,
  HelpCircle,
  X,
  Loader2,
  Cloud,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WorldBuilderPanel: React.FC = () => {
  const { lang, t } = useI18n();

  // Excel template name input
  const [templatePrefix, setTemplatePrefix] = useState<string>('MyNewWorld');

  // Excel Upload & Parsed Data State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedExcelWorldData | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Uploaded Images map (filename -> dataUrl)
  const [uploadedImages, setUploadedImages] = useState<Map<string, string>>(new Map());
  const [isCompressingImages, setIsCompressingImages] = useState<boolean>(false);
  const [compressProgress, setCompressProgress] = useState<{ current: number; total: number } | null>(null);

  // World Meta Form State
  const [worldCategory, setWorldCategory] = useState<WorldType>('anime');
  const [worldId, setWorldId] = useState<string>('');
  const [nameAr, setNameAr] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [taglineAr, setTaglineAr] = useState<string>('');
  const [taglineEn, setTaglineEn] = useState<string>('');
  const [descAr, setDescAr] = useState<string>('');
  const [descEn, setDescEn] = useState<string>('');
  const [icon, setIcon] = useState<string>('⚔️');
  const [themeColor, setThemeColor] = useState<string>('#06b6d4');
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Status feedback
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [activeCustomWorlds, setActiveCustomWorlds] = useState<World[]>(() => getCustomWorlds());
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>(() => {
    const k = getSupabaseAnonKey();
    return k.startsWith('eyJ') && !k.includes('dummy') ? k : '';
  });
  const [isCloudConfigured, setIsCloudConfigured] = useState<boolean>(() => isSupabaseConfigured());
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // Keep active custom worlds state strictly in sync with storage updates
  useEffect(() => {
    const handleSync = () => {
      setActiveCustomWorlds(getCustomWorlds());
      setIsCloudConfigured(isSupabaseConfigured());
    };
    window.addEventListener('ag_utopia_worlds_updated', handleSync);
    window.addEventListener('ag_utopia_supabase_key_updated', handleSync);
    return () => {
      window.removeEventListener('ag_utopia_worlds_updated', handleSync);
      window.removeEventListener('ag_utopia_supabase_key_updated', handleSync);
    };
  }, []);

  const handleSaveSupabaseKey = () => {
    const cleanKey = supabaseKeyInput.trim();
    if (!cleanKey.startsWith('eyJ')) {
      alert('الرجاء إدخال Anon Key صحيح من Supabase (يبدأ بـ eyJ...)');
      return;
    }
    setCustomSupabaseKey(cleanKey);
    setIsCloudConfigured(true);
    setShowKeyModal(false);
    sounds.playVictory();
    alert('🎉 تم تفعيل المزامنة السحابية بنجاح! سيتم الآن بث ومزامنة جميع العوالم لجميع هواتف وأجهزة اللاعبين.');
  };

  // Step Tracker
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Handle Download Template
  const handleDownloadTemplate = () => {
    sounds.playClick();
    const cleanPrefix = templatePrefix.trim().replace(/[^a-zA-Z0-9]/g, '') || 'CustomWorld';
    downloadWorldExcelTemplate(cleanPrefix);
  };

  // Handle Excel File Selection
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);
    setExcelFile(file);

    try {
      const data = await parseWorldExcelFile(file);
      if (data.characters.length === 0 && data.triviaQuestions.length === 0 && data.trueFalseQuestions.length === 0) {
        throw new Error('لم يتم العثور على بيانات شخصيات أو أسئلة صالحة في ملف الإكسيل المرفوع.');
      }

      setParsedData(data);
      sounds.playVictory();

      // Auto-suggest world info if empty
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/ag_utopia_world_template_/i, '');
      if (!nameEn) setNameEn(baseName);
      if (!worldId) setWorldId(baseName.toLowerCase().replace(/[^a-z0-9]/g, '_'));

      setCurrentStep(2);
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || 'حدث خطأ أثناء قراءة ملف الإكسيل.');
      sounds.playWrong();
    } finally {
      setIsParsing(false);
    }
  };

  // Handle Multi-Images Upload with smart auto-compression
  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsCompressingImages(true);
    setCompressProgress({ current: 0, total: fileList.length });

    const newMap = new Map(uploadedImages);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const compressed = await compressImage(file, 400, 400, 0.85);
        newMap.set(file.name.toLowerCase().trim(), compressed);
        const withoutExt = file.name.replace(/\.[^/.]+$/, '').toLowerCase().trim();
        newMap.set(withoutExt, compressed);
      } catch (err) {
        console.error(`Failed compressing ${file.name}`, err);
      }
      setCompressProgress({ current: i + 1, total: fileList.length });
    }

    setUploadedImages(new Map(newMap));
    setIsCompressingImages(false);
    setCompressProgress(null);
    sounds.playClaim();
  };

  // Handle World Banner Image with compression
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1280, 720, 0.85);
      setBannerPreview(compressed);
      setBannerUrl(compressed);
      sounds.playClick();
    } catch (err) {
      console.error('Failed to compress banner:', err);
    }
  };

  // Bind character avatar: lookup uploaded map, or URL, or fallback
  const getCharacterAvatar = (char: Character, index: number): string => {
    const raw = (char.avatar || '').toLowerCase().trim();
    if (uploadedImages.has(raw)) {
      return uploadedImages.get(raw)!;
    }
    const withoutExt = raw.replace(/\.[^/.]+$/, '');
    if (uploadedImages.has(withoutExt)) {
      return uploadedImages.get(withoutExt)!;
    }
    // Also try matching by character index (e.g. 1.png, 2.png or 1, 2)
    if (uploadedImages.has(`${index + 1}`)) {
      return uploadedImages.get(`${index + 1}`)!;
    }
    if (uploadedImages.has(`image_${index + 1}`)) {
      return uploadedImages.get(`image_${index + 1}`)!;
    }
    if (char.avatar && (char.avatar.startsWith('http') || char.avatar.startsWith('data:'))) {
      return char.avatar;
    }
    return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300';
  };

  // Save and Publish World
  const handleSaveAndPublish = async () => {
    if (!nameAr.trim() || !nameEn.trim()) {
      setFeedback({ success: false, message: 'يرجى إدخال اسم العالم بالعربية والإنجليزية.' });
      sounds.playWrong();
      return;
    }

    if (!parsedData || parsedData.characters.length === 0) {
      setFeedback({ success: false, message: 'يجب رفع ملف إكسيل يحتوي على شخصيات وأسئلة.' });
      sounds.playWrong();
      return;
    }

    const finalWorldId = (worldId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') || nameEn.toLowerCase().replace(/[^a-z0-9_]/g, '_')).slice(0, 32);

    // Finalize character avatars from the bound images
    const finalCharacters: Character[] = parsedData.characters.map((c, idx) => ({
      ...c,
      id: `${finalWorldId}_char_${idx + 1}_${c.id}`,
      avatar: getCharacterAvatar(c, idx)
    }));

    // Finalize Trivia
    const finalTrivia: TriviaQuestion[] = parsedData.triviaQuestions.map((q, idx) => ({
      ...q,
      id: `${finalWorldId}_triv_${idx + 1}`
    }));

    // Finalize True/False
    const finalTF: TrueFalseQuestion[] = parsedData.trueFalseQuestions.map((q, idx) => ({
      ...q,
      id: `${finalWorldId}_tf_${idx + 1}`
    }));

    const newWorld: World = {
      id: finalWorldId,
      name: { ar: nameAr.trim(), en: nameEn.trim() },
      category: worldCategory,
      tagline: {
        ar: taglineAr.trim() || `عالم المغامرات والتحديات في ${nameAr}`,
        en: taglineEn.trim() || `The epic world of ${nameEn}`
      },
      description: {
        ar: descAr.trim() || `خض أشرس التحديات في عالم ${nameAr} وتعرف على أسرار شخصياته الأسطورية.`,
        en: descEn.trim() || `Conquer trivia and deduction duels across the legendary realm of ${nameEn}.`
      },
      icon: icon || '⚔️',
      banner: bannerUrl || bannerPreview || (finalCharacters.length > 0 && finalCharacters[0].avatar.startsWith('data:') ? finalCharacters[0].avatar : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200'),
      themeColor: themeColor || '#06b6d4',
      accentGlow: `${themeColor}66`,
      characters: finalCharacters,
      triviaQuestions: finalTrivia,
      trueFalseQuestions: finalTF,
      isCustom: true,
      created_at: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      await saveCustomWorld(newWorld);
      setActiveCustomWorlds(getCustomWorlds());
      sounds.playVictory();
      confetti({ particleCount: 150, spread: 100 });

      setFeedback({
        success: true,
        message: `🎉 تم بنجاح إنشاء ونشر وحفظ عالم "${nameAr}" (${finalWorldId}) بمجموع ${finalCharacters.length} شخصية و ${finalTrivia.length + finalTF.length} سؤال! أصبح متاحاً الآن لكافة الأجهزة واللاعبين فوراً.`
      });

      // Reset Form
      setCurrentStep(4);
    } catch (err: any) {
      console.error(err);
      setFeedback({
        success: false,
        message: `فشل حفظ العالم: ${err.message || 'حدث خطأ غير متوقع'}`
      });
      sounds.playWrong();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorld = async (id: string) => {
    if (confirm(`هل أنت متأكد من حذف هذا العالم (${id}) نهائياً؟`)) {
      await deleteCustomWorld(id);
      setActiveCustomWorlds(getCustomWorlds());
      sounds.playWrong();
    }
  };

  const handleClearAllWorlds = async () => {
    if (confirm('⚠️ تحذير: هل أنت متأكد من تصفير وتنظيف جميع العوالم المخصصة من السحابة والذاكرة المحلية بالكامل؟')) {
      await clearAllCustomWorlds();
      setActiveCustomWorlds(getCustomWorlds());
      sounds.playWrong();
      setFeedback({
        success: true,
        message: '🧹 تم تنظيف وتصفير قاعدة البيانات بنجاح! يمكنك الآن البدء برفع عوالمك الجديدة من الصفر.'
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-start">
      
      {/* Top Banner & Guide */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-black to-cyan-950/80 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-black mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>نظام بناء العوالم والمحتوى بالأكسيل (Admin World Studio)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            أنشئ عوالم جديدة وادمجها في الموقع فوراً بدون كتابة سطر كود واحد!
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            قم بتنزيل قالب الإكسيل الجاهز، املأ الشخصيات وتلميحاتها والأسئلة مع تحديد أسماء الصور (مثل <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300">Titan_1.png</code>)، ثم ارفع الشيت ومجلد الصور وسيقوم النظام بتوليد العالم ونشره في ثوانٍ.
          </p>

          {/* Quick Template Download Box */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                اسم العالم بالإنجليزية للنموذج (مثال: AttackOnTitan / SpiderMan / EldenRing):
              </label>
              <input
                type="text"
                value={templatePrefix}
                onChange={(e) => setTemplatePrefix(e.target.value)}
                placeholder="AttackOnTitan"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
              />
            </div>

            <button
              onClick={handleDownloadTemplate}
              className="w-full sm:w-auto px-6 py-2.5 mt-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل التيمب (Excel Template)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Sync Status Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        isCloudConfigured 
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
          : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isCloudConfigured 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
              : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
          }`}>
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-xs sm:text-sm flex items-center gap-2">
              <span>{isCloudConfigured ? '🟢 المزامنة السحابية الفورية نشطة (Supabase Cloud Sync Active)' : '🟡 المزامنة السحابية غير مفعّلة (وضع الحفظ المحلي)'}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isCloudConfigured 
                ? 'أي عالم يتم إنشاؤه يتم نشره تلقائياً لجميع المستخدمين على كافة الهواتف والأجهزة فوراً.' 
                : 'يتم حفظ العوالم على هذا المتصفح فقط. لتظهر العوالم لهواتف أصدقائك وكافة اللاعبين، أدخل Anon Key من Supabase.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowKeyModal(true)}
          className={`px-4 py-2 rounded-xl text-xs font-black border flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
            isCloudConfigured 
              ? 'bg-slate-900 border-slate-700 hover:border-emerald-400 text-slate-300' 
              : 'bg-amber-600 hover:bg-amber-500 border-amber-400 text-white shadow-lg animate-pulse'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>{isCloudConfigured ? 'تعديل المفتاح' : 'إدخال مفتاح السحابة (Cloud Key)'}</span>
        </button>
      </div>

      {/* Supabase Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-black text-white text-base">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <span>إعداد مفتاح المزامنة السحابية (Supabase Cloud Key)</span>
              </div>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              لجعل العوالم التي تنشئها تظهر فوراً لجميع أصدقائك واللاعبين على هواتفهم وأجهزتهم، الصق الـ <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300">anon public key</code> من لوحة تحكم مشروعك في Supabase (Settings &rarr; API &rarr; Project API keys &rarr; anon public):
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Supabase Anon Public Key (يبدأ بـ eyJhbGci...):
              </label>
              <textarea
                rows={3}
                value={supabaseKeyInput}
                onChange={(e) => setSupabaseKeyInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl p-3 text-xs font-mono text-slate-200 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveSupabaseKey}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-black shadow-lg"
              >
                حفظ وتفعيل المزامنة السحابية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps Header */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
        {[
          { step: 1, title: '1. رفع الإكسيل' },
          { step: 2, title: '2. مطابقة الصور' },
          { step: 3, title: '3. معلومات العالم' },
          { step: 4, title: '4. المراجعة والنشر' }
        ].map(s => (
          <button
            key={s.step}
            onClick={() => setCurrentStep(s.step)}
            className={`py-3 px-2 rounded-2xl border transition-all cursor-pointer ${
              currentStep === s.step
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md font-black'
                : currentStep > s.step
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-500'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* STEP 1: Excel File Upload */}
      {currentStep === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-base font-black text-white">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>الخطوة 1: رفع ملف الإكسيل المكتمل (.xlsx / .xls / .csv)</span>
          </div>

          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-3xl p-8 text-center transition-all bg-slate-950/50">
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelUpload}
              className="hidden"
            />
            <label htmlFor="excel-upload" className="cursor-pointer block">
              <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-3 animate-bounce" />
              <span className="block text-sm font-black text-white mb-1">
                اضغط هنا لاختيار ملف الإكسيل أو اسحبه وأفلته
              </span>
              <span className="block text-xs text-slate-400">
                يدعم صفحات: Characters, Trivia, TrueFalse
              </span>
            </label>
          </div>

          {isParsing && (
            <div className="text-center py-4 text-cyan-400 font-bold text-xs animate-pulse">
              ⏳ جاري تحليل وقراءة جداول وشخصيات الإكسيل...
            </div>
          )}

          {parseError && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {parsedData && (
            <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs font-bold space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم استخراج المحتوى بنجاح من: {excelFile?.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-black/60 p-3 rounded-xl border border-emerald-500/20 text-center">
                  <span className="block text-slate-400 text-[10px]">الشخصيات المستخرجة</span>
                  <span className="text-base font-black text-white">{parsedData.characters.length}</span>
                </div>
                <div className="bg-black/60 p-3 rounded-xl border border-emerald-500/20 text-center">
                  <span className="block text-slate-400 text-[10px]">أسئلة الترايفيا العامة</span>
                  <span className="text-base font-black text-white">{parsedData.triviaQuestions.length}</span>
                </div>
                <div className="bg-black/60 p-3 rounded-xl border border-emerald-500/20 text-center">
                  <span className="block text-slate-400 text-[10px]">أسئلة صح / خطأ</span>
                  <span className="text-base font-black text-white">{parsedData.trueFalseQuestions.length}</span>
                </div>
              </div>
              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <span>المتابعة للخطوة 2 (مطابقة الصور)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Multi-Image Matching */}
      {currentStep === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-black text-white">
              <ImageIcon className="w-5 h-5 text-purple-400" />
              <span>الخطوة 2: رفع صور الشخصيات (Multi-Image Binder)</span>
            </div>
            <span className="text-xs font-bold text-slate-400">
              تم تحميل {uploadedImages.size} صورة
            </span>
          </div>

          <p className="text-xs text-slate-300">
            حدد جميع ملفات الصور دفعة واحدة من جهازك. سيقوم النظام بربط الصورة تلقائياً بالشخصية إذا كان اسمها يطابق اسم الصورة المكتوب في الشيت.
          </p>

          <div className="border border-slate-700 bg-slate-950 p-6 rounded-2xl text-center">
            <input
              type="file"
              id="multi-img-upload"
              multiple
              accept="image/*"
              onChange={handleMultiImageUpload}
              className="hidden"
              disabled={isCompressingImages}
            />
            <label 
              htmlFor="multi-img-upload" 
              className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3 text-white text-xs font-black rounded-xl shadow-lg transition-all ${
                isCompressingImages ? 'bg-purple-800 cursor-not-allowed opacity-80' : 'bg-purple-600 hover:bg-purple-500'
              }`}
            >
              {isCompressingImages ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري معالجة وضغط الصور ({compressProgress?.current || 0}/{compressProgress?.total || 0})...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>اختر ملفات الصور المتعددة من جهازك (Select Multiple Images)</span>
                </>
              )}
            </label>
          </div>

          {/* Characters Binding Status Grid */}
          {parsedData && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-300">حالة صور الشخصيات في العالم:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                {parsedData.characters.map((char, i) => {
                  const avatarSrc = getCharacterAvatar(char, i);
                  const isBound = uploadedImages.has((char.avatar || '').toLowerCase().trim()) || 
                                  uploadedImages.has((char.avatar || '').replace(/\.[^/.]+$/, '').toLowerCase().trim()) || 
                                  uploadedImages.has(`${i + 1}`) || 
                                  char.avatar?.startsWith('http') ||
                                  char.avatar?.startsWith('data:');
                  return (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                      <img
                        src={avatarSrc}
                        alt={char.name[lang]}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0 bg-slate-900"
                      />
                      <div className="overflow-hidden flex-1 text-xs">
                        <div className="font-bold text-white truncate">{char.name[lang]}</div>
                        <div className="text-[10px] text-slate-400 truncate">ملف: {char.avatar || `#${i + 1}`}</div>
                        <div className="mt-1">
                          {isBound ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> تم الربط
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                              ⚠️ صورة افتراضية
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              السابق
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <span>المتابعة للخطوة 3 (بيانات العالم والغلاف)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: World Metadata & Banner */}
      {currentStep === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-base font-black text-white">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>الخطوة 3: معلومات وهوية العالم وغلافه</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category Selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-2">
                التصنيف الرئيسي (Category):
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'anime', label: 'عالم الأنمي 🎬', icon: <Film className="w-4 h-4" /> },
                  { id: 'games', label: 'عالم الألعاب 🎮', icon: <Gamepad2 className="w-4 h-4" /> },
                  { id: 'superheroes', label: 'الأبطال الخارقين 🦸‍♂️', icon: <Shield className="w-4 h-4" /> }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setWorldCategory(cat.id as WorldType)}
                    className={`py-3 px-4 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      worldCategory === cat.id
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md ring-2 ring-cyan-400/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Names */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم العالم بالعربية *</label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: هجوم العمالقة (Attack on Titan)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">اسم العالم بالإنجليزية *</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => {
                  setNameEn(e.target.value);
                  if (!worldId) setWorldId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                }}
                placeholder="Attack on Titan"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-bold"
              />
            </div>

            {/* Unique ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">معرف العالم الفريد (World ID) *</label>
              <input
                type="text"
                value={worldId}
                onChange={(e) => setWorldId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                placeholder="attack_on_titan"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs font-mono text-cyan-400 outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">يُستخدم لسحب الأسئلة تلقائياً في عالم الفوضى الكونية.</span>
            </div>

            {/* Icon & Theme Color */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الأيقونة (إيموجي)</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="⚔️"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2 text-center text-base text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">لون السمة الرئيسي</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-9 h-9 rounded-xl bg-transparent cursor-pointer border border-slate-800"
                  />
                  <span className="text-xs font-mono text-slate-300">{themeColor}</span>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">الشعار القصير (Tagline - عربي)</label>
              <input
                type="text"
                value={taglineAr}
                onChange={(e) => setTaglineAr(e.target.value)}
                placeholder="عالم العمالقة والقتال من أجل الحرية"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">الشعار القصير (Tagline - إنجليزي)</label>
              <input
                type="text"
                value={taglineEn}
                onChange={(e) => setTaglineEn(e.target.value)}
                placeholder="Fight for freedom behind the walls"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2 text-xs text-white outline-none"
              />
            </div>

            {/* Banner Cover Upload */}
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                صورة غلاف / بانر العالم (World Cover Banner):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="border border-slate-700 bg-slate-950 p-4 rounded-2xl text-center">
                  <input
                    type="file"
                    id="banner-upload"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <label htmlFor="banner-upload" className="cursor-pointer block text-xs font-bold text-cyan-400 hover:text-cyan-300">
                    <Upload className="w-6 h-6 mx-auto mb-1" />
                    <span>رفع صورة الغلاف من الجهاز</span>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">أو أدخل رابط الصورة (URL) مباشرة:</label>
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => { setBannerUrl(e.target.value); setBannerPreview(e.target.value); }}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {bannerPreview && (
                <div className="mt-3 relative rounded-2xl overflow-hidden h-32 border border-slate-800">
                  <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-3">
                    <span className="text-white text-xs font-bold">معاينة غلاف العالم</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              السابق
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <span>المتابعة للمراجعة والحفظ النهائي</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Publish */}
      {currentStep === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-base font-black text-white">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>الخطوة 4: المراجعة والنشر الفوري</span>
          </div>

          {feedback && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              feedback.success ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200' : 'bg-rose-950/80 border border-rose-500 text-rose-200'
            }`}>
              {feedback.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Summary Card */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{icon}</span>
                <div>
                  <h3 className="text-xl font-black text-white">{nameAr || 'اسم العالم'}</h3>
                  <div className="text-xs text-cyan-400 font-mono">ID: {worldId || 'custom_world'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold">
                  {worldCategory === 'anime' ? 'أنمي 🎬' : worldCategory === 'games' ? 'ألعاب 🎮' : 'أبطال خارقين 🦸‍♂️'}
                </span>
                <span className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: themeColor }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-center">
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-400 block">شخصيات جاهزة</span>
                <span className="text-base font-black text-white">{parsedData?.characters.length || 0}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-400 block">أسئلة عامة (ترايفيا)</span>
                <span className="text-base font-black text-white">{parsedData?.triviaQuestions.length || 0}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-400 block">أسئلة صح / خطأ</span>
                <span className="text-base font-black text-white">{parsedData?.trueFalseQuestions.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              تعديل البيانات
            </button>

            <button
              onClick={handleSaveAndPublish}
              disabled={isSaving}
              className={`px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-sm rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2 transition-all ${
                isSaving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ والتثبيت في قاعدة البيانات...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                  <span>🚀 حفظ ونشر العالم في المنصة الآن</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Custom Worlds List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>العوالم المخصصة المنشورة في المنصة ({activeCustomWorlds.length})</span>
          </h3>

          <button
            onClick={handleClearAllWorlds}
            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="حذف وتصفير جميع العوالم من السحابة والذاكرة"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>تصفير وتنظيف قاعدة البيانات</span>
          </button>
        </div>

        {activeCustomWorlds.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            لا توجد عوالم مخصصة منشورة حالياً. استخدم النموذج بالأعلى لإنشاء أول عالم!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCustomWorlds.map(w => (
              <div key={w.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={w.banner} alt={w.name[lang]} className="w-16 h-12 rounded-xl object-cover flex-shrink-0" />
                  <div className="overflow-hidden text-xs">
                    <div className="font-bold text-white truncate flex items-center gap-1.5">
                      <span>{w.icon}</span>
                      <span>{w.name[lang]}</span>
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono">{w.id} • {w.category}</div>
                    <div className="text-[10px] text-slate-400">
                      {(w.characters || []).length} شخصية • {((w.triviaQuestions || (w as any).trivia_questions || []).length + ((w.trueFalseQuestions || (w as any).true_false_questions || []).length))} سؤال
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteWorld(w.id)}
                  className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200 border border-rose-600/30 transition-all flex-shrink-0"
                  title="حذف العالم"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
