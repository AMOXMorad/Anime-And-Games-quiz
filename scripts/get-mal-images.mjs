const characters = [
  { id: 17, name: 'Naruto' },
  { id: 13, name: 'Sasuke' },
  { id: 85, name: 'Kakashi' },
  { id: 14936, name: 'Madara' },
  { id: 2455, name: 'Jiraiya' },
  { id: 5373, name: 'Minato' },
  { id: 118738, name: 'Subaru' },
  { id: 118737, name: 'Emilia' },
  { id: 118763, name: 'Rem' },
  { id: 145877, name: 'Echidna' },
  { id: 118765, name: 'Beatrice' },
  { id: 118771, name: 'Roswaal' }
];

async function fetchImages() {
  for (const c of characters) {
    try {
      const res = await fetch(`https://myanimelist.net/character/${c.id}`);
      const text = await res.text();
      const match = text.match(/https:\/\/cdn\.myanimelist\.net\/images\/characters\/[0-9]+\/[0-9]+\.jpg/);
      console.log(`${c.name} (${c.id}): ${match ? match[0] : 'NOT FOUND'}`);
    } catch(e) {
      console.log(`${c.name} error: ${e.message}`);
    }
  }
}

fetchImages();
