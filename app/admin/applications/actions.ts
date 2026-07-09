"use server";

import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, orderBy, doc, updateDoc, getDoc, deleteDoc, where } from "firebase/firestore";
import { Application } from "@/app/generate/actions";

export interface AdminApplication extends Application {
  collegeName?: string;
  department?: string;
  educationStatus?: string;
  phone?: string;
  certificateUrls?: Record<string, string>;
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
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
        paidAt: data.paidAt?.toMillis ? data.paidAt.toMillis() : null,
      };
    });

    // Custom sort: 'pending' first, then sort all by createdAt descending
    apps.sort((a: any, b: any) => {
      const isAPending = a.status === 'pending';
      const isBPending = b.status === 'pending';
      
      if (isAPending && !isBPending) return -1;
      if (!isAPending && isBPending) return 1;
      
      // Secondary sort: createdAt descending
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return apps as AdminApplication[];
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
}

export async function getPendingCount() {
  try {
    const q = query(
      collection(db, "applications"),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching pending count:", error);
    return 0;
  }
}

export async function verifyApplication(id: string) {
  try {
    const docRef = doc(db, "applications", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Application not found");
    const appData = docSnap.data();

    // Fetch sample certificate logo IDs
    const settingsRef = doc(db, "settings", "sample_certificate");
    const settingsSnap = await getDoc(settingsRef);
    const settingsData = settingsSnap.exists() ? settingsSnap.data() : null;

    if (!settingsData) throw new Error("No sample certificate template found in settings.");

    // IMPORTANT: Strip ALL commas from name and date - commas break Cloudinary URL parsing
    const toTitleCase = (str: string) => str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const rawName = toTitleCase((appData.fullName || appData.FullName || "Applicant Name").replace(/,/g, ""));
    const name = encodeURIComponent(rawName);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const encodedDate = encodeURIComponent(dateStr).replace(/%2C/g, "%252C");

    const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    // Cloudinary text overlays: adjusting positioning roughly to center-left as per typical certificates
    const nameOverlay = `co_rgb:0000a0,l_text:Arial_50_bold:${name}/fl_layer_apply,g_west,x_85,y_130`;
    const dateOverlay = `co_rgb:444444,l_text:Arial_30:${encodedDate}/fl_layer_apply,g_west,x_85,y_170`;

    const selectedTracks: string[] = appData.selectedTracks || ["ai", "programming", "android", "data"];
    const certificateUrls: Record<string, string> = {};

    for (const track of selectedTracks) {
        const logoId = settingsData[track];
        if (logoId) {
            certificateUrls[track] = `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/${nameOverlay}/${dateOverlay}/${logoId}`;
        }
    }

    // fallback if no tracks matched but logoId exists
    if (Object.keys(certificateUrls).length === 0 && settingsData.logoId) {
        certificateUrls['ai'] = `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/${nameOverlay}/${dateOverlay}/${settingsData.logoId}`;
    }

    if (Object.keys(certificateUrls).length === 0) {
        throw new Error("No sample certificate templates found for selected tracks.");
    }

    await updateDoc(docRef, {
      status: "paid",
      certificateUrls
    });
    return { success: true, certificateUrls };
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
