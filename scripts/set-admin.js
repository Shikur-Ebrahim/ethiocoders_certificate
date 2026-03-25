const admin = require("firebase-admin");
const path = require("path");

// Path to your service account key file
const serviceAccount = require(path.join(__dirname, "../ethiocoders-certifyServiceAccount.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ethiocoders-certify.firebaseio.com"
  });
}

const db = admin.firestore();
const adminEmail = "ethiocoders38@gmail.com";

async function setAdmin() {
  try {
    const userRef = db.collection("users").doc(adminEmail);
    await userRef.set({
      email: adminEmail,
      isAdmin: true,
      role: "admin",
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`Successfully set ${adminEmail} as admin.`);
    process.exit(0);
  } catch (error) {
    console.error("Error setting admin:", error);
    process.exit(1);
  }
}

setAdmin();
