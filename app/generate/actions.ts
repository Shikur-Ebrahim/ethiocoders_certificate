"use server";

import { db } from "@/lib/firebase/config";
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";


const COLLECTION_NAME = "applications";

export interface Application {
  id: string;
  fullName?: string;
  FullName?: string;
  status: "pending_payment" | "paid" | "declined" | "pending";
  createdAt: number;
  paidAt: number | null;
  screenshotId?: string;
  methodId?: string;
  [key: string]: any;
}



export async function saveApplication(formData: any) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...formData,
      status: "pending_payment",
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving application:", error);
    return { success: false, error: "Failed to save application" };
  }
}

export async function createFullApplication(formData: any, paymentData: { screenshotId: string, methodId: string }) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...formData,
      ...paymentData,
      status: "pending",
      createdAt: serverTimestamp(),
      paidAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating full application:", error);
    return { success: false, error: "Failed to create application" };
  }
}


export async function submitPayment(applicationId: string, paymentData: { screenshotId: string, methodId: string }) {
  try {
    const docRef = doc(db, COLLECTION_NAME, applicationId);
    await updateDoc(docRef, {
      ...paymentData,
      status: "paid", // Automatically set to paid after upload per user request
      paidAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting payment:", error);
    return { success: false, error: "Failed to submit payment" };
  }
}

export async function getApplication(id: string): Promise<Application | null> {
  try {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
        paidAt: data.paidAt?.toMillis ? data.paidAt.toMillis() : null
      } as Application;
    }
    return null;
  } catch (error) {
    console.error("Error fetching application:", error);
    return null;
  }
}

export async function checkDuplicatePhone(phone: string) {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("phone", "==", phone)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking duplicate phone:", error);
    return false;
  }
}


