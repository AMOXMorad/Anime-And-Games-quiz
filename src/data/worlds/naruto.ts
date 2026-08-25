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
  banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg',
  themeColor: '#f97316',
  accentGlow: 'rgba(249, 115, 22, 0.4)',
  characters: [
    {
      id: 'naruto_uzumaki',
      name: { ar: 'ناروتو أوزوماكي', en: 'Naruto Uzumaki' },
      avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png',
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
      avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b13-SISLEw1oAD7a.png',
      gender: 'male',
      role: { ar: 'شينوبي الظلال والوريث الأخير للأوتشيها', en: 'Supporting Kage & Uchiha Prodigy' },
      powerType: { ar: 'المانغيكيو شارينغان الأبدية + الرينغان + التشيدوري', en: 'Eternal Mangekyo Sharingan + Rinnegan + Chidori' },
      affiliation: { ar: 'عشيرة الأوتشيها (كونوها)', en: 'Uchiha Clan (Hidden Leaf)' },
      quote: { ar: 'أنا أسير في طريقي الخاص في الظلام.', en: 'I walk my own path through the shadows.' },
      clues: {
        easy: [
          { ar: 'الناجي الوحيد من مذبحة عشيرة الأوتشيها الشهيرة', en: 'The sole survivor of the infamous Uchiha clan massacre' },
          { ar: 'منافس ناروتو الأبدي وعضو الفريق السابع الأصلي', en: 'Naruto’s eternal rival and member of Team 7' }
        ],
        medium: [
          { ar: 'أيقظ الشارينغان لأول مرة في ليلة إبادة عشيرته', en: 'Awakened his Sharingan for the first time during the massacre night' },
          { ar: 'استخدم عنصر البرق (التشيدوري) بتعليم من كاكاشي', en: 'Mastered the Lightning Release Chidori under Kakashi’s guidance' }
        ],
        hard: [
          { ar: 'التناسخ الروحي لـ إندرا أوتسوتسوكي', en: 'He is the spiritual reincarnation of Indra Otsutsuki' },
          { ar: 'حصل على ختم اللعنة السماوي من أوروتشيمارو في غابة الموت', en: 'Received the Cursed Seal of Heaven from Orochimaru in the Forest of Death' }
        ]
      }
    },
    {
      id: 'itachi_uchiha',
      name: { ar: 'إيتاتشي أوتشيها', en: 'Itachi Uchiha' },
      avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b14-9Kb1E5oel1ke.png',
      gender: 'male',
      role: { ar: 'عبقري الأوتشيها وحامي كونوها من الظلال', en: 'Uchiha Prodigy & Protector from the Shadows' },
      powerType: { ar: 'تسوكيومي + أماتيراسو + سوسانو (سيف توتسوكا)', en: 'Tsukuyomi + Amaterasu + Susanoo (Totsuka Blade)' },
      affiliation: { ar: 'منظمة الأكاتسكي (سابقاً كونوها/الأنبو)', en: 'Akatsuki (Formerly Leaf Village ANBU)' },
      quote: { ar: 'تضحية الشينوبي الحقيقي تكون دائماً في الخفاء.', en: 'Self-sacrifice... a true shinobi does not seek glory.' },
      clues: {
        easy: [
          { ar: 'الأخ الأكبر لساسكي الذي أباد العشيرة لحماية القرية', en: 'Sasuke’s older brother who wiped out the clan to save the village' },
          { ar: 'عضو أسطوري في منظمة الأكاتسكي مع شريكه كيسامي', en: 'Legendary member of the Akatsuki partnered with Kisame' }
        ],
        medium: [
          { ar: 'تخرج من أكاديمية النينجا في سن 7 سنوات وأصبح قائد أنبو في سن 13', en: 'Graduated the Academy at age 7 and became an ANBU Captain at 13' },
          { ar: 'يحمل سيف توتسوكا ومرآة ياتا في السوسانو الخاص به', en: 'Wields the Totsuka Blade and Yata Mirror in his ethereal Susanoo' }
        ],
        hard: [
          { ar: 'قام بزرع عين شيسوي مع تقنية كوتواماتسوكامي في غراب داخل ناروتو', en: 'Implanted Shisui’s Kotoamatsukami eye into a crow inside Naruto' },
          { ar: 'تحرر ذاتياً من سيطرة تقنية الإيدو تينسي أثناء حرب النينجا الرابعة', en: 'Freed himself from the Edo Tensei control during the 4th Ninja War' }
        ]
      }
    },
    {
      id: 'kakashi_hatake',
      name: { ar: 'كاكاشي هاتاكي', en: 'Kakashi Hatake' },
      avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b85-mkVBh2yjxjmx.png',
      gender: 'male',
      role: { ar: 'الهوكاجي السادس والنينجا الناسخ', en: 'Sixth Hokage & Copy Ninja' },
      powerType: { ar: 'رايكيري + الكاموي (البعد الفضائي) + نسخ 1000 جيتسو', en: 'Raikiri + Kamui + 1000 Jutsu Copies' },
      affiliation: { ar: 'قرية كونوها (الفريق السابع)', en: 'Hidden Leaf Village (Team 7)' },
      quote: { ar: 'الذين يكسرون القواعد حثالة، لكن الذين يتخلون عن أصدقائهم أسوأ من الحثالة!', en: 'Those who break rules are scum, but those who abandon their friends are worse than scum!' },
      clues: {
        easy: [
          { ar: 'معروف بقراءة روايات "جنة الغزل" الشهيرة لجيرايا', en: 'Famous for reading Jiraiya’s Icha Icha Paradise novels' },
          { ar: 'يرتدي قناعاً يغطي وجهه وعينه اليسرى بها شارينغان', en: 'Wears a mask covering his face with a Sharingan in his left eye' }
        ],
        medium: [
          { ar: 'ابن الناب الأبيض لكونوها (ساكومو هاتاكي)', en: 'Son of the White Fang of the Leaf (Sakumo Hatake)' },
          { ar: 'مبتكر تقنية التشيدوري والرايكيري الشهيرة', en: 'Creator of the original Chidori and Raikiri jutsu' }
        ],
        hard: [
          { ar: 'حصل على الشارينغان من صديقه أوبيتو في معركة جسر كانابي', en: 'Received his Sharingan from Obito at the Kannabi Bridge battle' },
          { ar: 'أيقظ السوسانو المثالي الكامل مؤقتاً في معركة كاغويا', en: 'Temporarily manifested a Complete Perfect Susanoo against Kaguya' }
        ]
      }
    },
    {
      id: 'madara_uchiha',
      name: { ar: 'مادارا أوتشيها', en: 'Madara Uchiha' },
      avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b53901-HnRKSoHMG5Vg.png',
      gender: 'male',
      role: { ar: 'مؤسس كونوها الأسطوري وزعيم الأوتشيها', en: 'Legendary Co-Founder of Konoha & Uchiha Clan Head' },
      powerType: { ar: 'السوسانو الكامل + الرينغان + قوى التينغاي شينسي (النيازك)', en: 'Perfect Susanoo + Rinnegan + Tengai Shinsei Meteors' },
      affiliation: { ar: 'عشيرة الأوتشيها (مهندس خطة عين القمر)', en: 'Uchiha Clan (Architect of Eye of the Moon Plan)' },
      quote: { ar: 'هل تريد أن ترقص معي؟ في هذا العالم حيث يوجد ضوء يوجد ظل دائماً.', en: 'Would you like to dance? In this world, wherever there is light, there are shadows.' },
      clues: {
        easy: [
          { ar: 'أسس قرية كونوها رفقة صديقه وغريمه هاشيراما سينجو', en: 'Co-founded the Hidden Leaf alongside his rival Hashirama Senju' },
          { ar: 'أسقط نيزكين ضخمين على قوات تحالف الشينوبي بمفرده', en: 'Summoned two colossal meteors on the Shinobi Alliance single-handedly' }
        ],
        medium: [
          { ar: 'أول إنسان يوقظ الرينغان طبيعياً بدمج خلايا هاشيراما مع دمه', en: 'First human to naturally awaken the Rinnegan by fusing Hashirama cells' },
          { ar: 'استدعى وحش الكيوبي وسيطر عليه بالشارينغان لمواجهة هاشيراما', en: 'Controlled the Nine-Tails with his Sharingan to duel Hashirama' }
        ],
        hard: [
          { ar: 'هو أول شخص في تاريخ عشيرة الأوتشيها يوقظ المانغيكيو شارينغان الأبدية', en: 'First person in Uchiha history to awaken the Eternal Mangekyo Sharingan' },
          { ar: 'أصبح جينشوريكي الجيوبي (ذي الذيول العشرة) في حرب النينجا الرابعة', en: 'Became the Ten-Tails Jinchuriki during the 4th Great Ninja War' }
        ]
      }
    },
    {
      id: 'jiraiya',
      name: { ar: 'جيرايا (الناسك المنحرف)', en: 'Jiraiya (Toad Sage)' },
      avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b2423-RO5MyoXSA9OL.png',
      gender: 'male',
      role: { ar: 'أحد السنانين الأسطوريين وكاتب شهير', en: 'Legendary Sannin & Toad Sage' },
      powerType: { ar: 'نمط ناسك الضفادع + استدعاء غامابونتا + التشاكرا النارية والزيت', en: 'Toad Sage Mode + Gamabunta Summon + Fire & Oil Release' },
      affiliation: { ar: 'قرية كونوها (جبل ميوبوكو)', en: 'Hidden Leaf Village (Mount Myoboku)' },
      quote: { ar: 'مقياس الشينوبي الحقيقي ليس في كيفية حياته، بل في كيفية موته!', en: 'A shinobi’s life is not measured by how they live, but by what they achieved before death!' },
      clues: {
        easy: [
          { ar: 'أحد السنانين الثلاثة الأسطوريين ومعلم ناروتو وميناتو', en: 'One of the Legendary Three Sannin and teacher of Naruto and Minato' },
          { ar: 'يركب دائماً على ظهور ضفادع جبل ميوبوكو العملاقة', en: 'Summons giant battle toads from Mount Myoboku' }
        ],
        medium: [
          { ar: 'مؤلف سلسلة كتب "إيتشا إيتشا بارادايس" التي يقرأها كاكاشي', en: 'Author of the Icha Icha romance novels read by Kakashi' },
          { ar: 'علّم ناروتو كيفية استدعاء الضفادع واستخدام الراسينغان', en: 'Taught Naruto toad summoning and the Rasengan' }
        ],
        hard: [
          { ar: 'تنبأ الحكيم العظيم للضفادع بأنه سيربي طفل النبوءة الذي سيغير العالم', en: 'Great Toad Sage prophesied he would mentor the Child of Prophecy' },
          { ar: 'ضحى بحياته في قرية المطر لكشف سر باين وأرسل الكود المشفر على ظهر فوكاساكو', en: 'Died in the Hidden Rain to decode Pain’s secret, writing the message on Fukasaku’s back' }
        ]
      }
    }
  ],
  triviaQuestions: [
    {
      id: 'n_triv_1',
      difficulty: 'easy',
      question: { ar: 'ما هو اسم مطعم الرامن المفضل لناروتو في كونوها؟', en: 'What is Naruto’s favorite ramen shop in Konoha?' },
      options: [{ ar: 'إيتشيراكو رامن', en: 'Ichiraku Ramen' }, { ar: 'كونوها ياكيزورا', en: 'Konoha Noodles' }, { ar: 'يوتوبيا رامن', en: 'Utopia Ramen' }, { ar: 'هوكاجي سوبا', en: 'Hokage Soba' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_2',
      difficulty: 'easy',
      question: { ar: 'من هو الهوكاجي الرابع والد ناروتو؟', en: 'Who is the Fourth Hokage and Naruto’s father?' },
      options: [{ ar: 'ميناتو ناميكازي', en: 'Minato Namikaze' }, { ar: 'جيرايا', en: 'Jiraiya' }, { ar: 'هاشيراما', en: 'Hashirama' }, { ar: 'توبيراما', en: 'Tobirama' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_3',
      difficulty: 'medium',
      question: { ar: 'ما اسم السيف الأسطوري في سوسانو إيتاتشي الذي يختم الخصوم للأبد؟', en: 'What is the legendary sword in Itachi’s Susanoo that seals enemies forever?' },
      options: [{ ar: 'سيف توتسوكا', en: 'Totsuka Blade' }, { ar: 'سيف كوساناغي', en: 'Kusanagi' }, { ar: 'مرآة ياتا', en: 'Yata Mirror' }, { ar: 'سيمبونزاكورا', en: 'Senbonzakura' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_4',
      difficulty: 'hard',
      question: { ar: 'ما هي الرسالة المشفرة التي نقشها جيرايا على ظهر الضفدع؟', en: 'What was Jiraiya’s decoded message on the toad’s back?' },
      options: [{ ar: 'الحقيقي ليس بين أحد منهم', en: 'The real one is not among them' }, { ar: 'باين في البرج', en: 'Pain is in the tower' }, { ar: 'الرينغان مزيفة', en: 'The Rinnegan is fake' }, { ar: 'ناغاتو يسيطر عليهم', en: 'Nagato controls them' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_5',
      difficulty: 'easy',
      question: { ar: 'ما هو العنصر الأساسي لتشاكرا ناروتو الطبيعية؟', en: 'What is Naruto’s primary natural chakra nature?' },
      options: [{ ar: 'عنصر الرياح (فوتون)', en: 'Wind Release' }, { ar: 'عنصر النار (كاتون)', en: 'Fire Release' }, { ar: 'عنصر البرق (رايتون)', en: 'Lightning Release' }, { ar: 'عنصر الماء (سويتون)', en: 'Water Release' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_6',
      difficulty: 'medium',
      question: { ar: 'من هو مبتكر تقنية نسخ الظل (كاجي بونشين نو جيتسو) وتقنية الإيدو تينسي؟', en: 'Who created the Shadow Clone jutsu and Edo Tensei?' },
      options: [{ ar: 'توبيراما سينجو (الهوكاجي الثاني)', en: 'Tobirama Senju' }, { ar: 'هاشيراما سينجو', en: 'Hashirama Senju' }, { ar: 'أوروتشيمارو', en: 'Orochimaru' }, { ar: 'ميناتو ناميكازي', en: 'Minato Namikaze' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_7',
      difficulty: 'easy',
      question: { ar: 'ما هو الاسم الحقيقي لوحش الذيول التسعة (الكيوبي)؟', en: 'What is the true name of the Nine-Tails Fox?' },
      options: [{ ar: 'كوراما', en: 'Kurama' }, { ar: 'شوكاكو', en: 'Shukaku' }, { ar: 'غيوكي', en: 'Gyuki' }, { ar: 'ماتاتابي', en: 'Matatabi' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_8',
      difficulty: 'medium',
      question: { ar: 'ما هي العين الأسطورية التي يمتلكها ناغاتو وساسكي ومادارا؟', en: 'What legendary dojutsu is shared by Nagato, Sasuke, and Madara?' },
      options: [{ ar: 'الرينغان', en: 'Rinnegan' }, { ar: 'البياكوغان', en: 'Byakugan' }, { ar: 'التنسيغان', en: 'Tenseigan' }, { ar: 'الكيتسوريوغان', en: 'Ketsuryugan' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_9',
      difficulty: 'hard',
      question: { ar: 'كم عدد البوابات الثمانية التي فتحها مايت غاي ضد مادارا؟', en: 'How many of the Eight Gates did Might Guy open against Madara?' },
      options: [{ ar: 'جميع البوابات الثمانية (بوابة الموت)', en: 'All Eight Gates (Gate of Death)' }, { ar: 'سبع بوابات فقط', en: 'Seven Gates' }, { ar: 'ست بوابات', en: 'Six Gates' }, { ar: 'خمس بوابات', en: 'Five Gates' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_10',
      difficulty: 'easy',
      question: { ar: 'ما اسم القرية التي ينتمي إليها غارا؟', en: 'What hidden village does Gaara belong to?' },
      options: [{ ar: 'قرية الرمال المخفية (سوناغاكوري)', en: 'Hidden Sand Village' }, { ar: 'قرية المطر', en: 'Hidden Rain' }, { ar: 'قرية الضباب', en: 'Hidden Mist' }, { ar: 'قرية السحاب', en: 'Hidden Cloud' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_11',
      difficulty: 'medium',
      question: { ar: 'من هو المعلم الأول لناروتو في الأكاديمية الذي اعترف به وحماه من ميزوكي؟', en: 'Who was Naruto’s first Academy teacher who acknowledged him?' },
      options: [{ ar: 'إيروكا أومينو', en: 'Iruka Umino' }, { ar: 'كاكاشي هاتاكي', en: 'Kakashi' }, { ar: 'إيبيسو', en: 'Ebisu' }, { ar: 'أسوما ساروتوبي', en: 'Asuma' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_12',
      difficulty: 'medium',
      question: { ar: 'ما اسم السيف العظيم ذو الأشواك الذي كان يحمله كيسامي هوشيغاكي؟', en: 'What was the name of Kisame’s chakra-eating blade?' },
      options: [{ ar: 'ساميهادا (جلد القرش)', en: 'Samehada' }, { ar: 'كوبيكيريبوتشو', en: 'Kubikiribocho' }, { ar: 'كيبا', en: 'Kiba' }, { ar: 'هيراميكاري', en: 'Hiramekarei' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_13',
      difficulty: 'hard',
      question: { ar: 'ما هي المنظمة السرية في كونوها التي كان يقودها دانزو شيمورا؟', en: 'What was the secret division in Konoha led by Danzo Shimura?' },
      options: [{ ar: 'جذور الأنبو (The Foundation / Root)', en: 'The Foundation (Root)' }, { ar: 'فرقة الصقور', en: 'Hawk Division' }, { ar: 'حراس الهوكاجي الاثني عشر', en: 'Twelve Guardian Ninja' }, { ar: 'شرطة كونوها', en: 'Konoha Police' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_14',
      difficulty: 'easy',
      question: { ar: 'من هي النينجا الطبية وحفيدة الهوكاجي الأول التي أصبحت الهوكاجي الخامس؟', en: 'Who is the medical ninja and granddaughter of the 1st Hokage who became 5th Hokage?' },
      options: [{ ar: 'تسونادي سينجو', en: 'Tsunade Senju' }, { ar: 'شيزوني', en: 'Shizune' }, { ar: 'كوريناي', en: 'Kurenai' }, { ar: 'ميتو أوزوماكي', en: 'Mito Uzumaki' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_15',
      difficulty: 'medium',
      question: { ar: 'ما هو اسم تقنية الوهم البصري الأقوى لشيسوي أوتشيها؟', en: 'What is Shisui Uchiha’s ultimate genjutsu technique?' },
      options: [{ ar: 'كوتواماتسوكامي', en: 'Kotoamatsukami' }, { ar: 'تسوكيومي', en: 'Tsukuyomi' }, { ar: 'إيزانامي', en: 'Izanami' }, { ar: 'إيزاناغي', en: 'Izanagi' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_16',
      difficulty: 'hard',
      question: { ar: 'ما اسم الجبل المقدس الذي تعلم فيه ناروتو وجيرايا نمط الناسك؟', en: 'What sacred mountain did Naruto and Jiraiya master Sage Mode on?' },
      options: [{ ar: 'جبل ميوبوكو (Myoboku)', en: 'Mount Myoboku' }, { ar: 'كهف ريوتشي', en: 'Ryuchi Cave' }, { ar: 'غابة شيكوتسو', en: 'Shikkotsu Forest' }, { ar: 'وادي السحاب', en: 'Cloud Valley' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_17',
      difficulty: 'easy',
      question: { ar: 'من هو قائد الفريق الثامن المكون من كيبا وشينو وهيناتا؟', en: 'Who was the jonin leader of Team 8 (Kiba, Shino, Hinata)?' },
      options: [{ ar: 'كوريناي يوهي', en: 'Kurenai Yuhi' }, { ar: 'أسوما ساروتوبي', en: 'Asuma' }, { ar: 'غاي', en: 'Guy' }, { ar: 'أنكو', en: 'Anko' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_18',
      difficulty: 'medium',
      question: { ar: 'ما اسم التناسخين الأوائل لأبناء حكيم المسارات الستة؟', en: 'Who were the two sons of the Sage of Six Paths?' },
      options: [{ ar: 'إندرا وآشورا', en: 'Indra and Asura' }, { ar: 'هاغورومو وهامورا', en: 'Hagoromo and Hamura' }, { ar: 'مادارا وهاشيراما', en: 'Madara and Hashirama' }, { ar: 'ساسكي وناروتو', en: 'Sasuke and Naruto' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_19',
      difficulty: 'hard',
      question: { ar: 'ما هو الاسم الحقيقي لجسد باين الرئيسي (مسار الديفا)؟', en: 'What was the real name of Pain’s Deva Path host body?' },
      options: [{ ar: 'ياهيكو', en: 'Yahiko' }, { ar: 'ناغاتو', en: 'Nagato' }, { ar: 'كونان', en: 'Konan' }, { ar: 'هانزو', en: 'Hanzo' }],
      correctIndex: 0
    },
    {
      id: 'n_triv_20',
      difficulty: 'hard',
      question: { ar: 'ما هو الكائن الأول الذي استدعته كاغويا أوتسوتسوكي وحولته إلى شجرة التشاكرا؟', en: 'What entity did Kaguya fuse with that became the Ten-Tails?' },
      options: [{ ar: 'الوحش ذو الذيول العشرة (الجيوبي)', en: 'The Ten-Tails (Juubi)' }, { ar: 'الكيوبي والهاشيمي', en: 'Kurama & Gyuki' }, { ar: 'جدول الضفادع', en: 'Toad Elder' }, { ar: 'السوسانو المطلق', en: 'Ultimate Susanoo' }],
      correctIndex: 0
    }
  ],
  trueFalseQuestions: [
    { id: 'n_tf_1', difficulty: 'easy', statement: { ar: 'كاكاشي هاتاكي ينتمي إلى عشيرة الأوتشيها بالدم.', en: 'Kakashi belongs to the Uchiha clan by blood.' }, isCorrect: false },
    { id: 'n_tf_2', difficulty: 'easy', statement: { ar: 'ناروتو أوزوماكي هو التناسخ الروحي لـ آشورا أوتسوتسوكي.', en: 'Naruto is Asura’s spiritual reincarnation.' }, isCorrect: true },
    { id: 'n_tf_3', difficulty: 'medium', statement: { ar: 'ميناتو ناميكازي هو مبتكر تقنية الراسينغان الأصلية.', en: 'Minato is the original inventor of the Rasengan.' }, isCorrect: true },
    { id: 'n_tf_4', difficulty: 'hard', statement: { ar: 'تقنية الإيزاناغي تعمي عين المستخدم للأبد.', en: 'The Izanagi technique permanently blinds the eye.' }, isCorrect: true },
    { id: 'n_tf_5', difficulty: 'easy', statement: { ar: 'إيتاتشي أوتشيها أباد عشيرته بسبب كرهه لأخيه ساسكي.', en: 'Itachi destroyed his clan because he hated Sasuke.' }, isCorrect: false },
    { id: 'n_tf_6', difficulty: 'medium', statement: { ar: 'هاشيراما سينجو يمتلك عنصر الخشب (الموكوتون) بشكل طبيعي وراثي.', en: 'Hashirama naturally possesses Wood Release.' }, isCorrect: true },
    { id: 'n_tf_7', difficulty: 'easy', statement: { ar: 'غارا أصبح الكازيكاجي الخامس لقرية الرمال.', en: 'Gaara became the Fifth Kazekage of the Sand.' }, isCorrect: true },
    { id: 'n_tf_8', difficulty: 'medium', statement: { ar: 'أوروتشيمارو تم ختمه بسيف توتسوكا الخاص بإيتاتشي.', en: 'Orochimaru was sealed by Itachi’s Totsuka blade.' }, isCorrect: true },
    { id: 'n_tf_9', difficulty: 'hard', statement: { ar: 'أوبيتو أوتشيها هو من درب ميناتو ناميكازي في طفولته.', en: 'Obito trained Minato during childhood.' }, isCorrect: false },
    { id: 'n_tf_10', difficulty: 'easy', statement: { ar: 'هيناتا هيوفا تنتمي للفرع الرئيسي لعشيرة الهيوفا.', en: 'Hinata belongs to the Hyuga Main Family.' }, isCorrect: true },
    { id: 'n_tf_11', difficulty: 'medium', statement: { ar: 'ساسكي أوتشيها أيقظ الرينغان في كلتا عينيه اليمنى واليسرى.', en: 'Sasuke awakened the Rinnegan in both eyes.' }, isCorrect: false },
    { id: 'n_tf_12', difficulty: 'easy', statement: { ar: 'شيكامارو نارا يشتهر بذكائه الخارق واستخدام تقنيات الظلال.', en: 'Shikamaru is famous for intellect and shadow jutsu.' }, isCorrect: true },
    { id: 'n_tf_13', difficulty: 'hard', statement: { ar: 'ناغاتو ينتمي إلى عشيرة الأوزوماكي بالدم ويمتلك شعرهم الأحمر.', en: 'Nagato is of Uzumaki blood with their red hair.' }, isCorrect: true },
    { id: 'n_tf_14', difficulty: 'medium', statement: { ar: 'جيرايا تمكن من هزيمة باين والعودة حياً لكونوها.', en: 'Jiraiya defeated Pain and returned alive.' }, isCorrect: false },
    { id: 'n_tf_15', difficulty: 'easy', statement: { ar: 'تسونادي سينجو هي إحدى السنانين الثلاثة الأسطوريين.', en: 'Tsunade is one of the Three Legendary Sannin.' }, isCorrect: true },
    { id: 'n_tf_16', difficulty: 'hard', statement: { ar: 'مانغيكيو شارينغان كاكاشي وأوبيتو متصلتان بنفس البعد الفضائي (الكاموي).', en: 'Kakashi and Obito’s Mangekyo connect to the same Kamui dimension.' }, isCorrect: true },
    { id: 'n_tf_17', difficulty: 'medium', statement: { ar: 'ساسوري كان يتحكم بجسده كدمية بشرية تحتوي على قلب تشاكرا نابض.', en: 'Sasori converted his body into a puppet with a living core.' }, isCorrect: true },
    { id: 'n_tf_18', difficulty: 'easy', statement: { ar: 'روك لي يستطيع استخدام تقنيات النينجيتسو والجينجيتسو ببراعة.', en: 'Rock Lee excels at ninjutsu and genjutsu.' }, isCorrect: false },
    { id: 'n_tf_19', difficulty: 'hard', statement: { ar: 'توبيراما سينجو هو من صمم قرية كونوها وأنشأ شرطة الأوتشيها.', en: 'Tobirama Senju established the Konoha Police Force.' }, isCorrect: true },
    { id: 'n_tf_20', difficulty: 'hard', statement: { ar: 'مادارا أوتشيها خطط لخطة عين القمر بعد قراءته للوح الأوتشيها المحرف من زيتسو.', en: 'Madara planned the Eye of the Moon after reading the stone tablet altered by Zetsu.' }, isCorrect: true }
  ]
};
