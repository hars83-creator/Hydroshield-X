/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  ShieldAlert,
  LayoutDashboard,
  Database,
  Layers,
  FlameKindling,
  Droplet,
  Activity,
  Cpu,
  Thermometer,
  Zap,
  Wind,
  Wand2,
  Brain,
  BarChart4,
  Cable,
  FileText,
  MessageSquare,
  Settings,
  Flame,
  Binary
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isUnlocked: boolean;
}

export default function Sidebar({ currentTab, setCurrentTab, isUnlocked }: SidebarProps) {
  const categories = [
    {
      title: "Core Deck",
      items: [
        { id: "dashboard", label: "Control Center", icon: LayoutDashboard },
        { id: "materials", label: "Materials Database", icon: Database },
        { id: "coating-designer", label: "Coating Stack Designer", icon: Layers },
      ],
    },
    {
      title: "Molecular & Wave Solvers",
      items: [
        { id: "simulator", label: "Corrosion Engine", icon: Flame },
        { id: "droplet-lab", label: "Droplet Physics Lab", icon: Droplet },
        { id: "electrochemistry", label: "Electrochemical Lab", icon: Activity },
      ],
    },
    {
      title: "Digital Twin Space",
      items: [
        { id: "digital-twin", label: "PCB Digital Twin", icon: Cpu },
        { id: "thermal", label: "Thermal & Condensation", icon: Thermometer },
        { id: "contamination", label: "Contamination Engine", icon: Wind },
      ],
    },
    {
      title: "Micro-Coatings Lab",
      items: [
        { id: "salt-fog", label: "Salt Fog Chamber", icon: Zap },
        { id: "self-healing", label: "Self-Healing Lab", icon: FlameKindling },
      ],
    },
    {
      title: "Autonomous ML & Math",
      items: [
        { id: "ai-lab", label: "AI Prediction Center", icon: Brain },
        { id: "material-discovery", label: "Material Discovery Engine", icon: Wand2 },
        { id: "reliability", label: "Monte Carlo Failure Solver", icon: Binary },
      ],
    },
    {
      title: "Systems Interface",
      items: [
        { id: "sensors", label: "Live Sensor Hub", icon: Cable },
        { id: "reports", label: "Report Generator", icon: FileText },
        { id: "assistant", label: "AI Research Assistant", icon: MessageSquare },
        { id: "admin", label: "System Guard (Admin)", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0a0d14] border-r border-[#1a1f2e] text-[#e0e6ed] md:flex flex-col h-screen overflow-y-auto hidden">
      {/* Title */}
      <div className="p-5 border-b border-[#1a1f2e] flex items-center gap-3 bg-[#0a0d14]">
        <div className="w-8 h-8 bg-gradient-to-br from-[#00f2ff] to-[#0066ff] rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.35)] shrink-0">
          <span className="font-black text-[#05070a] text-lg italic select-none">X</span>
        </div>
        <div>
          <h1 className="text-[13px] font-bold tracking-tighter uppercase font-display text-white">
            HydroShield<span className="text-[#00f2ff]">-X</span>
          </h1>
          <span className="text-[9px] text-[#00ff9d] font-mono uppercase tracking-widest block font-bold">
            Twin Engine v4.2
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="text-[10px] font-bold text-[#475569] tracking-widest uppercase font-mono px-3">
              {cat.title}
            </h3>
            <ul className="space-y-0.5">
              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setCurrentTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-sm text-[11px] font-mono transition-all text-left group ${
                        isActive
                          ? "bg-[#111827] text-white border-l-2 border-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.1)]"
                          : "text-[#94a3b8] hover:bg-[#0a0d14]/80 hover:text-white border-l-2 border-transparent"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isActive
                            ? "text-[#00f2ff]"
                            : "text-[#64748b] group-hover:text-slate-300"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                      {item.id === "sensors" && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse shadow-[0_0_6px_#00ff9d]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#1a1f2e] bg-[#05070a] font-mono text-[9px] text-[#64748b] space-y-1.5">
        <div className="flex justify-between items-center">
          <span>SERVER SECURE:</span>
          <span className="text-[#00ff9d] font-bold uppercase">SSL ACTIVE</span>
        </div>
        <div className="flex justify-between items-center">
          <span>GEMINI CORE:</span>
          <span className="text-[#00f2ff] font-bold uppercase">ONLINE</span>
        </div>
        <div className="flex justify-between items-center">
          <span>SYSTEM SENSORS:</span>
          <span className="text-[#00ff9d] font-bold">5 RECEPTORS</span>
        </div>
      </div>
    </aside>
  );
}
