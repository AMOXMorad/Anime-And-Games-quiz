import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const NARUTO_DIR = 'D:\\Personal\\APP\\AG world\\Naruto';
const EXCEL_PATH = path.join(NARUTO_DIR, 'AG_Utopia_World_Naruto.xlsx');
const COVER_PATH = path.join(NARUTO_DIR, 'Cover.jpg');
const CHARS_DIR = path.join(NARUTO_DIR, 'شخصيات ناروتو');

async function fileToBase64Image(filePath, width, height, quality = 80) {
  if (!fs.existsSync(filePath)) {
    console.warn('File not found:', filePath);
    return null;
  }
  const buffer = await sharp(filePath)
    .resize(width, height, { fit: 'cover' })
    .webp({ quality })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

function getField(row, ...aliases) {
  if (!row || typeof row !== 'object') return '';
  const keys = Object.keys(row);
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim() !== '') {
      return String(row[alias]).trim();
    }
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

async function uploadNarutoWorld() {
  console.log('🚀 Starting Naruto World creation and upload...');

  // 1. Process Cover Banner
  console.log('🖼️ Processing Cover Banner...');
  let bannerBase64 = null;
  if (fs.existsSync(COVER_PATH)) {
    bannerBase64 = await fileToBase64Image(COVER_PATH, 1280, 720, 85);
    console.log(`✅ Banner compressed (size: ${(bannerBase64.length / 1024).toFixed(1)} KB)`);
  } else {
    bannerBase64 = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200';
  }

  // 2. Pre-process and cache all character images
  console.log('👥 Processing character avatars from directory...');
  const charFiles = fs.readdirSync(CHARS_DIR);
  const imageMap = new Map();

  for (const file of charFiles) {
    const filePath = path.join(CHARS_DIR, file);
    try {
      const b64 = await fileToBase64Image(filePath, 300, 300, 80);
      imageMap.set(file.toLowerCase(), b64);
      const withoutExt = file.replace(/\.[^/.]+$/, '').toLowerCase();
      imageMap.set(withoutExt, b64);
    } catch (err) {
      console.error(`Failed processing ${file}:`, err.message);
    }
  }
  console.log(`✅ Cached ${imageMap.size / 2} character images.`);

  // 3. Read Excel Sheets
  console.log('📊 Reading Excel file...');
  const wb = XLSX.readFile(EXCEL_PATH);

  // Characters Sheet
  const charSheet = wb.Sheets['Characters'] || wb.Sheets[wb.SheetNames[0]];
  const rawChars = XLSX.utils.sheet_to_json(charSheet);
  const characters = [];

  rawChars.forEach((row, i) => {
    const nameAr = getField(row, 'name_ar (اسم الشخصية)', 'name_ar', 'اسم الشخصية') || `شخصية ${i + 1}`;
    const nameEn = getField(row, 'name_en (Character Name)', 'name_en', 'Character Name') || `Character ${i + 1}`;
    const id = (nameEn.toLowerCase().replace(/[^a-z0-9]/g, '_') || `char_${i + 1}`).slice(0, 30);
    const genderRaw = getField(row, 'gender (male/female/other)', 'gender').toLowerCase();
    const gender = genderRaw.includes('fem') || genderRaw.includes('أنث') || genderRaw.includes('انث') ? 'female' : 'male';
    const roleAr = getField(row, 'role_ar (الدور)', 'role_ar') || 'شخصية رئيسية';
    const roleEn = getField(row, 'role_en (Role)', 'role_en') || 'Main Character';
    const powerAr = getField(row, 'power_ar (نوع القوة)', 'power_ar') || 'قوى قتالية شينوبي';
    const powerEn = getField(row, 'power_en (Power)', 'power_en') || 'Shinobi Ninjutsu';
    const affAr = getField(row, 'affiliation_ar (الانتماء)', 'affiliation_ar') || 'قرية كونوها';
    const affEn = getField(row, 'affiliation_en (Affiliation)', 'affiliation_en') || 'Hidden Leaf Village';
    const quoteAr = getField(row, 'quote_ar (اقتباس مشهور)', 'quote_ar') || 'هذا هو طريقي في النينجا!';
    const quoteEn = getField(row, 'quote_en (Famous Quote)', 'quote_en') || 'That is my nindo, my ninja way!';
    const imgFilename = getField(row, 'image_filename (اسم ملف الصورة)', 'image_filename') || '';

    // Lookup avatar in imageMap
    let avatar = imageMap.get(imgFilename.toLowerCase()) 
      || imageMap.get(imgFilename.replace(/\.[^/.]+$/, '').toLowerCase())
      || imageMap.get(`naruto_${String(i + 1).padStart(4, '0')}`)
      || bannerBase64;

    const cluesEasy = [
      { ar: getField(row, 'clue_easy_1_ar') || 'شخصية بارزة في عالم الشينوبي', en: getField(row, 'clue_easy_1_en') || 'Prominent Shinobi' },
      { ar: getField(row, 'clue_easy_2_ar'), en: getField(row, 'clue_easy_2_en') }
    ].filter(c => c.ar && c.ar.trim());

    const cluesMed = [
      { ar: getField(row, 'clue_med_1_ar') || 'تمتلك تقنيات قتالية فريدة', en: getField(row, 'clue_med_1_en') || 'Unique jutsu technique' },
      { ar: getField(row, 'clue_med_2_ar'), en: getField(row, 'clue_med_2_en') }
    ].filter(c => c.ar && c.ar.trim());

    const cluesHard = [
      { ar: getField(row, 'clue_hard_1_ar') || 'شاركت في معارك وحروب تاريخية', en: getField(row, 'clue_hard_1_en') || 'Fought in legendary ninja wars' },
      { ar: getField(row, 'clue_hard_2_ar'), en: getField(row, 'clue_hard_2_en') }
    ].filter(c => c.ar && c.ar.trim());

    characters.push({
      id: `ag_utopia_world_naruto_char_${i + 1}_${id}`,
      name: { ar: nameAr, en: nameEn },
      avatar,
      gender,
      role: { ar: roleAr, en: roleEn },
      powerType: { ar: powerAr, en: powerEn },
      affiliation: { ar: affAr, en: affEn },
      quote: { ar: quoteAr, en: quoteEn },
      clues: {
        easy: cluesEasy.length > 0 ? cluesEasy : [{ ar: 'نينجا من عالم ناروتو', en: 'Shinobi from Naruto' }],
        medium: cluesMed.length > 0 ? cluesMed : [{ ar: 'يمتلك مهارات قتالية قوية', en: 'Strong combat mastery' }],
        hard: cluesHard.length > 0 ? cluesHard : [{ ar: 'تاريخه مرتبط بأحداث سرية', en: 'Linked to secret events' }]
      }
    });
  });

  console.log(`✅ Extracted ${characters.length} characters.`);

  // Trivia Sheet
  const triviaSheet = wb.Sheets['Trivia'] || wb.Sheets[wb.SheetNames[1]];
  const rawTrivia = XLSX.utils.sheet_to_json(triviaSheet);
  const triviaQuestions = [];

  rawTrivia.forEach((row, i) => {
    const qAr = getField(row, 'question_ar (نص السؤال)', 'question_ar');
    const qEn = getField(row, 'question_en (Question)', 'question_en') || qAr;
    if (!qAr) return;

    const diffStr = getField(row, 'difficulty (easy/medium/hard)', 'difficulty').toLowerCase();
    const difficulty = diffStr.includes('hard') ? 'hard' : diffStr.includes('easy') ? 'easy' : 'medium';

    const opt1Ar = getField(row, 'option_1_ar') || 'الخيار 1';
    const opt1En = getField(row, 'option_1_en') || opt1Ar;
    const opt2Ar = getField(row, 'option_2_ar') || 'الخيار 2';
    const opt2En = getField(row, 'option_2_en') || opt2Ar;
    const opt3Ar = getField(row, 'option_3_ar') || 'الخيار 3';
    const opt3En = getField(row, 'option_3_en') || opt3Ar;
    const opt4Ar = getField(row, 'option_4_ar') || 'الخيار 4';
    const opt4En = getField(row, 'option_4_en') || opt4Ar;

    let correctIndex = parseInt(getField(row, 'correct_index (رقم الإجابة 1-4)', 'correct_index') || '1', 10);
    if (isNaN(correctIndex) || correctIndex < 1 || correctIndex > 4) correctIndex = 1;
    const finalCorrectIdx = correctIndex - 1;

    const expAr = getField(row, 'explanation_ar');
    const expEn = getField(row, 'explanation_en') || expAr;

    triviaQuestions.push({
      id: `ag_utopia_world_naruto_triv_${i + 1}`,
      difficulty,
      question: { ar: qAr, en: qEn },
      options: [
        { ar: opt1Ar, en: opt1En },
        { ar: opt2Ar, en: opt2En },
        { ar: opt3Ar, en: opt3En },
        { ar: opt4Ar, en: opt4En }
      ],
      correctIndex: finalCorrectIdx,
      explanation: expAr ? { ar: expAr, en: expEn } : undefined
    });
  });

  console.log(`✅ Extracted ${triviaQuestions.length} trivia questions.`);

  // TrueFalse Sheet
  const tfSheet = wb.Sheets['TrueFalse'] || wb.Sheets[wb.SheetNames[2]];
  const rawTF = XLSX.utils.sheet_to_json(tfSheet);
  const trueFalseQuestions = [];

  rawTF.forEach((row, i) => {
    const stmtAr = getField(row, 'statement_ar (نص الجملة)', 'statement_ar');
    const stmtEn = getField(row, 'statement_en (Statement)', 'statement_en') || stmtAr;
    if (!stmtAr) return;

    const diffStr = getField(row, 'difficulty (easy/medium/hard)', 'difficulty').toLowerCase();
    const difficulty = diffStr.includes('hard') ? 'hard' : diffStr.includes('med') ? 'medium' : 'easy';

    const isCorrectRaw = String(getField(row, 'is_correct (true/false أو صح/خطأ)', 'is_correct')).toLowerCase();
    const isCorrect = isCorrectRaw.includes('true') || isCorrectRaw.includes('صح') || isCorrectRaw === '1';

    const expAr = getField(row, 'explanation_ar');
    const expEn = getField(row, 'explanation_en') || expAr;

    trueFalseQuestions.push({
      id: `ag_utopia_world_naruto_tf_${i + 1}`,
      difficulty,
      statement: { ar: stmtAr, en: stmtEn },
      isCorrect,
      explanation: expAr ? { ar: expAr, en: expEn } : undefined
    });
  });

  console.log(`✅ Extracted ${trueFalseQuestions.length} true/false questions.`);

  // 4. Construct Full World Payload
  const narutoWorld = {
    id: 'ag_utopia_world_naruto',
    name: {
      ar: 'ناروتو شيبودن',
      en: 'Naruto Shippuden'
    },
    category: 'anime',
    tagline: {
      ar: 'عالم النينجا، الأختام، وحرب الشينوبي الرابعة العظمى',
      en: 'The Shinobi World of Ninjas, Jutsu, and Destiny'
    },
    description: {
      ar: 'خض غمار التحديات في قرية كونوها وتعرف على أعتى الشينوبي وأسرار الأكاتسوكي في اختبار أسطوري لمعلوماتك!',
      en: 'Test your mastery of the Hidden Leaf Village, the Akatsuki, and legendary shinobi lore!'
    },
    icon: '🥷',
    banner: bannerBase64,
    theme_color: '#f97316',
    accent_glow: 'rgba(249, 115, 22, 0.5)',
    characters: characters,
    trivia_questions: triviaQuestions,
    true_false_questions: trueFalseQuestions,
    is_custom: true,
    updated_at: new Date().toISOString()
  };

  console.log('☁️ Pushing to Supabase Cloud Database...');
  const { data, error } = await supabase
    .from('custom_worlds')
    .upsert(narutoWorld);

  if (error) {
    console.error('❌ Supabase Upload Error:', error);
    process.exit(1);
  }

  console.log('🎉 Successfully saved Naruto World to Supabase Cloud Database!');

  // 5. Verify the uploaded world from Supabase
  console.log('🔍 Verifying from Supabase...');
  const { data: fetched, error: fetchErr } = await supabase
    .from('custom_worlds')
    .select('id, name, characters, trivia_questions, true_false_questions')
    .eq('id', 'ag_utopia_world_naruto')
    .single();

  if (fetchErr || !fetched) {
    console.error('❌ Verification failed:', fetchErr);
  } else {
    console.log('====================================');
    console.log('✅ VERIFICATION RESULT:');
    console.log('World ID:', fetched.id);
    console.log('World Name:', fetched.name);
    console.log('Characters count:', fetched.characters.length);
    console.log('Trivia questions count:', fetched.trivia_questions.length);
    console.log('True/False questions count:', fetched.true_false_questions.length);
    console.log('Total Questions:', fetched.trivia_questions.length + fetched.true_false_questions.length);
    console.log('Sample character 1:', fetched.characters[0].name, 'Avatar length:', fetched.characters[0].avatar?.length);
    console.log('Sample character 50:', fetched.characters[49].name, 'Avatar length:', fetched.characters[49].avatar?.length);
    console.log('====================================');
    console.log('🎉 EVERYTHING IS 100% OPERATIONAL AND SYNCED TO THE CLOUD!');
  }
}

uploadNarutoWorld();
