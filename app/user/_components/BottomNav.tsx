"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Wallet, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/user", icon: Home },
    { name: "Records", href: "/user/record", icon: History },
    { name: "Wallet", href: "/user/wallet", icon: Wallet },
    { name: "Profile", href: "/user/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 px-6 py-3 z-50">
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive 
                  ? "text-blue-600 dark:text-blue-400 scale-110" 
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
