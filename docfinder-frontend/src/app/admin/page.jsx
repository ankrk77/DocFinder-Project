"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      fetchDocuments();
    }
  }, [isAuthorized]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/documents/admin/all");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.reverse());
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (inputUsername === "policeindia" && inputPassword === "Police@112") {
      setIsAuthorized(true);
    } else {
      alert("🛑 ACCESS DENIED: Invalid Command Credentials.");
    }
  };

  const handleAdminLogout = () => {
    setIsAuthorized(false);
    setInputUsername("");
    setInputPassword("");
    setDocuments([]); 
  };

  const handlePoliceAction = async (docId, actionType, message) => {
    const confirmAction = window.confirm(message);
    if (!confirmAction) return;

    try {
      const response = await fetch(`http://localhost:8080/api/documents/admin/verify?documentId=${docId}&actionType=${actionType}`, {
        method: "POST"
      });
      if (response.ok) {
        alert(`✅ ACTION SUCCESSFUL: Status updated.`);
        fetchDocuments();
      } else {
        alert("Action failed. Ensure backend server is running correctly.");
      }
    } catch (error) {
      console.error("Verification Error:", error);
    }
  };

  // ✅ DSA FIX: Grouping algorithm to merge twin reports into a single Case File row
  const groupedDocuments = Object.values(
    documents.reduce((acc, doc) => {
      const id = doc.documentIdNumber;
      if (!acc[id]) {
        acc[id] = {
          documentIdNumber: doc.documentIdNumber,
          documentType: doc.documentType,
          foundDoc: doc.status === "FOUND" ? doc : null,
          lostDoc: doc.status === "LOST" ? doc : null,
          custodyStatus: doc.custodyStatus,
          finalStatus: doc.finalStatus,
          fOut: doc.finderHandedOverToPolice,
          pIn: doc.policeAcceptedFromFinder,
          pOut: doc.policeHandedOverToLoser,
          oIn: doc.loserReceivedConfirmed,
        };
      } else {
        if (doc.status === "FOUND") acc[id].foundDoc = doc;
        if (doc.status === "LOST") acc[id].lostDoc = doc;
        acc[id].fOut = acc[id].fOut || doc.finderHandedOverToPolice;
        acc[id].pIn = acc[id].pIn || doc.policeAcceptedFromFinder;
        acc[id].pOut = acc[id].pOut || doc.policeHandedOverToLoser;
        acc[id].oIn = acc[id].oIn || doc.loserReceivedConfirmed;
        if (doc.custodyStatus && doc.custodyStatus !== "WITH_FINDER") acc[id].custodyStatus = doc.custodyStatus;
        if (doc.finalStatus && doc.finalStatus !== "PENDING_MATCH") acc[id].finalStatus = doc.finalStatus;
      }
      return acc;
    }, {})
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center font-sans p-4 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-slate-950 to-slate-950">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 animate-pulse" />
        <div className="w-full max-w-md bg-slate-900 rounded-2xl border-2 border-red-900/40 shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="bg-black p-6 text-center border-b border-slate-800">
            <div className="text-5xl mb-2">🛡️</div>
            <h2 className="text-xl font-black text-white tracking-widest uppercase">National Crime Registry</h2>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1">Authorized Police Personnel Only</p>
          </div>
          <form onSubmit={handleAdminLogin} className="p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Police Identification ID</label>
              <input type="text" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} className="w-full bg-black border border-slate-800 rounded-lg py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm font-mono tracking-wide" placeholder="Enter Terminal ID" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secure Access Password</label>
              <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className="w-full bg-black border border-slate-800 rounded-lg py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600 text-sm font-mono tracking-wide" placeholder="••••••••••••••" required />
            </div>
            <div className="pt-2">
              <button type="submit" className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-3 px-4 rounded-lg shadow-xl text-xs uppercase tracking-widest border border-red-500">🔓 Authenticate Node</button>
            </div>
          </form>
          <div className="bg-black/40 p-4 border-t border-slate-800/60 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider transition-colors">← Return to Public Network</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col text-slate-200">
      <header className="bg-black border-b-4 border-red-700 p-5 shadow-2xl flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🛡️</div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">Admin Command Center</h1>
            <p className="text-xs text-red-500 font-bold uppercase tracking-widest">Anti-Corruption Forensic Registry</p>
          </div>
        </div>
        <button onClick={handleAdminLogout} className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-400 px-5 py-2 rounded font-black transition-all text-xs tracking-widest uppercase">🔒 Lock Terminal</button>
      </header>

      <div className="flex-grow max-w-[95%] w-full mx-auto p-6 mt-4">

        {/* ✅ NEW STANDING DIRECTIVES PANEL: Vistrit protocols, process usage manual, and real-world exception handling mapping */}
        <div className="bg-slate-900 rounded-2xl border border-red-900/40 p-6 mb-6 shadow-2xl bg-gradient-to-r from-slate-900 via-red-950/5 to-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
            <span className="text-2xl animate-pulse">⚠️</span>
            <div>
              <h2 className="text-base font-black text-red-400 uppercase tracking-widest">Standard Operating Procedures & Real-World Exception Manual</h2>
              <p className="text-slate-400 text-xs mt-0.5">Strict regulatory guidelines for on-duty station desk officers maintaining tokenized chain-of-custody logs.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400 leading-relaxed">
            {/* COLUMN 1: USAGE PROCESS */}
            <div className="bg-black/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <p className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1 text-cyan-400">1. Core Operational Flow Process</p>
              <ul className="space-y-2 list-disc list-inside pl-1 text-[11px]">
                <li><strong className="text-slate-300">Live Audit Sync:</strong> Use the <span className="font-mono text-slate-200 bg-slate-800 px-1 py-0.5 rounded">🔄 Refresh Feed</span> button continuously to track live citizen handovers executing across the network.</li>
                <li><strong className="text-slate-300">Intake Logging:</strong> When a finder deposits an asset, verify physical serial numbers against the digital registry before executing <span className="text-cyan-400 font-bold">Accept From Finder</span>.</li>
                <li><strong className="text-slate-300">Outbound Handover:</strong> Tap <span className="text-amber-500 font-bold">Handover To Loser</span> only when the verified original claimant is physically standing at the station desk counter.</li>
              </ul>
            </div>

            {/* COLUMN 2: STRICT DIRECTIVES */}
            <div className="bg-black/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <p className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1 text-red-500">2. Strict Anti-Corruption Directives</p>
              <ul className="space-y-2 list-disc list-inside pl-1 text-[11px]">
                <li><strong className="text-slate-300">Privacy Lockout Mandate:</strong> Officers are strictly forbidden from sharing contact parameters between finders and losers to prevent external extortion or under-the-table bribery channels.</li>
                <li><strong className="text-slate-300">Volatile Memory Limitation:</strong> Terminal state operates purely on runtime RAM cache. Hitting back or view changes destroys active sessions, forcing re-authentication automatically.</li>
                <li><strong className="text-slate-300">Atomic Modification Block:</strong> System databases use immutable transactional constraints. Manual state adjustments outside the tactical button loops are completely blocked.</li>
              </ul>
            </div>

            {/* COLUMN 3: REAL-WORLD HANDLING */}
            <div className="bg-black/40 p-4 rounded-xl border border-slate-800/80 space-y-2">
              <p className="font-extrabold text-slate-200 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1 text-emerald-400">3. Real-World Exception Handling</p>
              <ul className="space-y-2 list-disc list-inside pl-1 text-[11px]">
                <li><strong className="text-slate-300">Unmarked Delivery State:</strong> If an officer dispatches a document but the citizen terminal fails to execute receipt confirmation, the grid auto-flags the row as <span className="text-red-400 font-bold">⚠️ UNMARKED DELIV</span> to initiate local follow-ups.</li>
                <li><strong className="text-slate-300">Twin Mapping Intercept:</strong> The system automatically merges separate loss and find records matching identical document IDs into a single unified row to prevent duplicate item processing clutter.</li>
                <li><strong className="text-slate-300">Identity Countermeasure:</strong> If a citizen details badge displays "Unknown User", proceed with manual phone-call cross-referencing using the clickable contact coordinates.</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md text-center">
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Items</h3>
            <p className="text-2xl font-black text-white mt-1">{documents.length}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md text-center border-b-4 border-blue-500">
            <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider">Total Lost</h3>
            <p className="text-2xl font-black text-white mt-1">{documents.filter(d => d.status === "LOST").length}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md text-center border-b-4 border-orange-500">
            <h3 className="text-orange-400 text-xs font-bold uppercase tracking-wider">Total Found</h3>
            <p className="text-2xl font-black text-white mt-1">{documents.filter(d => d.status === "FOUND").length}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md text-center border-b-4 border-purple-500">
            <h3 className="text-purple-400 text-xs font-bold uppercase tracking-wider">In Station</h3>
            <p className="text-2xl font-black text-white mt-1">{documents.filter(d => d.custodyStatus === "IN_POLICE_STATION").length}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md text-center border-b-4 border-yellow-600">
            <h3 className="text-yellow-500 text-xs font-bold uppercase tracking-wider">With Finder</h3>
            <p className="text-2xl font-black text-white mt-1">{documents.filter(d => d.status === "FOUND" && d.custodyStatus === "WITH_FINDER").length}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md text-center border-b-4 border-red-500">
            <h3 className="text-red-400 text-xs font-bold uppercase tracking-wider">Unmarked</h3>
            <p className="text-2xl font-black text-white mt-1">{documents.filter(d => d.finalStatus === "DELIVERED_UNMARKED").length}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md text-center border-b-4 border-green-500">
            <h3 className="text-green-400 text-xs font-bold uppercase tracking-wider">Completed</h3>
            <p className="text-2xl font-black text-white mt-1">{documents.filter(d => d.finalStatus === "COMPLETED").length}</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-md font-bold text-slate-300 uppercase tracking-widest">Live Audit Trail Registry Logs</h2>
            <button onClick={fetchDocuments} className="text-xs bg-slate-800 px-4 py-2 rounded hover:bg-slate-700 transition-all font-bold">🔄 Refresh Feed</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-black tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Doc Particulars</th>
                  <th className="px-4 py-4">Case Status</th>
                  <th className="px-4 py-4">Citizen Identity Cross-Reference</th>
                  <th className="px-4 py-4">Physical Custody</th>
                  <th className="px-4 py-4 text-center">Protocol Flags</th>
                  <th className="px-4 py-4">Workflow State</th>
                  <th className="px-4 py-4 text-center">Tactical Action Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-10 font-bold text-slate-500 tracking-widest">CONNECTING TO FORENSIC DATABASE LAYER...</td></tr>
                ) : groupedDocuments.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-10 text-slate-600">Zero active records inside current registry lifecycle.</td></tr>
                ) : (
                  groupedDocuments.map((caseItem) => (
                    <tr key={caseItem.documentIdNumber} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-4 font-mono text-slate-500">#{caseItem.documentIdNumber.slice(-6)}</td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-white text-md">{caseItem.documentType}</p>
                        <p className="font-mono text-xs text-cyan-500 mt-0.5">{caseItem.documentIdNumber}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider border ${
                          caseItem.foundDoc && caseItem.lostDoc ? 'bg-green-950/40 text-green-400 border-green-900' :
                          caseItem.foundDoc ? 'bg-orange-950/40 text-orange-400 border-orange-900' : 'bg-blue-950/40 text-blue-400 border-blue-900'
                        }`}>
                          {caseItem.foundDoc && caseItem.lostDoc ? "TWIN MATCH" : caseItem.foundDoc ? "FOUND ONLY" : "LOST ONLY"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs">
                        <div className="flex flex-col gap-2 max-w-[300px]">
                          <div className="p-2 rounded bg-orange-950/10 border border-orange-900/30">
                            <p className="text-orange-400 font-black uppercase tracking-wider text-[9px] mb-0.5">🤝 Document Finder:</p>
                            {caseItem.foundDoc ? (
                              <>
                                <p className="text-slate-200 font-bold">{caseItem.foundDoc.reportedBy?.name || "Unknown User"}</p>
                                <p className="font-mono text-cyan-400 mt-0.5">📞 +91 {caseItem.foundDoc.reportedBy?.phoneNumber || caseItem.foundDoc.reportedBy?.phone}</p>
                              </>
                            ) : (
                              <p className="text-slate-500 italic text-[11px]">No active finder registered</p>
                            )}
                          </div>
                          <div className="p-2 rounded bg-blue-950/10 border border-blue-900/30">
                            <p className="text-blue-400 font-black uppercase tracking-wider text-[9px] mb-0.5">🙋‍♂️ Original Owner:</p>
                            {caseItem.lostDoc ? (
                              <>
                                <p className="text-slate-200 font-bold">{caseItem.lostDoc.reportedBy?.name || "Unknown User"}</p>
                                <p className="font-mono text-cyan-400 mt-0.5">📞 +91 {caseItem.lostDoc.reportedBy?.phoneNumber || caseItem.lostDoc.reportedBy?.phone}</p>
                              </>
                            ) : (
                              <p className="text-slate-500 italic text-[11px]">Awaiting loss claim report...</p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-black tracking-wider uppercase border ${
                          caseItem.custodyStatus === 'WITH_FINDER' ? 'bg-yellow-950/40 text-yellow-400 border-yellow-900' :
                          caseItem.custodyStatus === 'IN_TRANSIT_TO_POLICE' ? 'bg-red-950/40 text-red-400 border-red-900 animate-pulse' :
                          caseItem.custodyStatus === 'IN_POLICE_STATION' ? 'bg-purple-950/40 text-purple-400 border-purple-900' : 
                          'bg-green-950/40 text-green-400 border-green-900'
                        }`}>
                          {caseItem.custodyStatus ? caseItem.custodyStatus.replace(/_/g, ' ') : 'WITH FINDER'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-center items-center text-sm">
                          <span title="Finder Sent" className={`px-1.5 py-0.5 rounded text-xs font-bold ${caseItem.fOut ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-slate-950 text-slate-600'}`}>F-Out</span>
                          <span title="Police Received" className={`px-1.5 py-0.5 rounded text-xs font-bold ${caseItem.pIn ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-slate-950 text-slate-600'}`}>P-In</span>
                          <span title="Police Dispatched" className={`px-1.5 py-0.5 rounded text-xs font-bold ${caseItem.pOut ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-slate-950 text-slate-600'}`}>P-Out</span>
                          <span title="Owner Claims Secure Delivery" className={`px-1.5 py-0.5 rounded text-xs font-bold ${caseItem.oIn ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-slate-950 text-slate-600'}`}>O-In</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {caseItem.finalStatus === "COMPLETED" ? (
                          <span className="text-green-500 font-extrabold text-xs tracking-widest block">✅ COMPLETED</span>
                        ) : caseItem.finalStatus === "DELIVERED_UNMARKED" ? (
                          <span className="text-red-400 font-extrabold text-xs tracking-widest block bg-red-950/20 p-1 rounded border border-red-900/50 animate-pulse">⚠️ UNMARKED DELIV</span>
                        ) : caseItem.finalStatus === "IN_POLICE_CUSTODY" ? (
                          <span className="text-purple-400 font-extrabold text-xs tracking-widest block">⏳ IN STATION</span>
                        ) : caseItem.finalStatus === "MATCHED_UNVERIFIED" ? (
                          <span className="text-yellow-500 font-extrabold text-xs tracking-widest block">⏳ VERIFY CHAIN</span>
                        ) : (
                          <span className="text-slate-500 font-bold text-xs tracking-widest block">⏳ PENDING MATCH</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center">
                        {caseItem.foundDoc ? (
                          !caseItem.pIn ? (
                            <button onClick={() => handlePoliceAction(caseItem.foundDoc.id, "ACCEPT_FROM_FINDER", "Confirm receipt of physical asset inside station registry boundaries?")} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black py-1.5 px-3 rounded shadow-md text-xs uppercase tracking-wide transition-all">
                              📥 Accept From Finder
                            </button>
                          ) : caseItem.lostDoc ? (
                            !caseItem.pOut ? (
                              <button onClick={() => handlePoliceAction(caseItem.lostDoc.id, "HANDOVER_TO_LOSER", "Authorize permanent handover release to verified document owner?")} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-1.5 px-3 rounded shadow-md text-xs uppercase tracking-wide transition-all">
                                📤 Handover To Loser
                              </button>
                            ) : caseItem.finalStatus !== "COMPLETED" ? (
                              <span className="inline-block bg-slate-950 border border-red-900/60 text-red-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider animate-pulse">Awaiting Citizen Confirm</span>
                            ) : (
                              <span className="text-slate-600 text-xs font-extrabold uppercase tracking-wider">Audit Closed</span>
                            )
                          ) : (
                            <span className="inline-block bg-slate-950 border border-orange-900/60 text-orange-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Awaiting Owner Claim</span>
                          )
                        ) : (
                          <span className="inline-block bg-slate-950 border border-slate-800 text-slate-500 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Awaiting Physical Asset</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}