import admin from "firebase-admin";
import fs from "node:fs";
import path from "node:path";

const adminEmail = process.argv[2] || process.env.ADMIN_EMAIL;
const serviceAccountArg = process.argv[3] || process.env.SERVICE_ACCOUNT_PATH;

if (!adminEmail || !adminEmail.includes("@")) {
  console.error("Usage: node scripts/set-admin.js <admin-email> <service-account-json-path>");
  process.exit(1);
}

if (!serviceAccountArg) {
  console.error("Missing service account path.");
  console.error("Usage: node scripts/set-admin.js <admin-email> <service-account-json-path>");
  process.exit(1);
}

const serviceAccountPath = path.isAbsolute(serviceAccountArg)
  ? serviceAccountArg
  : path.resolve(process.cwd(), serviceAccountArg);

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account file not found: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

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
