"use client";

import { useState } from "react";
import { Search, Loader2, Download, CheckCircle, ArrowLeft, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { findCertificateByPhone } from "./actions";

export default function VerifyPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [certificateData, setCertificateData] = useState<{ url: string; name: string } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Please enter a phone number.");
      return;
    }

    setIsLoading(true);
    setError("");
    setCertificateData(null);
    setIsNotRegistered(false);

    const res = await findCertificateByPhone(phone.trim());

    if (res.success && res.certificateUrl) {
      setCertificateData({ url: res.certificateUrl, name: res.fullName || "Applicant" });
    } else {
      if ((res as any).isNotRegistered) {
        setIsNotRegistered(true);
      } else {
        setError(res.error || "Failed to find certificate.");
      }
    }

    setIsLoading(false);
  };

  const getDownloadUrl = (url: string, name: string) => {
    const params = new URLSearchParams({
      url,
      name,
    });
    return `/api/certificate/download?${params.toString()}`;
  };

  const getImageDownloadUrl = (url: string, name: string) => {
    const params = new URLSearchParams({
      url,
      name,
    });
    return `/api/certificate/download-image?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans flex flex-col items-center justify-center p-2 sm:p-6 relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-emerald-500/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-500/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-md p-4 sm:p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-md mb-5 border border-emerald-500/20">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">
              Verify Certificate
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Enter your registered phone number to retrieve and download your verified digital certificate.
            </p>
          </div>

          {!certificateData ? (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-zinc-400" />
                </div>
                <input
                  type="tel"
                  placeholder="0911 234 567"
                  className="w-full pl-14 pr-6 py-5 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-md text-lg font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-4 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-bold text-center animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !phone.trim()}
                className="w-full h-16 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Find Certificate"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">

              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 shadow-2xl bg-zinc-100 dark:bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={certificateData.url}
                  alt="Your Certificate"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="pt-2 space-y-3">
                <p className="text-center text-sm font-black text-zinc-700 dark:text-zinc-200">
                  Download as
                </p>

                <div className="flex w-full max-w-md mx-auto rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">
                  <a
                    href={getDownloadUrl(certificateData.url, certificateData.name)}
                    download={`Certificate_${certificateData.name.replace(/\s+/g, "_")}.pdf`}
                    className="flex-1 h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base sm:text-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>PDF</span>
                  </a>

                  <a
                    href={getImageDownloadUrl(certificateData.url, certificateData.name)}
                    download={`Certificate_${certificateData.name.replace(/\s+/g, "_")}.jpg`}
                    className="flex-1 h-16 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-black text-base sm:text-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 border-l border-zinc-200 dark:border-zinc-800"
                  >
                    <Download className="w-5 h-5" />
                    <span>Image</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Not Registered Modal */}
      {isNotRegistered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <UserPlus className="w-10 h-10 text-emerald-500" />
              </div>

              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3">Not Registered</h3>
              
              <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-8">
                This phone number is not registered. Please register first to be able to download your certificate.
              </p>

              <button
                onClick={() => router.push("/generate")}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                OK, Register Now
              </button>
              
              <button 
                onClick={() => setIsNotRegistered(false)}
                className="mt-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
