import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testFetchAsGuest() {
  console.log('Testing public fetch from Supabase (simulating guest user / phone)...');
  const { data, error } = await supabase
    .from('custom_worlds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching worlds:', error);
    process.exit(1);
  }

  console.log(`Fetched ${data.length} worlds from cloud:`);
  for (const w of data) {
    console.log(`- World: ${w.name.ar} (${w.name.en}) [ID: ${w.id}]`);
    console.log(`  Characters: ${w.characters?.length || 0}`);
    console.log(`  Trivia Questions: ${w.trivia_questions?.length || 0}`);
    console.log(`  True/False Questions: ${w.true_false_questions?.length || 0}`);
    console.log(`  Banner: ${w.banner ? 'Uploaded & Valid (' + w.banner.slice(0, 30) + '...)' : 'None'}`);
  }
}

testFetchAsGuest();
