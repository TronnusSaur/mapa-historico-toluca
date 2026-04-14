const admin = require('firebase-admin');
const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

// 1. Initialize Firebase Admin
// Make sure you have a serviceAccountKey.json file in this directory
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const csvFilePath = path.join(__dirname, '../public/data/5 - NUEVOS TICKETS.csv');

async function uploadData() {
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');
  
  Papa.parse(fileContent, {
    header: true,
    complete: async (results) => {
      const tickets = results.data;
      console.log(`Prasin ${tickets.length} tickets...`);

      const batch = db.batch();
      
      tickets.forEach((ticket, index) => {
        if (!ticket.Ticket) return;

        const docRef = db.collection('active_tickets').doc(ticket.Ticket);
        batch.set(docRef, {
          folio: ticket.Ticket,
          status: 'PLANEADO',
          lat: parseFloat(ticket.Latitud),
          lng: parseFloat(ticket.Longitud),
          street: ticket['Calle y nǧmero'] || '',
          delegation: ticket['Delegación'] || '',
          material: ticket.Material || '',
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Firestore batch limit is 500
        if ((index + 1) % 500 === 0) {
          console.log(`Processed ${index + 1} tickets...`);
        }
      });

      await batch.commit();
      console.log('Upload complete!');
    }
  });
}

uploadData().catch(console.error);
