/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sliders, RefreshCw, Layers, Cpu, Terminal, Shield } from "lucide-react";

export default function AdminPanel() {
  const [logs, setLogs] = useState([
    { time: "05:16:05", type: "INFO", text: "[HYDROSHIELD-X SERVER COUPLER] Booting microphysics engines" },
    { time: "05:16:10", type: "INFO", text: "[BUTLER-VOLMER] Solved kinetic polarization matrix" },
    { time: "05:16:12", type: "INFO", text: "[GEMINI INTERACTION] Server route POST /api/assistant initialized" },
    { time: "05:16:21", type: "METRIC", text: "[CHAMBER SENSOR #1] ESP32 RSSI Signal receiver connected" },
    { time: "05:16:40", type: "WARN", text: "[THERMALS CORE] PCB avionics J1 temperature boundary has exceeded 100°C" }
  ]);

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            System Control Panel (Admin)
          </h2>
          <p className="text-slate-400 mt-1">
            EXPRESS REST INGRESS GATEWAYS · TELEMETRY AGENTS ENGINE METRICS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Diagnostics widgets. Col span 4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1.5 border-b border-slate-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              Diagnostics Metrics
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">INGRESS GATES:</span>
                <span className="text-cyan-400 font-bold uppercase">PORT: 3000 Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ENGINE LATENCY:</span>
                <span className="text-emerald-400 font-bold">12.5 ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RAM MEMORY RESERVES:</span>
                <span className="text-slate-200">114.5 MB / 512 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GEMINI API ENDPOINT:</span>
                <span className="text-emerald-400">gemini-3.5-flash</span>
              </div>
            </div>
          </div>
        </div>

        {/* Console and logs feed. Col span 8 */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-4 flex flex-col h-[340px]">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="w-4 w-4 text-rose-400" />
                REST Server Transactions Logs
              </h3>
              <button
                onClick={clearLogs}
                className="px-3 py-1 bg-slate-950 border border-slate-850 hover:bg-slate-900 font-bold font-mono text-[9px] uppercase rounded text-slate-400 hover:text-slate-200"
              >
                Clear Terminal Console
              </button>
            </div>

            <pre className="flex-1 p-4 bg-slate-950 border border-slate-850 rounded text-[10px] leading-relaxed overflow-y-auto block space-y-1 block font-mono select-all">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-slate-500 font-normal">[{log.time}]</span>
                    <span className={log.type === "WARN" ? "text-rose-400 font-bold" : "text-cyan-400 font-bold"}>{log.type}</span>
                    <span className="text-slate-300 font-normal">{log.text}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic select-none">No transactions registered in current console loop.</div>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
