"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Download, 
  Printer, 
  CheckCircle, 
  Trophy, 
  Award, 
  Loader2, 
  ArrowLeft,
  Share2,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { getApplication, type Application } from "../actions";


import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [application, setApplication] = useState<Application | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      router.push("/generate");
      return;
    }

    const fetchApp = async () => {
      const data = await getApplication(id);
      // Allow both 'paid' and 'pending' status for the success page
      if (!data || (data.status !== "paid" && data.status !== "pending")) {
        // If not paid or pending, redirect to pay if it's pending_payment
        if (data && data.status === "pending_payment") {
            router.push(`/generate/pay?id=${id}`);
            return;
        }
      }
      setApplication(data);
      setIsLoading(false);
    };


    fetchApp();
  }, [id, router]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !application) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const dateToDisplay = application.paidAt ?? application.createdAt;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50 p-4 md:p-12 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto print:max-w-none">
        {/* Navigation - Hidden on Print */}
        <div className="flex items-center justify-between mb-12 print:hidden px-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-600 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-tight text-sm uppercase">Return to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Verified Certificate</span>
          </div>
        </div>

        {/* Success Message - Hidden on Print */}
        <div className="text-center mb-12 print:hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/20 mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-center">
            Congratulations, <span className="text-emerald-500 capitalize">{application.fullName || application.FullName}</span>!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Your payment has been confirmed and your certificate is now ready for download. This document celebrates your dedication and achievement.
          </p>
        </div>

        {/* Certificate Card */}
        <div className="relative group perspective-1000 mb-12">
          {/* Certificate Container */}
          <div 
            ref={certificateRef}
            className="w-full aspect-[1.414/1] bg-white text-zinc-900 p-8 md:p-16 border-[12px] md:border-[24px] border-zinc-100 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between print:border-none print:shadow-none print:p-8"
          >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full -ml-32 -mb-32"></div>
            
            {/* Header Content */}
            <div className="w-full flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-black tracking-tighter text-zinc-900">5M <span className="text-emerald-600">CERTIFICATE</span></h3>
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Official Generation System</p>
              </div>
              <div className="w-16 h-16 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8" />
              </div>
            </div>

            {/* Main Content */}
            <div className="text-center space-y-8 flex-1 flex flex-col justify-center">
              <div className="space-y-4">
                <h2 className="text-xl md:text-2xl font-black text-zinc-400 uppercase tracking-[0.3em]">Certificate of Achievement</h2>
                <div className="h-0.5 w-32 bg-emerald-500 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-2">
                <p className="text-sm md:text-lg font-medium italic text-zinc-500">This is to officially certify that</p>
                <h1 className="text-3xl md:text-6xl font-black text-zinc-900 tracking-tight capitalize">
                  {application.fullName || application.FullName}
                </h1>
              </div>

              <p className="text-sm md:text-lg font-medium text-zinc-600 max-w-xl mx-auto leading-relaxed px-4">
                Has successfully completed the requirements for the <span className="text-emerald-600 font-bold">5M CERTIFICATE DEVELOPMENT PROGRAM</span> and is hereby recognized as a certified developer.
              </p>
            </div>

            {/* Footer Content */}
            <div className="w-full grid grid-cols-3 items-end pt-12 mt-auto">
              <div className="space-y-2">
                <div className="h-px w-full bg-zinc-200"></div>
                <p className="text-[10px] font-black text-zinc-400 uppercase text-center">Date Issued</p>
                <p className="text-xs font-black text-zinc-900 text-center">{new Date(dateToDisplay).toLocaleDateString()}</p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 border-4 border-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8" />
                  </div>
                </div>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Badge</p>
              </div>

              <div className="space-y-2">
                <div className="h-px w-full bg-zinc-200"></div>
                <p className="text-[10px] font-black text-zinc-400 uppercase text-center">Certificate ID</p>
                <p className="text-xs font-mono font-black text-zinc-900 text-center uppercase">{application.id.slice(0, 12)}</p>
              </div>
            </div>

            {/* Verification Link */}
            <p className="absolute bottom-4 left-0 w-full text-center text-[8px] font-black text-zinc-300 uppercase tracking-[0.4em]">
              Verify at ethiocoders.io/verify/{application.id.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* Action Buttons - Hidden on Print */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center print:hidden pb-20">
          <button 
            onClick={handlePrint}
            className="w-full md:w-auto px-10 h-16 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl active:scale-95"
          >
            <Printer className="w-6 h-6" />
            Print Certificate
          </button>
          
          <button 
            onClick={() => alert("PDF Download starting...")}
            className="w-full md:w-auto px-10 h-16 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <Download className="w-6 h-6" />
            Download PDF
          </button>

          <button className="w-16 h-16 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:border-emerald-500 transition-all active:scale-95">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
          }
          aside, nav, header, .print-hidden {
            display: none !important;
          }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      ` }} />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
