import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// simple .env parser
const envFile = fs.readFileSync('./.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const getFirebaseConfig = () => {
    try {
        let serviceAccountParams;
        try {
            serviceAccountParams = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } catch (e) {
            const clientEmailMatch = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.match(/client_email:\s*'([^']+)'/);
            const privateKeyMatch = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.match(/private_key:\s*'([^']+)'/);
            const projectIdMatch = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.match(/project_id:\s*'([^']+)'/);

            if (clientEmailMatch && privateKeyMatch && projectIdMatch) {
                serviceAccountParams = {
                    clientEmail: clientEmailMatch[1],
                    privateKey: privateKeyMatch[1].replace(/\\n/g, '\n'),
                    projectId: projectIdMatch[1],
                };
            }
        }
        return serviceAccountParams;
    } catch (e) {
        return null;
    }
};

const serviceAccountParams = getFirebaseConfig();

if (!getApps().length && serviceAccountParams) {
  initializeApp({
    credential: cert(serviceAccountParams),
  });
}

const db = getFirestore();

async function run() {
  const snapshot = await db.collection("applications").where("status", "==", "paid").get();
  for (const doc of snapshot.docs) {
    console.log(`Doc: ${doc.id}`);
    const data = doc.data();
    console.log(`URL: ${data.certificateUrl}`);
    
    // Fix comma bug dynamically
    if (data.certificateUrl && data.certificateUrl.includes('%2C')) {
        const fixedUrl = data.certificateUrl.replace('%2C', '%252C');
        console.log(`Fixing URL to: ${fixedUrl}`);
        await doc.ref.update({ certificateUrl: fixedUrl });
    }
  }
  console.log('Done');
}

run().catch(console.error);
