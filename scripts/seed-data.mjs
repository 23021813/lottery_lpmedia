import fs from 'fs';
import path from 'path';

const csvPath = path.resolve('data/data.csv');
const distCsvPath = path.resolve('dist/data/data.csv');

// Backup original
fs.copyFileSync(csvPath, path.resolve('data/data.csv.bak'));

const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
const header = 'id,name,phone,nationalId,agency,answer,prizeWon';

// 70% C, 10% A, 10% B, 10% D
const options = ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'A', 'B', 'D'];

const updatedRows = [header];
let countC = 0;
let countOther = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  // Simple CSV parser handling quotes
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let c = 0; c < line.length; c++) {
    const char = line[c];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());

  if (parts.length >= 5) {
    const id = parts[0];
    const name = parts[1].replace(/^"|"$/g, '');
    const phone = parts[2].replace(/^"|"$/g, '');
    const nationalId = parts[3].replace(/^"|"$/g, '');
    const agency = parts[4].replace(/^"|"$/g, '');
    
    // Deterministic distribution based on ID
    const numId = parseInt(id, 10) || i;
    const ans = options[(numId * 7 + 3) % options.length];
    
    if (ans === 'C') countC++;
    else countOther++;

    updatedRows.push(`${id},"${name}","${phone}","${nationalId}","${agency}","${ans}",""`);
  }
}

const newCsvContent = updatedRows.join('\n') + '\n';
fs.writeFileSync(csvPath, newCsvContent, 'utf8');
if (fs.existsSync('dist/data')) {
  fs.writeFileSync(distCsvPath, newCsvContent, 'utf8');
}

console.log('Successfully updated data.csv:');
console.log('Total entries:', updatedRows.length - 1);
console.log('Entries with answer C (Qualified):', countC);
console.log('Entries with other answers (A, B, D):', countOther);
