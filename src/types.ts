/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Material {
  id: string;
  name: string;
  formula?: string;
  category: "carbon" | "polymer" | "oxide" | "ceramic" | "custom";
  density: number; // g/cm³
  conductivity: number; // S/m (electrical)
  contactAngle: number; // degrees
  slidingAngle: number; // degrees
  thermalConductivity: number; // W/m·K
  cost: number; // $/kg
  surfaceEnergy: number; // mN/m
  uvResistance: number; // index 1-10
  corrosionResistance: number; // protection premium index 1-10
  moisturePermeability: number; // g/m²·day (WVTR)
  adhesionStrength: number; // MPa
  description: string;
  references: string[];
}

export interface CoatingLayer {
  id: string;
  materialId: string;
  materialName: string;
  thickness: number; // microns
  order: number;
}

export interface SimulationParams {
  temperature: number; // °C
  humidity: number; // % RH
  saltConcentration: number; // % NaCl
  pollutionLevel: number; // SO2 ppm
  dustDensity: number; // µg/cm²
  exposureDuration: number; // hours
  corrosionType: "uniform" | "pitting" | "galvanic" | "crevice" | "atmospheric";
}

export interface SimulationResults {
  corrosionRate: number; // mm/year
  materialLoss: number; // mg/cm²
  protectionEfficiency: number; // %
  remainingLife: number; // years
  failureProbability: number; // %
  kineticsData: { time: number; currentDensity: number; layerThicknessLoss: number }[];
  heatmap: number[][]; // 2D corrosion damage map grid
}

export interface ElectrochemicalParams {
  eqPotential: number; // V vs SHE
  exchangeCurrent: number; // A/cm²
  tafelAnodic: number; // V/dec
  tafelCathodic: number; // V/dec
  solutionResistance: number; // ohm/cm²
  chargeTransferResistance: number; // ohm/cm²
  doubleLayerCapacitance: number; // µF/cm²
}

export interface SelfHealingMetrics {
  scratchDepth: number; // microns
  efficiency: number; // %
  healedPercentage: number; // %
  healingTime: number; // minutes
}

export interface SensorReading {
  id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  naclPpm: number;
  vibration: number;
  leakageCurrent: number; // nA
  node: string;
}

export interface PcbComponent {
  id: string;
  name: string;
  type: "CPU" | "GPU" | "VRM" | "Connector" | "Capacitor" | "Trace";
  x: number; // grid position x
  y: number; // grid position y
  radius: number; // click/containment range
  tempMax: number; // power rating thermals
  corrosionRisk: "Low" | "Medium" | "High" | "Critical";
  shielded: boolean;
}

export interface AiPredictionExplanation {
  features: { name: string; importance: number; direction: "increase" | "decrease" }[];
  confidence: number;
  alternativeMaterials: { name: string; estimatedLifetime: number; costSavings: number }[];
}

export interface DiscoveryTarget {
  maxCost: number;
  minTemp: number;
  maxHumid: number;
  minLifetime: number;
}
