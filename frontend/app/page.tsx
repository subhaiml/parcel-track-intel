'use client';
import { useState, useEffect, useRef } from 'react';

// --- Types ---
interface Shipment {
  reference_no: string;
  waybill_no: string;
  origin: string;
  destination: string;
  status: string;
}

interface JobResponse {
  jobId: string;
  status: string;
}

export default function Home() {
  // --- State ---
  const [pattern, setPattern] = useState('');
  const [searchMode, setSearchMode] = useState<'waybill' | 'ref'>('waybill');
  const [jobId, setJobId] = useState<string | null>(null);
  const [results, setResults] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to track polling attempts
  const pollAttempts = useRef(0);

  // --- Actions ---
  const startSearch = async () => {
    if (!pattern.trim()) {
      setError("Please enter a valid number.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setJobId(null);
    pollAttempts.current = 0;

    try {
      // connecting to your now-perfect API
      const res = await fetch('http://localhost:3001/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: '993aca18-3053-48cb-a5b8-e56fa588fdda', // HARDCODED VALID UUID
          pattern: pattern,
          mode: searchMode
        })
      });

      if (!res.ok) throw new Error("Failed to connect to API. Is the server running?");

      const data: JobResponse = await res.json();
      setJobId(data.jobId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  // --- Polling Logic ---
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      // STOP AFTER 120 SECONDS (60 attempts * 2s)
      // This gives you plenty of time to type the Captcha without rushing.
      if (pollAttempts.current > 60) {
        setLoading(false);
        setError("Search timed out. The worker might be stuck or offline.");
        setJobId(null);
        return;
      }
      pollAttempts.current += 1;

      try {
        const res = await fetch(`http://localhost:3001/api/jobs/${jobId}`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          setResults(data.results);
          setLoading(false);
          setJobId(null); // Stop polling
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  // --- Apple Style Status Colors ---
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50 shadow-emerald-100';
    if (s.includes('transit')) return 'bg-blue-500/10 text-blue-700 border-blue-200/50 shadow-blue-100';
    if (s.includes('pending') || s.includes('delay')) return 'bg-amber-500/10 text-amber-700 border-amber-200/50 shadow-amber-100';
    return 'bg-slate-500/10 text-slate-600 border-slate-200/50';
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-[#F5F5F7] selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* Background Gradient Mesh (The "Apple" Glow) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60" 
           style={{ background: 'radial-gradient(circle at 15% 15%, #dbeafe 0%, transparent 40%), radial-gradient(circle at 85% 85%, #e0e7ff 0%, transparent 40%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto p-8 space-y-10">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-2 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center text-white font-bold text-2xl">
                P
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
                  Parcel Intel
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Enterprise Logistics Tracker</p>
              </div>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-white/40 border border-white/60 backdrop-blur-md text-xs font-semibold text-slate-500 shadow-sm">
              v1.0.0 Stable
            </div>
        </div>

        {/* SEARCH CARD (Glassmorphism Effect) */}
        <div className="rounded-[2rem] shadow-2xl shadow-slate-200/60 bg-white/70 backdrop-blur-2xl border border-white/60 p-10 transition-all duration-300 hover:shadow-slate-300/50 hover:bg-white/80">
          
          {/* Error Banner */}
          {error && (
            <div className="mb-8 p-4 bg-red-50/90 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-10">
            
            {/* Mode Switcher */}
            <div className="flex md:flex-col gap-4 min-w-[260px]">
              <label className="relative group cursor-pointer block">
                <input type="radio" name="mode" className="peer hidden" checked={searchMode === 'waybill'} onChange={() => setSearchMode('waybill')} />
                <div className="p-5 rounded-2xl border border-transparent bg-slate-50/50 transition-all duration-200 peer-checked:bg-white peer-checked:shadow-xl peer-checked:shadow-blue-900/5 peer-checked:border-blue-100 hover:bg-white/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700">Waybill Number</span>
                    <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${searchMode === 'waybill' ? 'border-blue-500' : 'border-slate-300 group-hover:border-slate-400'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-blue-500 transition-transform duration-300 ${searchMode === 'waybill' ? 'scale-100' : 'scale-0'}`} />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Direct tracking ID</div>
                </div>
              </label>

              <label className="relative group cursor-pointer block">
                <input type="radio" name="mode" className="peer hidden" checked={searchMode === 'ref'} onChange={() => setSearchMode('ref')} />
                <div className="p-5 rounded-2xl border border-transparent bg-slate-50/50 transition-all duration-200 peer-checked:bg-white peer-checked:shadow-xl peer-checked:shadow-blue-900/5 peer-checked:border-blue-100 hover:bg-white/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700">Reference Number</span>
                    <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${searchMode === 'ref' ? 'border-blue-500' : 'border-slate-300 group-hover:border-slate-400'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full bg-blue-500 transition-transform duration-300 ${searchMode === 'ref' ? 'scale-100' : 'scale-0'}`} />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Order/Ref ID lookup</div>
                </div>
              </label>
            </div>

            {/* Input Area */}
            <div className="flex-1 flex flex-col justify-end gap-5">
              <label className="text-xs font-bold text-slate-500 ml-1 tracking-widest uppercase">
                {searchMode === 'waybill' ? 'Waybill' : 'Reference'} Number
              </label>
              
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder={searchMode === 'waybill' ? "e.g., 123456789" : "e.g., Dipti-05-02-99"}
                  className="flex-1 px-6 py-5 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl text-lg outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all placeholder:text-slate-400 font-semibold text-slate-700 shadow-inner"
                  onKeyDown={(e) => e.key === 'Enter' && startSearch()}
                />
                <button 
                  onClick={startSearch}
                  disabled={loading}
                  className={`px-10 py-5 rounded-2xl font-bold text-white shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 transform active:scale-[0.98]
                    ${loading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-600/30 hover:-translate-y-0.5'}
                  `}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="opacity-90">Searching...</span>
                    </>
                  ) : (
                    "Track Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS TABLE */}
        <div className="rounded-[2rem] shadow-xl shadow-slate-200/40 bg-white/50 backdrop-blur-xl border border-white/60 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 bg-white/40">
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest pl-10">Reference</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Waybill</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Origin</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Destination</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest pr-10">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    {loading ? (
                       <div className="flex flex-col items-center justify-center gap-4 animate-pulse">
                          <div className="h-2 w-32 bg-slate-300/50 rounded-full"></div>
                          <span className="text-sm font-medium text-slate-400">Securely connecting to worker...</span>
                       </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <span className="text-slate-500 font-medium">No active shipments tracked.</span>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                results.map((r, i) => (
                  <tr key={i} className="group hover:bg-white/60 transition-colors duration-200">
                    <td className="p-6 pl-10 font-bold text-slate-700">{r.reference_no}</td>
                    <td className="p-6">
                        <span className="font-mono text-sm font-medium text-blue-600 bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                            {r.waybill_no}
                        </span>
                    </td>
                    <td className="p-6 text-slate-600 font-medium">{r.origin}</td>
                    <td className="p-6 text-slate-600 font-medium">{r.destination}</td>
                    <td className="p-6 pr-10">
                      <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}