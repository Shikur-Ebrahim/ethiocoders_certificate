const { getFirestore, collection, getDocs } = require('firebase-admin/firestore');
const { initializeApp, cert } = require('firebase-admin/app');
const path = require('path');

// Use the correct service account filename found in the root
const serviceAccount = require(path.join(process.cwd(), 'ethiocoders-certifyServiceAccount.json'));

if (!serviceAccount) {
    console.error("Service account not found");
    process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function listPaymentMethods() {
  const snapshot = await db.collection('payment_methods').get();
  snapshot.forEach(doc => {
    console.log(`ID: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
    console.log('---');
  });
}

listPaymentMethods().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
