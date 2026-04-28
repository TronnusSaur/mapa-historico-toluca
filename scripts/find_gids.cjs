const https = require('https');

function get(url) {
    https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            get(res.headers.location);
            return;
        }
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('--- GIDs Found ---');
            // Look for patterns like ["SheetName",null,12345678] or similar in bootstrap data
            const regex = /\["([^"]+)",(?:null|\d+),(\d+)\]/g;
            let match;
            while ((match = regex.exec(data)) !== null) {
                console.log(`Name: ${match[1]}, GID: ${match[2]}`);
            }
            
            // Look for another common format: ["SheetName",0,0,0,0,0,0,0,0,"12345678"]
            const regex2 = /\["([^"]+)",\d+,\d+,\d+,\d+,\d+,\d+,\d+,\d+,"(\d+)"\]/g;
            while ((match = regex2.exec(data)) !== null) {
                console.log(`Name: ${match[1]}, GID: ${match[2]}`);
            }
            
            // Look for simpler format often in script tags
            const regex3 = /"([^"]+)":(\d{8,})/g;
            while ((match = regex3.exec(data)) !== null) {
                console.log(`Potential: ${match[1]}, GID: ${match[2]}`);
            }
        });
    }).on('error', (err) => {
        console.error('Error:', err.message);
    });
}

get('https://docs.google.com/spreadsheets/d/1XsAB-ADnF8xqFOvsW9w9PGDCDI51OJbvYPVyFXTZ9j8/edit');
