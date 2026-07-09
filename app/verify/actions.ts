"use server";

import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Auto-repair broken Cloudinary text overlay URLs.
 * Old URLs had: l_text:Arial_60_bold:NAME,co_rgb:HEX  (comma breaks Cloudinary)
 * Fixed URLs:   co_rgb:HEX,l_text:Arial_60_bold:NAME  (color first, then text)
 * Also removes encoded commas (%2C) from text content.
 */
function repairCloudinaryUrl(url: string): string {
  if (!url) return url;

  // Fix pattern: l_text:FONT:TEXT,co_rgb:HEX  ->  co_rgb:HEX,l_text:FONT:TEXT
  let fixed = url.replace(
    /l_text:([^,/]+),co_rgb:([a-fA-F0-9]+)/g,
    'co_rgb:$2,l_text:$1'
  );

  // Show comma instead of space by double-encoding commas in Cloudinary URLs.
  // This handles dates like "March%2024%2C%202026" -> "March%2024%252C%202026"
  fixed = fixed.replace(/%2C/g, '%252C');

  return fixed;
}

export async function findCertificateByPhone(phone: string) {
  try {
    const q = query(
      collection(db, "applications"),
      where("phone", "==", phone),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: "This phone number is not registered.", isNotRegistered: true };
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    if (data.status !== "paid" || (!data.certificateUrl && !data.certificateUrls)) {
      return { success: false, error: "Your application is still under review.", isPending: true };
    }

    // Auto-repair old broken Cloudinary URLs
    let certificateUrls: Record<string, string> = data.certificateUrls || {};
    let needsUpdate = false;

    // Fallback for old single certificate
    if (Object.keys(certificateUrls).length === 0 && data.certificateUrl) {
      certificateUrls['ai'] = data.certificateUrl;
    }

    for (const [track, url] of Object.entries(certificateUrls)) {
      const repairedUrl = repairCloudinaryUrl(url);
      if (repairedUrl !== url) {
        certificateUrls[track] = repairedUrl;
        needsUpdate = true;
      }
    }

    // If the URL was repaired, also update it in the database for next time
    if (needsUpdate) {
      console.log("Auto-repairing broken certificate URL for:", docSnap.id);
      try {
        const docRef = doc(db, "applications", docSnap.id);
        await updateDoc(docRef, { certificateUrls });
      } catch (updateErr) {
        console.error("Failed to persist URL repair:", updateErr);
      }
    }

    return {
      success: true,
      certificateUrls,
      fullName: data.fullName || data.FullName || "Applicant"
    };

  } catch (error: any) {
    console.error("Error finding certificate:", error);
    return { success: false, error: "An error occurred while verifying your certificate. Please try again later." };
  }
}
