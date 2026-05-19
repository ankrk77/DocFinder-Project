"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const [lang, setLang] = useState("EN");

  // ✅ THE MASTER HACK: Overriding Default Browser Alerts with a Translatable HTML Modal
  useEffect(() => {
    window.alert = function (message) {
      const existingAlert = document.getElementById("custom-global-alert");
      if (existingAlert) existingAlert.remove();

      const modal = document.createElement("div");
      modal.id = "custom-global-alert";
      modal.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 font-sans";
      
      modal.innerHTML = `
        <div class="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-blue-600 text-center animate-in fade-in zoom-in duration-200">
          <div class="text-4xl mb-4">🔔</div>
          <p class="text-slate-800 font-bold text-sm md:text-base mb-8 leading-relaxed">${message}</p>
          <button onclick="document.getElementById('custom-global-alert').remove()" class="bg-blue-600 text-white px-8 py-3 rounded-lg font-black shadow-md hover:bg-blue-700 w-full text-xs uppercase tracking-widest transition-all focus:ring-4 focus:ring-blue-300 outline-none">
            Acknowledge / OK
          </button>
        </div>
      `;
      document.body.appendChild(modal);
    };
  }, []);

  // ✅ TRANSLATION ENGINE TRIGGER
  const changeLanguage = (langCode) => {
    setLang(langCode === 'hi' ? 'HI' : 'EN');
    
    // Triggering the hidden Google Translate dropdown
    const selectBox = document.querySelector(".goog-te-combo");
    if (selectBox) {
      selectBox.value = langCode;
      selectBox.dispatchEvent(new Event("change"));
    } else {
      console.warn("Google Translate engine is still loading...");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* Top Gov Bar */}
      <div className="bg-[#2c3e50] text-white text-xs py-2 px-6 md:px-10 flex justify-between items-center notranslate">
        <span className="font-semibold tracking-wider">GOVERNMENT OF INDIA | भारत सरकार</span>
        <div className="space-x-4 font-bold flex items-center">
          {/* ✅ Linked to Google Translate */}
          <button onClick={() => changeLanguage('hi')} className={`transition-all ${lang === "HI" ? "text-orange-400 border-b border-orange-400 pb-0.5" : "hover:text-gray-300"}`}>हिन्दी</button>
          <span className="text-slate-500">|</span>
          <button onClick={() => changeLanguage('en')} className={`transition-all ${lang === "EN" ? "text-orange-400 border-b border-orange-400 pb-0.5" : "hover:text-gray-300"}`}>English</button>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b-4 border-orange-500 p-4 md:p-6 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center text-2xl border-2 border-slate-800 shadow-sm">🏛️</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">DocFinder</h1>
            <p className="text-xs md:text-sm text-green-700 font-bold uppercase tracking-widest">National Lost & Found Portal</p>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-8 font-bold text-slate-700 items-center">
          <Link href="/search" className="hover:text-orange-600 transition-colors">SEARCH</Link>
          <Link href="/report" className="hover:text-orange-600 transition-colors">REPORT</Link>
          <Link href="/login" className="bg-blue-800 text-white px-6 py-2 rounded-md hover:bg-blue-900 transition-all shadow-md">LOGIN</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative h-[400px] bg-slate-900 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-800 opacity-90"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Your Documents, Our Responsibility
          </h2>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-200 font-medium mb-8">
            A secure digital bridge between the finder, the loser, and the authorities.
          </p>
        </div>
      </section>

      {/* Action Cards */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 flex-grow">
        
        {/* FOUND CARD */}
        <div className="border-t-4 border-orange-500 bg-white p-8 shadow-xl text-center rounded-b-xl hover:-translate-y-2 transition-transform duration-300">
          <div className="text-5xl mb-4">🤝</div>
          <h3 className="text-xl font-bold mb-3 text-slate-800">FOUND/LOST DOCUMENT?</h3>
          <p className="text-gray-600 mb-8 italic">"Help a fellow citizen today. Scan and report found items securely."</p>
          <Link href="/report?role=founder" className="inline-block w-full bg-orange-600 text-white px-8 py-3 rounded-md font-bold hover:bg-orange-700 shadow-md">REPORT FOUND</Link>
        </div>

        {/* LOST CARD */}
        <div className="border-t-4 border-blue-800 bg-white p-8 shadow-xl text-center rounded-b-xl hover:-translate-y-2 transition-transform duration-300">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-3 text-slate-800">Sarch Lost!</h3>
          <p className="text-gray-600 mb-8 italic">"Search our national database or file a lost report instantly."</p>
          <Link href="/search" className="inline-block w-full bg-blue-800 text-white px-8 py-3 rounded-md font-bold hover:bg-blue-900 shadow-md">START SEARCH</Link>
        </div>

        {/* POLICE CARD */}
        <div className="border-t-4 border-green-600 bg-white p-8 shadow-xl text-center rounded-b-xl hover:-translate-y-2 transition-transform duration-300">
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold mb-3 text-slate-800">POLICE PORTAL</h3>
          <p className="text-gray-600 mb-8 italic">"Verification and handover management for authorized officials."</p>
          <Link href="/admin" className="inline-block w-full bg-green-700 text-white px-8 py-3 rounded-md font-bold hover:bg-green-800 shadow-md">OFFICER LOGIN</Link>
        </div>

      </section>

      {/* ✅ COMPLIANCE SECTION */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full mb-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-5 border-b border-slate-800 flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">Official Operating Protocols & User Manual</h2>
              <p className="text-slate-400 text-xs">Standard operating procedures for maintaining end-to-end data safety and asset integrity.</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* PROTOCOL BLOCK 1: FINDERS / REPORTERS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 border-slate-100">
                <span className="text-xl text-orange-500">🤝</span>
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wide text-sm">For Document Finders</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 list-disc list-inside leading-relaxed">
                <li><strong className="text-slate-800">Legal Custody Chain:</strong> Once a document is registered on DocFinder, you are legally designated as its temporary custodian. Do not store or carry it unnecessarily.</li>
                <li><strong className="text-slate-800">Mandatory Handover:</strong> You are strictly instructed to submit the discovered asset to your nearest local police desk within 48 hours of reporting.</li>
                <li><strong className="text-slate-800">Digital Acknowledgment:</strong> Make sure to tap the <span className="font-bold text-orange-600">"I Handed Over to Police"</span> button on your dashboard the moment you transition custody to an officer.</li>
                <li><strong className="text-slate-800">Zero Contact Directives:</strong> Never communicate independently with individuals claiming to be the document owners outside system parameters to eliminate bribery attempts.</li>
              </ul>
            </div>

            {/* PROTOCOL BLOCK 2: LOST OWNERS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 border-slate-100">
                <span className="text-xl text-blue-800">🙋‍♂️</span>
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wide text-sm">For Document Losers</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 list-disc list-inside leading-relaxed">
                <li><strong className="text-slate-800">Accurate Claims Only:</strong> File reports matching your original government credentials. Processing fraudulent matching records triggers automatic blacklisting.</li>
                <li><strong className="text-slate-800">Station Verification:</strong> Upon receiving a match alert, proceed exclusively to the localized police station listed on your lifecycle grid. Do not attempt direct meetups with finders.</li>
                <li><strong className="text-slate-800">Identity Substantiation:</strong> Carry secondary supporting identification items when claiming your principal physical document at the desk.</li>
                <li><strong className="text-slate-800">Final Verification Clause:</strong> Immediately verify and click <span className="font-bold text-green-700">"Confirm: I Received It Safely"</span> from your personal panel once the item is delivered to close the transaction.</li>
              </ul>
            </div>

            {/* PROTOCOL BLOCK 3: POLICE PERSONNEL */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 border-slate-100">
                <span className="text-xl text-green-600">🛡️</span>
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wide text-sm">For Police Officials</h3>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 list-disc list-inside leading-relaxed">
                <li><strong className="text-slate-800">Terminal Authentication Mandate:</strong> Duty nodes operate entirely on non-persistent volatile memory. Terminal lock sequences initialize automatically on view changes or tab resets.</li>
                <li><strong className="text-slate-800">Physical Asset Intake:</strong> Inspect physical markings on the asset before executing the <span className="font-bold text-cyan-600">"Accept From Finder"</span> query log.</li>
                <li><strong className="text-slate-800">Privacy Non-Disclosure Rules:</strong> Officers are strictly forbidden from sharing contact details between parties to minimize extortion channels.</li>
                <li><strong className="text-slate-800">Atomic Workflow Closures:</strong> Ensure double-verification parameters. The handover is legally active only after clicking <span className="font-bold text-amber-600">"Handover to Loser"</span> alongside the corresponding citizen confirmation signature.</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 border-t-4 border-orange-500">
        <div className="text-center text-sm font-medium">
          <p>© 2026 Ministry of Electronics and Information Technology | Digital India</p>
          <p className="text-slate-400 mt-2">DocFinder - A Secure Tri-Party Verification System</p>
        </div>
      </footer>

    </div>
  );
}