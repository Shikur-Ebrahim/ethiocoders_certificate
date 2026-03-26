"use server";

import { db } from "@/lib/firebase/config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

import { revalidatePath } from "next/cache";

const COLLECTION_NAME = "payment_methods";

export async function addPaymentMethod(data: any) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: "active",
      createdAt: serverTimestamp(),
    });
    revalidatePath("/admin/payment-methods");
    return docRef.id;
  } catch (error) {
    console.error("Error adding payment method:", error);
    throw error;
  }
}

export async function getPaymentMethods() {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
        updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (data.updatedAt || null),
      };
    });

  } catch (error) {
    console.error("Error getting payment methods:", error);
    return [];
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    revalidatePath("/admin/payment-methods");
  } catch (error) {
    console.error("Error deleting payment method:", error);
    throw error;
  }
}

export async function updatePaymentMethod(id: string, data: any) {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    revalidatePath("/admin/payment-methods");
  } catch (error) {
    console.error("Error updating payment method:", error);
    throw error;
  }
}

export async function togglePaymentMethodStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    revalidatePath("/admin/payment-methods");
  } catch (error) {
    console.error("Error toggling status:", error);
    throw error;
  }
}
