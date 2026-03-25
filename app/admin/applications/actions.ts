"use server";

import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { Application } from "@/app/generate/actions";

export interface AdminApplication extends Application {
  collegeName?: string;
  department?: string;
  educationStatus?: string;
  phone?: string;
  certificateUrl?: string;
}

export async function getAllApplications() {
  try {
    const q = query(
      collection(db, "applications"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const apps = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
        paidAt: data.paidAt?.toMillis ? data.paidAt.toMillis() : null,
      };
    });

    return apps as AdminApplication[];
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
}

export async function verifyApplication(id: string) {
  try {
    const docRef = doc(db, "applications", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Application not found");
    const appData = docSnap.data();

    // Fetch sample certificate logo ID
    const settingsRef = doc(db, "settings", "sample_certificate");
    const settingsSnap = await getDoc(settingsRef);
    const logoId = settingsSnap.exists() ? settingsSnap.data().logoId : null;

    if (!logoId) throw new Error("No sample certificate template found in settings.");

    // IMPORTANT: Strip ALL commas from name and date - commas break Cloudinary URL parsing
    const rawName = (appData.fullName || appData.FullName || "Applicant Name").replace(/,/g, "").toUpperCase();
    const name = encodeURIComponent(rawName);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const encodedDate = encodeURIComponent(dateStr).replace(/%2C/g, "%252C");

    const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    // Cloudinary text overlays: adjusting positioning roughly to center-left as per typical certificates
    const nameOverlay = `co_rgb:0000a0,l_text:Arial_50_bold:${name}/fl_layer_apply,g_west,x_70,y_100`;
    const dateOverlay = `co_rgb:444444,l_text:Arial_30:${encodedDate}/fl_layer_apply,g_west,x_70,y_170`;

    const certificateUrl = `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/${nameOverlay}/${dateOverlay}/${logoId}`;

    await updateDoc(docRef, {
      status: "paid",
      certificateUrl
    });
    return { success: true, certificateUrl };
  } catch (error: any) {
    console.error("Error verifying application:", error);
    return { success: false, error: error.message || "Failed to verify application" };
  }
}

export async function rejectApplication(id: string) {
  try {
    const docRef = doc(db, "applications", id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting application:", error);
    return { success: false, error: error.message || "Failed to reject application" };
  }
}
