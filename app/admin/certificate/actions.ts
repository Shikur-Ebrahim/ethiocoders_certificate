"use server";

import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export async function getSampleCertificate() {
  try {
    const docRef = doc(db, "settings", "sample_certificate");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching sample certificate:", error);
    return null;
  }
}

export async function saveSampleCertificate(logoId: string) {
  try {
    const docRef = doc(db, "settings", "sample_certificate");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        logoId,
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(docRef, {
        logoId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error saving sample certificate:", error);
    return { success: false, error: "Failed to save sample certificate" };
  }
}
