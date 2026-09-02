import * as XLSX from 'xlsx';
import { Character, TriviaQuestion, TrueFalseQuestion, World, WorldType } from '../types';

export interface ParsedExcelWorldData {
  characters: Character[];
  triviaQuestions: TriviaQuestion[];
  trueFalseQuestions: TrueFalseQuestion[];
  suggestedWorldName?: { ar: string; en: string };
}

/**
 * Generates and triggers download for the official Excel World Template (.xlsx)
 */
export function downloadWorldExcelTemplate(worldNamePlaceholder: string = 'AttackOnTitan') {
  const wb = XLSX.utils.book_new();

  // 1. Characters Sheet
  const charactersData = [
    {
      'name_ar (اسم الشخصية)': 'إيرين ييغر',
      'name_en (Character Name)': 'Eren Yeager',
      'gender (male/female/other)': 'male',
      'role_ar (الدور)': 'حامل العملاق المهاجم وعملاق المؤسس',
      'role_en (Role)': 'Attack Titan & Founding Titan Host',
      'power_ar (نوع القوة)': 'قوة العمالقة التسعة + التصلب والمطالبة بالحرية',
      'power_en (Power)': 'Nine Titans Power + Titan Hardening',
      'affiliation_ar (الانتماء)': 'فيلق الاستطلاع (جزيرة باراديس)',
      'affiliation_en (Affiliation)': 'Survey Corps (Paradis Island)',
      'quote_ar (اقتباس مشهور)': 'إذا لم نقاتل، فلن نتمكن من الفوز أبداً!',
      'quote_en (Famous Quote)': 'If you do not fight, you cannot win!',
      'clue_easy_1_ar': 'يمتلك مفتاح قبو منزل والده في مقاطعة شيغانشينا',
      'clue_easy_1_en': 'Holds the basement key to his father house in Shiganshina',
      'clue_easy_2_ar': 'انضم إلى فيلق الاستطلاع للانتقام من العمالقة وإبادتهم',
      'clue_easy_2_en': 'Joined the Survey Corps to eliminate all Titans',
      'clue_med_1_ar': 'ابن غريشا ييغر وكارلا ييغر والأخ غير الشقيق لزيكي',
      'clue_med_1_en': 'Son of Grisha and Carla, half-brother of Zeke Yeager',
      'clue_med_2_ar': 'أيقظ قوة العملاق المؤسس لأول مرة عند لمس دينا فريتز',
      'clue_med_2_en': 'First awakened Founding Titan upon touching Dina Fritz',
      'clue_hard_1_ar': 'تلاعب بذكريات والده في الماضي عبر مسارات العملاق المهاجم',
      'clue_hard_1_en': 'Manipulated his father memories through Attack Titan paths',
      'clue_hard_2_ar': 'أطلق هدير العمالقة (The Rumbling) لتدمير العالم خلف الأسوار',
      'clue_hard_2_en': 'Initiated the Rumbling to protect Paradis Island',
      'image_filename (اسم ملف الصورة)': `${worldNamePlaceholder}_1.png`
    },
    {
      'name_ar (اسم الشخصية)': 'ليفاي أكرمان',
      'name_en (Character Name)': 'Levi Ackerman',
      'gender (male/female/other)': 'male',
      'role_ar (الدور)': 'أقوى جندي في البشرية وقائد فرقة العمليات الخاصة',
      'role_en (Role)': 'Humanity Strongest Soldier & Special Squad Captain',
      'power_ar (نوع القوة)': 'مهارة قتالية خارقة بأجهزة المناورة ثلاثية الأبعاد + قوة دماء الأكرمان',
      'power_en (Power)': 'Master ODM Gear Combat + Awakened Ackerman Power',
      'affiliation_ar (الانتماء)': 'فيلق الاستطلاع (المدينة السفلية سابقاً)',
      'affiliation_en (Affiliation)': 'Survey Corps (Underground City)',
      'quote_ar (اقتباس مشهور)': 'اختر بنفسك القرار الذي لن تندم عليه لاحقاً.',
      'quote_en (Famous Quote)': 'Make the choice that you will regret the least.',
      'clue_easy_1_ar': 'مهووس بالنظافة الشديدة ويشرب الشاي بطريقة مميزة',
      'clue_easy_1_en': 'Obsessed with extreme cleanliness and holds tea cups by the rim',
      'clue_easy_2_ar': 'يُعرف رسمياً بلقب أقوى جندي في تاريخ البشرية داخل الأسوار',
      'clue_easy_2_en': 'Known as Humanity Strongest Soldier inside the walls',
      'clue_med_1_ar': 'خاله هو السفاح كيني أكرمان الذي دربه في المدينة السفلية',
      'clue_med_1_en': 'His uncle is Kenny the Ripper who raised him underground',
      'clue_med_2_ar': 'قطع العملاق القرد (زيكي) وهزمه في غابة الأشجار العملاقة',
      'clue_med_2_en': 'Shredded and humiliated the Beast Titan multiple times',
      'clue_hard_1_ar': 'كان الجندي الوحيد الذي نجا من مجزرة هجوم فرقة كيني في الكهف الكريستالي',
      'clue_hard_1_en': 'Sole survivor of multiple catastrophic ambush missions',
      'clue_hard_2_ar': 'حقق وعده لإرفين سميث بالقضاء على العملاق الوحش في النهاية',
      'clue_hard_2_en': 'Fulfilled his final oath to Commander Erwin Smith',
      'image_filename (اسم ملف الصورة)': `${worldNamePlaceholder}_2.png`
    }
  ];

  const wsChars = XLSX.utils.json_to_sheet(charactersData);
  XLSX.utils.book_append_sheet(wb, wsChars, 'Characters');

  // 2. Trivia Questions Sheet
  const triviaData = [
    {
      'question_ar (نص السؤال)': 'ما هو اسم المدينة أو الجزيرة التي تدور فيها أحداث القصة خلف الأسوار؟',
      'question_en (Question)': 'What is the name of the island where the story takes place behind the walls?',
      'difficulty (easy/medium/hard)': 'easy',
      'option_1_ar': 'جزيرة باراديس',
      'option_1_en': 'Paradis Island',
      'option_2_ar': 'إمبراطورية مارلي',
      'option_2_en': 'Marley Empire',
      'option_3_ar': 'أوديسيا',
      'option_3_en': 'Odyssey',
      'option_4_ar': 'هيزورو',
      'option_4_en': 'Hizuru',
      'correct_index (رقم الإجابة 1-4)': 1,
      'explanation_ar': 'جزيرة باراديس هي الجزيرة المعزولة التي بنى عليها الملك فريتز الأسوار الثلاثة.',
      'explanation_en': 'Paradis Island is where King Fritz retreated and constructed the 3 walls.'
    },
    {
      'question_ar (نص السؤال)': 'كم عدد العمالقة التسعة الأسطوريين المنحدرين من يمير فريتز؟',
      'question_en (Question)': 'How many Intelligent Titan Powers descended from Ymir Fritz?',
      'difficulty (easy/medium/hard)': 'easy',
      'option_1_ar': '9 عمالقة',
      'option_1_en': '9 Titans',
      'option_2_ar': '7 عمالقة',
      'option_2_en': '7 Titans',
      'option_3_ar': '12 عملاقاً',
      'option_3_en': '12 Titans',
      'option_4_ar': '5 عمالقة',
      'option_4_en': '5 Titans',
      'correct_index (رقم الإجابة 1-4)': 1,
      'explanation_ar': 'العمالقة التسعة هم: المؤسس، المهاجم، الهائل، المدرع، الأنثى، الوحش، الفك، العربة، ومطرقة الحرب.',
      'explanation_en': 'The Nine Titans are: Founding, Attack, Colossal, Armored, Female, Beast, Jaw, Cart, and War Hammer.'
    },
    {
      'question_ar (نص السؤال)': 'ما هو الاسم الحقيقي لقائد فيلق الاستطلاع الذي قاد هجوم الانتحار الأخير على العملاق الوحش؟',
      'question_en (Question)': 'Who was the Commander of the Survey Corps who led the final charge against the Beast Titan?',
      'difficulty (medium/hard)': 'medium',
      'option_1_ar': 'إرفين سميث',
      'option_1_en': 'Erwin Smith',
      'option_2_ar': 'هانجي زوي',
      'option_2_en': 'Hange Zoe',
      'option_3_ar': 'كيث شاديس',
      'option_3_en': 'Keith Shadis',
      'option_4_ar': 'دوت بيكسيس',
      'option_4_en': 'Dot Pyxis',
      'correct_index (رقم الإجابة 1-4)': 1,
      'explanation_ar': 'القائد إرفين سميث ضحى بحياته في معركة شيغانشينا لصنع فرصة لليفاي لمباغتة العملاق الوحش.',
      'explanation_en': 'Commander Erwin Smith sacrificed his life to give Levi the opening to attack the Beast Titan.'
    }
  ];

  const wsTrivia = XLSX.utils.json_to_sheet(triviaData);
  XLSX.utils.book_append_sheet(wb, wsTrivia, 'Trivia');

  // 3. True / False Sheet
  const trueFalseData = [
    {
      'statement_ar (نص الجملة)': 'الميكاسا أكرمان هي الأخت البيولوجية لليفاي أكرمان.',
      'statement_en (Statement)': 'Mikasa Ackerman is the biological sister of Levi Ackerman.',
      'difficulty (easy/medium/hard)': 'easy',
      'is_correct (true/false أو صح/خطأ)': 'false',
      'explanation_ar': 'خطأ؛ كلاهما من نفس عشيرة الأكرمان لكنهما ليسا أخوة.',
      'explanation_en': 'False; both belong to the Ackerman clan but are not siblings.'
    },
    {
      'statement_ar (نص الجملة)': 'حاملو قوة العمالقة التسعة يعيشون 13 عاماً فقط بعد وراثة القوة (لعنة يمير).',
      'statement_en (Statement)': 'Titan shifters only live for 13 years after inheriting their power (Curse of Ymir).',
      'difficulty (easy/medium/hard)': 'easy',
      'is_correct (true/false أو صح/خطأ)': 'true',
      'explanation_ar': 'صحيح؛ هذه القاعدة تُعرف باسم لعنة يمير لأن يمير فريتز ماتت بعد 13 عاماً من إيقاظ القوة.',
      'explanation_en': 'True; this is known as the Curse of Ymir because Ymir died 13 years after gaining her power.'
    }
  ];

  const wsTF = XLSX.utils.json_to_sheet(trueFalseData);
  XLSX.utils.book_append_sheet(wb, wsTF, 'TrueFalse');

  // Write and trigger download
  XLSX.writeFile(wb, `AG_Utopia_World_Template_${worldNamePlaceholder}.xlsx`);
}

