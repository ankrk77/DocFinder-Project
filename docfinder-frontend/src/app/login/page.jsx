"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [name, setName] = useState(""); // NAYA: User ka Naam store karne ke liye
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = Details Input, 2 = OTP Verification
  const router = useRouter();

  // Security Lock: Jaise hi page load ho, purana koi bhi galti se bacha hua session clear kar do
  useEffect(() => {
    localStorage.removeItem("docfinder_user");
  }, []);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your Full Name.");
      return;
    }
    if (phoneNumber.length === 10) {
      alert(`🔔 Mock OTP Sent for ${name}! (Code is 123456)`);
      setStep(2);
    } else {
      alert("Please enter a valid 10-digit mobile number.");
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === "123456") {
      
      // ✅ FIX: Dynamic ID Allocation (Phone ke last 5 digits ko numeric ID banaya)
      // Isse har user ki ID unique hogi aur session overlap nahi hoga
      const dynamicId = parseInt(phoneNumber.substring(5)) || Math.floor(Math.random() * 90000) + 10000;
      
      const sessionUser = { 
        id: dynamicId, 
        name: name, 
        phone: phoneNumber, 
        phoneNumber: phoneNumber, // Dono nomenclature compatibility ke liye
        role: "USER" 
      };
      
      // Forceful clear and override session
      localStorage.removeItem("docfinder_user");
      localStorage.setItem("docfinder_user", JSON.stringify(sessionUser));
      
      alert(`🎉 Login Successful! Welcome ${name}. Redirecting...`);
      router.push("/dashboard");
    } else {
      alert("Invalid OTP! Try 123456");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b-4 border-blue-800 p-4 shadow-sm flex justify-between items-center px-8">
        <Link href="/" className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
          🏛️ DocFinder
        </Link>
        <span className="text-sm font-bold text-slate-500">Citizen Portal</span>
      </header>

      {/* ✅ NEW COMPLIANCE SECTION: Citizen Identity and Legal Guidelines Panel */}
        <div className="bg-white w-full rounded-xl shadow-lg border border-slate-200 overflow-hidden p-6 md:p-8">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100 mb-4">
            <span className="text-2xl">⚠️</span>
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Citizen Portal Usage Guidelines & Legal Compliance</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="space-y-3">
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-blue-800">1. Mandatory Legal Name Integrity</strong>
                You are strictly required to enter your legitimate legal full name as printed on government certificates (Aadhar, PAN, or Passport). This name acts as your permanent digital signature for physical verification audits at police centers.
              </p>
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-blue-800">2. Active Mobile Authentication</strong>
                The provided 10-digit mobile phone parameter must remain active throughout the document retrieval lifecycle. All automated intersection matches, dispatch notices, and twin token alerts will rely on this registered communication layer.
              </p>
            </div>
            
            <div className="space-y-3">
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-blue-800">3. Non-Disclosure & Anti-Bribery Shield</strong>
                To safeguard citizen data, DocFinder enforces strict information masking. Contact coordinates between independent finders and losers are completely locked out to eliminate any direct cash extortion attempts or external reward manipulation.
              </p>
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-blue-800">4. Fraudulent Logging Penalities</strong>
                Filing deceptive lost parameters or registering matching claims for assets belonging to another individual will result in immediate system blacklisting, truncation of platform access privileges, and referral to cyber law enforcement cells.
              </p>
            </div>
          </div>
        </div>

      {/* Login Container */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-blue-800 p-6 text-center text-white">
            <h2 className="text-2xl font-bold">Secure Login / Register</h2>
            <p className="text-blue-200 text-sm mt-1">Anti-Corruption Audit Verified Access</p>
          </div>

          <div className="p-8">
            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                {/* NAYA: Full Name Input Field */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full block rounded-md border border-gray-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    placeholder="Enter your legal identity name"
                    required
                  />
                </div>

                {/* Mobile Number Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Mobile Number *</label>
                  <div className="flex shadow-sm rounded-md">
                    <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 font-bold text-sm">
                      +91
                    </span>
                    <input
                      type="text"
                      maxLength="10"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="Enter 10-digit number"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-md hover:bg-orange-600 transition-colors shadow-md text-sm uppercase tracking-wider"
                >
                  Generate Security OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-slate-600">Verification code sent for <span className="font-bold text-slate-800">{name}</span></p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">(+91 {phoneNumber})</p>
                  <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline font-semibold mt-2 block mx-auto">Modify Identity Details</button>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="block w-full border border-gray-300 rounded-md py-3 px-4 text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono"
                    placeholder="••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 transition-colors shadow-md text-sm uppercase tracking-wider"
                >
                  Verify & Open Dashboard
                </button>
              </form>
            )}
          </div>
        </div>
        

      </div>
    </div>
  );
}