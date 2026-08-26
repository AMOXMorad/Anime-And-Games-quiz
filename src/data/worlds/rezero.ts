import { World } from '../../types';

export const rezeroWorld: World = {
  id: 'rezero',
  name: {
    ar: 'ريزيرو: بدء الحياة في عالم آخر',
    en: 'Re:Zero - Starting Life in Another World'
  },
  category: 'anime',
  tagline: {
    ar: 'حلقة الموت المتكررة، لعنة الساحرات، والعهد الذي لا يموت',
    en: 'The loop of death, witch’s curse, and an immortal vow'
  },
  description: {
    ar: 'عالم مملكة لوغنيكا الساحر، حيث يواجه ناتسوكي سوبارو مصيراً قاسياً عبر قدرة العودة بالموت وسط صراع الساحرات وكهنة الخطيئة.',
    en: 'The Kingdom of Lugnica, where Subaru Natsuki defies cruel fate through Return by Death amidst Sin Archbishops and Witches.'
  },
  icon: '🍎',
  banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21355-f9SjOfEJMk5P.jpg',
  themeColor: '#8b5cf6',
  accentGlow: 'rgba(139, 92, 246, 0.45)',
  characters: [
    {
      id: 'subaru_natsuki',
      name: { ar: 'ناتسوكي سوبارو', en: 'Subaru Natsuki' },
      avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b88573-F8yMTK9GhnTA.png',
      gender: 'male',
      role: { ar: 'فارس إيميليا وبطل التحدي الأبدي', en: 'Emilia’s Knight & Lolimancer' },
      powerType: { ar: 'العودة بالموت (Return by Death) + سحر الظلال يين', en: 'Return by Death + Yin Magic + Invisible Providence' },
      affiliation: { ar: 'معسكر إيميليا (مملكة لوغنيكا)', en: 'Emilia Camp (Lugnica)' },
      quote: { ar: 'إذا كان التخلي عنك سينقذك، فسأرفض التخلي وسأنقذك بكل طريقة ممكنة!', en: 'If giving up will save you, I refuse to give up and I will save you no matter what!' },
      clues: {
        easy: [
          { ar: 'يرتدي دائماً بدلة رياضية (تراك سوت) برتقالية وسوداء', en: 'Always wears a black and orange tracksuit from the modern world' },
          { ar: 'يعود للحياة في نقطة حفظ زمنية محددة في كل مرة يموت فيها', en: 'Revives at a past checkpoint whenever he dies' }
        ],
        medium: [
          { ar: 'لا يستطيع إخبار أي شخص عن قدرته وإلا تُعتصر قلبه يد الظلال', en: 'Cannot speak of his power without the Shadow Hand squeezing his heart' },
          { ar: 'عقد اتفاقاً روحياً مع بياتريس لتصبح روحه الحامية', en: 'Formed a permanent spirit contract with Beatrice' }
        ],
        hard: [
          { ar: 'استوعب عامل الخطيئة (Witch Factor) للكسل بعد هزيمة بيتلغيوس', en: 'Absorbed the Witch Factor of Sloth after defeating Petelgeuse' },
          { ar: 'تجاوز اختبارات الملاذ (Sanctuary) وواجه ساحرات الخطيئة السبع في حفلة الشاي', en: 'Passed the Sanctuary trials and confronted the 7 Witches of Sin' }
        ]
      }
    },
    {
      id: 'emilia',
      name: { ar: 'إيميليا (أميرة الصقيع الفضي)', en: 'Emilia' },
      avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b88572-IzTwXEHSobRs.jpg',
      gender: 'female',
      role: { ar: 'مرشحة العرش الملكي ونصف الإلف الفضية', en: 'Royal Candidate & Silver Half-Elf' },
      powerType: { ar: 'سحر الجليد المطلق + التعاقد مع الروح العظمى باك', en: 'Ice Absolute Magic + Great Spirit Puck Contract' },
      affiliation: { ar: 'معسكر إيميليا (غابة إليور)', en: 'Emilia Camp (Elior Forest)' },
      quote: { ar: 'أنا لست ساحرة الحسد، اسمي إيميليا فقط!', en: 'I am not the Witch of Envy, my name is simply Emilia!' },
      clues: {
        easy: [
          { ar: 'نصف إلف بشعر فضي وعينين بنفسجيتين تشبه ساحرة الحسد ساتيلا', en: 'A half-elf with silver hair and purple eyes resembling Satella' },
          { ar: 'يرتدي تميمة خضراء تحتوي على الروح العظمى باك على هيئة قطة', en: 'Accompanied by the Great Spirit Puck who looks like a cat' }
        ],
        medium: [
          { ar: 'إحدى المرشحات الخمس لخلافة عرش مملكة لوغنيكا في الانتخابات الملكية', en: 'One of the five candidates in the Royal Selection of Lugnica' },
          { ar: 'استخدمت اسماً مستعاراً هو "ساتيلا" في أول لقاء لها مع سوبارو', en: 'Used the alias "Satella" when first meeting Subaru' }
        ],
        hard: [
          { ar: 'تسببت في تجميد غابة إليور بالكامل عندما كانت طفلة لإنقاذها من باندورا', en: 'Froze the entire Elior Forest as a child to protect it from Pandora' },
          { ar: 'ابنة فورتونا بالتبني وابنة شقيق غيفوس كاهن الكسل السابق', en: 'Adoptive daughter of Fortuna and niece of Geuse' }
        ]
      }
    },
    {
      id: 'rem',
      name: { ar: 'ريم (الخادمة الزرقاء)', en: 'Rem' },
      avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b88575-Ayu8UPDA8NS6.png',
      gender: 'female',
      role: { ar: 'خادمة قصر روزوال ومحاربة عشيرة الأوني', en: 'Roswaal Manor Head Maid & Oni Clan Warrior' },
      powerType: { ar: 'سحر الماء الشافي + قرن الأوني الموقظ + سلاح الصباح المرصع بالمسامير', en: 'Water Magic + Awakened Oni Horn + Morningstar Flail' },
      affiliation: { ar: 'قصر روزوال (معسكر إيميليا)', en: 'Roswaal Manor (Emilia Camp)' },
      quote: { ar: 'البدء من الصفر... لنبدأ من هنا، من الصفر يا سوبارو-كون!', en: 'Starting from Zero... let us start from here, from zero, Subaru-kun!' },
      clues: {
        easy: [
          { ar: 'تمتلك شعراً أزرق قصيراً وتوأمها ذات الشعر الوردي هي رام', en: 'Has short blue hair and her twin sister with pink hair is Ram' },
          { ar: 'ألقت خطاب "من الصفر" الشهير الذي أعاد الأمل لسوبارو في الحلقة 18', en: 'Gave the iconic "From Zero" speech restoring Subaru’s resolve' }
        ],
        medium: [
          { ar: 'تقاتل باستخدام سلاح ثقيل مرصع بالأشواك الحادة (Morningstar)', en: 'Fights wielding a spiked iron morningstar on a chain' },
          { ar: 'تمتلك قرناً واحداً فقط في جبهتها لأنها ولدت كتوأم في عشيرة الأوني', en: 'Possesses a single magical horn on her forehead as a twin' }
        ],
        hard: [
          { ar: 'تم التهام اسمها وذكرياتها من قبل كاهن الشراهة لي باتينكايتوس ودخلت في غيبوبة', en: 'Her name and memories were eaten by Ley Batenkaitos, putting her into a coma' },
          { ar: 'تخلصت من عقدة الذنب تجاه أختها رام بفضل تضحيات سوبارو في غابة الكلاب الشيطانية', en: 'Overcame her survivor guilt towards Ram through Subaru’s battle against Mabeasts' }
        ]
      }
    },
    {
      id: 'echidna',
      name: { ar: 'إيكيدنا (ساحرة الجشع)', en: 'Echidna' },
      avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b129330-ZUtYw4n7N0uH.png',
      gender: 'female',
      role: { ar: 'ساحرة الجشع وحارسة المعرفة المطلقة', en: 'Witch of Greed & Keeper of Infinite Knowledge' },
      powerType: { ar: 'سحر المعرفة والذكريات + التحكم في اختبارات الملاذ', en: 'Omniscient Knowledge Magic + Dream Realm Control' },
      affiliation: { ar: 'قلعة الأحلام (الملاذ)', en: 'Dream Citadel (The Sanctuary)' },
      quote: { ar: 'كل المعرفة في العالم، أريد معرفة كل شيء دون استثناء!', en: 'All the knowledge in the universe, I desire to know everything without exception!' },
      clues: {
        easy: [
          { ar: 'تستضيف سوبارو في حفلة شاي سريالية داخل عالم الأحلام', en: 'Hosts Subaru at surreal tea parties inside her dream dimension' },
          { ar: 'ترتدي فستاناً أسود وشعرها أبيض طويل ناصع مع رموش بيضاء', en: 'Dressed in a mourning black gown with long silver-white hair' }
        ],
        medium: [
          { ar: 'صانعة الروحين العظيمين بياتريس وباك ومبتكرة الملاذ', en: 'Creator of Great Spirits Beatrice and Puck and architect of the Sanctuary' },
          { ar: 'قدمت لسوبارو عقداً ليصبح رفيقها لاستغلال قدرة العودة بالموت لمعرفة كل الاحتمالات', en: 'Proposed a contract to Subaru to use Return by Death to witness all futures' }
        ],
        hard: [
          { ar: 'جسدها الحقيقي محفوظ في تابوت بلوري داخل قاعة اختبارات الملاذ', en: 'Her physical body is sealed within a crystal tomb inside the Sanctuary' },
          { ar: 'توفيت قبل 400 عام بعد أن ختمت التنين المقدس فولكانيكا', en: 'Died 400 years ago during the era of the Great Calamity' }
        ]
      }
    }
  ],
  triviaQuestions: [
    {
      id: 'rz_triv_1',
      difficulty: 'easy',
      question: { ar: 'ما هو الاسم الشهير لفاكهة التفاح في عاصمة مملكة لوغنيكا؟', en: 'What is apple fruit called in Lugnica?' },
      options: [{ ar: 'أبّـا (Appa)', en: 'Appa' }, { ar: 'رينغو', en: 'Ringo' }, { ar: 'مانا فروت', en: 'Mana Fruit' }, { ar: 'لوغو', en: 'Lugo' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_2',
      difficulty: 'medium',
      question: { ar: 'من هو قاطع الرؤوس وسيد السيف الذي قاد فرقة الفرسان لهزيمة الحوت الأبيض؟', en: 'Who is the Master Swordsman (Sword Demon) who avenged his wife against the White Whale?' },
      options: [{ ar: 'ويلهيلم فان أستريا', en: 'Wilhelm van Astrea' }, { ar: 'راينهارد', en: 'Reinhard' }, { ar: 'يوليوس', en: 'Julius' }, { ar: 'فيليكس', en: 'Felix' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_3',
      difficulty: 'hard',
      question: { ar: 'كم عدد الساحرات السبع اللاتي حضرن حفلة شاي إيكيدنا في الملاذ مع سوبارو؟', en: 'How many Witches of Sin appeared before Subaru at Echidna’s tea party?' },
      options: [{ ar: '7 ساحرات', en: '7 Witches' }, { ar: '5 ساحرات', en: '5 Witches' }, { ar: '4 ساحرات', en: '4 Witches' }, { ar: '3 ساحرات', en: '3 Witches' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_4',
      difficulty: 'easy',
      question: { ar: 'ما هو اسم الروح العظمى التي ترافق إيميليا وتبدو مثل قط رمادي؟', en: 'What is the name of the Great Spirit that accompanies Emilia as a gray cat?' },
      options: [{ ar: 'باك (Puck)', en: 'Puck' }, { ar: 'بياتريس', en: 'Beatrice' }, { ar: 'فولكانيكا', en: 'Volcanica' }, { ar: 'شاكولا', en: 'Chacula' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_5',
      difficulty: 'easy',
      question: { ar: 'ما هو لون شعر ريم ولون شعر أختها التوأم رام على الترتيب؟', en: 'What are the hair colors of Rem and Ram respectively?' },
      options: [{ ar: 'أزرق لريم، ووردي لرام', en: 'Blue for Rem, Pink for Ram' }, { ar: 'وردي لريم، وأزرق لرام', en: 'Pink for Rem, Blue for Ram' }, { ar: 'أخضر وأصفر', en: 'Green & Yellow' }, { ar: 'فضي وذهبي', en: 'Silver & Gold' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_6',
      difficulty: 'medium',
      question: { ar: 'من هو كاهن خطيئة الكسل في طائفة الساحرة الذي يتكلم بجملة "دماغي يرتعش"؟', en: 'Who is the Sin Archbishop of Sloth famous for "My brain trembles"?' },
      options: [{ ar: 'بيتلغيوس رومانيكوني', en: 'Petelgeuse Romanee-Conti' }, { ar: 'ريغولوس كورنياس', en: 'Regulus Corneas' }, { ar: 'لي باتينكايتوس', en: 'Ley Batenkaitos' }, { ar: 'سيريوس', en: 'Sirius' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_7',
      difficulty: 'medium',
      question: { ar: 'ما هو اللقب الأسطوري الذي يحمله الفارس راينهارد فان أستريا؟', en: 'What title is held by Reinhard van Astrea?' },
      options: [{ ar: 'قديس السيف', en: 'Sword Saint' }, { ar: 'فارس الملاذ', en: 'Knight of Sanctuary' }, { ar: 'سيد التنانين', en: 'Dragon Master' }, { ar: 'حاكم الظلال', en: 'Shadow Monarch' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_8',
      difficulty: 'hard',
      question: { ar: 'ما اسم الساحرة التي تسببت في الكارثة العظمى قبل 400 عام ومحبوسة في ختم الضريح؟', en: 'Which Witch caused the Great Calamity 400 years ago and is sealed away?' },
      options: [{ ar: 'ساتيلا', en: 'Satella' }, { ar: 'إيكيدنا', en: 'Echidna' }, { ar: 'كارميلا', en: 'Carmilla' }, { ar: 'مينيرفا', en: 'Minerva' }],
      correctIndex: 0,
      explanation: { ar: 'ساتيلا (ساحرة الحسد) دمرت نصف العالم قبل 400 عام.', en: 'Satella (Witch of Envy) caused the Great Calamity.' }
    },
    {
      id: 'rz_triv_9',
      difficulty: 'easy',
      question: { ar: 'من هي الطفلة الروحية التي تحرس المكتبة المحرمة في قصر روزوال؟', en: 'Who is the spirit girl guarding the Forbidden Library at Roswaal’s mansion?' },
      options: [{ ar: 'بياتريس', en: 'Beatrice' }, { ar: 'بيترا', en: 'Petra' }, { ar: 'فريدريكا', en: 'Frederica' }, { ar: 'إلسا', en: 'Elsa' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_10',
      difficulty: 'medium',
      question: { ar: 'ما هو السلاح الخفي القاتل واللقب الذي تشتهر به السفاحة إلسا غران هيرت؟', en: 'What is the signature title/killing style of assassin Elsa Granhiert?' },
      options: [{ ar: 'صائدة الأمعاء', en: 'Bowel Hunter' }, { ar: 'قاطعة الرؤوس', en: 'Decapitator' }, { ar: 'مجمدة القلوب', en: 'Heart Freezer' }, { ar: 'المسممة البطيئة', en: 'Slow Poisoner' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_11',
      difficulty: 'hard',
      question: { ar: 'ما هي الوحوش الشيطانية العظيمة الثلاثة التي صنعتها دافني ساحرة الشراهة؟', en: 'What are the Three Great Mabeasts created by Daphne?' },
      options: [{ ar: 'الحوت الأبيض، والأرنب العظيم، وثعبان كورغان الأسود', en: 'White Whale, Great Rabbit, Black Serpent' }, { ar: 'التنين، والذئب، والعقرب', en: 'Dragon, Wolf, Scorpion' }, { ar: 'القط، والنسر، والأسد', en: 'Cat, Eagle, Lion' }, { ar: 'الظلال، والأشباح، والموتى', en: 'Shadows, Ghosts, Undead' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_12',
      difficulty: 'easy',
      question: { ar: 'ما هو نوع الكائنات التي تنتمي إليها الشقيقتان ريم ورام؟', en: 'What race do twin sisters Rem and Ram belong to?' },
      options: [{ ar: 'عشيرة الأوني', en: 'Oni Clan' }, { ar: 'نصف إلف', en: 'Half-Elf' }, { ar: 'بشر عاديون', en: 'Human' }, { ar: 'أقزام', en: 'Dwarves' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_13',
      difficulty: 'medium',
      question: { ar: 'ما اسم الساحر الأكبر ومالك القصر الذي يرتدي ملابس المهرج ولديه عينان بلونين مختلفين؟', en: 'Who is the Court Mage and Lord of the Manor dressed like a jester?' },
      options: [{ ar: 'روزوال إل ماذرز', en: 'Roswaal L. Mathers' }, { ar: 'غارفيل', en: 'Garfiel' }, { ar: 'أوتو', en: 'Otto' }, { ar: 'ماركوس', en: 'Marcos' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_14',
      difficulty: 'easy',
      question: { ar: 'ما اسم الفتاة اللصة الصغيرة ذات الأسنان الحادة التي تصبح مرشحة للعرش الملكي بمساعدة روم؟', en: 'What is the name of the thief girl who is also a Royal Candidate?' },
      options: [{ ar: 'فيلت', en: 'Felt' }, { ar: 'كريش كارستن', en: 'Crusch' }, { ar: 'أناستازيا', en: 'Anastasia' }, { ar: 'بريسيلا', en: 'Priscilla' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_15',
      difficulty: 'medium',
      question: { ar: 'ما هي القدرة الخاصة التي يمتلكها التاجر الصديق لسوبارو (أوتو سويوين)؟', en: 'What is Otto Suwen’s unique Divine Protection blessing?' },
      options: [{ ar: 'التحدث مع جميع الحيوانات والكائنات', en: 'Whispering with animals and creatures' }, { ar: 'الطيران في الهواء', en: 'Flight' }, { ar: 'قراءة الأفكار', en: 'Telepathy' }, { ar: 'التحكم في النار', en: 'Pyrokinesis' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_16',
      difficulty: 'hard',
      question: { ar: 'ما هو اللقب الممنوح لغارفيل تينسل كحامي الملاذ؟', en: 'What is the title given to Garfiel Tinsel as protector of the Sanctuary?' },
      options: [{ ar: 'درع الملاذ', en: 'Shield of Sanctuary' }, { ar: 'سيف الظلال', en: 'Shadow Blade' }, { ar: 'ملك الوحوش', en: 'Beast King' }, { ar: 'حارس الأرواح', en: 'Spirit Guardian' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_17',
      difficulty: 'medium',
      question: { ar: 'من هي النبيلة المحاربة ذات الشعر الأخضر التي تقود عائلة كارستن في الانتخابات الملكية؟', en: 'Who is the green-haired Duchess leading the Karsten camp in Royal Selection?' },
      options: [{ ar: 'كروش كارستن', en: 'Crusch Karsten' }, { ar: 'بريسيلا بارييل', en: 'Priscilla' }, { ar: 'أناستازيا هوشين', en: 'Anastasia' }, { ar: 'إيميليا', en: 'Emilia' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_18',
      difficulty: 'hard',
      question: { ar: 'ما هو العنصر السحري الذي يتحكم به سوبارو ناتسوكي طبيعياً؟', en: 'What natural magical element affinity does Subaru Natsuki have?' },
      options: [{ ar: 'عنصر الـ يين', en: 'Yin Magic' }, { ar: 'عنصر اليانغ', en: 'Yang Magic' }, { ar: 'عنصر النار', en: 'Fire' }, { ar: 'عنصر الأرض', en: 'Earth' }],
      correctIndex: 0,
      explanation: { ar: 'عنصر الـ يين يتحكم في سحر الظلال والمكان مثل الشاماق (Shamak).', en: 'Yin magic controls shadows and spatial disruption like Shamak.' }
    },
    {
      id: 'rz_triv_19',
      difficulty: 'easy',
      question: { ar: 'من هو الفارس الأنيق ذو الشعر البنفسجي المعروف باسم "فارس الفرسان" وحامي أناستازيا؟', en: 'Who is the purple-haired "Knight of Knights" serving Anastasia?' },
      options: [{ ar: 'يوليوس جوكوليوس', en: 'Julius Juukulius' }, { ar: 'راينهارد', en: 'Reinhard' }, { ar: 'فيليكس', en: 'Felix' }, { ar: 'ويلهيلم', en: 'Wilhelm' }],
      correctIndex: 0
    },
    {
      id: 'rz_triv_20',
      difficulty: 'hard',
      question: { ar: 'ما هي العبارة الأيقونية التي قالها سوبارو لريم في الحلقة 18 ليبدآ من جديد؟', en: 'What was Subaru’s iconic phrase delivered with Rem in Episode 18?' },
      options: [{ ar: 'لنبدأ من الصفر', en: 'Starting from Zero' }, { ar: 'الموت لا ينتهي', en: 'Death never ends' }, { ar: 'أنا ساحر الظلام', en: 'I am shadow mage' }, { ar: 'العودة للمستقبل', en: 'Return to future' }],
      correctIndex: 0
    }
  ],
  trueFalseQuestions: [
    { id: 'rz_tf_1', difficulty: 'easy', statement: { ar: 'سوبارو يستطيع التحدث بحرية عن العودة بالموت دون أي عواقب.', en: 'Subaru can talk freely about Return by Death.' }, isCorrect: false },
    { id: 'rz_tf_2', difficulty: 'medium', statement: { ar: 'راينهارد فان أستريا يمتلك مئات البركات الإلهية التي تجعله لا يُقهر.', en: 'Reinhard possesses hundreds of Divine Protections.' }, isCorrect: true },
    { id: 'rz_tf_3', difficulty: 'easy', statement: { ar: 'إيميليا هي نصف إلف ذات شعر فضي.', en: 'Emilia is a silver-haired half-elf.' }, isCorrect: true },
    { id: 'rz_tf_4', difficulty: 'medium', statement: { ar: 'ريم هي الأخت الكبرى لرام وتمتلك قرنين كاملين.', en: 'Rem is older than Ram and has two horns.' }, isCorrect: false },
    { id: 'rz_tf_5', difficulty: 'hard', statement: { ar: 'إيكيدنا هي صانعة الروحين العظيمين باك وبياتريس.', en: 'Echidna created both Puck and Beatrice.' }, isCorrect: true },
    { id: 'rz_tf_6', difficulty: 'easy', statement: { ar: 'سوبارو أتى إلى عالم لوغنيكا بعد خروجه من متجر بقالة في اليابان.', en: 'Subaru was summoned after visiting a convenience store.' }, isCorrect: true },
    { id: 'rz_tf_7', difficulty: 'medium', statement: { ar: 'بيتلغيوس يمتلك أيدي غير مرئية تسمى Invisible Providence.', en: 'Petelgeuse commands unseen hands.' }, isCorrect: true },
    { id: 'rz_tf_8', difficulty: 'hard', statement: { ar: 'فيلت هي في الحقيقة الأميرة المفقودة من العائلة المالكة للوغنيكا.', en: 'Felt is the lost royal princess of Lugnica.' }, isCorrect: true },
    { id: 'rz_tf_9', difficulty: 'easy', statement: { ar: 'فيليكس أرجايل هو أعظم فارس بالسيف في المملكة ولا يجيد الشفاء.', en: 'Felix is a swordmaster with no healing magic.' }, isCorrect: false },
    { id: 'rz_tf_10', difficulty: 'medium', statement: { ar: 'الأرنب العظيم هو كائن وحيد ولا يتكاثر في معركة الملاذ.', en: 'The Great Rabbit is a single non-multiplying creature.' }, isCorrect: false },
    { id: 'rz_tf_11', difficulty: 'hard', statement: { ar: 'روزوال يمتلك إنجيل الساحرة (Gospel) الذي يخبره بالمستقبل لتحقيق رغبته.', en: 'Roswaal possesses a Witch’s Gospel guiding his future.' }, isCorrect: true },
    { id: 'rz_tf_12', difficulty: 'easy', statement: { ar: 'باك ينفد وقته ويختفي يومياً عند حلول الساعة الخامسة مساءً.', en: 'Puck’s mana is limited and he rests daily at 5 PM.' }, isCorrect: true },
    { id: 'rz_tf_13', difficulty: 'medium', statement: { ar: 'كاهن الشراهة التهم ذكريات ريم واسمها وتسبب في دخولها بغيبوبة.', en: 'The Archbishop of Gluttony ate Rem’s name and memories.' }, isCorrect: true },
    { id: 'rz_tf_14', difficulty: 'hard', statement: { ar: 'ساتيلا وإيكيدنا تمتلكان نفس الشخصية وهما نفس الساحرة بالضبط.', en: 'Satella and Echidna are the same person.' }, isCorrect: false },
    { id: 'rz_tf_15', difficulty: 'easy', statement: { ar: 'سوبارو عقد عقداً روحياً رسمياً مع بياتريس بعد إنقاذها من احتراق المكتبة.', en: 'Subaru formed a contract with Beatrice.' }, isCorrect: true },
    { id: 'rz_tf_16', difficulty: 'medium', statement: { ar: 'تيريسيا فان أستريا كانت قديسة السيف السابقة وزوجة ويلهيلم.', en: 'Theresia was the former Sword Saint and Wilhelm’s wife.' }, isCorrect: true },
    { id: 'rz_tf_17', difficulty: 'hard', statement: { ar: 'غارفيل تينسل يستطيع التحول إلى نمر ضخم ذو فراء ذهبي.', en: 'Garfiel can transform into a giant golden tiger.' }, isCorrect: true },
    { id: 'rz_tf_18', difficulty: 'easy', statement: { ar: 'إيميليا تخلت عن الانتخابات الملكية وأصبحت خادمة في قصر روزوال.', en: 'Emilia gave up the Royal Selection.' }, isCorrect: false },
    { id: 'rz_tf_19', difficulty: 'medium', statement: { ar: 'سوبارو يحمل رائحة ساحرة الحسد (Miasma) وتزداد كلما مات وعاد للحياة.', en: 'Subaru carries the Witch’s Miasma which intensifies upon death.' }, isCorrect: true },
    { id: 'rz_tf_20', difficulty: 'hard', statement: { ar: 'التنين المقدس فولكانيكا شارك قبل 400 عام في ختم ساحرة الحسد.', en: 'The Divine Dragon Volcanica helped seal the Witch of Envy.' }, isCorrect: true }
  ]
};
