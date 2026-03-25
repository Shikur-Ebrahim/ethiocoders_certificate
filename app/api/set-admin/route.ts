import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  const adminEmail = "ethiocoders38@gmail.com";
  
  try {
    const userRef = adminDb.collection("users").doc(adminEmail);
    await userRef.set({
      email: adminEmail,
      isAdmin: true,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ message: `User ${adminEmail} is now an admin.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
