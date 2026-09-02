import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlgecqqddvoamufwtwkf.supabase.co';
const KEY = 'sb_publishable_CdOZXNxUUo88HQszdA9sgw_Myb9EowU';

const supabase = createClient(SUPABASE_URL, KEY);

async function testWrite() {
  console.log('Testing insert/upsert with Supabase REST API...');
  const testWorld = {
    id: 'test_sync_world',
    name: { ar: 'عالم تجريبي', en: 'Test Realm' },
    category: 'anime',
    tagline: { ar: 'تجربة المزامنة السحابية', en: 'Cloud Sync Test' },
    description: { ar: 'تم رفع هذا العالم بنجاح عبر السحابة', en: 'Cloud synced realm' },
    banner: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
    is_custom: true
  };

  const { data, error } = await supabase.from('custom_worlds').upsert(testWorld).select();
  if (error) {
    console.error('Upsert Error:', error);
  } else {
    console.log('🎉 Successfully written to Supabase Cloud DB!', data);
    
    // Clean up test world
    await supabase.from('custom_worlds').delete().eq('id', 'test_sync_world');
    console.log('Cleaned up test world.');
  }
}

testWrite();
