async function getAniListChar(name) {
  const query = `
    query ($search: String) {
      Character(search: $search) {
        id
        name {
          full
          native
        }
        image {
          large
          medium
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
        variables: { search: name }
      })
    });
    const json = await res.json();
    console.log(name, '=>', json.data?.Character?.name?.full, '=>', json.data?.Character?.image?.large);
  } catch(e) {
    console.log(name, 'error', e.message);
  }
}

async function run() {
  const list = [
    'Madara Uchiha',
    'Jiraiya',
    'Naruto Uzumaki',
    'Sasuke Uchiha',
    'Itachi Uchiha',
    'Kakashi Hatake',
    'Minato Namikaze',
    'Gaara',
    'Tsunade',
    'Subaru Natsuki',
    'Emilia',
    'Rem',
    'Ram',
    'Echidna',
    'Beatrice',
    'Roswaal L. Mathers',
    'Reinhard van Astrea'
  ];
  for (const name of list) {
    await getAniListChar(name);
  }
}

run();
