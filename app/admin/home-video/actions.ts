"use server";

import { db } from "@/lib/firebase/config";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export async function getHomeVideosServer() {
  try {
    const q = query(
      collection(db, "welcome_videos"), 
      orderBy("createdAt", "desc"), 
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    const videos = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        imageId: data.publicId,
        // Convert Firestore Timestamp to plain number for serialization
        createdAt: data.createdAt?.toMillis?.() || data.createdAt?.seconds * 1000 || Date.now(),
      };
    });
    return videos;
  } catch (error) {
    console.error("Error fetching home videos:", error);
    return [];
  }
}
