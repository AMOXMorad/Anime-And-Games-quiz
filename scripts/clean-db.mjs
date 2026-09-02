import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, KEY);

async function cleanDatabase() {
  console.log('Cleaning custom_worlds table in Supabase...');
  const { data, error } = await supabase
    .from('custom_worlds')
    .delete()
    .neq('id', '___non_existent_id___');

  if (error) {
    console.error('Error cleaning table:', error);
  } else {
    console.log('🎉 Successfully cleared all worlds from Supabase custom_worlds table!');
  }
}

cleanDatabase();
