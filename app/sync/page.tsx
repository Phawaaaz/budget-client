"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, RefreshCw, ArrowLeft, Inbox, Zap, CheckCircle2 } from "lucide-react";

export default function EmailSyncPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [syncCompleted, setSyncCompleted] = useState(false);

  const startSimulatedSync = () => {
    setIsSyncing(true);
    setSyncCompleted(false);
    setProgress(0);
    setLogs([]);

    const steps = [
      { pct: 20, msg: "Connecting to Gmail API...", delay: 500 },
      { pct: 50, msg: "Scanning inbox for receipts...", delay: 1200 },
      { pct: 80, msg: "Extracting receipt items via LLM...", delay: 2000 },
      { pct: 100, msg: "Sync complete! Transactions saved.", delay: 2800 },
    ];

    steps.forEach(({ pct, msg, delay }) => {
      setTimeout(() => {
        setProgress(pct);
        setCurrentStep(msg);
        setLogs((prev) => [msg, ...prev]);

        if (pct === 100) {
          setIsSyncing(false);
          setSyncCompleted(true);
        }
      }, delay);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-purple-900 text-white h-16 flex items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-purple-200 hover:text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold">
          <Mail className="w-4 h-4 text-purple-300" />
          <span>Mail Pipeline</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pt-12 px-4 space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-purple-100 text-center shadow-xs">
          <Inbox className="w-10 h-10 text-purple-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold">Sync Email Receipts</h2>
          <p className="text-xs text-slate-500 mt-1">
            Trigger automated parsing to import receipt line items.
          </p>

          <button
            onClick={startSimulatedSync}
            disabled={isSyncing}
            className={`mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white shadow-xs ${
              isSyncing ? "bg-purple-400" : "bg-purple-700 hover:bg-purple-600"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Start Sync"}</span>
          </button>

          {(isSyncing || syncCompleted) && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-purple-900">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-purple-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="bg-purple-950 text-purple-200 p-4 rounded-xl font-mono text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-purple-800 pb-2">
              <span className="flex items-center gap-1.5 font-bold text-purple-300">
                <Zap className="w-3.5 h-3.5" /> Pipeline Console
              </span>
              {syncCompleted && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              )}
            </div>
            {logs.map((log, index) => (
              <div key={index}>{`> ${log}`}</div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}