"use server";

import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, limit, doc, setDoc, getDoc } from "firebase/firestore";

export interface TelegramInfo {
  id?: string;
  username: string;
  updatedAt: number;
}

const COLLECTION_NAME = "telegrams";
const DOC_ID = "main_link";

export async function getTelegramInfo() {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        username: data.username || "",
        updatedAt: data.updatedAt || Date.now()
      } as TelegramInfo;
    }

    return null;
  } catch (error) {
    console.error("Error fetching telegram info:", error);
    return null;
  }
}

export async function saveTelegramInfo(username: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    
    // Clean username (remove @ if present)
    const cleanUsername = username.startsWith("@") ? username.substring(1) : username;

    await setDoc(docRef, {
      username: cleanUsername,
      updatedAt: Date.now()
    }, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error("Error saving telegram info:", error);
    return { success: false, error: error.message || "Failed to save telegram info" };
  }
}
