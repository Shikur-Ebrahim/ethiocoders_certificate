import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  const querySnapshot = await getDocs(collection(db, "payment_methods"));
  const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ docs });
}
