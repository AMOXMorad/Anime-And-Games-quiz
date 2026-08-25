import pg from 'pg';
const { Client } = pg;

const regions = [
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'ap-southeast-1',
  'me-central-1'
];

async function testRegions() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    // For pooler: username is postgres.wlgecqqddvoamufwtwkf
    const connStr = `postgresql://postgres.wlgecqqddvoamufwtwkf:LshyN5%40%21Mda%2BCe6@${host}:6543/postgres`;
    console.log(`Trying ${region}...`);
    const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 4000 });
    try {
      await client.connect();
      console.log(`\n🎉 SUCCESS! Connected via region: ${region}`);
      await client.end();
      return { region, host, connStr };
    } catch (e) {
      console.log(`Failed ${region}: ${e.message}`);
    }
  }
  console.log('No pooler connected.');
  return null;
}

testRegions();
