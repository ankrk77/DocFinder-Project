"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ReportForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // States
  const [role, setRole] = useState("founder"); // founder ya reporter
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    docType: "",
    documentId: "",
    certNo: "",
  });

  // URL se Role uthana
  useEffect(() => {
    const urlRole = searchParams.get("role");
    if (urlRole === "reporter" || urlRole === "founder") {
      setRole(urlRole);
    }
  }, [searchParams]);

  // File Handle karna
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // STEP 1: AI Data Extraction
  const handleExtractData = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select an image file first.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/api/documents/extract", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.doc_type === "ERROR" || result.document_id === "NOT_FOUND") {
          alert("AI could not read the image. Please fill the form manually.");
          return;
        }

        setFormData({
          docType: result.doc_type && result.doc_type !== "NOT_FOUND" ? result.doc_type : "",
          documentId: result.document_id && result.document_id !== "NOT_FOUND" ? result.document_id.replaceAll("\\s+", "").toUpperCase() : "",
          certNo: result.cert_no && result.cert_no !== "NOT_FOUND" ? result.cert_no : "",
        });
        alert("Success! Details filled by AI.");
      } else {
        alert("AI server is busy. Please fill the details manually.");
      }
    } catch (error) {
      console.error("Extraction Error:", error);
      alert("Network error. Please fill the form manually.");
    } finally {
      setLoading(false); // ✅ THE FIX: loading(false) ko theek kar diya!
    }
  };

  // ✅ FIXED STEP 2: Real Identity Transmission to Backend
  const handleSubmitToDB = async (e) => {
    e.preventDefault();
    
    if (!formData.documentId || !formData.docType) {
      alert("Please enter Document Type and Document ID.");
      return;
    }

    if (role === "founder" && !file) {
      alert("Please upload the document image. This is mandatory for finders.");
      return;
    }

    setSubmitting(true);

    // Get real user identity from local storage
    const storedUser = JSON.parse(localStorage.getItem("docfinder_user") || "{}");
    const userId = storedUser.id || "1"; 
    
    const finalData = new FormData();
    finalData.append("userId", userId); 
    
    // 🔥 THE FIX: explicitly sending real NAME and PHONE to avoid random generated data.
    finalData.append("userName", storedUser.name || "Unknown Citizen");
    finalData.append("userPhone", storedUser.phone || storedUser.phoneNumber || "0000000000");
    
    finalData.append("status", role === "founder" ? "FOUND" : "LOST");
    
    const cleanId = formData.documentId.replace(/\s+/g, "").toUpperCase();
    finalData.append("documentId", cleanId);
    finalData.append("docType", formData.docType);
    
    if (file) {
      finalData.append("file", file);
    } else {
        const emptyBlob = new Blob([""], { type: "text/plain" });
        finalData.append("file", emptyBlob, "no_image.txt");
    }

    try {
      const response = await fetch("http://localhost:8080/api/documents/report", {
        method: "POST",
        body: finalData,
      });

      if (response.ok) {
        alert(`Success! Your ${role === "founder" ? "FOUND" : "LOST"} report has been saved.`);
        router.push("/dashboard"); 
      } else {
        const errorText = await response.text();
        alert(`Error: ${errorText || "This Document ID is already reported."}`);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Server error. Please check your internet and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-[#2c3e50] text-white p-4 shadow-md flex justify-between items-center px-8">
        <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2 hover:text-orange-400 transition-colors">
          ⬅️ Back to Dashboard
        </Link>
        <span className="text-sm font-bold text-slate-300">Official Reporting Portal</span>
      </header>

      <div className="flex-grow py-12 px-4 flex flex-col items-center gap-8">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden border-t-8 border-orange-500">
          <div className="p-8">
            <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-8">
              Document Reporting Form
            </h2>

            <div className="flex bg-slate-100 rounded-lg p-1 mb-8 shadow-inner">
              <button
                type="button"
                onClick={() => setRole("founder")}
                className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${
                  role === "founder" ? "bg-white shadow-sm text-orange-600 border border-slate-200" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                🤝 I FOUND A DOCUMENT
              </button>
              <button
                type="button"
                onClick={() => setRole("reporter")}
                className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${
                  role === "reporter" ? "bg-white shadow-sm text-blue-700 border border-slate-200" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                📝 I LOST A DOCUMENT
              </button>
            </div>

            {role === "founder" && (
              <div className="bg-orange-50 border border-orange-200 p-5 rounded-lg border-dashed mb-8">
                <label className="block text-sm font-bold text-orange-800 mb-2">Upload Document for AI Scan *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 mb-3"
                />
                <button
                  type="button"
                  onClick={handleExtractData}
                  disabled={loading || !file}
                  className="w-full bg-slate-800 text-white py-2 rounded-md font-bold hover:bg-slate-900 disabled:bg-slate-400"
                >
                  {loading ? "🤖 AI is Scanning..." : "Scan Details with AI"}
                </button>
              </div>
            )}

            {role === "reporter" && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8 text-sm text-blue-800">
                <span className="font-bold">Note:</span> Please manually enter the details of your lost document below.
              </div>
            )}

            <form onSubmit={handleSubmitToDB} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Document Type *</label>
                <input
                  type="text"
                  value={formData.docType}
                  onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. 10th Marksheet, PAN Card, College ID"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Document ID / Unique Identity No *</label>
                <input
                  type="text"
                  value={formData.documentId}
                  onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono uppercase"
                  placeholder="Unique ID Number"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Certificate No (Optional)</label>
                <input
                  type="text"
                  value={formData.certNo}
                  onChange={(e) => setFormData({ ...formData, certNo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-md hover:bg-green-700 transition-colors shadow-lg disabled:bg-slate-400 mt-6"
              >
                {submitting ? "Submitting to Secure Database..." : "Confirm & Submit Report"}
              </button>
            </form>
          </div>
        </div>

        {/* ✅ FIXED & CLEANED OPERATING protocol BOARD PANEL */}
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8">
          {role === "founder" ? (
            <div>
              <div className="flex items-center gap-2 border-b pb-3 border-slate-100 mb-4">
                <span className="text-xl">🤝</span>
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm text-orange-600">Finder's Operating Protocol & Instructions</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 list-disc list-inside leading-relaxed">
                <li><strong className="text-slate-800">AI Computer Vision Scan:</strong> Upload a clear image of the credential badge. The integrated system uses localized AI to parse metadata parameters to avoid typos.</li>
                <li><strong className="text-slate-800">Manual Override Contingency:</strong> If text recognition timeouts or struggles with ambient lighting limits, the entry framework unlocks to enable zero-barrier manual string typing.</li>
                <li><strong className="text-slate-800">Physical Deposition Order:</strong> Submitting this online ledger assigns you immediate responsibility. You must physical drop this document at the desk officer in the station within 48 hours.</li>
              </ul>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 border-b pb-3 border-slate-100 mb-4">
                <span className="text-xl">📝</span>
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm text-blue-800">Loser's Loss Registration Instructions</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 list-disc list-inside leading-relaxed">
                <li><strong className="text-slate-800">Absolute ID Match Requirement:</strong> Input the alphanumeric unique identifier exactly as issued by the governing body. Minor spacing variations are auto-sanitized by the backend algorithm.</li>
                <li><strong className="text-slate-800">Zero Document Upload Mandate:</strong> As an original owner registering a loss case, uploading an image is completely optional. Plain text tracking fields are enough to lock the sequence.</li>
                <li><strong className="text-slate-800">Automated Twin Intersection:</strong> The core algorithm continuously cross-references entries. If a matching credential identifier is uploaded by any finder, your lifecycle card instantly activates.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}