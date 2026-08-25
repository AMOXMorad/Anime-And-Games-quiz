import React, { createContext, useContext, useState } from 'react';
import { Language } from '../types';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export const translations: Translations = {
  // Brand
  appName: { ar: 'AG Utopia', en: 'AG Utopia' },
  appTagline: { ar: 'يوتوبيا تحديات الأنمي والألعاب الكبرى', en: 'The Ultimate Anime & Games Quiz Universe' },
  
  // Navbar
  home: { ar: 'الرئيسية والعوالم', en: 'Worlds' },
  shop: { ar: 'المتجر', en: 'Store' },
  profile: { ar: 'بروفايلي', en: 'Profile' },
  friends: { ar: 'الأصدقاء', en: 'Friends' },
  suggestions: { ar: 'اقتراحات المجتمع', en: 'Suggestions' },
  adminPanel: { ar: 'لوحة التحكم', en: 'Admin Panel' },
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  register: { ar: 'إنشاء حساب', en: 'Sign Up' },
  guestMode: { ar: 'لعب كضيف', en: 'Play as Guest' },
  logout: { ar: 'خروج', en: 'Logout' },
  
  // Categories & Chaos
  allWorlds: { ar: 'كافة العوالم', en: 'All Worlds' },
  anime: { ar: 'أنمي', en: 'Anime' },
  games: { ar: 'ألعاب', en: 'Games' },
  chaosRealm: { ar: 'عالم الفوضى الكونية', en: 'The Chaos Realm' },
  chaosSubtitle: { ar: 'امزج كل الأنمي والألعاب في ساحة أسئلة موحدة لا ترحم', en: 'Blend all anime & games into one relentless arena' },
  chaosAll: { ar: 'الفوضى الشاملة (كل شيء)', en: 'Absolute Chaos (All)' },
  chaosAnimeOnly: { ar: 'كل عوالم الأنمي فقط', en: 'All Anime Worlds Only' },
  chaosGamesOnly: { ar: 'كل عوالم الألعاب فقط', en: 'All Games Worlds Only' },

  // Modes
  modeWhoAmI: { ar: 'من أنا؟ (خمن الشخصية)', en: 'Who Am I? (Deduction)' },
  modeWhoAmIDesc: { ar: 'تخمين استنتاجي ذكي؛ في الـ 1v1 كل لاعب يرى شخصية خصمه ويخمن شخصيته', en: 'Smart deduction; in 1v1 each player sees the opponent character and guesses their own' },
  modeTrivia: { ar: 'تريفيا العالم والشخصيات', en: 'World & Lore Trivia' },
  modeTriviaDesc: { ar: 'أسئلة اختيار من متعدد بمؤقت ونظام كومبو ومؤثرات حماسية', en: 'Timed 4-choice questions with combos and bonus multipliers' },
  modeTrueFalse: { ar: 'صح أم خطأ (بليتز)', en: 'True or False (Blitz)' },
  modeTrueFalseDesc: { ar: 'جولات سريعة تعتمد على سرعة البديهة والتركيز اللحظي', en: 'High-octane rapid-fire questions testing your lightning reflexes' },
  modeSuperChallenge: { ar: 'تحدي الـ Super (1v1 لايف)', en: 'Super Challenge (1v1 Live)' },
  modeSuperChallengeDesc: { ar: 'بطولة ملحمية متعددة الجولات ضد لاعبين أونلاين بنقاط السرعة والدقة', en: 'Multi-round championship against online rivals with speed and accuracy points' },

  // Difficulty
  difficulty: { ar: 'مستوى الصعوبة', en: 'Difficulty Level' },
  easy: { ar: 'سهل (مبتدئ)', en: 'Easy (Apprentice)' },
  medium: { ar: 'متوسط (أوتاكو/جيمر)', en: 'Medium (Challenger)' },
  hard: { ar: 'صعب (محنك أسطوري)', en: 'Hard (Hardcore Master)' },
  selectDifficulty: { ar: 'اختر مستوى الصعوبة', en: 'Select Difficulty' },
  startPlaying: { ar: 'ابدأ اللعب الآن', en: 'Start Playing' },

  // Super Challenge Matchmaking
  randomMatchmaking: { ar: 'بحث عن منافس عشوائي', en: 'Random Matchmaking' },
  privateRoom: { ar: 'غرفة خاصة (مع صديق)', en: 'Private Room (With Friend)' },
  createRoom: { ar: 'إنشاء غرفة جديدة', en: 'Create New Room' },
  joinRoom: { ar: 'الانضمام بكود الغرفة', en: 'Join by Room Code' },
  roomCode: { ar: 'كود الغرفة', en: 'Room Code' },
  enterRoomCode: { ar: 'أدخل كود الغرفة (مثال: NARUTO-88)', en: 'Enter Room Code (e.g., NARUTO-88)' },
  waitingForOpponent: { ar: 'جاري انتظار انضمام المنافس...', en: 'Waiting for opponent to join...' },
  matchFound: { ar: 'تم العثور على منافس! تبدأ المواجهة الآن!', en: 'Opponent Found! Battle begins!' },
  copyCode: { ar: 'نسخ الكود', en: 'Copy Code' },
  codeCopied: { ar: 'تم نسخ الكود!', en: 'Code Copied!' },

  // Shop & Inventory
  storeTitle: { ar: 'متجر يوتوبيا للجوائز والتخصيص', en: 'Utopia Rewards & Customization Store' },
  storeSubtitle: { ar: 'ميّز نفسك بصور بروفايل AI احترافية، إطارات متوهجة، تيجان ملكية، وألقاب أسطورية', en: 'Stand out with AI character avatars, glowing frames, royal tags, and legendary titles' },
  avatars: { ar: 'صور البروفايل (AI Art)', en: 'AI Profile Avatars' },
  frames: { ar: 'إطارات البروفايل', en: 'Avatar Frames' },
  tags: { ar: 'تيجان وشارات الاسم', en: 'Name Tags & Badges' },
  titles: { ar: 'الألقاب', en: 'Titles' },
  buyNow: { ar: 'شراء', en: 'Purchase' },
  owned: { ar: 'تمتلكه', en: 'Owned' },
  equipped: { ar: 'مُجهّز حالياً', en: 'Equipped' },
  equip: { ar: 'تجهيز', en: 'Equip' },
  coins: { ar: 'عملة يوتوبيا', en: 'Coins' },
  notEnoughCoins: { ar: 'رصيد العملات غير كافٍ!', en: 'Not enough coins!' },
  purchaseSuccess: { ar: 'تمت عملية الشراء والتجهيز بنجاح!', en: 'Purchase successful!' },

  // Profile & Showcases
  myProfile: { ar: 'الملف الشخصي والمقتنيات', en: 'Player Profile & Showcase' },
  activeFrame: { ar: 'الإطار المجهز', en: 'Active Frame' },
  showcaseTitles: { ar: 'معرض أفضل 5 ألقاب', en: 'Top 5 Titles Showcase' },
  showcaseTags: { ar: 'معرض أفضل 5 شارات وتيجان', en: 'Top 5 Tags Showcase' },
  showcaseFrames: { ar: 'معرض أفضل 5 إطارات', en: 'Top 5 Frames Showcase' },
  showcaseAvatars: { ar: 'معرض أفضل 5 صور بروفايل AI', en: 'Top 5 AI Avatars Showcase' },
  statsTitle: { ar: 'إحصائيات المعارك', en: 'Battle Statistics' },
  winRate: { ar: 'نسبة الفوز', en: 'Win Rate' },
  totalMatches: { ar: 'إجمالي المباريات', en: 'Total Matches' },
  wins: { ar: 'مرات الفوز', en: 'Victories' },
  correctAnswers: { ar: 'الإجابات الصحيحة', en: 'Correct Answers' },
  userTag: { ar: 'معرف اللاعب الفريد', en: 'Unique Player Tag' },

  // Friends & Chat
  friendsList: { ar: 'قائمة الأصدقاء', en: 'Friends List' },
  friendRequests: { ar: 'طلبات الصداقة', en: 'Friend Requests' },
  searchPlayer: { ar: 'ابحث باسم اللاعب أو التاغ (مثل: Naruto#1042)', en: 'Search player name or tag (e.g. Naruto#1042)' },
  sendRequest: { ar: 'إرسال طلب', en: 'Send Request' },
  accept: { ar: 'قبول', en: 'Accept' },
  decline: { ar: 'رفض', en: 'Decline' },
  online: { ar: 'متصل الآن', en: 'Online' },
  offline: { ar: 'غير متصل', en: 'Offline' },
  inMatch: { ar: 'في مواجهة', en: 'In Match' },
  directChat: { ar: 'الشات المباشر', en: 'Direct Chat' },
  chatRetentionNotice: { ar: '💡 ملاحظة: يتم حذف رسائل الشات تلقائياً بعد 3 أيام للحفاظ على سرعة قاعدة البيانات.', en: '💡 Note: Messages are automatically cleared after 3 days to keep the database optimal.' },
  typeMessage: { ar: 'اكتب رسالتك هنا...', en: 'Type your message here...' },
  send: { ar: 'إرسال', en: 'Send' },
  quickChallenge: { ar: 'تحدي سريع 1v1', en: 'Quick 1v1 Challenge' },

  // Notifications & Gifts
  notifications: { ar: 'صندوق الإشعارات والجوائز', en: 'Notifications & Gifts Inbox' },
  noNotifications: { ar: 'لا توجد إشعارات جديدة حالياً', en: 'No notifications at this moment' },
  claimGift: { ar: '🎁 استلام المكافأة الآن', en: '🎁 Claim Reward Now' },
  giftClaimed: { ar: 'تم استلام الجائزة بنجاح!', en: 'Reward Claimed Successfully!' },

  // Suggestions & Reports
  communitySuggestions: { ar: 'اقتراحات وأفكار اللاعبين', en: 'Community Ideas & Suggestions' },
  submitSuggestion: { ar: 'تقديم فكرة / اقتراح جديد', en: 'Submit New Idea' },
  suggestionTitle: { ar: 'عنوان الاقتراح', en: 'Suggestion Title' },
  suggestionCategory: { ar: 'التصنيف', en: 'Category' },
  suggestionDetails: { ar: 'تفاصيل الفكرة', en: 'Details of your idea' },
  upvote: { ar: 'تصويت', en: 'Upvote' },
  reportTitle: { ar: 'مركز البلاغات والدعم', en: 'Reporting & Support' },
  reportPlayer: { ar: 'إبلاغ عن لاعب', en: 'Report Player' },
  reportBug: { ar: 'إبلاغ عن خطأ في اللعبة أو السؤال', en: 'Report Bug / Question' },
  reportReason: { ar: 'سبب البلاغ', en: 'Reason' },
  reportSubmit: { ar: 'إرسال البلاغ', en: 'Submit Report' },
  reportSubmitted: { ar: 'تم إرسال البلاغ بنجاح للإدارة.', en: 'Report submitted to Admins.' },

  // In-Game
  question: { ar: 'السؤال', en: 'Question' },
  round: { ar: 'الجولة', en: 'Round' },
  score: { ar: 'النقاط', en: 'Score' },
  cluesRemaining: { ar: 'التلميحات المتبقية', en: 'Remaining Clues' },
  unlockClue: { ar: 'فتح تلميح جديد', en: 'Unlock Next Clue' },
  guessCharacter: { ar: 'تخمين الشخصية', en: 'Guess Character' },
  correct: { ar: 'إجابة صحيحة!', en: 'Correct Answer!' },
  wrong: { ar: 'إجابة خاطئة!', en: 'Wrong Answer!' },
  timeUp: { ar: 'انتهى الوقت!', en: 'Time is Up!' },
  explanation: { ar: 'توضيح ومعلومة:', en: 'Explanation:' },
  nextQuestion: { ar: 'السؤال التالي', en: 'Next Question' },
  gameOver: { ar: 'انتهى التحدي!', en: 'Challenge Finished!' },
  victory: { ar: '🎉 انتصار ساحق!', en: '🎉 Victory!' },
  defeat: { ar: 'هزيمة! حظ أوفر في المرة القادمة', en: 'Defeat! Better luck next time' },
  earnedRewards: { ar: 'المكافآت المكتسبة', en: 'Rewards Earned' },
  xpGained: { ar: 'نقاط الخبرة XP', en: 'XP Gained' },
  coinsGained: { ar: 'عملات يوتوبيا', en: 'Coins Gained' },
  levelUp: { ar: '🚀 ترقية مستوى جديدة!', en: '🚀 Level Up!' }
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ar');

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    if (newLang === 'ar') {
      document.body.classList.remove('font-gaming');
      document.body.classList.add('font-arabic');
    } else {
      document.body.classList.remove('font-arabic');
      document.body.classList.add('font-gaming');
    }
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][lang] || key;
    }
    return key;
  };

  const isRtl = lang === 'ar';

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRtl }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
