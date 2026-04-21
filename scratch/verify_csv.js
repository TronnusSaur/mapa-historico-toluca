import fs from 'fs';
import path from 'path';

const csvPath = 'public/data/3 - ETAPA 3 MASTER.csv';
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n').filter(line => line.trim() !== '');
const header = lines[0].split(',');
const headerCount = header.length;

console.log(`Header columns: ${headerCount}`);
console.log(`Total rows: ${lines.length - 1}`);

let errors = 0;
lines.forEach((line, i) => {
  if (i === 0) return;
  const columns = line.split(',');
  if (columns.length !== headerCount) {
    console.error(`Row ${i} has ${columns.length} columns (expected ${headerCount})`);
    errors++;
  }
});

if (errors === 0) {
  console.log('Verification successful: All rows have consistent column counts.');
} else {
  console.log(`Verification failed: Found ${errors} rows with inconsistent column counts.`);
}