/**
 * Parses uploaded Excel File buffer and extracts Characters, Trivia, True/False
 */
export async function parseWorldExcelFile(file: File): Promise<ParsedExcelWorldData> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });

  const sheetNames = wb.SheetNames;
  
  // Find sheets or fallback to indices
  const charSheetName = sheetNames.find(s => s.toLowerCase().includes('char')) || sheetNames[0];
  const triviaSheetName = sheetNames.find(s => s.toLowerCase().includes('triv')) || sheetNames[1] || sheetNames[0];
  const tfSheetName = sheetNames.find(s => s.toLowerCase().includes('true') || s.toLowerCase().includes('tf')) || sheetNames[2] || sheetNames[0];

  const characters: Character[] = [];
  const triviaQuestions: TriviaQuestion[] = [];
  const trueFalseQuestions: TrueFalseQuestion[] = [];

  // Parse Characters
  if (charSheetName && wb.Sheets[charSheetName]) {
    const rawChars: any[] = XLSX.utils.sheet_to_json(wb.Sheets[charSheetName]);
    rawChars.forEach((row, i) => {
      const nameAr = row['name_ar (اسم الشخصية)'] || row['name_ar'] || row['Name Ar'] || row['اسم الشخصية'] || `شخصية ${i + 1}`;
      const nameEn = row['name_en (Character Name)'] || row['name_en'] || row['Name En'] || `Character ${i + 1}`;
      const id = (nameEn.toLowerCase().replace(/[^a-z0-9]/g, '_') || `char_${i + 1}`).slice(0, 30);
      const gender = (row['gender (male/female/other)'] || row['gender'] || 'male').toString().toLowerCase().includes('fem') ? 'female' : 'male';
      const roleAr = row['role_ar (الدور)'] || row['role_ar'] || 'شخصية أسطورية';
      const roleEn = row['role_en (Role)'] || row['role_en'] || 'Legendary Character';
      const powerAr = row['power_ar (نوع القوة)'] || row['power_ar'] || 'قوى قتالية خاصة';
      const powerEn = row['power_en (Power)'] || row['power_en'] || 'Special Combat Powers';
      const affAr = row['affiliation_ar (الانتماء)'] || row['affiliation_ar'] || 'عالم المنافسة';
      const affEn = row['affiliation_en (Affiliation)'] || row['affiliation_en'] || 'Contest Universe';
      const quoteAr = row['quote_ar (اقتباس مشهور)'] || row['quote_ar'] || 'أنا جاهز للمعركة!';
      const quoteEn = row['quote_en (Famous Quote)'] || row['quote_en'] || 'I am ready for battle!';
      const imgFilename = row['image_filename (اسم ملف الصورة)'] || row['image_filename'] || row['image'] || '';

      const cluesEasy = [
        { ar: row['clue_easy_1_ar'] || 'تلميح سهل 1', en: row['clue_easy_1_en'] || 'Easy Clue 1' },
        { ar: row['clue_easy_2_ar'] || 'تلميح سهل 2', en: row['clue_easy_2_en'] || 'Easy Clue 2' },
      ].filter(c => c.ar && c.ar.trim());

      const cluesMed = [
        { ar: row['clue_med_1_ar'] || 'تلميح متوسط 1', en: row['clue_med_1_en'] || 'Medium Clue 1' },
        { ar: row['clue_med_2_ar'] || 'تلميح متوسط 2', en: row['clue_med_2_en'] || 'Medium Clue 2' },
      ].filter(c => c.ar && c.ar.trim());

      const cluesHard = [
        { ar: row['clue_hard_1_ar'] || 'تلميح صعب 1', en: row['clue_hard_1_en'] || 'Hard Clue 1' },
        { ar: row['clue_hard_2_ar'] || 'تلميح صعب 2', en: row['clue_hard_2_en'] || 'Hard Clue 2' },
      ].filter(c => c.ar && c.ar.trim());

      characters.push({
        id,
        name: { ar: nameAr, en: nameEn },
        avatar: imgFilename, // placeholder for file binder or direct URL
        gender,
        role: { ar: roleAr, en: roleEn },
        powerType: { ar: powerAr, en: powerEn },
        affiliation: { ar: affAr, en: affEn },
        quote: { ar: quoteAr, en: quoteEn },
        clues: {
          easy: cluesEasy.length > 0 ? cluesEasy : [{ ar: 'شخصية مشهورة في هذا العالم', en: 'Famous character' }],
          medium: cluesMed.length > 0 ? cluesMed : [{ ar: 'تمتلك قدرات وتاريخاً مميزاً', en: 'Distinctive abilities' }],
          hard: cluesHard.length > 0 ? cluesHard : [{ ar: 'شاركت في أحداث مفصلية تاريخية', en: 'Part of crucial events' }],
        }
      });
    });
  }

  // Parse Trivia Questions
  if (triviaSheetName && wb.Sheets[triviaSheetName] && triviaSheetName !== charSheetName) {
    const rawTrivia: any[] = XLSX.utils.sheet_to_json(wb.Sheets[triviaSheetName]);
    rawTrivia.forEach((row, i) => {
      const qAr = row['question_ar (نص السؤال)'] || row['question_ar'] || row['Question Ar'] || row['السؤال'] || `سؤال عام ${i + 1}`;
      const qEn = row['question_en (Question)'] || row['question_en'] || row['Question En'] || `Question ${i + 1}`;
      const diffStr = (row['difficulty (easy/medium/hard)'] || row['difficulty'] || 'medium').toString().toLowerCase();
      const difficulty = diffStr.includes('hard') || diffStr.includes('صعب') ? 'hard' : diffStr.includes('easy') || diffStr.includes('سهل') ? 'easy' : 'medium';

      const opt1Ar = row['option_1_ar'] || row['opt_1_ar'] || 'الخيار الأول';
      const opt1En = row['option_1_en'] || row['opt_1_en'] || 'Option 1';
      const opt2Ar = row['option_2_ar'] || row['opt_2_ar'] || 'الخيار الثاني';
      const opt2En = row['option_2_en'] || row['opt_2_en'] || 'Option 2';
      const opt3Ar = row['option_3_ar'] || row['opt_3_ar'] || 'الخيار الثالث';
      const opt3En = row['option_3_en'] || row['opt_3_en'] || 'Option 3';
      const opt4Ar = row['option_4_ar'] || row['opt_4_ar'] || 'الخيار الرابع';
      const opt4En = row['option_4_en'] || row['opt_4_en'] || 'Option 4';

      let correctIndex = parseInt(row['correct_index (رقم الإجابة 1-4)'] || row['correct_index'] || row['correct'] || '1', 10);
      if (isNaN(correctIndex) || correctIndex < 1 || correctIndex > 4) {
        correctIndex = 1;
      }
      // 0-indexed in code:
      const finalCorrectIdx = correctIndex - 1;

      const expAr = row['explanation_ar'] || '';
      const expEn = row['explanation_en'] || '';

      triviaQuestions.push({
        id: `triv_q_${i + 1}_${Math.random().toString(36).substring(2, 6)}`,
        difficulty,
        question: { ar: qAr, en: qEn },
        options: [
          { ar: opt1Ar, en: opt1En },
          { ar: opt2Ar, en: opt2En },
          { ar: opt3Ar, en: opt3En },
          { ar: opt4Ar, en: opt4En }
        ],
        correctIndex: finalCorrectIdx,
        explanation: expAr ? { ar: expAr, en: expEn || expAr } : undefined
      });
    });
  }

  // Parse True/False Questions
  if (tfSheetName && wb.Sheets[tfSheetName] && tfSheetName !== charSheetName && tfSheetName !== triviaSheetName) {
    const rawTF: any[] = XLSX.utils.sheet_to_json(wb.Sheets[tfSheetName]);
    rawTF.forEach((row, i) => {
      const stmtAr = row['statement_ar (نص الجملة)'] || row['statement_ar'] || row['Statement Ar'] || `جملة صح أو خطأ ${i + 1}`;
      const stmtEn = row['statement_en (Statement)'] || row['statement_en'] || `Statement ${i + 1}`;
      const diffStr = (row['difficulty (easy/medium/hard)'] || row['difficulty'] || 'easy').toString().toLowerCase();
      const difficulty = diffStr.includes('hard') ? 'hard' : diffStr.includes('med') ? 'medium' : 'easy';

      const isCorrectRaw = (row['is_correct (true/false أو صح/خطأ)'] || row['is_correct'] || 'true').toString().toLowerCase();
      const isCorrect = isCorrectRaw.includes('true') || isCorrectRaw.includes('صح') || isCorrectRaw === '1';

      const expAr = row['explanation_ar'] || '';
      const expEn = row['explanation_en'] || '';

      trueFalseQuestions.push({
        id: `tf_q_${i + 1}_${Math.random().toString(36).substring(2, 6)}`,
        difficulty,
        statement: { ar: stmtAr, en: stmtEn },
        isCorrect,
        explanation: expAr ? { ar: expAr, en: expEn || expAr } : undefined
      });
    });
  }

  // Auto-generate rich Trivia & True/False questions if none were explicitly provided in sheets
  if (triviaQuestions.length === 0 && characters.length >= 2) {
    const generated = generateQuestionsFromCharacters(characters);
    triviaQuestions.push(...generated.triviaQuestions);
    if (trueFalseQuestions.length === 0) {
      trueFalseQuestions.push(...generated.trueFalseQuestions);
    }
  }

  return {
    characters,
    triviaQuestions,
    trueFalseQuestions
  };
}

