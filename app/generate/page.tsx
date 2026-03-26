"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle, 
  Loader2, 
  User, 
  Phone, 
  Mail, 
  School, 
  GraduationCap, 
  Award, 
  BookOpen 
} from "lucide-react";
import { checkDuplicatePhone } from "./actions";


type EducationStatus = 
  | "" 
  | "University Student" 
  | "Graduate" 
  | "College Student" 
  | "High School Student" 
  | "Not a Student";

export default function GeneratePage() {
  const router = useRouter();
  const [status, setStatus] = useState<EducationStatus>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [phoneError, setPhoneError] = useState<string | null>(null);


  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as EducationStatus);
    setFormData({}); // Reset form data when status changes
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "phone") setPhoneError(null);
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setIsSubmitting(true);
    
    try {
      const phone = formData.phone;
      if (!phone) {
        setPhoneError("Please enter your phone number.");
        setIsSubmitting(false);
        return;
      }

      // Check for duplicate phone number
      const isDuplicate = await checkDuplicatePhone(phone);
      if (isDuplicate) {
        setPhoneError("This phone number has already been used. Please use your own unique phone number.");
        setIsSubmitting(false);
        return;
      }

      // Store form data in sessionStorage


      const applicationData = {
        ...formData,
        educationStatus: status,
      };
      sessionStorage.setItem("pendingApplication", JSON.stringify(applicationData));

      // Redirect to payment page
      router.push("/generate/pay");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 p-4 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold tracking-tight text-sm">Back to Home</span>
        </Link>

        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 px-2">
            Certificate <span className="text-emerald-500">Generation</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-xl mx-auto md:mx-0">
            Complete the form below to generate your official 5M certificate.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-2xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 relative z-10">
            {/* Education Status Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-zinc-500 dark:text-zinc-400">
                Education Status
              </label>
              <div className="relative group">
                <select
                  required
                  value={status}
                  onChange={handleStatusChange}
                  className="w-full h-14 md:h-16 px-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 appearance-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold text-base md:text-lg cursor-pointer"
                >
                  <option value="" disabled>Select your status...</option>
                  <option value="University Student">University Student</option>
                  <option value="Graduate">Graduate (Finished University)</option>
                  <option value="College Student">College Student</option>
                  <option value="High School Student">High School Student</option>
                  <option value="Not a Student">Not a Student</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-emerald-500 transition-colors">
                  <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </div>

            {/* Dynamic Fields Section */}
            {status && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                {/* Common Fields: Full Name & Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 ml-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Enter your full name"
                      onChange={handleInputChange}
                      className="w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 ml-1">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="09... or 07..."
                      pattern="^(09|07)\d{8}$"
                      title="Phone number must start with 09 or 07 and be 10 digits long"
                      minLength={10}
                      maxLength={10}
                      onChange={handleInputChange}
                      className={`w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base ${
                        phoneError ? "border-red-500 bg-red-50/50 dark:bg-red-500/5 shadow-lg shadow-red-500/5" : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    />
                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 transition-colors ${phoneError ? "text-red-500" : "text-zinc-400"}`} />
                  </div>
                  {phoneError && (
                    <p className="text-[10px] font-black text-red-500 ml-1 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-300 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-red-500" />
                      {phoneError}
                    </p>
                  )}
                </div>


                {/* Status Specific Fields */}
                {status === "Not a Student" && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-400 ml-1">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="your@email.com"
                        onChange={handleInputChange}
                        className="w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base"
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
                    </div>
                  </div>
                )}

                {status === "High School Student" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 ml-1">School Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="schoolName"
                          required
                          placeholder="School name"
                          onChange={handleInputChange}
                          className="w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base"
                        />
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 ml-1">Grade / Level</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="grade"
                          required
                          placeholder="Grade 9, 10, etc."
                          onChange={handleInputChange}
                          className="w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base"
                        />
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
                      </div>
                    </div>
                  </>
                )}

                {status === "College Student" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 ml-1">College Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="collegeName"
                          required
                          placeholder="College name"
                          onChange={handleInputChange}
                          className="w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base"
                        />
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 ml-1">Department / Field</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="department"
                          required
                          placeholder="Department"
                          onChange={handleInputChange}
                          className="w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base"
                        />
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
                      </div>
                    </div>
                  </>
                )}

                {status === "University Student" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 ml-1">University Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="universityName"
                          required
                          placeholder="University name"
                          onChange={handleInputChange}
                          className="w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base"
                        />
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 ml-1">Department</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="department"
                          required
                          placeholder="Department"
                          onChange={handleInputChange}
                          className="w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base"
                        />
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
                      </div>
                    </div>
                  </>
                )}

                {status === "Graduate" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 ml-1">University Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="universityName"
                          required
                          placeholder="University name"
                          onChange={handleInputChange}
                          className="w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base"
                        />
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 ml-1">Degree</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="degree"
                          required
                          placeholder="BSc, MSc, etc."
                          onChange={handleInputChange}
                          className="w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base"
                        />
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-400 ml-1">Field of Study</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="fieldOfStudy"
                          required
                          placeholder="Your major"
                          onChange={handleInputChange}
                          className="w-full h-12 md:h-14 px-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 outline-none transition-all font-medium text-sm md:text-base"
                        />
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-400" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 md:pt-6">
              <button
                type="submit"
                disabled={!status || isSubmitting}
                className="w-full h-16 md:h-18 rounded-[1.5rem] bg-emerald-600 text-white font-bold text-lg md:text-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 group"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>Apply for Certificate</span>
                    <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>


      </div>
    </div>
  );
}
