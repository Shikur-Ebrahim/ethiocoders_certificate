"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { getAllApplications, AdminApplication, verifyApplication, rejectApplication } from "./actions";
import { Loader2, Eye, CheckCircle, User, Phone, Check, Award } from "lucide-react";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      const data = await getAllApplications();
      setApplications(data);
      setIsLoading(false);
    };
    fetchApps();
  }, []);

  const handleVerify = async (id: string) => {
    if (!confirm("Are you sure you want to verify this application?")) return;
    setUpdatingId(id);
    const res = await verifyApplication(id);
    if (res.success) {
      setApplications(apps => apps.map(app => app.id === id ? { ...app, status: 'paid', certificateUrl: res.certificateUrl } : app));
    } else {
      alert(res.error || "Failed to verify application.");
    }
    setUpdatingId(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this application?")) return;
    setUpdatingId(id);
    const res = await rejectApplication(id);
    if (res.success) {
      setApplications(apps => apps.filter(app => app.id !== id));
    } else {
      alert(res.error || "Failed to delete application.");
    }
    setUpdatingId(null);
  };

  const formatDate = (ms: number) => {
    return new Date(ms).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': 
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-black uppercase tracking-widest border border-emerald-500/20">Paid</span>;
      case 'pending': 
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-black uppercase tracking-widest border border-amber-500/20">Processing</span>;
      case 'pending_payment': 
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 text-[11px] font-black uppercase tracking-widest border border-slate-700">Unpaid</span>;
      default: 
        return <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[11px] font-black uppercase tracking-widest border border-red-500/20">{status}</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 font-sans">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-12 lg:pt-0">
            <div>
              <div className="inline-flex items-center justify-center p-2.5 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20">
                <Award className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Applications</h1>
              <p className="text-slate-400 text-sm md:text-base font-medium tracking-wide">Manage and review all student certificate applications.</p>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 md:px-8 md:py-5 flex flex-col items-center justify-center backdrop-blur-sm shadow-xl self-start sm:self-auto">
                <div className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin text-blue-500" /> : applications.length}
                </div>
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 md:mt-2">Total Submissions</div>
            </div>
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {isLoading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800 rounded-[2rem] backdrop-blur-xl shadow-2xl">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                <div className="text-slate-400 font-bold tracking-wide">Loading applications...</div>
              </div>
            ) : applications.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800 rounded-[2rem] backdrop-blur-xl shadow-2xl">
                <div className="text-slate-400 font-bold tracking-wide">No applications found in the database.</div>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col hover:bg-slate-800/60 transition-all group backdrop-blur-xl shadow-xl">
                  {/* Background Blur */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                  
                  {/* Header: User Info */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700/50 group-hover:border-slate-600 transition-colors shrink-0 shadow-inner">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-slate-100 text-lg leading-tight mb-1">{app.fullName || app.FullName || 'Unknown Applicant'}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{app.phone || 'No phone provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Payment Proof Image */}
                  {app.screenshotId ? (
                    <a 
                      href={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${app.screenshotId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative w-full h-40 rounded-2xl overflow-hidden group/image mb-6 border border-slate-700/50 bg-slate-900 shadow-inner shrink-0"
                    >
                      {/* Using standard img tag with Cloudinary resizing for immediate loading without Next.js Image overhead */}
                      <img 
                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,h_400,w_600/${app.screenshotId}`}
                        alt="Payment Proof"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110 opacity-90 group-hover/image:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-black/40 text-white text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-xl flex items-center gap-2 backdrop-blur-md shadow-xl border border-white/10">
                          <Eye className="w-4 h-4" /> View Full Image
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div className="w-full h-40 rounded-2xl mb-6 border border-slate-800 border-dashed bg-slate-900/20 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] uppercase tracking-widest text-slate-600 font-black">No Image Attached</span>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-xs font-medium text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800/50">
                      <span className="uppercase tracking-wider text-[10px] font-bold">Applied</span>
                      <span>{formatDate(app.createdAt)}</span>
                    </div>
                    {app.paidAt && (
                      <div className="flex justify-between items-center text-xs font-medium text-emerald-400 bg-emerald-900/10 px-3 py-2 rounded-lg border border-emerald-500/10">
                        <span className="uppercase tracking-wider text-[10px] font-bold">Paid</span>
                        <span>{formatDate(app.paidAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto space-y-5">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</span>
                      {getStatusBadge(app.status)}
                    </div>

                    {/* Action Buttons */}
                    {app.certificateUrl || app.status === 'paid' ? (
                      <div className="pt-4 border-t border-slate-800/50">
                        {app.certificateUrl ? (
                            <a 
                                href={app.certificateUrl}
                                target="_blank" rel="noopener noreferrer"
                                className="w-full py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40"
                            >
                                <Award className="w-4 h-4" /> View Auto-Generated Certificate
                            </a>
                        ) : (
                            <div className="w-full py-3 rounded-xl text-xs font-black text-slate-500 border border-slate-800 bg-slate-900/50 flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Verified
                            </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-4 border-t border-slate-800/50">
                        <button 
                          onClick={() => handleVerify(app.id)} 
                          disabled={updatingId !== null}
                          className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 hover:border-emerald-500/40"
                        >
                           {updatingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                           VERIFY
                        </button>
                        <button 
                          onClick={() => handleReject(app.id)} 
                          disabled={updatingId !== null}
                          className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 hover:border-rose-500/40"
                        >
                           {updatingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                           REJECT / DELETE
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
