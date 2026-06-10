/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Clock, ShieldCheck, Thermometer, Droplets, Server } from "lucide-react";

export default function Header() {
  const [time, setTime] = useState(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 border-b border-[#1a1f2e] bg-[#0a0d14] px-6 flex items-center justify-between z-10 shrink-0">
      {/* Simulation Banner / Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#05070a] border border-[#1a1f2e] font-mono text-[9px] text-[#94a3b8]">
          <Server className="w-3 h-3 text-[#00f2ff]" />
          <span>GRID: CLOUD_RUN_SECURE</span>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#05070a] border border-[#1a1f2e] font-mono text-[9px] text-[#94a3b8]">
          <Thermometer className="w-3 h-3 text-[#ff8c00]" />
          <span>AMB TEMP: 24.5 °C</span>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#05070a] border border-[#1a1f2e] font-mono text-[9px] text-[#94a3b8]">
          <Droplets className="w-3 h-3 text-[#00f2ff]" />
          <span>AMB HUMIDITY: 55.0%</span>
        </div>
      </div>

      {/* Date-System Clock & Telemetry Widgets */}
      <div className="flex items-center gap-6">
        {/* UTC Clock */}
        <div className="hidden md:flex flex-col items-end font-mono">
          <div className="text-[9px] text-[#475569] uppercase tracking-wider">SYSTEM TIME</div>
          <div className="text-[11px] text-[#94a3b8] tabular-nums font-bold">
            {time.slice(17, 25)} UTC
          </div>
        </div>

        <div className="hidden sm:block w-px h-6 bg-[#1a1f2e]"></div>

        {/* Core Temp readout */}
        <div className="flex flex-col items-end">
          <div className="text-[10px] text-[#475569] uppercase font-mono tracking-widest">Core Temp</div>
          <div className="text-[11px] font-mono font-bold text-[#00ff9d]">32.4°C [STABLE]</div>
        </div>

        <div className="w-px h-6 bg-[#1a1f2e]"></div>

        {/* AI Node status */}
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse shadow-[0_0_8px_#00ff9d]"></div>
          <span className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-tighter hidden sm:inline">
            AI Node Active: 0x9AF4
          </span>
        </div>
      </div>
    </header>
  );
}
