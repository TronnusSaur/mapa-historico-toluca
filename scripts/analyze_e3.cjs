const fs = require('fs');
const content = fs.readFileSync('scratch/stage3_debug.csv', 'utf8');
const lines = content.trim().split('\n');
const headers = lines[0].split(',');
const dateIdx = headers.findIndex(h => h.toLowerCase().includes('fecha'));
const limitDate = new Date('2026-05-07');
limitDate.setHours(0,0,0,0);

let futureCount = 0;
let futureDates = [];
let invalidDates = 0;
let total = 0;

for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim()) continue;
    total++;
    const fields = l.split(',');
    let dateStr = fields[dateIdx]?.replace(/"/g, '');
    if (dateStr) {
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
            const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
            const date = new Date(parseInt(year), parseInt(parts[1]) - 1, parseInt(parts[0]));
            date.setHours(0,0,0,0);
            if (date > limitDate) {
                futureCount++;
                futureDates.push(dateStr);
            }
        } else {
            invalidDates++;
        }
    } else {
        invalidDates++;
    }
}

console.log('Total valid records found:', total);
console.log('Baches after May 7, 2026 (filtered out by timeline):', futureCount);
console.log('Unique future dates:', [...new Set(futureDates)]);
console.log('Invalid/Missing dates:', invalidDates);
