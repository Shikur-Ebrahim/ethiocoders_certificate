"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Video, 
  LogOut, 
  ChevronRight,
  CreditCard,
  Award,
  Menu,
  X,
  Phone
} from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { useState, useEffect } from "react";
import { getPendingCount } from "@/app/admin/applications/actions";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Applications", href: "/admin/applications", icon: CreditCard },
  { name: "Welcome Video", href: "/admin/welcome-video", icon: Video },
  { name: "Sample Certificate", href: "/admin/certificate", icon: Award },
  { name: "Payment Methods", href: "/admin/payment-methods", icon: CreditCard },
  { name: "Telegram Link", href: "/admin/telegrams", icon: Phone },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await getPendingCount();
      setPendingCount(count);
    };
    fetchCount();
  }, [pathname]); // Refresh on navigation to show latest state

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-zinc-600 dark:text-zinc-400 active:scale-95 transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] animate-in fade-in duration-300"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[55] w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transform transition-transform duration-500 ease-out
        lg:translate-x-0 lg:static lg:h-screen lg:w-64
        ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent tracking-tighter">
            5M ADMIN
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all group ${
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10" 
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? "text-emerald-500" : "group-hover:text-emerald-500"}`} />
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  {item.name === "Applications" && pendingCount > 0 && (
                    <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-emerald-500 text-white text-[10px] font-black rounded-full animate-in zoom-in duration-300">
                      {pendingCount}
                    </span>
                  )}
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => {
              auth.signOut();
              setIsOpen(false);
              router.push("/");
            }}
            className="w-full flex items-center gap-3 p-4 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
