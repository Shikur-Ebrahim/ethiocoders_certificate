"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Video, 
  LogOut, 
  ChevronRight,
  CreditCard,
  Award,
} from "lucide-react";
import { auth } from "@/lib/firebase/config";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Applications", href: "/admin/applications", icon: CreditCard },
  { name: "Welcome Video", href: "/admin/welcome-video", icon: Video },
  { name: "Sample Certificate", href: "/admin/certificate", icon: Award },
  { name: "Payment Methods", href: "/admin/payment-methods", icon: CreditCard },
];


export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col sticky top-0">
      <div className="p-8 border-b border-zinc-100 dark:border-zinc-800">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
          EC Admin
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                isActive 
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                  : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${isActive ? "text-emerald-500" : "group-hover:text-emerald-500"}`} />
                <span className="font-medium">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-3 p-3 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout Admin</span>
        </button>
      </div>
    </aside>
  );
}
