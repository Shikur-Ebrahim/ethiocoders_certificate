"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { getHomeVideosServer } from "./admin/home-video/actions";
import { Loader2, Play } from "lucide-react";
import { PwaInstallButton } from "@/components/PwaInstallButton";

type HomeVideo = {
  imageId: string;
  url?: string;
};

export default function Home() {
  const [homeVideo, setHomeVideo] = useState<HomeVideo | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);

  useEffect(() => {
    async function loadHomeVideo() {
      try {
        const videos = await getHomeVideosServer();
        if (videos && videos.length > 0) {
          setHomeVideo(videos[0]);
        }
      } catch (error) {
        console.error("Failed to load home video:", error);
      } finally {
        setIsLoadingVideo(false);
      }
    }
    loadHomeVideo();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black overflow-x-hidden relative">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 dark:opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Welcome Video Hero Section - Subtly Curved & Bordered */}
      <div className="w-full px-1 pt-1 md:px-2 md:pt-2 relative overflow-hidden transition-all duration-700">
        <div className="relative aspect-[16/10] md:aspect-video w-full overflow-hidden rounded-xl md:rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl bg-zinc-900 transition-all">
          {isLoadingVideo ? (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            </div>
          ) : homeVideo ? (
            <>
              <video
                ref={(el) => {
                  if (el) el.volume = 0.2;
                }}
                src={homeVideo.url || `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${homeVideo.imageId}`}
                className="w-full h-full object-cover"
                autoPlay
                loop
                playsInline
                controls
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-50 dark:bg-zinc-950">
              <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800 shadow-2xl">
                <Play className="w-12 h-12 text-emerald-600 fill-emerald-600" />
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight italic">Innovation in Motion</p>
            </div>
          )}
        </div>
      </div>

      <main className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-6 pt-2 pb-16 md:pt-4 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">

        <div className="mb-2 sm:mb-8 animate-in fade-in zoom-in duration-1000 delay-300 scale-90 sm:scale-100">
          <PwaInstallButton />
        </div>

        <div className="flex flex-row gap-2 sm:gap-3 justify-center w-full max-w-md mb-4 sm:mb-8">
          <Link
            href="/generate"
            className="h-12 sm:h-16 flex-1 px-3 sm:px-8 rounded-[1.2rem] sm:rounded-[1.5rem] bg-emerald-600 text-white font-black text-xs sm:text-lg hover:bg-emerald-700 hover:scale-105 transition-all shadow-2xl shadow-emerald-500/40 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 text-center"
          >
            Start Generating
          </Link>
          <Link
            href="/verify"
            className="h-12 sm:h-16 flex-1 px-3 sm:px-8 rounded-[1.2rem] sm:rounded-[1.5rem] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold text-xs sm:text-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-105 transition-all active:scale-95 shadow-lg flex items-center justify-center text-center"
          >
            Download Certificate
          </Link>
        </div>

        <h3 className="text-xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-3 sm:mb-6 leading-tight">
          Next Generation <br />
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">Automatic Certification</span>
        </h3>

        <p className="w-full text-left text-[12px] sm:text-sm md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 sm:mb-7 font-medium px-2">
          Automatically complete all questions, calculate your score, and instantly generate your certificate. Users who achieve <span className="font-black text-zinc-900 dark:text-zinc-50">95% and above</span> can directly download their official 5 Million Ethiopian Coders certificate. Simply complete the process, pay a small fee, and receive your fully generated certificate within <span className="font-black text-zinc-900 dark:text-zinc-50">5 minutes</span>—fast, secure, and hassle-free.
        </p>

        <Footer />
      </main>
    </div>
  );
}
