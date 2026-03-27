"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Loader2, 
  CheckCircle, 
  CreditCard, 
  Phone, 
  Building2, 
  Upload, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Copy,
  Check
} from "lucide-react";

import Image from "next/image";
import { getApplication, createFullApplication } from "../actions";
import { getPaymentMethods } from "../../admin/payment-methods/actions";

type PaymentApplication = {
  fullName?: string;
  FullName?: string;
  educationStatus?: string;
};

type PaymentMethodType = "bank" | "telebirr";

type PaymentMethod = {
  id: string;
  type: PaymentMethodType;
  holderName?: string;
  bankName?: string;
  accountNumber?: string;
  phoneNumber?: string;
  workerFee?: number;
  logoId?: string;
  status?: string;
  createdAt?: number;
  updatedAt?: number | null;
};

import { Suspense } from "react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const applicationIdFromUrl = searchParams.get("id");

  const [application, setApplication] = useState<PaymentApplication>({});
  const [formData, setFullFormData] = useState<Record<string, unknown> | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isScoring, setIsScoring] = useState(true);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationScore, setVerificationScore] = useState(0);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoId, setLogoId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);

  const normalizeMethodType = (raw: Record<string, unknown>): PaymentMethodType => {
    const rawType = raw.type;
    const hasBankShape = Boolean(raw.bankName) || Boolean(raw.accountNumber);
    const hasTelebirrShape = Boolean(raw.phoneNumber);

    if (rawType === "bank" || rawType === "telebirr") {
      if (rawType === "telebirr" && hasBankShape && !hasTelebirrShape) return "bank";
      if (rawType === "bank" && hasTelebirrShape && !hasBankShape) return "telebirr";
      return rawType;
    }

    return hasBankShape ? "bank" : "telebirr";
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  useEffect(() => {
    const fetchData = async () => {
      // Priority 1: Check sessionStorage (the new flow)
      const storedData = sessionStorage.getItem("pendingApplication");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setFullFormData(parsed as Record<string, unknown>);
        setApplication(parsed as PaymentApplication); // Use for UI display parity
      } else if (applicationIdFromUrl) {
          // Priority 2: Fallback to existing application (legacy flow/refresh)
          const app = await getApplication(applicationIdFromUrl);
          if (app) {
              setApplication(app);
          }
      } else {
          // No data found, redirect
          router.push("/generate");
          return;
      }

      const methodsRaw = await getPaymentMethods();
      const methods = (methodsRaw as unknown as Array<Record<string, unknown>>).map((m) => {
        const type = normalizeMethodType(m);
        const workerFeeRaw = m.workerFee;
        const workerFee = typeof workerFeeRaw === "number" ? workerFeeRaw : Number(workerFeeRaw ?? 0);
        const createdAtRaw = m.createdAt;
        const updatedAtRaw = m.updatedAt;
        const createdAt = typeof createdAtRaw === "number" ? createdAtRaw : Number(createdAtRaw ?? 0);
        const updatedAt =
          typeof updatedAtRaw === "number" ? updatedAtRaw : updatedAtRaw == null ? null : Number(updatedAtRaw);

        return {
          id: String(m.id ?? ""),
          type,
          holderName: (m.holderName as string | undefined) ?? undefined,
          bankName: (m.bankName as string | undefined) ?? undefined,
          accountNumber: (m.accountNumber as string | undefined) ?? undefined,
          phoneNumber: (m.phoneNumber as string | undefined) ?? undefined,
          workerFee: Number.isFinite(workerFee) ? workerFee : 0,
          logoId: (m.logoId as string | undefined) ?? undefined,
          status: (m.status as string | undefined) ?? undefined,
          createdAt: Number.isFinite(createdAt) ? createdAt : 0,
          updatedAt: updatedAt !== null && Number.isFinite(updatedAt) ? updatedAt : null,
        } satisfies PaymentMethod;
      });

      const activeMethods = methods.filter((m) => m.status === "active");
      const byType = new Map<PaymentMethodType, PaymentMethod>();
      for (const method of activeMethods) {
        const existing = byType.get(method.type);
        if (!existing) {
          byType.set(method.type, method);
          continue;
        }
        const methodTs = method.updatedAt ?? method.createdAt ?? 0;
        const existingTs = existing.updatedAt ?? existing.createdAt ?? 0;
        if (methodTs > existingTs) byType.set(method.type, method);
      }

      setPaymentMethods(Array.from(byType.values()));
      
      setIsLoading(false);


      // Simulate scoring sequence
      let currentScore = 0;
      const interval = setInterval(() => {
        currentScore += Math.floor(Math.random() * 10) + 5;
        if (currentScore >= 96) {
          setScore(96);
          clearInterval(interval);
          setTimeout(() => setIsScoring(false), 800);
        } else {
          setScore(currentScore);
        }
      }, 150);
    };

    fetchData();
  }, [applicationIdFromUrl, router]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      const uniquePublicId = `proof_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const signResponse = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paramsToSign: {
            timestamp: Math.round(new Date().getTime() / 1000),
            folder: "payment_proofs",
            public_id: uniquePublicId,
          }
        })
      });

      const { signature, timestamp, apiKey } = await signResponse.json();

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", timestamp.toString());
      uploadData.append("signature", signature);
      uploadData.append("folder", "payment_proofs");
      uploadData.append("public_id", uniquePublicId);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: uploadData }
      );

      const data = await uploadResponse.json();
      if (data.public_id) {
        setLogoId(data.public_id);
      } else {
        throw new Error("Screenshot upload failed");
      }
    } catch (error) {
      console.error("Screenshot upload error:", error);
      alert("Failed to upload screenshot. Please try again.");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!logoId) {
      alert("Please upload your payment screenshot first.");
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (formData) {
          // New flow: Save everything at once
        if (!selectedMethod) {
          alert("Please select a payment method.");
          return;
        }
          result = await createFullApplication(formData, {
            screenshotId: logoId,
            methodId: selectedMethod.id
          });
          // Clear session after success
          if (result.success) sessionStorage.removeItem("pendingApplication");
      } else if (applicationIdFromUrl) {
          // Legacy flow: Update existing
          // (Need to import submitPayment if keeping this, but focusing on user's request)
          result = { success: false, error: "Legacy flow not fully upgraded" };
      } else {
          result = { success: false, error: "No data found" };
      }


      if (result.success) {
        setIsVerifying(true);
        // Simulation of verification
        let currentScore = 0;
        const interval = setInterval(() => {
            currentScore += Math.floor(Math.random() * 15) + 10;
            if (currentScore >= 100) {
                setVerificationScore(100);
                clearInterval(interval);
                setTimeout(() => {
                    // Redirect to landing page instead of success page as requested
                    router.push("/");
                }, 1000);


            } else {
                setVerificationScore(currentScore);
            }
        }, 300);
      } else {
        alert(result.error || "Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Payment submission error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 mb-8 bg-blue-500/10 rounded-full flex items-center justify-center relative">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin absolute" />
          <span className="text-xl font-black text-blue-500">{verificationScore}%</span>
        </div>
        <h2 className="text-3xl font-black mb-2 tracking-tight">Verifying Payment...</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm">
          Matching your screenshot with our records and confirming the transaction. This will only take a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 p-1 md:p-4 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 text-left flex flex-col items-start animate-in fade-in slide-in-from-top-6 duration-1000 w-full">

          
          <div className="relative group w-full bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl rounded-xl border border-white dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 blur-2xl opacity-50 -z-10"></div>
            
            <div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[8px] font-black text-zinc-400 tracking-wider mb-0.5">Applicant</p>
                  <p className="text-xs font-black text-zinc-900 dark:text-white truncate">{application.fullName || application.FullName || "Applicant"}</p>
                </div>


              </div>
              
              <div className="flex items-center gap-3 p-4 pl-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center text-emerald-600">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[8px] font-black text-emerald-600/60 dark:text-emerald-500/40 tracking-wider mb-0.5">Level</p>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 truncate tracking-tight">{application.educationStatus}</p>
                </div>

              </div>
            </div>

            <div className="p-5 bg-zinc-50/50 dark:bg-zinc-900/20">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                To generate and download your <span className="text-zinc-900 dark:text-white font-bold">official certificate</span>, please complete the payment using one of our supported methods below.
              </p>
            </div>
          </div>
        </div>





        {isScoring ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 mb-8 bg-emerald-500/10 rounded-xl flex items-center justify-center relative">

              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin absolute" />
              <span className="text-xl font-black text-emerald-500">{score}%</span>
            </div>
            <h2 className="text-3xl font-black mb-2 tracking-tight">Analyzing Application...</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm">
              Generating your certificate profile and verifying your achievements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-bottom-6 duration-1000">

          {/* Left: Payment Methods Selection */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">

              <div className="flex flex-col gap-4 mb-4">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  Select Payment Method
                </h2>
                <div className="px-5 py-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between w-full">
                   <span className="text-[11px] font-black text-zinc-500 tracking-wide">Certificate Generate Fee</span>
                   <span className="text-xl font-black text-emerald-400 tracking-tight">
                     {selectedMethod?.workerFee || paymentMethods.find(m => m.type === 'bank')?.workerFee || paymentMethods[0]?.workerFee || "100"} ETB
                   </span>
                </div>


              </div>


              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left group ${

                      selectedMethod?.id === method.id 
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5 shadow-lg shadow-emerald-500/10" 
                        : "border-zinc-100 dark:border-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 relative overflow-hidden flex items-center justify-center p-1.5 shadow-sm">
                      {method.logoId ? (
                        <Image src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${method.logoId}`} alt="Logo" fill className="object-contain p-1" />
                      ) : (
                        method.type === "telebirr" ? <Phone className="w-6 h-6 text-zinc-300" /> : <Building2 className="w-6 h-6 text-zinc-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white truncate">
                        {method.type === "bank" ? method.bankName : "Telebirr"}
                      </h3>
                      <p className="text-xs text-zinc-500 font-bold">{method.type === "bank" ? "Direct Transfer" : "Mobile Money"}</p>
                    </div>
                    {selectedMethod?.id === method.id && <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Transfer Details & Upload */}
          <div className="space-y-6">
            {!selectedMethod ? (
              <div className="bg-white dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center opacity-60 h-full min-h-[400px]">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center mb-6">

                  <CreditCard className="w-10 h-10 text-zinc-300" />
                </div>
                <h3 className="text-xl font-black mb-2">Select a Payment Method</h3>
                <p className="text-zinc-500 font-medium max-w-xs text-sm">
                  Please choose your preferred payment method from the list to view the transfer details.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-none -mr-16 -mt-16"></div>
                
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Transfer Details
                </h2>

                <div className="space-y-6 relative z-10">
                  <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-400">Account Holder</p>
                      <p className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">{selectedMethod.holderName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-zinc-400">
                        {selectedMethod.type === "bank" ? "Account Number" : "Phone Number"}
                      </p>

                      <div className="flex items-center justify-between bg-white dark:bg-black p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 group/copy relative">
                        <p className="text-xl font-mono font-black text-emerald-600 tracking-wider">
                          {selectedMethod.type === "bank" ? selectedMethod.accountNumber : selectedMethod.phoneNumber}
                        </p>
                        <button
                          onClick={() =>
                            handleCopy(
                              selectedMethod.type === "bank"
                                ? selectedMethod.accountNumber ?? ""
                                : selectedMethod.phoneNumber ?? ""
                            )
                          }
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-emerald-500"
                          title="Copy to clipboard"
                        >
                          {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-black text-zinc-400">Step 2: Upload Screenshot</h3>


                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        previewUrl ? "border-emerald-500 bg-emerald-500/5" : "border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30"
                      }`}
                    >
                      {previewUrl ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-xl border border-emerald-500/20">
                          <Image src={previewUrl} alt="Screenshot Proof" fill className="object-cover" />
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-zinc-400" />
                          </div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Upload Payment Screenshot</p>
                          <p className="text-xs text-zinc-500 font-medium px-4">Take a screenshot of your transfer confirmation and upload it here.</p>
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                    </div>

                    <button
                      disabled={!logoId || isSubmitting || isUploading}
                      onClick={handleConfirmPayment}
                      className="w-full h-18 py-5 rounded-xl bg-emerald-600 text-white font-black text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 group"
                    >

                      {isSubmitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <span>Verify & Generate Certificate</span>
                          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
