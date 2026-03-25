"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

import AdminSidebar from "@/components/AdminSidebar";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.email!));
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true);
        } else {
          router.push("/");
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isAdmin === null) return <div className="flex h-screen items-center justify-center font-sans tracking-tight">Verifying credentials...</div>;

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <AdminSidebar />
      
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">Admin Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Welcome back to your administration command center.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Total Certificates</h3>
            <p className="text-5xl font-extrabold text-emerald-600">0</p>
          </div>
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Verified Users</h3>
            <p className="text-5xl font-extrabold text-blue-600">0</p>
          </div>
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Pending Requests</h3>
            <p className="text-5xl font-extrabold text-amber-500">0</p>
          </div>
        </section>
      </main>
    </div>
  );
}
