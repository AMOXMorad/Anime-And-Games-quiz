import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, KEY);

async function test() {
  console.log('Testing key with Supabase REST API...');
  const { data, error } = await supabase.from('custom_worlds').select('*');
  if (error) {
    console.error('Error with publishable key:', error);
  } else {
    console.log('Success! Data:', data);
  }
}

test();
