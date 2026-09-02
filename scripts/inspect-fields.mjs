import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, KEY);

async function inspectFirstWorld() {
  const { data, error } = await supabase.from('custom_worlds').select('*');
  if (data && data.length > 0) {
    const w = data[0];
    console.log('ID:', w.id);
    console.log('Name:', w.name);
    console.log('Characters length:', w.characters ? w.characters.length : 'null');
    console.log('Trivia Questions length:', w.trivia_questions ? w.trivia_questions.length : 'null');
    console.log('True/False Questions length:', w.true_false_questions ? w.true_false_questions.length : 'null');
    console.log('Characters data sample:', JSON.stringify(w.characters));
  } else {
    console.log('No worlds found');
  }
}

inspectFirstWorld();
