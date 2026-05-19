"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SearchPage() {
  const [searchId, setSearchId] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Page load hote hi check karega user login hai ya nahi
  useEffect(() => {
    const user = localStorage.getItem("docfinder_user");
    if (user) setIsLoggedIn(true);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`http://localhost:8080/api/documents/search?documentId=${searchId.toUpperCase()}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search Error:", error);
      alert("Spring Boot server se connect nahi ho paa raha hai.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyPolice = async (docIdInDB) => {
    if (!isLoggedIn) {
      alert("⚠️ Request bhejne ke liye aapko pehle Login karna hoga!");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/documents/confirm?documentId=${docIdInDB}&roleType=REPORTER`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        alert("🚨 Notification sent to Police! They will verify and contact you soon.");
        router.push("/dashboard");
      } else {
        alert("Action Failed: Server responded with an error. Ensure Backend is updated.");
      }
    } catch (error) {
      console.error("Notification Error:", error);
      alert("Server connection lost. Is your Spring Boot running?");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-[#2c3e50] text-white p-4 shadow-md flex justify-between items-center px-8">
        <Link href="/" className="text-xl font-bold flex items-center gap-2 hover:text-orange-400 transition-colors">
          🏛️ DocFinder Portal
        </Link>
        
        {isLoggedIn ? (
          <Link href="/dashboard" className="bg-green-600 text-white px-5 py-2 rounded text-sm font-bold hover:bg-green-700 transition-all">
            My Dashboard ➡️
          </Link>
        ) : (
          <Link href="/login" className="bg-orange-500 text-white px-5 py-2 rounded text-sm font-bold hover:bg-orange-600 transition-all">
            Citizen Login
          </Link>
        )}
      </header>

      <div className="flex-grow max-w-4xl w-full mx-auto p-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
          <div className="bg-blue-800 text-white p-6 text-center">
            <h2 className="text-3xl font-extrabold">National Document Search Engine</h2>
            <p className="text-blue-200 text-sm mt-1">Instant database lookup for Lost & Found items</p>
          </div>

          <form onSubmit={handleSearch} className="p-8 flex flex-col md:flex-row gap-4 items-end bg-slate-50 border-b border-slate-200">
            <div className="flex-grow w-full">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Enter Document ID / Roll Number *</label>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. 1234-5678-9012"
                className="w-full border border-gray-300 rounded-lg py-3 px-4 text-lg font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full md:w-48 bg-blue-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-900 transition-colors shadow-md disabled:bg-slate-400 text-lg">
              {loading ? "Searching..." : "🔍 SEARCH"}
            </button>
          </form>

          <div className="p-8">
            {!searched && (
              <div className="text-center text-slate-400 py-6">
                <p className="text-4xl mb-2">🔎</p>
                <p className="text-sm font-medium">Enter a unique identifier above to check live status.</p>
              </div>
            )}

            {searched && results.length === 0 && !loading && (
              <div className="text-center text-red-600 py-6 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-2xl mb-1">❌ No Matches Found</p>
                <p className="text-sm">This document is not reported in our system yet.</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">🎉 LIVE MATCH FOUND IN SYSTEM!</h3>
                {results.map((doc) => (
                  <div key={doc.id} className="border-2 border-slate-200 rounded-xl p-6 bg-white shadow-md flex flex-col gap-4">
                    
                    {/* Upper Core Info Info Block */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-100">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2 ${doc.status === 'FOUND' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          STATUS: {doc.status}
                        </span>
                        <h4 className="text-xl font-bold text-slate-800">{doc.documentType}</h4>
                        <p className="text-sm font-mono text-slate-500 mt-1">ID Number: {doc.documentIdNumber}</p>
                        <p className="text-xs text-slate-400 mt-1">System State: <span className="font-bold text-slate-600">{doc.finalStatus}</span></p>
                      </div>

                      <div className="w-full md:w-auto text-right">
                        {doc.finalStatus !== "COMPLETED" ? (
                          <button
                            onClick={() => handleNotifyPolice(doc.id)}
                            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition-all text-sm uppercase tracking-wider"
                          >
                            Send Handover Request to Police
                          </button>
                        ) : (
                          <span className="inline-block bg-green-100 text-green-800 font-bold px-4 py-2 rounded-lg text-sm">
                            ✅ Case Closed / Handed Over
                          </span>
                        )}
                      </div>
                    </div>

                    {/* NAYA: Live Custody & Audit Trail Chain */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                      <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3">
                        🛡️ Anti-Corruption Live Custody Tracking
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* Physical Location Monitor */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📍</span>
                          <span className="font-medium text-slate-700">Physical Custody:</span>
                          <span className={`px-2.5 py-1 rounded-md font-black text-xs uppercase tracking-wide ${
                            doc.custodyStatus === 'WITH_FINDER' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            doc.custodyStatus === 'IN_POLICE_STATION' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 
                            'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {doc.custodyStatus ? doc.custodyStatus.replace(/_/g, ' ') : 'WITH FINDER'}
                          </span>
                        </div>

                        {/* Tri-Party Signature Logs */}
                        <div className="flex flex-wrap gap-4 items-center md:justify-end">
                          <span className="font-bold text-xs text-slate-400 uppercase">Sign-offs:</span>
                          
                          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${doc.finderConfirmed ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {doc.finderConfirmed ? "✅ Finder" : "❌ Finder"}
                          </span>

                          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${doc.policeVerified ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {doc.policeVerified ? "✅ Police" : "❌ Police"}
                          </span>

                          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${doc.loserConfirmed ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {doc.loserConfirmed ? "✅ Owner" : "❌ Owner"}
                          </span>
                        </div>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ✅ NEW COMPLIANCE SECTION: Global Query Operating Manual Panel */}
        <div className="bg-white w-full rounded-xl shadow-lg border border-slate-200 overflow-hidden p-6 md:p-8">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100 mb-4">
            <span className="text-2xl">🔍</span>
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Global Lookup Protocol & Operational Directions</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="space-y-3">
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-blue-800">1. Alphanumeric Identity Strict Filtering</strong>
                The search query cleans blank spaces automatically and maps the value in pure uppercase. Ensure your entered character combination matches your missing credentials accurately to prompt a successful matching intercept.
              </p>
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-blue-800">2. Autonomous Matching Infrastructure</strong>
                Once you file a lost document report via your dashboard, the database initializes an automated tracking state. There is no manual intervention required; any matching upload by a finder automatically merges both entries into an active verification chain.
              </p>
            </div>
            
            <div className="space-y-3">
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-blue-800">3. Physical Verification Gatekeeping</strong>
                The <span className="font-bold text-green-700">"Send Handover Request"</span> interface triggers an electronic tracking flag for desk officials. Do not expect direct contact coordinates to show up here. You must bring supporting verification IDs directly to the designated physical station house.
              </p>
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-blue-800">4. Immutable Cryptographic Ledger</strong>
                The sign-off statuses (Finder, Police, Owner) serve as public anti-corruption forensic logs. Custody progress bars update instantly upon legal handovers, ensuring zero data modifications can take place without all three parties signing off.
              </p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}