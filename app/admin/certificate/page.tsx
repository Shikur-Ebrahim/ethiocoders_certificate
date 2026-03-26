"use client";

import { useState, useRef, useEffect } from "react";
import { Award, Loader2, Upload, CheckCircle, RefreshCw, Eye } from "lucide-react";
import { getSampleCertificate, saveSampleCertificate } from "./actions";
import AdminSidebar from "@/components/AdminSidebar";
import Image from "next/image";

export default function AdminCertificatePage() {
    const [publicId, setPublicId] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            const data = await getSampleCertificate();
            if (data?.logoId) {
                setPublicId(data.logoId);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const getErrorMessage = (err: unknown) => {
        return err instanceof Error ? err.message : "Unexpected error";
    };

    // Clean up preview URL
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        setPublicId(""); 

        setIsUploading(true);
        try {
            let signResponse;
            try {
                signResponse = await fetch("/api/admin/cloudinary-sign", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        paramsToSign: {
                            timestamp: Math.round(new Date().getTime() / 1000),
                            folder: "certificates",
                        }
                    })
                });
            } catch (networkError: unknown) {
                console.error("Server API fetch error:", networkError);
                throw new Error("Could not reach local server. The dev server may have crashed or hung. Try restarting 'npm run dev'.");
            }

            if (!signResponse.ok) {
                throw new Error(`Cloudinary signature failed with status ${signResponse.status}`);
            }

            const { signature, timestamp, apiKey } = await signResponse.json();

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", "certificates");

            let uploadResponse;
            try {
                uploadResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    { method: "POST", body: formData }
                );
            } catch (cloudError: unknown) {
                console.error("Cloudinary fetch error:", cloudError);
                throw new Error("Could not reach Cloudinary API. This is usually caused by an Ad Blocker or a network problem.");
            }

            const uploadData = await uploadResponse.json();

            if (uploadData.public_id) {
                setPublicId(uploadData.public_id);
            } else {
                throw new Error(uploadData.error?.message || "Cloudinary upload failed");
            }
        } catch (error: unknown) {
            console.error("Upload process error:", error);
            alert("Upload Error: " + getErrorMessage(error));
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!publicId) return;

        setIsSaving(true);
        try {
            const res = await saveSampleCertificate(publicId);
            if (res.success) {
                alert("Sample certificate updated successfully!");
                setPreviewUrl(null); // Clear local preview once saved
            } else {
                throw new Error(res.error);
            }
        } catch (error: unknown) {
            console.error("Save error:", error);
            alert("Failed to save to database: " + getErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    const displayUrl = previewUrl || (publicId ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}` : null);

    return (
        <div className="flex min-h-screen bg-zinc-950 font-sans">
            <AdminSidebar />
            
            <main className="flex-1 py-8 md:py-12 px-4 sm:px-6 overflow-y-auto w-full">
                <div className="max-w-xl mx-auto">
                    <div className="text-center mb-8 md:mb-10 pt-12 lg:pt-0">
                        <div className="inline-flex items-center justify-center p-2.5 bg-emerald-500/10 rounded-2xl mb-4 border border-emerald-500/20">
                            <Award className="h-6 w-6 md:h-8 md:w-8 text-emerald-500" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">Sample Certificate</h1>
                        <p className="text-slate-400 text-sm md:text-base font-medium">Manage the reference image used for certificate generation.</p>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full" />

                        {isLoading ? (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                                <Loader2 className="h-8 w-8 animate-spin mb-3" />
                                <span className="font-bold">Loading dashboard...</span>
                            </div>
                        ) : (
                            <div className="space-y-8 relative z-10">
                                <div 
                                    onClick={() => !isUploading && fileInputRef.current?.click()}
                                    className={`aspect-[4/3] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden group
                                        ${isUploading ? 'border-emerald-500/50 bg-emerald-500/5' : 
                                          displayUrl ? 'border-emerald-500/40 bg-zinc-950 shadow-2xl' : 
                                          'border-slate-800 bg-slate-950/50 hover:border-slate-600 hover:bg-slate-950 shadow-inner'}`}
                                >
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleFileUpload} 
                                        accept="image/*" 
                                    />
                                    
                                    {displayUrl ? (
                                        <div className="absolute inset-0 w-full h-full">
                                            <div className="relative w-full h-full p-2">
                                                <Image 
                                                    src={displayUrl} 
                                                    alt="Certificate Preview"
                                                    fill
                                                    className={`object-contain transition-all duration-500 rounded-2xl ${isUploading ? 'opacity-40 scale-95' : 'opacity-100'}`}
                                                    unoptimized
                                                />
                                            </div>
                                            
                                            {isUploading && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                                    <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
                                                    <div className="text-sm text-white font-black animate-pulse uppercase tracking-widest">Uploading...</div>
                                                </div>
                                            )}
                                            
                                            {!isUploading && !isSaving && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/60 backdrop-blur-sm">
                                                    <div className="flex flex-col items-center">
                                                        <div className="h-14 w-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/20 mb-3 transition-all scale-90 group-hover:scale-100">
                                                            <RefreshCw className="h-6 w-6" />
                                                        </div>
                                                        <span className="text-[10px] text-white font-black uppercase tracking-wider">Change Certificate</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 flex flex-col items-center">
                                            <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 text-zinc-500 group-hover:text-emerald-500 group-hover:scale-110 transition-all border border-slate-800 shadow-lg">
                                                <Upload className="h-8 w-8" />
                                            </div>
                                            <div className="text-sm text-zinc-300 font-bold mb-1">Select Certificate Image</div>
                                            <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">PNG, JPG or WEBP</div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button 
                                        onClick={handleSave}
                                        disabled={isSaving || isUploading || !publicId}
                                        className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95
                                            ${!publicId || isSaving ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 
                                              'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'}`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                <span className="uppercase tracking-widest text-xs">Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className={`h-6 w-6 ${!publicId ? 'opacity-20' : ''}`} />
                                                <span className="uppercase tracking-widest text-xs">Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                {publicId && !isSaving && previewUrl && (
                                    <div className="flex items-center justify-center gap-2 text-emerald-500/80 animate-in fade-in slide-in-from-bottom-2 duration-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Unsaved changes detected</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-8 p-6 bg-slate-900/20 border border-slate-800/50 rounded-3xl backdrop-blur-md">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <Eye className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-200 mb-1">Preview Notice</h4>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    The image uploaded here will be used as the base for all generated certificates. Ensure it has the correct layout and resolution for professional results.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
