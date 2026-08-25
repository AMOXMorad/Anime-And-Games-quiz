import { World } from '../../types';

export const rezeroWorld: World = {
  id: 're_zero',
  name: {
    ar: 'Re:Zero (بدء الحياة في عالم آخر)',
    en: 'Re:Zero - Starting Life in Another World'
  },
  category: 'anime',
  tagline: {
    ar: 'حلقة الموت اللانهائية، سحر الساحرات، والعهد الذي لا يموت في مملكة لوغنيكا',
    en: 'The infinite cycle of death, witches miasma, and unwavering vows in Lugnica'
  },
  description: {
    ar: 'خُض معارك المصير مع سوبارو وقوة "العودة بالموت"، واجه سحرة الخطايا السبع، حيتان الضباب البيضاء، وصراعات الخلافة الملكية.',
    en: 'Defy fate with Subaru’s Return by Death, face the Sin Archbishops, the White Whale, and royal selection trials.'
  },
  icon: '🍎',
  banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80', // Mystical fantasy atmosphere
  themeColor: '#a855f7', // Purple
  accentGlow: 'rgba(168, 85, 247, 0.4)',
  characters: [
    {
      id: 'subaru_natsuki',
      name: { ar: 'سوبارو ناتسوكي', en: 'Subaru Natsuki' },
      avatar: 'https://cdn.jsdelivr.net/gh/akabab/anime-characters-database@master/images/subaru.png',
      gender: 'male',
      role: { ar: 'فارس إيميليا والعائد بالموت', en: 'Emilia’s Knight & Return by Death Bearer' },
      powerType: { ar: 'العودة بالموت (سحر الين وعوامل الخطايا)', en: 'Return by Death + Yin Magic + Witch Factors' },
      affiliation: { ar: 'فصيل إيميليا / معسكر روزوال', en: 'Emilia Camp / Kingdom of Lugnica' },
      quote: { ar: 'حتى لو نسيتني ألف مرة، سأنقذك ألف مرة!', en: 'Even if you forget me a thousand times, I will save you a thousand times!' },
      clues: {
        easy: [
          { ar: 'انتقل فجأة إلى عالم موازي وهو يرتدي بدلة رياضية ويحمل كيس بقالة', en: 'Transported to a fantasy world in a tracksuit carrying a convenience store bag' },
          { ar: 'يمتلك قدرة إعادة الزمن لنقاط حفظ سابقة كلما قُتل', en: 'Resets time to checkpoints whenever he dies' }
        ],
        medium: [
          { ar: 'تنبعث منه رائحة ساحرة الحسد (ساتيلا) كلما حاول إخبار أحد عن قدرته', en: 'Emits the Witch of Envy’s miasma whenever he tries to speak of his power' },
          { ar: 'قاتل الحوت الأبيض وقاد حملة هزيمة بيتيلغيوس روماني كونتي', en: 'Subjugated the White Whale and defeated Petelgeuse Romanee-Conti' }
        ],
        hard: [
          { ar: 'تربطه صلة روحية مع بياتريس عبر عقد حارس المكتبة المحرمة', en: 'Formed a spirit contract with Beatrice, guardian of the Forbidden Library' },
          { ar: 'اجتاز اختبار معبد ساحرة الجشع (إيكيدنا) في السانكتشواري', en: 'Completed the Sanctuary trials presided by Echidna the Witch of Greed' }
        ]
      }
    },
    {
      id: 'emilia',
      name: { ar: 'إيميليا', en: 'Emilia' },
      avatar: 'https://cdn.jsdelivr.net/gh/akabab/anime-characters-database@master/images/emilia.png',
      gender: 'female',
      role: { ar: 'نصف إلف مرشحة للعرش الملكي', en: 'Half-Elf Royal Selection Candidate' },
      powerType: { ar: 'سحر الجليد الروحي + عقد روح النار باك', en: 'Ice Spirit Magic + Contract with Great Spirit Puck' },
      affiliation: { ar: 'فصيل إيميليا / مملكة لوغنيكا', en: 'Emilia Camp / Kingdom of Lugnica' },
      quote: { ar: 'أنا لست الساحرة الشريرة، أنا مجرد إيميليا!', en: 'I am not the wicked witch, I am just Emilia!' },
      clues: {
        easy: [
          { ar: 'نصف إلف بشعر فضي وعينين بنفسجيتين تشبه ساحرة الحسد', en: 'A silver-haired half-elf with amethyst eyes resembling the Witch of Envy' },
          { ar: 'يرافقها دائماً الروح العظيمة للجليد والنار على شكل قط صغير (باك)', en: 'Accompanied by Puck, the Great Spirit taking the form of a small flying cat' }
        ],
        medium: [
          { ar: 'عاشت مجمدة في غابة إليور لأكثر من 100 عام قبل استيقاظها', en: 'Lived frozen in the Elior Forest for over a century before awakening' },
          { ar: 'أحد المرشحات الخمس لانتخابات العرش الملكي في لوغنيكا', en: 'One of the five candidates competing in the Royal Selection of Lugnica' }
        ],
        hard: [
          { ar: 'والدتها بالتبني كانت فورتونا وألقت تعويذة تجميد الغابة لمنع باندورا من فتح الباب', en: 'Her foster mother Fortuna fell protecting the seal from Pandora’s deception' },
          { ar: 'تتحكم بأعظم سحر جليدي إطلاقاً "أبسولوت زيرو" الذي يجمد المفاهيم والزمن', en: 'Commands supreme Absolute Zero ice crystals capable of freezing surroundings' }
        ]
      }
    },
    {
      id: 'rem',
      name: { ar: 'ريم', en: 'Rem' },
      avatar: 'https://cdn.jsdelivr.net/gh/akabab/anime-characters-database@master/images/rem.png',
      gender: 'female',
      role: { ar: 'خادمة قصر روزوال والناجية من عشيرة الشياطين (الأوني)', en: 'Head Maid of Roswaal Manor & Oni Clan Survivor' },
      powerType: { ar: 'قرن الأوني + سحر الماء والشفاء + سلاح المورنينغ ستار الصباحي', en: 'Oni Horn + Water Magic + Morningstar Flail' },
      affiliation: { ar: 'قصر روزوال إل ماثرز', en: 'Roswaal L. Mathers Manor' },
      quote: { ar: 'من هنا، من الصفر... دعنا نبدأ قصتنا من جديد يا سوبارو!', en: 'From here, from zero... let us start our story together, Subaru!' },
      clues: {
        easy: [
          { ar: 'خادمة بشعر أزرق قصير ترتدي زي الميد ولها أخت توأم بشعر وردي', en: 'Blue-haired maid in maid uniform with a pink-haired twin sister' },
          { ar: 'تستخدم سلاح الكرة الحديدية المسننة بالسلاسل (Morningstar)', en: 'Wields a spiked iron ball attached to a long chain (Morningstar)' }
        ],
        medium: [
          { ar: 'تمتلك قرناً شيطانياً واحداً في جبهتها يضاعف قوتها الجسدية والسحرية', en: 'Possesses a single magical Oni horn on her forehead empowering her stats' },
          { ar: 'ألقت أشهر خطاب اعتراف ووفاء بالحب لسوبارو تحت الشجرة الكبيرة في الحلقة 18', en: 'Delivered the legendary "From Zero" confession to Subaru in episode 18' }
        ],
        hard: [
          { ar: 'التهم أسقف الشراهة (لي بانتينكايتوس) اسمها وذكرياتها وجعلها تدخل في سبات عميق', en: 'Her name and memories were eaten by Ley Batenkaitos of Gluttony' },
          { ar: 'تخلت عن مشاعر الذنب تجاه كسر قرن أختها التوأم رام في مذبحة القرية', en: 'Carried deep survivor guilt after the cult severed Ram’s divine horn' }
        ]
      }
    },
    {
      id: 'echidna',
      name: { ar: 'إيكيدنا (ساحرة الجشع)', en: 'Echidna (Witch of Greed)' },
      avatar: 'https://cdn.jsdelivr.net/gh/akabab/anime-characters-database@master/images/echidna.png',
      gender: 'female',
      role: { ar: 'ساحرة الجشع وصانعة بياتريس وبك وتجارب الخلود', en: 'Witch of Greed & Creator of Beatrice and Sanctuary' },
      powerType: { ar: 'سحر المعرفة المطلقة والوعي الأبدي', en: 'Omniscient Wisdom & Dream Realm Authority' },
      affiliation: { ar: 'معبد السانكتشواري (عالم الأحلام)', en: 'The Sanctuary (Dream Citadel)' },
      quote: { ar: 'كل المعرفة في هذا العالم... أريد أن أعرفها كلها!', en: 'All the knowledge in this world... I want to know it all!' },
      clues: {
        easy: [
          { ar: 'ساحرة ترتدي فستاناً أسود وشعرها أبيض طويل وتستضيف حفلات شاي في عالم الأحلام', en: 'Witch in a black dress with long white hair hosting tea parties in dream realms' },
          { ar: 'قدمت لسوبارو "شاي إيكيدنا الشهير" المستخرج من سوائل جسدها الأثيري', en: 'Offered Subaru the infamous tea brewed from her ethereal bodily essence' }
        ],
        medium: [
          { ar: 'المدبرة الأصلية لحاجز السانكتشواري وتجارب نقل الأرواح إلى أجساد ريو بيلميل', en: 'Architect behind Sanctuary’s barrier and Ryuzu clone soul transfer experiments' },
          { ar: 'صنعت كتاب الإنجيل الإرشادي لروزوال والمكتبة المحرمة لبياتريس', en: 'Authored Roswaal’s Gospel and created the Forbidden Library for Beatrice' }
        ],
        hard: [
          { ar: 'أقامت عهداً مشروطاً مع سوبارو لتحليل مليارات المسارات الزمنية لإنقاذ الجميع لكنه رفضه في النهاية', en: 'Offered a contract to observe millions of death loops before Subaru rejected it' },
          { ar: 'تابوت جسدها الحقيقي كان محفوظاً داخل القبر المقدس في قاع السانكتشواري', en: 'Her preserved physical vessel rested deep inside the holy Sanctuary tomb' }
        ]
      }
    }
  ],
  triviaQuestions: [
    {
      id: 'rezero_q1',
      difficulty: 'easy',
      question: {
        ar: 'ما اسم الساحرة التي تمنح سوبارو ناتسوكي قدرة "العودة بالموت" وترتبط برائحته؟',
        en: 'Which Witch grants Subaru his "Return by Death" ability?'
      },
      options: [
        { ar: 'ساتيلا (ساحرة الحسد)', en: 'Satella (Witch of Envy)' },
        { ar: 'إيكيدنا (ساحرة الجشع)', en: 'Echidna (Witch of Greed)' },
        { ar: 'مينيرفا (ساحرة الغضب)', en: 'Minerva (Witch of Wrath)' },
        { ar: 'كارميلا (ساحرة الشهوة)', en: 'Carmilla (Witch of Lust)' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'ساتيلا، ساحرة الحسد، هي التي تمنحه لعنة وقدرة العودة بالموت وتمنعه من إخبار أي شخص عنها بقبضة قلب مظلمة.',
        en: 'Satella, the Witch of Envy, bestowed Return by Death upon him and silences him with her unseen hand.'
      }
    },
    {
      id: 'rezero_q2',
      difficulty: 'easy',
      question: {
        ar: 'ما اسم الفاكهة المشهورة الشبيهة بالتفاح في عاصمة مملكة لوغنيكا؟',
        en: 'What is the apple-like fruit iconic to Lugnica called?'
      },
      options: [
        { ar: 'أببا (Appa)', en: 'Appa' },
        { ar: 'رينغو (Ringo)', en: 'Ringo' },
        { ar: 'بانا (Bana)', en: 'Bana' },
        { ar: 'ميتيا (Metia)', en: 'Metia' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'فاكهة الأببا الحمراء والخضراء يبيعها كادومون في شوارع العاصمة وكانت أول ما رآه سوبارو عند استدعائه.',
        en: 'Appa is the iconic fruit sold by Kadomon, the first merchant Subaru encountered.'
      }
    },
    {
      id: 'rezero_q3',
      difficulty: 'medium',
      question: {
        ar: 'ما اسم السيف الأسطوري الذي يحمله قديس السيف رينهارد فان أستريا ولا يخرج من غمده إلا ضد خصم جدير؟',
        en: 'What is the Dragon Sword wielded by Reinhard that only unsheathes against worthy foes?'
      },
      options: [
        { ar: 'سيف التنين رييد (Reid)', en: 'Dragon Sword Reid' },
        { ar: 'سيف يانغ كيريكين', en: 'Yang Sword' },
        { ar: 'سيف إكستيرمينيتور', en: 'Exterminator' },
        { ar: 'سيف موراسامي', en: 'Murasame' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'سيف التنين "رييد" مسحور برغبة تنين الأرض ولا يخرج من غمده إلا إذا كان الخصم يشكل خطراً حقيقياً يستدعي ضربته.',
        en: 'The Dragon Sword Reid is enchanted and only allows itself to be drawn against truly formidable adversaries.'
      }
    },
    {
      id: 'rezero_q4',
      difficulty: 'hard',
      question: {
        ar: 'كم يبلغ عدد السنوات التي عاشتها بياتريس وحيدة داخل المكتبة المحرمة في انتظار "الشخص المنشود"؟',
        en: 'How many years did Beatrice wait alone inside the Forbidden Library for "That Person"?'
      },
      options: [
        { ar: '400 سنة', en: '400 Years' },
        { ar: '100 سنة', en: '100 Years' },
        { ar: '250 سنة', en: '250 Years' },
        { ar: '1000 سنة', en: '1000 Years' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'عاشت بياتريس 400 عام في عزلة حتى جاء سوبارو وقال لها: "اختاري أن أكون أنا ذلك الشخص ليس بسبب عهد، بل لأنك تريدين الحياة معي!".',
        en: 'Beatrice spent 400 lonely years until Subaru told her to choose him as her future.'
      }
    }
  ],
  trueFalseQuestions: [
    {
      id: 'rezero_tf1',
      difficulty: 'easy',
      statement: {
        ar: 'ريم ورام وُلِدتا بقرن واحد لكل منهما لأن التوائم في عشيرة الأوني يُعتبرون لعنة وتقتسم قواهم.',
        en: 'Rem and Ram were born with only one horn each because twins in the Oni clan are considered a curse that splits power.'
      },
      isCorrect: true,
      explanation: {
        ar: 'صحيح! عشيرة الشياطين تولد بقرنين، لكن التوائم يولدون بقرن واحد وكانوا ينوون قتلهما لولا إظهار رام لقوتها الهائلة.',
        en: 'Correct! Oni are born with two horns, but twins share one each.'
      }
    },
    {
      id: 'rezero_tf2',
      difficulty: 'easy',
      statement: {
        ar: 'سوبارو ناتسوكي يستطيع إخبار أي شخص بحرية ودون أي عواقب عن قدرة العودة بالموت.',
        en: 'Subaru can freely explain his Return by Death ability without any repercussions.'
      },
      isCorrect: false,
      explanation: {
        ar: 'خطأ! يد ساحرة الظلام تسحق قلبه أو تقتل الشخص الذي يستمع له إذا حاول الإفصاح عن سره.',
        en: 'False! The unseen witch hand crushes his heart or kills the listener if he attempts to reveal it.'
      }
    },
    {
      id: 'rezero_tf3',
      difficulty: 'medium',
      statement: {
        ar: 'روزوال إل ماثرز كان يعلم أن سوبارو يستطيع إعادة تدوير الزمن بناءً على كتاب الإنجيل الذي أعطته له إيكيدنا.',
        en: 'Roswaal knew Subaru had time-looping abilities because his Gospel predicted timeline resets.'
      },
      isCorrect: true,
      explanation: {
        ar: 'صحيح! روزوال كان يعلم أن سوبارو يعيد صياغة العالم، رغم أنه لم يكن يعلم أن ذلك يحدث عن طريق الموت تحديداً.',
        en: 'Correct! Roswaal knew Subaru could reset worlds, though he did not know it required actual death.'
      }
    },
    {
      id: 'rezero_tf4',
      difficulty: 'hard',
      statement: {
        ar: 'فليكس أرجيل (فريس) هو الفارس الشافي ذو الأذنين القطيتين وهو في الأصل أنثى متنكرة في هيئة رجل.',
        en: 'Felix Argyle (Ferris), the water healer knight with cat ears, is originally a female disguised as a male.'
      },
      isCorrect: false,
      explanation: {
        ar: 'خطأ! فليكس ذكر بيولوجياً، على الرغم من مظهره وملابسه الأنثوية ولقبه كفارس كروش الأول.',
        en: 'False! Felix is biologically male despite feminine appearance and attire.'
      }
    }
  ]
};
