import XLSX from 'xlsx';
import path from 'path';

const excelPath = 'D:\\Personal\\APP\\AG world\\Naruto\\AG_Utopia_World_Naruto.xlsx';
const wb = XLSX.readFile(excelPath);

console.log('Sheet Names:', wb.SheetNames);

for (const name of wb.SheetNames) {
  const sheet = wb.Sheets[name];
  const json = XLSX.utils.sheet_to_json(sheet);
  console.log(`Sheet "${name}": ${json.length} rows`);
  if (json.length > 0) {
    console.log(`Sample row keys from "${name}":`, Object.keys(json[0]));
    console.log(`Sample row [0] from "${name}":`, JSON.stringify(json[0], null, 2).slice(0, 300));
  }
}
