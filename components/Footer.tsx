"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const router = useRouter();

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount === 10) {
      router.push("/login");
    }
  };

  return (
    <footer className="w-full py-12 px-6 border-t border-zinc-100 dark:border-zinc-800 mt-20 flex flex-col items-center">
      <div className="flex items-center gap-4 mb-4">
        <div 
          onClick={handleSecretClick}
          className="w-1.5 h-1.5 bg-zinc-900/[0.03] dark:bg-zinc-100/[0.03] rounded-full cursor-default hover:bg-zinc-900/10 dark:hover:bg-zinc-100/10 transition-colors active:scale-95"
        ></div>
        <span className="text-zinc-400 dark:text-zinc-600 text-sm select-none">
          © {new Date().getFullYear()} 5M certificate Application.
        </span>
      </div>
      
    </footer>
  );
}
