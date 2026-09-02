import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.wlgecqqddvoamufwtwkf:LshyN5%40%21Mda%2BCe6@aws-0-eu-west-2.pooler.supabase.com:6543/postgres';

async function checkTables() {
  const client = new Client({ connectionString, connectionTimeoutMillis: 8000 });
  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('vault', 'auth', '_realtime', 'extensions', 'supabase_functions')
      ORDER BY table_schema, table_name;
    `);
    console.log('Tables:', res.rows);

    const vault = await client.query(`SELECT * FROM vault.decrypted_secrets LIMIT 10;`).catch(e => ({ rows: e.message }));
    console.log('Vault:', vault.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkTables();
