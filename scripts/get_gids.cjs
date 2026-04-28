const https = require('https');
https.get('https://docs.google.com/spreadsheets/d/1XsAB-ADnF8xqFOvsW9w9PGDCDI51OJbvYPVyFXTZ9j8/edit', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const sheetRegex = /\["([^"]+)","?(\d+)"?/g;
    let match;
    while ((match = sheetRegex.exec(data)) !== null) {
      if(match[2].length > 5) console.log(match[1], match[2]);
    }
  });
});
