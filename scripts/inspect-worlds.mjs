import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, KEY);

async function inspectWorlds() {
  const { data, error } = await supabase.from('custom_worlds').select('*');
  console.log('Error:', error);
  console.log('Worlds in DB:', JSON.stringify(data, null, 2));
}

inspectWorlds();
