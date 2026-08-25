async function findExactNarutoChar(name) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(name)}`);
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      for (const item of json.data) {
        console.log(`FOUND: ${item.name} (MAL ID: ${item.mal_id}) => Image: ${item.images?.jpg?.image_url}`);
      }
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

async function run() {
  console.log('--- MADARA UCHIHA ---');
  await findExactNarutoChar('Madara Uchiha');
  console.log('--- JIRAIYA ---');
  await findExactNarutoChar('Jiraiya');
}

run();
