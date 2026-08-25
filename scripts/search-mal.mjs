async function searchChar(name) {
  try {
    const res = await fetch(`https://myanimelist.net/character.php?q=${encodeURIComponent(name)}`);
    const text = await res.text();
    const matches = text.match(/https:\/\/cdn\.myanimelist\.net\/images\/characters\/[0-9]+\/[0-9]+\.jpg/g);
    console.log(`${name}: ${matches ? matches[0] : 'NONE'}`);
  } catch (e) {
    console.log(`${name} error: ${e.message}`);
  }
}

async function run() {
  await searchChar('Subaru Natsuki');
  await searchChar('Itachi Uchiha');
  await searchChar('Ram');
}
run();
