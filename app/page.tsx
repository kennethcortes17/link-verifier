"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";

interface Result {
  url: string;
  status: "Checking..." | "LIVE" | "OFFLINE";
}

export default function LinkChecker() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRefresh = () => window.location.reload();

  const handleExport = () => {
    const urls = url.split("\n").filter(line => line.trim() !== "");
    const data = [["paste your links here"], ...urls.map(u => [u])];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Links");
    XLSX.writeFile(wb, "Link_Template.xlsx");
  };

  // --- NEW FEATURE: Import Excel ---
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      // Filter out the header (A1) and join the rest into the textarea
      const importedUrls = data.slice(1).map(row => row[0]).filter(Boolean).join("\n");
      setUrl(importedUrls);
    };
    reader.readAsBinaryString(file);
  };

  const verifyLink = async (targetUrl: string): Promise<"LIVE" | "OFFLINE"> => {
    const formattedUrl = targetUrl.trim().startsWith("http") ? targetUrl.trim() : `https://${targetUrl.trim()}`;
    try {
      await fetch(formattedUrl, { mode: 'no-cors' });
      return "LIVE";
    } catch {
      return "OFFLINE";
    }
  };

  const handleProcess = async () => {
    if (!url) return;
    setLoading(true);
    const urls = url.split("\n").filter(line => line.trim() !== "");
    setResults(urls.map(u => ({ url: u, status: "Checking..." })));

    const updatedResults: Result[] = [];
    for (const u of urls) {
      const status = await verifyLink(u);
      updatedResults.push({ url: u, status });
    }
    setResults(updatedResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8 font-sans text-gray-900">
      <div className="max-w-4xl w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-xl">📤</span> 
            <h1>Live Manual Ingestion</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition">
              🔄 Refresh
            </button>
            {/* Hidden Input for File selection */}
            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".xlsx, .xls" className="hidden" />
            <button onClick={handleImportClick} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition">
              📂 Import
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition">
              📥 Export
            </button>
          </div>
        </div>

        <textarea
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none mb-6 font-mono text-sm"
          placeholder="Paste links or use Import..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={handleProcess}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-bold text-white transition-all w-full md:w-auto ${
            loading ? "bg-gray-400" : "bg-[#1a7f37] hover:bg-[#15662c]"
          }`}
        >
          {loading ? "Verifying..." : "Process and Verify List"}
        </button>

        {results.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-bold mb-4">Verification Report</h2>
            <div className="grid gap-2">
              {results.map((res, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-md border bg-white shadow-sm">
                  <span className="truncate text-sm font-medium text-gray-700">{res.url}</span>
                  <span className={`font-bold text-[10px] px-2 py-1 rounded uppercase tracking-wider ${
                    res.status === "LIVE" ? "bg-green-100 text-green-700" : 
                    res.status === "OFFLINE" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
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