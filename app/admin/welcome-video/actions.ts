"use server";

import { db } from "@/lib/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function addWelcomeVideoServer({ 
  imageId, 
  mediaType 
}: { 
  imageId: string; 
  mediaType: "video"; 
}) {
  try {
    // Construct URLs using Cloudinary standard URL structure
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined on the server.");
    }
    const secureUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${imageId}`;

    await addDoc(collection(db, "welcome_videos"), {
      publicId: imageId,
      url: secureUrl,
      mediaType,
      createdAt: serverTimestamp(),
    });

    revalidatePath("/admin/welcome-video");
    return { success: true };
  } catch (error) {
    console.error("Error saving welcome video:", error);
    throw error;
  }
}
