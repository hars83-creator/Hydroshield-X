/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import MaterialsDatabase from "./components/MaterialsDatabase";
import CoatingDesigner from "./components/CoatingDesigner";
import CorrosionSimulator from "./components/CorrosionSimulator";
import DropletLab from "./components/DropletLab";
import ElectrochemicalLab from "./components/ElectrochemicalLab";
import PcbDigitalTwin from "./components/PcbDigitalTwin";
import ThermalContaminationLab from "./components/ThermalContaminationLab";
import SaltFogChamber from "./components/SaltFogChamber";
import SelfHealingLab from "./components/SelfHealingLab";
import AiDiscoveryCenter from "./components/AiDiscoveryCenter";
import MonteCarloLab from "./components/MonteCarloLab";
import SensorsHub from "./components/SensorsHub";
import ReportsCenter from "./components/ReportsCenter";
import AiAssistant from "./components/AiAssistant";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentTab, setCurrentTab] = useState("dashboard");

  if (!isUnlocked) {
    return <LandingPage onLaunch={() => setIsUnlocked(true)} />;
  }

  // Active View router
  const renderActiveView = () => {
    switch (currentTab) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentTab} />;
      case "materials":
        return <MaterialsDatabase />;
      case "coating-designer":
        return <CoatingDesigner />;
      case "simulator":
        return <CorrosionSimulator />;
      case "droplet-lab":
        return <DropletLab />;
      case "electrochemistry":
        return <ElectrochemicalLab />;
      case "digital-twin":
        return <PcbDigitalTwin />;
      case "thermal":
      case "contamination":
        return <ThermalContaminationLab />;
      case "salt-fog":
        return <SaltFogChamber />;
      case "self-healing":
        return <SelfHealingLab />;
      case "ai-lab":
      case "material-discovery":
        return <AiDiscoveryCenter />;
      case "reliability":
        return <MonteCarloLab />;
      case "sensors":
        return <SensorsHub />;
      case "reports":
        return <ReportsCenter />;
      case "assistant":
        return <AiAssistant />;
      case "admin":
        return <AdminPanel />;
      default:
        return <Dashboard onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="flex bg-[#05070a] text-[#e0e6ed] min-h-screen font-sans select-none overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} isUnlocked={isUnlocked} />

      {/* Main Workstation frame */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header bar */}
        <Header />

        {/* Current Active view layout container */}
        <main className="flex-1 overflow-hidden relative bg-[#05070a]">
          {/* Subtle grid backdrop for active views */}
          <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none z-0" />
          <div className="relative z-10 h-full w-full">
            {renderActiveView()}
          </div>
        </main>

        {/* Technical Footer Toolbar */}
        <footer className="h-7 bg-[#00f2ff] text-[#05070a] px-4 flex items-center justify-between shrink-0 font-mono text-[9px] font-bold select-none z-20">
          <div className="flex gap-4 items-center">
            <div className="font-mono uppercase tracking-tighter">OPERATOR: singhashutosh39463@gmail.com</div>
            <div className="h-3 w-px bg-[#05070a]/20"></div>
            <div className="font-bold uppercase tracking-tighter">PROJECT: HYDROSHIELD-X_ORION_MAIN</div>
            <div className="h-3 w-px bg-[#05070a]/20"></div>
            <div className="font-bold text-[#0066ff]">SECURE MODE: ACTIVE</div>
          </div>
          <div className="flex gap-4">
            <span>GMT-TIME: 05:27:49</span>
            <span>COORD: 37.7749° N, 122.4194° W</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
