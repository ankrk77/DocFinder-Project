"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CitizenDashboard() {
  const [user, setUser] = useState(null);
  const [myActions, setMyActions] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  
  // ✅ MODALS STATES
  const [certDoc, setCertDoc] = useState(null);
  const [complaintDoc, setComplaintDoc] = useState(null);
  const [complaintText, setComplaintText] = useState("");
  const [feedbackDoc, setFeedbackDoc] = useState(null);
  const [feedbackType, setFeedbackType] = useState(""); // HANDOVER ya CLOSURE
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");

  const router = useRouter();

  const fetchUserRecords = async (currentUser) => {
    try {
      const response = await fetch("http://localhost:8080/api/documents/admin/all");
      if (response.ok) {
        const allDocs = await response.json();
        
        // ✅ MASTER DSA FIX: Matching by Phone Number instead of volatile Database IDs
        const filtered = allDocs.filter(doc => {
          if (!doc.reportedBy) return false;
          
          const dbPhone = String(doc.reportedBy.phoneNumber || doc.reportedBy.phone || "").trim();
          const localPhone = String(currentUser.phone || currentUser.phoneNumber || "").trim();
          
          return dbPhone === localPhone || String(doc.reportedBy.id) === String(currentUser.id);
        });
        
        setMyActions(filtered);
      }
    } catch (error) {
      console.error("Error fetching user actions:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("docfinder_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserRecords(parsedUser);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleCitizenSignOff = async (docId, roleType, message) => {
    const confirmAction = window.confirm(message);
    if (!confirmAction) return;

    try {
      const response = await fetch(`http://localhost:8080/api/documents/confirm?documentId=${docId}&roleType=${roleType}`, {
        method: "POST"
      });
      if (response.ok) {
        alert("Success! Status updated in the system registry.");
        fetchUserRecords(user);
      } else {
        alert("Action failed. Please check backend connections.");
      }
    } catch (error) {
      console.error("Sign-off Error:", error);
    }
  };

  // ✅ HANDLERS FOR NEW FEATURES
  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    if (!complaintText.trim()) return;
    alert("Complaint recorded! Filed securely to Higher Vigilance Department and SP Office for strict review.");
    setComplaintDoc(null);
    setComplaintText("");
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! Your feedback has been saved in National Digital India database.");
    setFeedbackDoc(null);
    setFeedbackComment("");
    setRating(5);
  };

  if (!user) return <div className="p-10 text-center font-bold">Loading Secure Portal...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* 🏆 PREMIUM GOVERNMENT CERTIFICATE MODAL */}
      {certDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-sm p-4 print:p-0 print:bg-white print:block">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page { size: A4 portrait; margin: 0mm; }
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
          `}} />
          <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 print:p-0">
            <div className="flex justify-end gap-3 w-full max-w-5xl mb-4 print:hidden">
              <button onClick={() => window.print()} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-black shadow-lg hover:bg-blue-700 text-xs uppercase tracking-widest border border-blue-400">🖨️ Print / Save PDF</button>
              <button onClick={() => setCertDoc(null)} className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-black shadow-lg hover:bg-red-700 text-xs uppercase border border-red-400">❌ Close</button>
            </div>
            <div className="bg-[#fffdf7] w-full max-w-5xl relative border-[16px] border-double border-[#b8860b] p-2 md:p-3 shadow-2xl rounded-sm print:border-[12px] print:shadow-none print:transform print:scale-[0.95] print:origin-top">
              <div className="border-4 border-[#daa520] p-8 md:p-14 text-center relative overflow-hidden bg-white/90 shadow-inner print:p-10">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/800px-Emblem_of_India.svg.png" alt="Emblem Watermark" className="w-[300px] h-auto" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="text-center w-32 flex flex-col items-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/0a/Emblem_of_India_%28Government_Gazette%29.svg" alt="Gov Logo" className="h-16 w-auto mb-2" />
                      <p className="text-[10px] font-black text-slate-800 uppercase font-serif">Satyameva Jayate</p>
                    </div>
                    <div className="flex-1 px-4 text-center">
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-[0.15em] font-serif mb-1">भारत सरकार</h1>
                      <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-[0.15em] font-serif mb-2">Government of India</h1>
                      <p className="text-xs md:text-sm font-bold text-red-800 uppercase tracking-widest border-b-2 border-[#b8860b]/30 pb-3 inline-block px-8">National Law Enforcement & Digital India Initiative</p>
                    </div>
                    <div className="text-center w-32 flex flex-col items-center">
                      <img src="https://img.magnific.com/free-vector/police-badge-isolated_1284-42802.jpg" alt="Police Logo" className="h-16 w-auto mb-2" />
                      <p className="text-[10px] font-black text-slate-800 uppercase font-serif">Central Police Service</p>
                    </div>
                  </div>
                  <div className="my-10 border-t border-b border-yellow-600/20 py-6 bg-yellow-50/20 shadow-inner">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-700 uppercase tracking-[0.3em] mb-2 font-serif">नागरिक सम्मान प्रमाण पत्र</h2>
                    <h3 className="text-4xl md:text-5xl font-extrabold text-[#b8860b] font-serif italic">Certificate of Good Citizenship</h3>
                  </div>
                  <p className="text-sm md:text-base text-slate-600 font-semibold uppercase tracking-widest mb-4">This honor is proudly awarded to citizen</p>
                  <div className="flex justify-center mb-8">
                    <p className="text-3xl md:text-5xl font-black text-slate-900 border-b-2 border-slate-400 px-12 pb-2 font-serif uppercase">
                      {certDoc.reportedBy?.name || user.name}
                    </p>
                  </div>
                  <p className="max-w-3xl mx-auto text-slate-800 leading-relaxed font-serif text-lg md:text-xl mb-12">
                    In profound appreciation of your exemplary civic duty, unwavering honesty, and moral integrity. Your vigilant action in recovering and safely handing over a lost <strong className="border-b border-slate-400 text-black px-1 mx-1">{certDoc.documentType}</strong> to the official authorities has upheld the noble spirit of a responsible citizen of India.
                  </p>
                  <div className="flex flex-col md:flex-row justify-between items-end mt-12 px-4 md:px-8 gap-6 md:gap-0">
                    <div className="flex flex-col items-center order-3 md:order-1">
                      <div className="p-1 border-2 border-slate-300 bg-white mb-2 shadow-sm">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VERIFY:IND-HONOR-2026-${certDoc.id}`} alt="QR" className="w-20 h-20" />
                      </div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Scan to Verify</p>
                    </div>
                    <div className="text-center order-1 md:order-2">
                      <div className="w-48 border-b-2 border-slate-800 mb-2 font-black text-blue-900 text-lg font-serif">Digitally Verified</div>
                      <p className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">DocFinder National Authority</p>
                    </div>
                    <div className="text-center order-2 md:order-3">
                      <div className="w-48 border-b-2 border-slate-800 mb-2"><span className="font-serif italic text-2xl text-slate-800">Auth. Officer</span></div>
                      <p className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Station Desk In-Charge</p>
                    </div>
                  </div>
                  <div className="mt-12 bg-slate-100 p-3 flex flex-col md:flex-row justify-between items-center border-t border-b border-slate-300 gap-2 md:gap-0 print:mt-8">
                    <p className="text-[10px] md:text-[11px] font-extrabold text-slate-600 uppercase tracking-widest">Date of Issue: {new Date().toLocaleDateString('en-IN')}</p>
                    <p className="text-[10px] md:text-[11px] font-extrabold text-slate-600 uppercase tracking-widest">Certificate No: <span className="text-red-700 font-mono text-xs ml-1 font-black bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">IND-HONOR-26-{certDoc.id}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚨 ALERT / COMPLAINT MODAL POPUP */}
      {complaintDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border-t-8 border-red-600 w-full max-w-md overflow-hidden animate-zoom-in">
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <span className="text-3xl">🚨</span>
                <h3 className="text-lg font-black uppercase tracking-wide">File Official Police Complaint</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">This complaint will bypass the local station and submit directly to the Higher Vigilance Commission and SP Headquarters Office.</p>
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Describe your issue / misbehavior *</label>
                  <textarea required rows={4} value={complaintText} onChange={(e) => setComplaintText(e.target.value)} placeholder="Enter details regarding harassment, delays, or bribery requests..." className="w-full border border-slate-200 bg-slate-50 rounded-lg p-3 text-xs text-slate-700 focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setComplaintDoc(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all">Cancel</button>
                  <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md">Submit Complaint</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 📝 FEEDBACK MODAL POPUP */}
      {feedbackDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border-t-8 border-green-600 w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 text-green-700 mb-2">
                <span className="text-3xl">📝</span>
                <h3 className="text-lg font-black uppercase tracking-wide">
                  {feedbackType === "HANDOVER" ? "Handover Experience Feedback" : "Final Case Settlement Feedback"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">Help us monitor and improve national public desk cooperation scoring parameters.</p>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Service Experience Rating</label>
                  <div className="flex gap-2 justify-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button key={num} type="button" onClick={() => setRating(num)} className={`text-2xl transition-transform active:scale-90 ${num <= rating ? 'scale-110' : 'opacity-30 grayscale'}`}>⭐</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Additional Comments (Optional)</label>
                  <textarea rows={3} value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder="Share your experience regarding the station desk officer interaction behavior..." className="w-full border border-slate-200 bg-slate-50 rounded-lg p-3 text-xs text-slate-700 focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFeedbackDoc(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all">Cancel</button>
                  <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-black py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-md">Submit Feedback</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-[#2c3e50] text-white p-4 shadow-md flex justify-between items-center px-8 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-white text-[#2c3e50] p-2 rounded-full font-bold">👤</div>
          <div>
            <h1 className="text-xl font-bold">Citizen Command Dashboard</h1>
            <p className="text-xs text-slate-300">Welcome, {user.name} | Mobile: +91 {user.phone || user.phoneNumber}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem("docfinder_user");
            router.push("/");
          }}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold transition-colors shadow"
        >
          LOGOUT
        </button>
      </header>

      <div className="max-w-6xl mx-auto p-6 mt-6 print:hidden">
        
        <h2 className="text-xl font-extrabold text-slate-700 mb-4 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link href="/search" className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 group border border-slate-200 hover:border-blue-400 hover:scale-[1.01]">
            <div className="text-4xl group-hover:scale-110 transition-transform">🔍</div>
            <h3 className="text-md font-bold text-slate-800 group-hover:text-blue-700">Global Search Engine</h3>
            <p className="text-xs text-slate-500">Search database using unique Document ID or Roll number.</p>
          </Link>

          <Link href="/report?role=founder" className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-orange-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 group border border-slate-200 hover:border-orange-400 hover:scale-[1.01]">
            <div className="text-4xl group-hover:scale-110 transition-transform">🤝</div>
            <h3 className="text-md font-bold text-slate-800 group-hover:text-orange-700">I Found a Document</h3>
            <p className="text-xs text-slate-500">Scan via AI and report an item you discovered to help others.</p>
          </Link>

          <Link href="/report?role=reporter" className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-slate-800 hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 group border border-slate-200 hover:border-slate-600 hover:scale-[1.01]">
            <div className="text-4xl group-hover:scale-110 transition-transform">📝</div>
            <h3 className="text-md font-bold text-slate-800 group-hover:text-slate-900">I Lost a Document</h3>
            <p className="text-xs text-slate-500">Register your missing credentials to get real-time match alerts.</p>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-extrabold text-slate-700 mb-4 uppercase tracking-wider">Your Active Verification Lifecycles</h2>
          
          {loadingDocs ? (
            <p className="text-slate-400 italic text-sm">Loading security registries...</p>
          ) : myActions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-3xl">📁</p>
              <p className="text-xs font-medium mt-1">You haven't reported any lost or found documents yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myActions.map((doc) => (
                <div key={doc.id} className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition-colors">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${doc.status === 'FOUND' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        Type: {doc.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-purple-100 text-purple-700`}>
                        Location: {doc.custodyStatus ? doc.custodyStatus.replace(/_/g, ' ') : 'WITH FINDER'}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-slate-800">{doc.documentType}</h4>
                    <p className="font-mono text-xs text-slate-500 mt-0.5">ID: {doc.documentIdNumber}</p>
                    
                    <p className="text-xs font-bold text-slate-600 mt-1 border-t pt-1 border-slate-200/60">
                      Workflow State: <span className="text-indigo-600 font-extrabold">{doc.finalStatus ? doc.finalStatus.replace(/_/g, ' ') : 'PENDING MATCH'}</span>
                    </p>

                    {/* ✅ COMPLAINT BUTTON (Visible on all incomplete/active tracking lifecycles) */}
                    {doc.finalStatus !== "COMPLETED" && (
                      <button type="button" onClick={() => setComplaintDoc(doc)} className="mt-3 text-[10px] font-black tracking-wider text-red-600 hover:text-red-700 flex items-center gap-1 uppercase border border-red-200 hover:border-red-300 bg-red-50/50 px-2 py-1 rounded transition-colors">
                        🚨 File Police Complaint / Misbehavior
                      </button>
                    )}
                  </div>

                  <div className="w-full md:w-auto text-right flex flex-col items-end gap-2">
                    {/* Finder signs off physical document handover to Police */}
                    {doc.status === "FOUND" && !doc.finderHandedOverToPolice && (
                      <button
                        onClick={() => handleCitizenSignOff(doc.id, "FINDER", "Confirm that you are physically handing over this asset to the Police station?")}
                        className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-wide shadow transition-all border border-orange-400"
                      >
                        📤 I handed over to Police
                      </button>
                    )}

                    {/* ✅ MILESTONE 1 FEEDBACK: Activated after finder clicks handover to police */}
                    {doc.status === "FOUND" && doc.finderHandedOverToPolice && !doc.policeAcceptedFromFinder && (
                      <div className="flex flex-col items-end gap-2">
                        <span className="inline-block bg-yellow-100 border border-yellow-200 text-yellow-800 text-xs font-black px-3 py-1.5 rounded-lg animate-pulse">
                          ⏳ Awaiting Police Acceptance Receipt
                        </span>
                        <button type="button" onClick={() => { setFeedbackDoc(doc); setFeedbackType("HANDOVER"); }} className="text-[10px] bg-slate-800 hover:bg-slate-900 text-white font-bold px-2 py-1 rounded uppercase tracking-wide">
                          📝 Rate Handover Experience
                        </button>
                      </div>
                    )}

                    {/* Loser confirms secure delivery from Police */}
                    {doc.status === "LOST" && doc.policeHandedOverToLoser && !doc.loserReceivedConfirmed && (
                      <button
                        onClick={() => handleCitizenSignOff(doc.id, "LOSER", "Verify that you have safely received your physical original document back from the Police?")}
                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-black py-2.5 px-4 rounded-lg text-xs uppercase tracking-widest shadow transition-all border border-green-400"
                      >
                        ✅ Confirm: I Received It Safely
                      </button>
                    )}

                    {doc.status === "LOST" && !doc.policeHandedOverToLoser && doc.finalStatus !== "PENDING_MATCH" && (
                      <span className="inline-block bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-lg">
                        ⏳ Processing via Police Station
                      </span>
                    )}

                    {/* ✅ MILESTONE 2 FEEDBACK: Activated on final case completion */}
                    {doc.finalStatus === "COMPLETED" && (
                      <>
                        <span className="inline-block bg-green-100 text-green-800 font-extrabold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider border border-green-200 mb-1">
                          🔒 Process Closed Immutable
                        </span>
                        
                        <div className="flex flex-col md:flex-row gap-2 mt-1">
                          <button type="button" onClick={() => { setFeedbackDoc(doc); setFeedbackType("CLOSURE"); }} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-wide border border-slate-700">
                            📝 Case Feedback
                          </button>
                          
                          {doc.status === "FOUND" && (
                            <button
                              onClick={() => setCertDoc(doc)}
                              className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-black py-2.5 px-5 rounded-lg text-xs uppercase tracking-widest shadow-xl transition-all border border-yellow-700 animate-pulse hover:animate-none hover:scale-105"
                            >
                              🏆 View Gov Certificate
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {(doc.finalStatus === "PENDING_MATCH" || !doc.finalStatus) && (
                      <span className="inline-block bg-slate-100 border border-slate-200 text-slate-400 text-xs font-medium px-3 py-1.5 rounded-lg shadow-inner">
                        🔍 Scanning for Database Matches...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COMPLIANCE SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 hover:shadow-lg transition-all">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100 mb-4">
            <span className="text-2xl">📋</span>
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Dashboard Lifecycle Validation Manual</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
            <div className="space-y-3 p-3 bg-orange-50 rounded-lg border border-orange-100 shadow-inner">
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-orange-700">For Document Finders:Handover Steps</strong>
                When you hand over the discovered asset to a desk official, you must tap <span className="font-bold text-orange-600">"I handed over to Police"</span>. This switches your tracking log to "In Transit" and legally flags the station node to confirm receipt of the physical asset.
              </p>
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-orange-700">Citizen Honor Protocol (Rewards)</strong>
                Once the original owner successfully claims the document from the station, your tracking status will update to "COMPLETED". As an official token of gratitude from the Government, an authenticated <span className="font-bold text-amber-600">Certificate of Good Citizenship</span> will be automatically generated and unlocked for you to download and print.
              </p>
            </div>
            
            <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-100 shadow-inner">
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-blue-700">For Document Losers:Recovery Steps</strong>
                If your document status transitions to a verified match, wait until the location tracker updates to "In Police Station". Proceed to that designated station with secondary verification items to substantiate your identity at the desk.
              </p>
              <p>
                <strong className="text-slate-800 block uppercase tracking-wide text-[10px] text-blue-700">Final Safe Delivery Acknowledgment</strong>
                Once the official physically delivers your credential back to you at the counter, immediately press the <span className="font-bold text-green-700">"Confirm: I Received It Safely"</span> button. This permanently logs a successful audit signature and closes the active file case.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}