/**
 * Automatically synthesizes comprehensive Trivia and True/False questions directly from Character entities
 */
export function generateQuestionsFromCharacters(characters: Character[]): {
  triviaQuestions: TriviaQuestion[];
  trueFalseQuestions: TrueFalseQuestion[];
} {
  if (characters.length === 0) return { triviaQuestions: [], trueFalseQuestions: [] };

  const triviaQuestions: TriviaQuestion[] = [];
  const trueFalseQuestions: TrueFalseQuestion[] = [];

  characters.forEach((char, i) => {
    const wrongChars = characters.filter(c => c.id !== char.id);

    // 1. Guess by Quote
    if (char.quote && char.quote.ar && char.quote.ar.length > 3 && wrongChars.length >= 3) {
      const pool = [char, ...wrongChars.slice(0, 3)].sort(() => 0.5 - Math.random());
      const correctIdx = pool.findIndex(p => p.id === char.id);
      triviaQuestions.push({
        id: `gen_triv_quote_${i + 1}_${char.id}`,
        difficulty: 'medium',
        question: {
          ar: `من صاحب هذه المقولة الشهيرة: «${char.quote.ar}»؟`,
          en: `Who famously said: "${char.quote.en || char.quote.ar}"?`
        },
        options: [
          pool[0].name,
          pool[1].name,
          pool[2].name,
          pool[3].name
        ],
        correctIndex: correctIdx >= 0 ? correctIdx : 0,
        explanation: {
          ar: `هذه العبارة هي الاقتباس الأيقوني لشخصية ${char.name.ar}.`,
          en: `This iconic quote belongs to ${char.name.en}.`
        }
      });
    }

    // 2. Guess by Role / Title
    if (char.role && char.role.ar && wrongChars.length >= 3) {
      const pool = [char, ...wrongChars.slice(0, 3)].sort(() => 0.5 - Math.random());
      const correctIdx = pool.findIndex(p => p.id === char.id);
      triviaQuestions.push({
        id: `gen_triv_role_${i + 1}_${char.id}`,
        difficulty: 'easy',
        question: {
          ar: `ما هو الدور أو اللقب الأساسي لشخصية ${char.name.ar}؟`,
          en: `What is the primary role or title of ${char.name.en}?`
        },
        options: [
          pool[0].role,
          pool[1].role,
          pool[2].role,
          pool[3].role
        ],
        correctIndex: correctIdx >= 0 ? correctIdx : 0,
        explanation: {
          ar: `دور ${char.name.ar} في القصة هو: ${char.role.ar}.`,
          en: `The role of ${char.name.en} is: ${char.role.en}.`
        }
      });
    }

    // 3. Guess by Affiliation
    if (char.affiliation && char.affiliation.ar && wrongChars.length >= 3) {
      const pool = [char, ...wrongChars.slice(0, 3)].sort(() => 0.5 - Math.random());
      const correctIdx = pool.findIndex(p => p.id === char.id);
      triviaQuestions.push({
        id: `gen_triv_aff_${i + 1}_${char.id}`,
        difficulty: 'medium',
        question: {
          ar: `إلى أي منظمة أو فصيل تنتمي شخصية ${char.name.ar}؟`,
          en: `Which faction or affiliation does ${char.name.en} belong to?`
        },
        options: [
          pool[0].affiliation,
          pool[1].affiliation,
          pool[2].affiliation,
          pool[3].affiliation
        ],
        correctIndex: correctIdx >= 0 ? correctIdx : 0,
        explanation: {
          ar: `تنتمي شخصية ${char.name.ar} إلى: ${char.affiliation.ar}.`,
          en: `${char.name.en} is affiliated with: ${char.affiliation.en}.`
        }
      });
    }

    // 4. True / False: Affiliation (True)
    if (char.affiliation && char.affiliation.ar) {
      trueFalseQuestions.push({
        id: `gen_tf_aff_true_${i + 1}_${char.id}`,
        difficulty: 'easy',
        statement: {
          ar: `تنتمي شخصية ${char.name.ar} إلى ${char.affiliation.ar}.`,
          en: `${char.name.en} belongs to ${char.affiliation.en}.`
        },
        isCorrect: true,
        explanation: {
          ar: `صحيح؛ ${char.name.ar} تنتمي إلى ${char.affiliation.ar}.`,
          en: `Correct; ${char.name.en} belongs to ${char.affiliation.en}.`
        }
      });
    }

    // 5. True / False: Wrong Affiliation (False)
    const otherCharWithDiffAff = characters.find(c => c.id !== char.id && c.affiliation.ar !== char.affiliation.ar);
    if (otherCharWithDiffAff) {
      trueFalseQuestions.push({
        id: `gen_tf_aff_false_${i + 1}_${char.id}`,
        difficulty: 'medium',
        statement: {
          ar: `تنتمي شخصية ${char.name.ar} إلى ${otherCharWithDiffAff.affiliation.ar}.`,
          en: `${char.name.en} belongs to ${otherCharWithDiffAff.affiliation.en}.`
        },
        isCorrect: false,
        explanation: {
          ar: `خطأ؛ ${char.name.ar} تنتمي في الحقيقة إلى ${char.affiliation.ar}.`,
          en: `False; ${char.name.en} actually belongs to ${char.affiliation.en}.`
        }
      });
    }
  });

  return { triviaQuestions, trueFalseQuestions };
}
