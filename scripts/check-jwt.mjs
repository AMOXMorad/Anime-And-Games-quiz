import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.wlgecqqddvoamufwtwkf:LshyN5%40%21Mda%2BCe6@aws-0-eu-west-2.pooler.supabase.com:6543/postgres';

async function checkSecrets() {
  const client = new Client({ connectionString, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    
    // Check JWT secret from auth or settings or vault
    const res1 = await client.query(`
      SELECT name, setting FROM pg_settings WHERE name LIKE '%jwt%' OR name LIKE '%auth%' OR name LIKE '%secret%';
    `).catch(e => ({ rows: [] }));
    console.log('Settings:', res1.rows);

    const res2 = await client.query(`
      SELECT * FROM auth.users LIMIT 1;
    `).catch(e => ({ rows: [] }));
    console.log('Auth check succeeded');

    const res3 = await client.query(`
      SELECT current_setting('app.settings.jwt_secret', true) as jwt_secret;
    `).catch(e => ({ rows: [] }));
    console.log('JWT secret setting:', res3.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkSecrets();
