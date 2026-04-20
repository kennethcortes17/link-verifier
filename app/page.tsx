// app/page.tsx
"use client";
import { useState } from "react";
import * as XLSX from "xlsx";

interface Result {
  url: string;
  status: "Checking..." | "LIVE" | "OFFLINE";
}

export default function LinkChecker() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Feature: Refresh ---
  const handleRefresh = () => {
    window.location.reload();
  };

  // --- Verification Logic ---
  const verifyLink = async (targetUrl: string): Promise<"LIVE" | "OFFLINE"> => {
    const formattedUrl = targetUrl.trim().startsWith("http") ? targetUrl.trim() : `https://${targetUrl.trim()}`;
    try {
      await fetch(formattedUrl, { mode: 'no-cors' });
      return "LIVE";
    } catch {
      return "OFFLINE";
    }
  };

  // --- Feature: Process Textarea ---
  const handleProcess = async () => {
    if (!url) return;
    setLoading(true);
    const urls = url.split("\n").filter(line => line.trim() !== "");
    const initialResults: Result[] = urls.map(u => ({ url: u, status: "Checking..." }));
    setResults(initialResults);

    const updatedResults: Result[] = [];
    for (const u of urls) {
      const status = await verifyLink(u);
      updatedResults.push({ url: u, status });
    }
    setResults(updatedResults);
    setLoading(false);
  };

  // --- Feature: Export Excel ---
  const handleExport = () => {
    const urls = url.split("\n").filter(line => line.trim() !== "");
    const data = [["paste your links here"], ...urls.map(u => [u])];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Links");
    XLSX.writeFile(wb, "Link_Verification_Template.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8 font-sans text-gray-900">
      <div className="max-w-4xl w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        
        {/* Header with Refresh & Export */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-xl">📤</span> 
            <h1>Live Manual Ingestion</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition">
              🔄 Refresh
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition">
              📥 Export
            </button>
          </div>
        </div>

        <p className="text-gray-600 mb-4 text-sm">
          Paste the URLs below (one per line) or use Export to create a template.
        </p>

        <textarea
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none mb-6 font-mono text-sm"
          placeholder="https://example.com&#10;https://tinyurl.com/xyz"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={handleProcess}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
            loading ? "bg-gray-400" : "bg-[#1a7f37] hover:bg-[#15662c]"
          }`}
        >
          {loading ? "Processing List..." : "Process and Verify All Links"}
        </button>

        {/* Results List */}
        {results.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-bold mb-4">Verification Report</h2>
            <div className="space-y-3">
              {results.map((res, index) => (
                <div key={index} className={`flex justify-between p-3 rounded-md border ${
                  res.status === "LIVE" ? "bg-green-50 border-green-200" : 
                  res.status === "OFFLINE" ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                }`}>
                  <span className="truncate mr-4 text-sm font-medium">{res.url}</span>
                  <span className={`font-bold text-xs px-2 py-1 rounded uppercase ${
                    res.status === "LIVE" ? "bg-green-200 text-green-800" : 
                    res.status === "OFFLINE" ? "bg-red-200 text-red-800" : "bg-gray-200 text-gray-600"
                  }`}>
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}