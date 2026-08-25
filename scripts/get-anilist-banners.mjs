async function getMediaBanner(title) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
        }
        bannerImage
        coverImage {
          extraLarge
          large
        }
      }
    }
  `;
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { search: title }
      })
    });
    const json = await res.json();
    console.log(title, '=> banner:', json.data?.Media?.bannerImage, '=> cover:', json.data?.Media?.coverImage?.extraLarge);
  } catch(e) {
    console.log(title, 'error', e.message);
  }
}

async function run() {
  await getMediaBanner('Naruto Shippuden');
  await getMediaBanner('Re:Zero kara Hajimeru Isekai Seikatsu');
}

run();
