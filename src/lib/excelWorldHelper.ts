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
 * Universal helper to extract a field value by matching any alias, case-insensitively and ignoring extra spaces/parentheses
 */
function getRowValue(row: any, ...aliases: string[]): string {
  if (!row || typeof row !== 'object') return '';
  const keys = Object.keys(row);

  for (const alias of aliases) {
    // 1. Direct exact match
    if (row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim() !== '') {
      return String(row[alias]).trim();
    }

    // 2. Normalized alphanumeric match
    const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
    const matchingKey = keys.find(k => {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
      return cleanKey === cleanAlias || cleanKey.includes(cleanAlias) || cleanAlias.includes(cleanKey);
    });

    if (matchingKey && row[matchingKey] !== undefined && row[matchingKey] !== null && String(row[matchingKey]).trim() !== '') {
      return String(row[matchingKey]).trim();
    }
  }

  return '';
}

/**
 * Parses uploaded Excel File buffer and extracts Characters, Trivia, True/False
 */
export async function parseWorldExcelFile(file: File): Promise<ParsedExcelWorldData> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });

  const sheetNames = wb.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('ملف الإكسيل فارغ أو غير صالح.');
  }

  const characters: Character[] = [];
  const triviaQuestions: TriviaQuestion[] = [];
  const trueFalseQuestions: TrueFalseQuestion[] = [];

  // Identify sheets dynamically based on content and names
  let charSheetName: string | undefined;
  let triviaSheetName: string | undefined;
  let tfSheetName: string | undefined;

  for (const s of sheetNames) {
    const sheet = wb.Sheets[s];
    if (!sheet) continue;
    const json: any[] = XLSX.utils.sheet_to_json(sheet);
    if (json.length === 0) continue;

    const firstRow = json[0];
    const rowKeys = Object.keys(firstRow).join(' ').toLowerCase();

    if (!charSheetName && (rowKeys.includes('name_ar') || rowKeys.includes('اسم') || rowKeys.includes('char') || s.toLowerCase().includes('char'))) {
      charSheetName = s;
    } else if (!triviaSheetName && (rowKeys.includes('option_1') || rowKeys.includes('question') || rowKeys.includes('سؤال') || s.toLowerCase().includes('triv'))) {
      triviaSheetName = s;
    } else if (!tfSheetName && (rowKeys.includes('statement') || rowKeys.includes('is_correct') || rowKeys.includes('صح') || s.toLowerCase().includes('true') || s.toLowerCase().includes('tf'))) {
      tfSheetName = s;
    }
  }

  // Fallbacks if not detected by content
  if (!charSheetName) charSheetName = sheetNames[0];

  // 1. Parse Characters
  if (charSheetName && wb.Sheets[charSheetName]) {
    const rawChars: any[] = XLSX.utils.sheet_to_json(wb.Sheets[charSheetName]);
    rawChars.forEach((row, i) => {
      const nameAr = getRowValue(row, 'name_ar (اسم الشخصية)', 'name_ar', 'اسم الشخصية', 'Name Ar', 'الاسم بالعربي', 'name', 'اسم') || `شخصية ${i + 1}`;
      const nameEn = getRowValue(row, 'name_en (Character Name)', 'name_en', 'Character Name', 'Name En', 'الاسم بالانجليزي', 'en_name') || `Character ${i + 1}`;
      const id = (nameEn.toLowerCase().replace(/[^a-z0-9]/g, '_') || `char_${i + 1}`).slice(0, 30);
      const genderRaw = getRowValue(row, 'gender (male/female/other)', 'gender', 'الجنس', 'نوع الجنس').toLowerCase();
      const gender = genderRaw.includes('fem') || genderRaw.includes('أنث') || genderRaw.includes('انث') ? 'female' : 'male';
      const roleAr = getRowValue(row, 'role_ar (الدور)', 'role_ar', 'الدور', 'اللقب', 'Role Ar') || 'شخصية رئيسية';
      const roleEn = getRowValue(row, 'role_en (Role)', 'role_en', 'Role En', 'Role') || 'Main Character';
      const powerAr = getRowValue(row, 'power_ar (نوع القوة)', 'power_ar', 'نوع القوة', 'القدرة', 'القوة') || 'قوى قتالية مميزة';
      const powerEn = getRowValue(row, 'power_en (Power)', 'power_en', 'Power En', 'Power', 'Ability') || 'Special Combat Powers';
      const affAr = getRowValue(row, 'affiliation_ar (الانتماء)', 'affiliation_ar', 'الانتماء', 'الفصيل', 'العشيرة', 'القرية', 'المنظمة') || 'عالم القصة';
      const affEn = getRowValue(row, 'affiliation_en (Affiliation)', 'affiliation_en', 'Affiliation En', 'Affiliation', 'Faction') || 'Story Universe';
      const quoteAr = getRowValue(row, 'quote_ar (اقتباس مشهور)', 'quote_ar', 'اقتباس مشهور', 'المقولة', 'اقتباس', 'Quote Ar') || 'أنا جاهز للتحدي!';
      const quoteEn = getRowValue(row, 'quote_en (Famous Quote)', 'quote_en', 'Famous Quote', 'Quote En', 'Quote') || 'I am ready for the battle!';
      const imgFilename = getRowValue(row, 'image_filename (اسم ملف الصورة)', 'image_filename', 'اسم ملف الصورة', 'الصورة', 'image', 'avatar') || '';

      const cluesEasy = [
        { ar: getRowValue(row, 'clue_easy_1_ar', 'تلميح سهل 1', 'easy_1_ar') || 'شخصية مشهورة في هذا العالم', en: getRowValue(row, 'clue_easy_1_en', 'Easy 1') || 'Famous character' },
        { ar: getRowValue(row, 'clue_easy_2_ar', 'تلميح سهل 2', 'easy_2_ar'), en: getRowValue(row, 'clue_easy_2_en', 'Easy 2') },
      ].filter(c => c.ar && c.ar.trim());

      const cluesMed = [
        { ar: getRowValue(row, 'clue_med_1_ar', 'تلميح متوسط 1', 'med_1_ar') || 'تمتلك قدرات وتاريخاً مميزاً', en: getRowValue(row, 'clue_med_1_en', 'Medium 1') || 'Distinctive abilities' },
        { ar: getRowValue(row, 'clue_med_2_ar', 'تلميح متوسط 2', 'med_2_ar'), en: getRowValue(row, 'clue_med_2_en', 'Medium 2') },
      ].filter(c => c.ar && c.ar.trim());

      const cluesHard = [
        { ar: getRowValue(row, 'clue_hard_1_ar', 'تلميح صعب 1', 'hard_1_ar') || 'شاركت في أحداث مفصلية تاريخية', en: getRowValue(row, 'clue_hard_1_en', 'Hard 1') || 'Part of crucial events' },
        { ar: getRowValue(row, 'clue_hard_2_ar', 'تلميح صعب 2', 'hard_2_ar'), en: getRowValue(row, 'clue_hard_2_en', 'Hard 2') },
      ].filter(c => c.ar && c.ar.trim());

      characters.push({
        id,
        name: { ar: nameAr, en: nameEn },
        avatar: imgFilename,
        gender,
        role: { ar: roleAr, en: roleEn },
        powerType: { ar: powerAr, en: powerEn },
        affiliation: { ar: affAr, en: affEn },
        quote: { ar: quoteAr, en: quoteEn },
        clues: {
          easy: cluesEasy.length > 0 ? cluesEasy : [{ ar: 'شخصية محورية في الأحداث', en: 'Central character' }],
          medium: cluesMed.length > 0 ? cluesMed : [{ ar: 'خاضت معارك لا تُنسى', en: 'Fought memorable battles' }],
          hard: cluesHard.length > 0 ? cluesHard : [{ ar: 'تاريخها مليء بالأسرار والغموض', en: 'Mysterious background' }],
        }
      });
    });
  }

  // 2. Parse Trivia Questions
  if (triviaSheetName && wb.Sheets[triviaSheetName] && triviaSheetName !== charSheetName) {
    const rawTrivia: any[] = XLSX.utils.sheet_to_json(wb.Sheets[triviaSheetName]);
    rawTrivia.forEach((row, i) => {
      const qAr = getRowValue(row, 'question_ar (نص السؤال)', 'question_ar', 'السؤال', 'نص السؤال', 'Question Ar');
      const qEn = getRowValue(row, 'question_en (Question)', 'question_en', 'Question En', 'Question') || qAr;
      if (!qAr) return;

      const diffStr = getRowValue(row, 'difficulty (easy/medium/hard)', 'difficulty', 'الصعوبة', 'مستوى الصعوبة').toLowerCase();
      const difficulty = diffStr.includes('hard') || diffStr.includes('صعب') ? 'hard' : diffStr.includes('easy') || diffStr.includes('سهل') ? 'easy' : 'medium';

      const opt1Ar = getRowValue(row, 'option_1_ar', 'الخيار 1', 'opt_1_ar', 'الخيار الاول') || 'الخيار الأول';
      const opt1En = getRowValue(row, 'option_1_en', 'Option 1', 'opt_1_en') || opt1Ar;
      const opt2Ar = getRowValue(row, 'option_2_ar', 'الخيار 2', 'opt_2_ar', 'الخيار الثاني') || 'الخيار الثاني';
      const opt2En = getRowValue(row, 'option_2_en', 'Option 2', 'opt_2_en') || opt2Ar;
      const opt3Ar = getRowValue(row, 'option_3_ar', 'الخيار 3', 'opt_3_ar', 'الخيار الثالث') || 'الخيار الثالث';
      const opt3En = getRowValue(row, 'option_3_en', 'Option 3', 'opt_3_en') || opt3Ar;
      const opt4Ar = getRowValue(row, 'option_4_ar', 'الخيار 4', 'opt_4_ar', 'الخيار الرابع') || 'الخيار الرابع';
      const opt4En = getRowValue(row, 'option_4_en', 'Option 4', 'opt_4_en') || opt4Ar;

      let correctIndex = parseInt(getRowValue(row, 'correct_index (رقم الإجابة 1-4)', 'correct_index', 'الإجابة الصحيحة', 'الرقم الصحيح') || '1', 10);
      if (isNaN(correctIndex) || correctIndex < 1 || correctIndex > 4) {
        correctIndex = 1;
      }
      const finalCorrectIdx = correctIndex - 1;

      const expAr = getRowValue(row, 'explanation_ar', 'التوضيح', 'الشرح', 'explanation');
      const expEn = getRowValue(row, 'explanation_en', 'Explanation') || expAr;

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

  // 3. Parse True/False Questions
  if (tfSheetName && wb.Sheets[tfSheetName] && tfSheetName !== charSheetName && tfSheetName !== triviaSheetName) {
    const rawTF: any[] = XLSX.utils.sheet_to_json(wb.Sheets[tfSheetName]);
    rawTF.forEach((row, i) => {
      const stmtAr = getRowValue(row, 'statement_ar (نص الجملة)', 'statement_ar', 'الجملة', 'نص الجملة', 'Statement Ar');
      const stmtEn = getRowValue(row, 'statement_en (Statement)', 'statement_en', 'Statement En', 'Statement') || stmtAr;
      if (!stmtAr) return;

      const diffStr = getRowValue(row, 'difficulty (easy/medium/hard)', 'difficulty', 'الصعوبة').toLowerCase();
      const difficulty = diffStr.includes('hard') ? 'hard' : diffStr.includes('med') ? 'medium' : 'easy';

      const isCorrectRaw = getRowValue(row, 'is_correct (true/false أو صح/خطأ)', 'is_correct', 'صح/خطأ', 'الصحة').toLowerCase();
      const isCorrect = isCorrectRaw.includes('true') || isCorrectRaw.includes('صح') || isCorrectRaw === '1';

      const expAr = getRowValue(row, 'explanation_ar', 'التوضيح', 'الشرح');
      const expEn = getRowValue(row, 'explanation_en', 'Explanation') || expAr;

      trueFalseQuestions.push({
        id: `tf_q_${i + 1}_${Math.random().toString(36).substring(2, 6)}`,
        difficulty,
        statement: { ar: stmtAr, en: stmtEn },
        isCorrect,
        explanation: expAr ? { ar: expAr, en: expEn || expAr } : undefined
      });
    });
  }

  // 4. If no Trivia or True/False questions were found in sheets, synthesize automatically from characters
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
 * Automatically synthesizes comprehensive, randomized Trivia and True/False questions directly from Character entities
 */
export function generateQuestionsFromCharacters(characters: Character[]): {
  triviaQuestions: TriviaQuestion[];
  trueFalseQuestions: TrueFalseQuestion[];
} {
  if (characters.length === 0) return { triviaQuestions: [], trueFalseQuestions: [] };

  const triviaQuestions: TriviaQuestion[] = [];
  const trueFalseQuestions: TrueFalseQuestion[] = [];

  // Helper to pick N random unique elements from an array satisfying a predicate
  const pickRandomUnique = <T>(arr: T[], count: number, excludePredicate: (item: T) => boolean): T[] => {
    const pool = arr.filter(item => !excludePredicate(item));
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  characters.forEach((char, i) => {
    // 1. Trivia: Guess Character by Famous Quote
    if (char.quote && char.quote.ar && char.quote.ar.trim().length > 3) {
      const wrongChars = pickRandomUnique(characters, 3, c => c.id === char.id || c.name.ar === char.name.ar);
      if (wrongChars.length >= 3) {
        const pool = [char, ...wrongChars].sort(() => 0.5 - Math.random());
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
            ar: `هذه العبارة هي الاقتباس الأيقوني الخاص بشخصية ${char.name.ar}.`,
            en: `This iconic quote belongs to ${char.name.en}.`
          }
        });
      }
    }

    // 2. Trivia: Guess Role / Title of Character
    if (char.role && char.role.ar && char.role.ar.trim()) {
      const wrongChars = pickRandomUnique(characters, 3, c => c.id === char.id || c.role.ar.trim() === char.role.ar.trim());
      if (wrongChars.length >= 3) {
        const pool = [char, ...wrongChars].sort(() => 0.5 - Math.random());
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
    }

    // 3. Trivia: Guess Power Type of Character
    if (char.powerType && char.powerType.ar && char.powerType.ar.trim()) {
      const wrongChars = pickRandomUnique(characters, 3, c => c.id === char.id || c.powerType.ar.trim() === char.powerType.ar.trim());
      if (wrongChars.length >= 3) {
        const pool = [char, ...wrongChars].sort(() => 0.5 - Math.random());
        const correctIdx = pool.findIndex(p => p.id === char.id);
        triviaQuestions.push({
          id: `gen_triv_power_${i + 1}_${char.id}`,
          difficulty: 'hard',
          question: {
            ar: `ما هي القدرة أو نوع القوة القتالية لشخصية ${char.name.ar}؟`,
            en: `What is the combat power or ability of ${char.name.en}?`
          },
          options: [
            pool[0].powerType,
            pool[1].powerType,
            pool[2].powerType,
            pool[3].powerType
          ],
          correctIndex: correctIdx >= 0 ? correctIdx : 0,
          explanation: {
            ar: `قوة ${char.name.ar} هي: ${char.powerType.ar}.`,
            en: `The power of ${char.name.en} is: ${char.powerType.en}.`
          }
        });
      }
    }

    // 4. Trivia: Guess Affiliation / Faction
    if (char.affiliation && char.affiliation.ar && char.affiliation.ar.trim()) {
      const wrongChars = pickRandomUnique(characters, 3, c => c.id === char.id || c.affiliation.ar.trim() === char.affiliation.ar.trim());
      if (wrongChars.length >= 3) {
        const pool = [char, ...wrongChars].sort(() => 0.5 - Math.random());
        const correctIdx = pool.findIndex(p => p.id === char.id);
        triviaQuestions.push({
          id: `gen_triv_aff_${i + 1}_${char.id}`,
          difficulty: 'medium',
          question: {
            ar: `إلى أي منظمة أو فصيل تنتمي شخصية ${char.name.ar}؟`,
            en: `Which faction or group does ${char.name.en} belong to?`
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
    }

    // === TRUE / FALSE QUESTIONS (Balanced True & False generation) ===

    // TF 1: Affiliation (TRUE)
    if (char.affiliation && char.affiliation.ar.trim()) {
      trueFalseQuestions.push({
        id: `gen_tf_aff_true_${i + 1}_${char.id}`,
        difficulty: 'easy',
        statement: {
          ar: `تنتمي شخصية ${char.name.ar} إلى ${char.affiliation.ar}.`,
          en: `${char.name.en} belongs to ${char.affiliation.en}.`
        },
        isCorrect: true,
        explanation: {
          ar: `العبارة صحيحة؛ ${char.name.ar} تنتمي بالفعل إلى ${char.affiliation.ar}.`,
          en: `True; ${char.name.en} indeed belongs to ${char.affiliation.en}.`
        }
      });
    }

    // TF 2: Affiliation (FALSE) - Swapped with random other character
    const wrongAffChar = pickRandomUnique(characters, 1, c => c.id === char.id || c.affiliation.ar.trim() === char.affiliation.ar.trim())[0];
    if (wrongAffChar) {
      trueFalseQuestions.push({
        id: `gen_tf_aff_false_${i + 1}_${char.id}`,
        difficulty: 'medium',
        statement: {
          ar: `تنتمي شخصية ${char.name.ar} إلى ${wrongAffChar.affiliation.ar}.`,
          en: `${char.name.en} belongs to ${wrongAffChar.affiliation.en}.`
        },
        isCorrect: false,
        explanation: {
          ar: `العبارة خاطئة؛ ${char.name.ar} تنتمي في الحقيقة إلى ${char.affiliation.ar} (وليس ${wrongAffChar.affiliation.ar}).`,
          en: `False; ${char.name.en} actually belongs to ${char.affiliation.en}.`
        }
      });
    }

    // TF 3: Power Type (TRUE)
    if (char.powerType && char.powerType.ar.trim()) {
      trueFalseQuestions.push({
        id: `gen_tf_pwr_true_${i + 1}_${char.id}`,
        difficulty: 'medium',
        statement: {
          ar: `تمتلك شخصية ${char.name.ar} القدرة القتالية: ${char.powerType.ar}.`,
          en: `${char.name.en} possesses the power: ${char.powerType.en}.`
        },
        isCorrect: true,
        explanation: {
          ar: `العبارة صحيحة؛ قدرة ${char.name.ar} هي ${char.powerType.ar}.`,
          en: `True; ${char.name.en}'s power is ${char.powerType.en}.`
        }
      });
    }

    // TF 4: Power Type (FALSE) - Swapped with random other character
    const wrongPwrChar = pickRandomUnique(characters, 1, c => c.id === char.id || c.powerType.ar.trim() === char.powerType.ar.trim())[0];
    if (wrongPwrChar) {
      trueFalseQuestions.push({
        id: `gen_tf_pwr_false_${i + 1}_${char.id}`,
        difficulty: 'hard',
        statement: {
          ar: `تمتلك شخصية ${char.name.ar} القدرة القتالية: ${wrongPwrChar.powerType.ar}.`,
          en: `${char.name.en} possesses the power: ${wrongPwrChar.powerType.en}.`
        },
        isCorrect: false,
        explanation: {
          ar: `العبارة خاطئة؛ هذه قوة ${wrongPwrChar.name.ar}، بينما قوة ${char.name.ar} هي: ${char.powerType.ar}.`,
          en: `False; that is ${wrongPwrChar.name.en}'s power. ${char.name.en}'s power is: ${char.powerType.en}.`
        }
      });
    }

    // TF 5: Role (TRUE)
    if (char.role && char.role.ar.trim()) {
      trueFalseQuestions.push({
        id: `gen_tf_role_true_${i + 1}_${char.id}`,
        difficulty: 'easy',
        statement: {
          ar: `دور شخصية ${char.name.ar} في القصة هو ${char.role.ar}.`,
          en: `The role of ${char.name.en} in the story is ${char.role.en}.`
        },
        isCorrect: true,
        explanation: {
          ar: `العبارة صحيحة؛ ${char.name.ar} هي ${char.role.ar}.`,
          en: `True; ${char.name.en} is ${char.role.en}.`
        }
      });
    }

    // TF 6: Role (FALSE) - Swapped with random other character
    const wrongRoleChar = pickRandomUnique(characters, 1, c => c.id === char.id || c.role.ar.trim() === char.role.ar.trim())[0];
    if (wrongRoleChar) {
      trueFalseQuestions.push({
        id: `gen_tf_role_false_${i + 1}_${char.id}`,
        difficulty: 'medium',
        statement: {
          ar: `دور شخصية ${char.name.ar} في القصة هو ${wrongRoleChar.role.ar}.`,
          en: `The role of ${char.name.en} in the story is ${wrongRoleChar.role.en}.`
        },
        isCorrect: false,
        explanation: {
          ar: `العبارة خاطئة؛ دور ${char.name.ar} في الحقيقة هو ${char.role.ar}.`,
          en: `False; the role of ${char.name.en} is actually ${char.role.en}.`
        }
      });
    }
  });

  // Thoroughly shuffle all Trivia and True/False questions
  const shuffledTrivia = [...triviaQuestions].sort(() => 0.5 - Math.random());
  const shuffledTF = [...trueFalseQuestions].sort(() => 0.5 - Math.random());

  return { triviaQuestions: shuffledTrivia, trueFalseQuestions: shuffledTF };
}
