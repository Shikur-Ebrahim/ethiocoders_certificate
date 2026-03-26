"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { getTelegramInfo, saveTelegramInfo, TelegramInfo } from "./actions";
import { Loader2, ArrowRight, LayoutDashboard, CheckCircle } from "lucide-react";

export default function TelegramAdminPage() {
  const [info, setInfo] = useState<TelegramInfo | null>(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const data = await getTelegramInfo();
      if (data) {
        setInfo(data);
        setUsername(data.username);
      }
      setIsLoading(false);
    };
    fetchInfo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsSaving(true);
    setMessage(null);
    
    const res = await saveTelegramInfo(username.trim());
    if (res.success) {
      setMessage({ type: 'success', text: "Telegram username updated successfully!" });
      setInfo({ username: username.replace("@", ""), updatedAt: Date.now() });
    } else {
      setMessage({ type: 'error', text: res.error || "Failed to save username." });
    }
    setIsSaving(false);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-12 lg:p-16">
        <div className="max-w-3xl">
          {/* Header */}
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white mb-3">
              Telegram <span className="text-emerald-500">Admin</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold max-w-lg">
              Manage the official Telegram link displayed on the landing page or used in support channels.
            </p>
          </div>

          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-zinc-400 font-black animate-pulse uppercase tracking-widest text-xs">Loading Settings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 animate-in fade-in zoom-in-95 duration-500">
              {/* Main Configuration Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full -mr-24 -mt-24 group-hover:bg-emerald-500/10 transition-colors duration-500" />
                
                <form onSubmit={handleSave} className="relative z-10 space-y-8">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-black text-zinc-400 uppercase tracking-widest ml-1">
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                      Telegram Username
                    </label>
                    <div className="relative group/input">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-emerald-500 text-xl group-focus-within/input:scale-110 transition-transform">@</div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        required
                        className="w-full h-16 md:h-20 pl-12 pr-8 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/10 transition-all outline-none font-black text-lg md:text-xl text-zinc-900 dark:text-white"
                      />
                    </div>
                    
                    {/* Helper Info */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 flex gap-4 items-start">
                      <div className="mt-1">
                        <ArrowRight className="w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="text-xs font-bold text-zinc-500 leading-relaxed italic">
                        The username will be automatically converted to a direct link (t.me/username) wherever it's used in the application.
                      </p>
                    </div>
                  </div>

                  {message && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                      message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    }`}>
                      {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                      <span className="font-bold text-sm tracking-tight">{message.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-16 md:h-20 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-lg md:text-xl rounded-[1.5rem] shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 group/btn relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/10 to-emerald-400/0 -translate-x-[200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                    {isSaving ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <span>Update Telegram Link</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Last Updated Information */}
              {info && (
                <div className="flex items-center justify-between px-8 py-4 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-700 delay-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400">Settings Active</span>
                  </div>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Last Updated: {new Date(info.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
