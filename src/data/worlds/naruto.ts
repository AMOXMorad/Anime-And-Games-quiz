import { World } from '../../types';

export const narutoWorld: World = {
  id: 'naruto',
  name: {
    ar: 'ناروتو شيبودن',
    en: 'Naruto Shippuden'
  },
  category: 'anime',
  tagline: {
    ar: 'عالم النينجا، روابط الصداقة، وطريق الشينوبي الذي لا ينكسر',
    en: 'The world of ninja, unbreakable bonds, and the true shinobi way'
  },
  description: {
    ar: 'ادخل إلى عالم القرى المخفية، تقنيات التشاكرا الأسطورية، معارك وادي النهاية، وصراع السلام ضد قوى الأكاتسكي.',
    en: 'Enter the realm of hidden villages, legendary chakra jutsu, the Valley of the End, and the fight for peace against the Akatsuki.'
  },
  icon: '🍥',
  banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80', // Atmospheric ninja backdrop
  themeColor: '#f97316', // Orange
  accentGlow: 'rgba(249, 115, 22, 0.4)',
  characters: [
    {
      id: 'naruto_uzumaki',
      name: { ar: 'ناروتو أوزوماكي', en: 'Naruto Uzumaki' },
      avatar: 'https://cdn.jsdelivr.net/gh/akabab/anime-characters-database@master/images/naruto.png',
      gender: 'male',
      role: { ar: 'الهوكاجي السابع وجينشوريكي الكيوبي', en: 'Seventh Hokage & Nine-Tails Jinchuriki' },
      powerType: { ar: 'نمط الناسك + تشاكرا الكوراما + الراسينغان', en: 'Sage Mode + Kurama Chakra + Rasengan' },
      affiliation: { ar: 'قرية كونوها (عشيرة الأوزوماكي)', en: 'Hidden Leaf Village (Uzumaki Clan)' },
      quote: { ar: 'لن أتراجع عن كلمتي أبداً، هذا هو طريقي في النينجا!', en: 'I never go back on my word, that is my nindo, my ninja way!' },
      clues: {
        easy: [
          { ar: 'يحب أكل الرامن بشدة من مطعم إيتشيراكو', en: 'He deeply loves eating ramen at Ichiraku Ramen' },
          { ar: 'يحمل وحش الذيول التسعة (كوراما) بداخله', en: 'He hosts the Nine-Tailed Fox (Kurama) within him' }
        ],
        medium: [
          { ar: 'ابن وميض كونوها الأصفر (ميناتو ناميكازي)', en: 'Son of the Yellow Flash of the Leaf (Minato Namikaze)' },
          { ar: 'أتقن الراسينغان في أسبوع واحد فقط', en: 'Mastered the Rasengan in just one week' }
        ],
        hard: [
          { ar: 'هو التناسخ الروحي لـ آشورا أوتسوتسوكي', en: 'He is the spiritual reincarnation of Asura Otsutsuki' },
          { ar: 'أول نينجا يصنع رازن-شوريكين بعنصر الرياح', en: 'The first ninja to create the Wind Release: Rasenshuriken' }
        ]
      }
    },
    {
      id: 'sasuke_uchiha',
      name: { ar: 'ساسكي أوتشيها', en: 'Sasuke Uchiha' },
      avatar: 'https://cdn.jsdelivr.net/gh/akabab/anime-characters-database@master/images/sasuke.png',
      gender: 'male',
      role: { ar: 'شينوبي الظلال والوريث الأخير للأوتشيها', en: 'Supporting Kage & Uchiha Prodigy' },
      powerType: { ar: 'المانغيكيو شارينغان الأبدية + الرينغان + التشيدوري', en: 'Eternal Mangekyo Sharingan + Rinnegan + Chidori' },
      affiliation: { ar: 'عشيرة الأوتشيها', en: 'Uchiha Clan' },
      quote: { ar: 'أنا أسير في طريقي الخاص في الظلام.', en: 'I walk my own path through the shadows.' },
      clues: {
        easy: [
          { ar: 'الناجي الوحيد من مذبحة عشيرة الأوتشيها الشهيرة', en: 'The sole survivor of the infamous Uchiha clan massacre' },
          { ar: 'منافس ناروتو الأبدي وعضو الفريق السابع', en: 'Naruto’s eternal rival and member of Team 7' }
        ],
        medium: [
          { ar: 'تدرب على يد أوروتشيمارو لعدة سنوات ليكتسب القوة', en: 'Trained under Orochimaru for years to gain vengeance power' },
          { ar: 'يستخدم تقنية التشيدوري بعنصر البرق وسيف الكوساناغي', en: 'Wields Lightning Release: Chidori and the Kusanagi sword' }
        ],
        hard: [
          { ar: 'هو التناسخ الروحي لـ إندرا أوتسوتسوكي', en: 'He is the spiritual reincarnation of Indra Otsutsuki' },
          { ar: 'حصل على الرينغان ذات الفواصل الستة في عينه اليسرى من حكيم المسارات الستة', en: 'Received the six-tomoe Rinnegan in his left eye from Hagoromo' }
        ]
      }
    },
    {
      id: 'kakashi_hatake',
      name: { ar: 'كاكاشي هاتاكي', en: 'Kakashi Hatake' },
      avatar: 'https://cdn.jsdelivr.net/gh/akabab/anime-characters-database@master/images/kakashi.png',
      gender: 'male',
      role: { ar: 'الهوكاجي السادس والنينجا الناسخ', en: 'Sixth Hokage & The Copy Ninja' },
      powerType: { ar: 'الشارينغان + الرايكيري + الكاموي', en: 'Sharingan + Raikiri + Kamui' },
      affiliation: { ar: 'قرية كونوها', en: 'Hidden Leaf Village' },
      quote: { ar: 'الذين يخالفون القواعد حثالة، لكن الذين يتخلون عن رفاقهم أسوأ من الحثالة!', en: 'Those who break the rules are scum, but those who abandon their friends are worse than scum!' },
      clues: {
        easy: [
          { ar: 'يغطي النصف السفلي من وجهه بقناع دائم', en: 'Always covers the lower half of his face with a mask' },
          { ar: 'معلم الفريق السابع وقائد اختبار الجرس الشهير', en: 'Teacher of Team 7 and leader of the famous bell test' }
        ],
        medium: [
          { ar: 'يقرأ روايات "جنة الغزل" التي ألفها جيرايا', en: 'Constantly reads the "Icha Icha Paradise" novels written by Jiraiya' },
          { ar: 'ابن "ناب كونوها الأبيض" ساكومو هاتاكي', en: 'Son of the "White Fang of the Leaf", Sakumo Hatake' }
        ],
        hard: [
          { ar: 'حصل على الشارينغان كهدية وداع من صديقه أوبيتو في جسر كانابي', en: 'Received his Sharingan as a parting gift from Obito at Kannabi Bridge' },
          { ar: 'أصغر نينجا تخرج من الأكاديمية في سن الخامسة وأصبح جونين في سن العاشرة', en: 'Youngest graduate at age 5 and became a Jonin at age 10' }
        ]
      }
    },
    {
      id: 'itachi_uchiha',
      name: { ar: 'إيتاتشي أوتشيها', en: 'Itachi Uchiha' },
      avatar: 'https://cdn.jsdelivr.net/gh/akabab/anime-characters-database@master/images/itachi.png',
      gender: 'male',
      role: { ar: 'بطل كونوها في الظلال وعضو الأكاتسكي', en: 'Hero in the Shadows & Akatsuki Operative' },
      powerType: { ar: 'التسوكويومي + الأماتيراسو + سوسانو بسيف توتسوكا', en: 'Tsukuyomi + Amaterasu + Susanoo with Totsuka Blade' },
      affiliation: { ar: 'الأكاتسكي / كونوها', en: 'Akatsuki / Hidden Leaf' },
      quote: { ar: 'تضحية الشينوبي الحقيقي تكون في الظلال دون انتظار شكر من أحد.', en: 'A true shinobi protects peace from within the shadows without seeking glory.' },
      clues: {
        easy: [
          { ar: 'الأخ الأكبر لساسكي الذي قاد مذبحة العشيرة لحماية القرية', en: 'Sasuke’s older brother who sacrificed his clan for the village peace' },
          { ar: 'يرتدي عباءة الأكاتسكي السوداء المزينة بالسحب الحمراء وخاتم "شوشين"', en: 'Wears the black Akatsuki cloak with red clouds and the Shu ring' }
        ],
        medium: [
          { ar: 'يتحكم بنيران الأماتيراسو السوداء التي تحرق لسبعة أيام وليال', en: 'Commands the black flames of Amaterasu that burn for seven days and nights' },
          { ar: 'صديقه المقرب كان شيسوي أوتشيها الذي أهداه عينه اليسرى كوتواماتسوكامي', en: 'Best friend of Shisui Uchiha who gifted him his Kotoamatsukami eye' }
        ],
        hard: [
          { ar: 'يمتلك السوسانو المسلحة بمرآة ياتا وسيف توتسوكا القادر على الختم الأبدي', en: 'His Susanoo wields the Yata Mirror and the soul-sealing Totsuka Blade' },
          { ar: 'تخلص من الإيدو تينسي بنفسه عبر الغينجوتسو المطلق في عين الغراب', en: 'Broke free from Edo Tensei control using the crow eye Kotoamatsukami' }
        ]
      }
    },
    {
      id: 'madara_uchiha',
      name: { ar: 'مادارا أوتشيها', en: 'Madara Uchiha' },
      avatar: 'https://cdn.jsdelivr.net/gh/akabab/anime-characters-database@master/images/madara.png',
      gender: 'male',
      role: { ar: 'مؤسس كونوها مع هاشيراما ومطلق التسوكويومي اللانهائية', en: 'Co-founder of Konoha & Infinite Tsukuyomi Architect' },
      powerType: { ar: 'الرينغان الكاملة + نيزك تينغاي شينسي + السوسانو المثالي', en: 'Complete Rinnegan + Tengai Shinsei Meteor + Perfect Susanoo' },
      affiliation: { ar: 'عشيرة الأوتشيها', en: 'Uchiha Clan' },
      quote: { ar: 'استيقظ على الواقع! لا شيء يسير كما خُطط له في هذا العالم البائس.', en: 'Wake up to reality! Nothing ever goes as planned in this accursed world.' },
      clues: {
        easy: [
          { ar: 'أسقط نيزكين ضخمين على قوات تحالف الشينوبي بمفرده', en: 'Dropped two colossal meteors on the Shinobi Alliance single-handedly' },
          { ar: 'المنافس التاريخي للهوكاجي الأول هاشيراما سينجو', en: 'The historical arch-rival of First Hokage Hashirama Senju' }
        ],
        medium: [
          { ar: 'أيقظ الرينغان في أواخر حياته بدمج خلايا هاشيراما مع عينه', en: 'Awakened the Rinnegan late in life by fusing Hashirama cells' },
          { ar: 'استخدم مروحة الحرب العملاقة "الغانباي" لعكس أقوى الهجمات', en: 'Wielded the giant Gunbai war fan to reflect incoming jutsu' }
        ],
        hard: [
          { ar: 'أول بشري يروض وحش الكيوبي بسحر الشارينغان في معركة وادي النهاية', en: 'First mortal to tame Kurama using Sharingan at the Valley of the End' },
          { ar: 'أصبح جينشوريكي الجيوبي (ذيول العشرة) وفتح عين التسوكي نو مي على القمر', en: 'Became the Ten-Tails Jinchuriki and projected the Infinite Tsukuyomi onto the moon' }
        ]
      }
    }
  ],
  triviaQuestions: [
    {
      id: 'naruto_q1',
      difficulty: 'easy',
      question: {
        ar: 'ما هو اسم المطعم المفضل لناروتو أوزوماكي لتناول الرامن؟',
        en: 'What is Naruto Uzumaki’s favorite ramen shop called?'
      },
      options: [
        { ar: 'رامن إيتشيراكو', en: 'Ichiraku Ramen' },
        { ar: 'رامن كونوها', en: 'Konoha Ramen' },
        { ar: 'رامن الشينوبي', en: 'Shinobi Ramen' },
        { ar: 'رامن تيوكي', en: 'Teuchi Ramen' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'رامن إيتشيراكو الذي يديره العم تيوكي وابنته أيامي كان الملاذ المفضل لناروتو منذ صغره.',
        en: 'Ichiraku Ramen, run by Teuchi and his daughter Ayame, has always been Naruto’s favorite comfort spot.'
      }
    },
    {
      id: 'naruto_q2',
      difficulty: 'easy',
      question: {
        ar: 'من هو مبتكر تقنية "الراسينغان" الأصلية؟',
        en: 'Who originally invented the "Rasengan" jutsu?'
      },
      options: [
        { ar: 'ميناتو ناميكازي (الهوكاجي الرابع)', en: 'Minato Namikaze (4th Hokage)' },
        { ar: 'جيرايا الناسك', en: 'Jiraiya the Sage' },
        { ar: 'كاكاشي هاتاكي', en: 'Kakashi Hatake' },
        { ar: 'هاشيراما سينجو', en: 'Hashirama Senju' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'ميناتو ناميكازي استغرق 3 سنوات لابتكار الراسينغان مستوحياً الفكرة من كرة وحش البيجو.',
        en: 'Minato spent 3 years developing the Rasengan, inspired by the Tailed Beast Bomb.'
      }
    },
    {
      id: 'naruto_q3',
      difficulty: 'medium',
      question: {
        ar: 'ما اسم السيف الأسطوري الذي استخدمه إيتاتشي أوتشيها في سوسانو لختم أوروتشيمارو وناغاتو؟',
        en: 'What is the mythical sword wielded by Itachi’s Susanoo to seal Orochimaru and Nagato?'
      },
      options: [
        { ar: 'سيف توتسوكا (سيف الساكي السكير)', en: 'Totsuka Blade' },
        { ar: 'سيف كوساناغي', en: 'Kusanagi Sword' },
        { ar: 'سيف النوبيساكي', en: 'Nobisaki Blade' },
        { ar: 'سيف نونوبوكو', en: 'Sword of Nunoboko' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'سيف توتسوكا هو سلاح أثيري يحبس أي شخص يطعنه في جرة خمر داخل غينجوتسو حلم أبدي.',
        en: 'The Totsuka Blade is an ethereal weapon that seals anyone it pierces into a jar of infinite genjutsu dreams.'
      }
    },
    {
      id: 'naruto_q4',
      difficulty: 'medium',
      question: {
        ar: 'كم عدد البوابات الثمانية التي فتحها مايت غاي في معركته الملحمية ضد مادارا أوتشيها؟',
        en: 'How many of the Eight Inner Gates did Might Guy open in his fight against Madara?'
      },
      options: [
        { ar: 'البوابات الثمانية جميعها (بوابة الموت)', en: 'All 8 Gates (Gate of Death)' },
        { ar: '7 بوابات فقط (بوابة العجب)', en: '7 Gates (Gate of Wonder)' },
        { ar: '6 بوابات (بوابة الرؤية)', en: '6 Gates (Gate of View)' },
        { ar: '5 بوابات', en: '5 Gates' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'فتح مايت غاي بوابة الموت الثامنة واستخدم تقنية "فراشة الليل / Night Guy" واعترف به مادارا كأقوى مستخدم للتايجوتسو.',
        en: 'Guy opened all Eight Gates, unleashing Night Guy, earning Madara’s praise as the strongest taijutsu user.'
      }
    },
    {
      id: 'naruto_q5',
      difficulty: 'hard',
      question: {
        ar: 'ما اسم المكان السري الذي احتفظت فيه عشيرة الأوتشيها بلوح المونووليث الحجري الذي تركه حكيم المسارات الستة؟',
        en: 'What is the secret shrine where the Uchiha stone monument was hidden?'
      },
      options: [
        { ar: 'ضريح ناكانو (Naka Shrine)', en: 'Naka Shrine' },
        { ar: 'مقر شينسيكي', en: 'Shinseki Hall' },
        { ar: 'وادي كانابي', en: 'Kannabi Cave' },
        { ar: 'كهف ريوتشي', en: 'Ryuchi Temple' }
      ],
      correctIndex: 0,
      explanation: {
        ar: 'ضريح ناكانو في ضواحي كونوها كان يحتوي في قبو سري تحت حصير التاتامي على اللوح الحجري الذي لا يقرأه إلا أصحاب الشارينغان والرينغان.',
        en: 'The secret chamber underneath the main tatami mat of the Naka Shrine held the ancient stone tablet.'
      }
    }
  ],
  trueFalseQuestions: [
    {
      id: 'naruto_tf1',
      difficulty: 'easy',
      statement: {
        ar: 'عشيرة الأوزوماكي اشتهرت عبر التاريخ بإتقانها الفائق لتقنيات الختم (الفوجينجوتسو) وقوة حياتهم الكبيرة.',
        en: 'The Uzumaki clan was historically renowned for their mastery of Fuinjutsu (sealing jutsu) and immense life force.'
      },
      isCorrect: true,
      explanation: {
        ar: 'صحيح! لدرجة أن قرية أوزوشيو دمرت من خوف بقية القرى من مهارات أختامهم.',
        en: 'Correct! Uzushio was destroyed precisely because other nations feared their unmatched sealing jutsu.'
      }
    },
    {
      id: 'naruto_tf2',
      difficulty: 'easy',
      statement: {
        ar: 'كاكاشي هاتاكي هو الشخص الذي اخترع تقنية الشارينغان.',
        en: 'Kakashi Hatake is the person who originally invented the Sharingan.'
      },
      isCorrect: false,
      explanation: {
        ar: 'خطأ! الشارينغان كيكي غينكاي وراثي لعشيرة الأوتشيها وتعود لأصول كاغويا وإندرا، وكاكاشي زرعها بعدما أهداها له أوبيتو.',
        en: 'False! The Sharingan is an inherited Kekkei Genkai of the Uchiha clan tracing back to Indra Otsutsuki.'
      }
    },
    {
      id: 'naruto_tf3',
      difficulty: 'medium',
      statement: {
        ar: 'إيتاشي أوتشيها تخرج من أكاديمية النينجا وهو في سن السابعة من عمره.',
        en: 'Itachi Uchiha graduated from the Ninja Academy at the age of seven.'
      },
      isCorrect: true,
      explanation: {
        ar: 'صحيح! تخرج في سن 7 سنوات كأحد أعظم العباقرة في تاريخ كونوها.',
        en: 'Correct! He graduated at age 7 with top marks in just one year of enrollment.'
      }
    },
    {
      id: 'naruto_tf4',
      difficulty: 'hard',
      statement: {
        ar: 'توبي (أوبيتو أوتشيها) لم يفقد عينه اليسرى أبداً عندما سقطت عليه الصخور في جسر كانابي.',
        en: 'Obito Uchiha never actually lost his left eye during the rock collapse at Kannabi bridge.'
      },
      isCorrect: false,
      explanation: {
        ar: 'خطأ! النصف الأيمن من جسده سحق بالصخور وهو بنفسه طلب من رين استئصال عينه اليسرى وإهدائها لكاكاشي.',
        en: 'False! His right side was crushed, and Rin transplanted his left eye into Kakashi as a Jonin gift.'
      }
    }
  ]
};
