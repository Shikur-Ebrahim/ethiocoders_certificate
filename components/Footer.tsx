"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const router = useRouter();

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount === 5) {
      router.push("/login");
    }
  };

  return (
    <footer className="w-full py-12 px-6 border-t border-zinc-100 dark:border-zinc-800 mt-20 flex flex-col items-center">
      <div className="flex items-center gap-4 mb-4">
        <div 
          onClick={handleSecretClick}
          className="w-4 h-4 bg-zinc-900 dark:bg-zinc-100 rounded-sm cursor-pointer hover:opacity-80 transition-opacity active:scale-90"
          title="Secret Admin Access"
        ></div>
        <span className="text-zinc-400 dark:text-zinc-600 text-sm select-none">
          © {new Date().getFullYear()} EthioCoders Certify Application.
        </span>
      </div>
      
    </footer>
  );
}
