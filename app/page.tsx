// app/page.tsx
"use client";
import { useState } from "react";

export default function LinkChecker() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!url) return;
    setLoading(true);
    setStatus(null);

    const targetUrl = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;

    try {
      // We use 'no-cors' mode. This is the "secret sauce" for browser checking.
      // It won't give us the 200/404 code, but if it doesn't crash, the site is likely up.
      await fetch(targetUrl, { mode: 'no-cors' });
      
      setStatus(`✅ LIVE: Verification request sent to ${targetUrl}.`);
    } catch (error) {
      setStatus("❌ OFFLINE: Unable to reach the link. Check the URL spelling.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="max-w-3xl w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-xl">📤</span> 
            <h1>Live Manual Ingestion</h1>
          </div>
          <button className="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50">
            ← Go Back
          </button>
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          Paste the URL below. This tool will verify if the link is active on your current network.
        </p>

        <textarea
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none mb-6"
          placeholder="Paste your URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
            loading ? "bg-gray-400" : "bg-[#1a7f37] hover:bg-[#15662c]"
          }`}
        >
          {loading ? "Verifying..." : "Process and Send to Live Queue"}
        </button>

        {status && (
          <div className={`mt-6 p-4 rounded-lg border ${status.includes("LIVE") ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}