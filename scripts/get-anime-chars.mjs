async function getAnimeChars(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const text = await res.text();
    // split by character links
    const parts = text.split('/character/');
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const nameMatch = part.match(/^[0-9]+\/([^"/]+)/);
      const imgMatch = part.match(/images\/characters\/[0-9]+\/[0-9]+\.jpg/);
      if (nameMatch && imgMatch) {
        console.log(`${nameMatch[1]}: https://cdn.myanimelist.net/${imgMatch[0]}`);
      }
    }
  } catch(e) {
    console.log('Error: ' + e.message);
  }
}

async function run() {
  console.log('=== NARUTO ===');
  await getAnimeChars('https://myanimelist.net/anime/20/Naruto/characters');
  console.log('=== RE:ZERO ===');
  await getAnimeChars('https://myanimelist.net/anime/31240/Re_Zero_kara_Hajimeru_Isekai_Seikatsu/characters');
}

run();
