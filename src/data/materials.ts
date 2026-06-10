/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Material } from "../types";

export const materialsCollection: Material[] = [
  {
    id: "graphene",
    name: "Monolayer Graphene",
    formula: "C",
    category: "carbon",
    density: 2.26,
    conductivity: 1e8, // Ultra-conductive 2D crystal
    contactAngle: 127.0, // High intrinsic contact angle
    slidingAngle: 15.0,
    thermalConductivity: 5300.0, // Highest thermal conductivity known
    cost: 450.0,
    surfaceEnergy: 46.7,
    uvResistance: 10,
    corrosionResistance: 9,
    moisturePermeability: 0.0001, // Extremely tight gas barrier (impermeable as monolayer)
    adhesionStrength: 1.2, // Moderate adhesion to Cu/Ni without interfaces
    description: "Atomically thin carbon sheet serving as an absolute molecular barrier. It stops all gas and damp infiltration but must be perfectly continuous to avoid galvanic corrosion hotspots.",
    references: [
      "Geim, A. K., & Novoselov, K. S. (2007). The rise of graphene. Nature Materials, 6(3), 183-191.",
      "Prasai, D., et al. (2012). Graphene: Can it protect metals from corrosion?. ACS Nano, 6(2), 1102-1108."
    ]
  },
  {
    id: "graphene-oxide",
    name: "Graphene Oxide (GO)",
    formula: "C_xO_yH_z",
    category: "carbon",
    density: 1.8,
    conductivity: 1.2, // Semi-insulating due to sp3 functional groups
    contactAngle: 65.0, // Hydrophilic due to hydroxyls/epoxides unless reduced
    slidingAngle: 45.0,
    thermalConductivity: 200.0,
    cost: 150.0,
    surfaceEnergy: 62.1,
    uvResistance: 9,
    corrosionResistance: 7,
    moisturePermeability: 0.05,
    adhesionStrength: 3.5, // Superior adhesion thanks to organic functional binds
    description: "Functionalized derivative of graphene with oxygen groups. Strongly hydrophilic but forms high-strength layered nano-composite crosslinks with other polymeric resins.",
    references: [
      "Dikin, D. A., et al. (2007). Preparation and characterization of graphene oxide paper. Nature, 448(7152), 457-460."
    ]
  },
  {
    id: "pdms",
    name: "Polydimethylsiloxane (PDMS)",
    formula: "C2H6OSi",
    category: "polymer",
    density: 0.97,
    conductivity: 1e-13, // Perfect insulator
    contactAngle: 115.0, // Highly hydrophobic
    slidingAngle: 8.0, // Low roll-off sliding angle (slippery)
    thermalConductivity: 0.15,
    cost: 25.0,
    surfaceEnergy: 20.4,
    uvResistance: 8,
    corrosionResistance: 8,
    moisturePermeability: 2.3, // Respectable hydrophobicity but elevated gas permeability
    adhesionStrength: 1.8,
    description: "Silicon-based organic polymer. Exceptionally hydrophobic, easy to deposit, highly flexible and biochemically inert, but permeable to organic vapors.",
    references: [
      "McDonald, J. C., et al. (2000). Fabrication of microfluidic systems in poly(dimethylsiloxane). Electrophoresis."
    ]
  },
  {
    id: "sio2",
    name: "Silicon Dioxide (SiO₂)",
    formula: "SiO₂",
    category: "oxide",
    density: 2.65,
    conductivity: 1e-15,
    contactAngle: 40.0, // Hydrophilic but chemically treated easily for superhydrophobicity
    slidingAngle: 35.0,
    thermalConductivity: 1.3,
    cost: 12.0,
    surfaceEnergy: 50.0,
    uvResistance: 10,
    corrosionResistance: 7,
    moisturePermeability: 0.001, // Excellent moisture seal
    adhesionStrength: 12.5, // Outstanding ceramic adhesion bond
    description: "Inorganic quartz matrix. Provides exceptional wear protection, scratch resistance, and barrier properties, forming a robust sub-layer for surficial organic silanes.",
    references: [
      "Iler, R. K. (1979). The Chemistry of Silica. Wiley-Interscience."
    ]
  },
  {
    id: "tio2",
    name: "Titanium Dioxide (TiO₂)",
    formula: "TiO₂",
    category: "oxide",
    density: 4.23,
    conductivity: 1e-11,
    contactAngle: 10.0, // Superhydrophilic under UV due to photo-excitation
    slidingAngle: 50.0,
    thermalConductivity: 8.5,
    cost: 15.0,
    surfaceEnergy: 75.0,
    uvResistance: 10,
    corrosionResistance: 9,
    moisturePermeability: 0.0005,
    adhesionStrength: 14.2,
    description: "Photocatalytic oxide crystal. Undergoes UV-induced organic self-cleaning, and serves as an exceptional electron and molecular passivation layer against chemical attack.",
    references: [
      "Fujishima, A., & Honda, K. (1972). Electrochemical photolysis of water at a semiconductor electrode. Nature."
    ]
  },
  {
    id: "zno",
    name: "Zinc Oxide (ZnO)",
    formula: "ZnO",
    category: "oxide",
    density: 5.61,
    conductivity: 1e-4,
    contactAngle: 95.0,
    slidingAngle: 25.0,
    thermalConductivity: 50.0,
    cost: 8.0,
    surfaceEnergy: 45.0,
    uvResistance: 9,
    corrosionResistance: 6,
    moisturePermeability: 0.005,
    adhesionStrength: 8.0,
    description: "Semiconductor oxide which can trigger high surface roughness (nanowires) to secure Cassie-Baxter states, achieving extreme mock-superhydrophobicity.",
    references: []
  },
  {
    id: "parylene",
    name: "Parylene C",
    formula: "[C₈H₇Cl]n",
    category: "polymer",
    density: 1.29,
    conductivity: 1e-14, // Outstanding conformal dielectric
    contactAngle: 92.0,
    slidingAngle: 30.0,
    thermalConductivity: 0.082,
    cost: 120.0,
    surfaceEnergy: 34.0,
    uvResistance: 6,
    corrosionResistance: 10, // Perfect pinhole-free conformity
    moisturePermeability: 0.002,
    adhesionStrength: 5.5,
    description: "Vapor-deposited polymer creating completely pinhole-free coatings on miniature PCB components. It provides unmatched barrier insulation against salt mist and moisture immersion.",
    references: [
      "ビーチ, W. F., et al. (1989). Parylene Conformal Coatings. Kirk-Othmer Encyclopedia of Chemical Technology."
    ]
  },
  {
    id: "epoxy",
    name: "Fluorinated Epoxy Resin",
    formula: "C_nF_mH_o",
    category: "polymer",
    density: 1.25,
    conductivity: 1e-15,
    contactAngle: 105.0,
    slidingAngle: 20.0,
    thermalConductivity: 0.25,
    cost: 18.0,
    surfaceEnergy: 24.5,
    uvResistance: 7,
    corrosionResistance: 8,
    moisturePermeability: 0.04,
    adhesionStrength: 18.0, // Incredibly robust bonding
    description: "Standard matrix engineering resin enriched with fluorocarbon nodes. Offers superior cohesive stickiness to metals while reducing water permeability.",
    references: []
  },
  {
    id: "mxene",
    name: "Ti₃C₂Tₓ MXene Nano-Sheets",
    formula: "Ti₃C₂Tₓ",
    category: "ceramic",
    density: 4.1,
    conductivity: 1.5e5, // Metal-like electrical conductivity
    contactAngle: 55.0, // Hydrophilic sheets
    slidingAngle: 55.0,
    thermalConductivity: 38.0,
    cost: 380.0,
    surfaceEnergy: 65.0,
    uvResistance: 9,
    corrosionResistance: 7,
    moisturePermeability: 0.01,
    adhesionStrength: 4.8,
    description: "Two-dimensional transition metal carbide. Delivers metallic electrical conductivity with outstanding shielding against EMI, and acts as a dynamic electrochemical modifier.",
    references: [
      "Naguib, M., et al. (2011). Two-dimensional transition metal carbides. Advanced Materials, 23(37), 4248-4253."
    ]
  },
  {
    id: "ceramics",
    name: "Hydrophobic Alumina (Al₂O₃)",
    formula: "Al₂O₃",
    category: "ceramic",
    density: 3.95,
    conductivity: 1e-16,
    contactAngle: 145.0, // Structured Alumina surface treated with fluoro-silanes
    slidingAngle: 5.0, // Extreme roll-off
    thermalConductivity: 30.0,
    cost: 35.0,
    surfaceEnergy: 12.0,
    uvResistance: 10,
    corrosionResistance: 10, // Incredible corrosion resistance
    moisturePermeability: 0.0001,
    adhesionStrength: 15.0,
    description: "Micro-structured ultra-hard ceramic film functionalized with perfluoroalkyl trichlorosilanes. Boasts superhydrophobic roll-off behaviors with physical scratch robustness.",
    references: []
  },
  {
    id: "custom",
    name: "Self-Healing Silane Matrix",
    formula: "SiO-R-NH2",
    category: "custom",
    density: 1.15,
    conductivity: 1e-12,
    contactAngle: 102.0,
    slidingAngle: 12.0,
    thermalConductivity: 0.18,
    cost: 85.0,
    surfaceEnergy: 22.0,
    uvResistance: 8,
    corrosionResistance: 8,
    moisturePermeability: 0.08,
    adhesionStrength: 6.2,
    description: "Hybrid organosilane polymer embedding microcapsules of linseed oil/polydimethylsiloxane oils. Surface scratches trigger shell rupture, restoring hydrophobicity automatically.",
    references: [
      "White, S. R., et al. (2001). Autonomic healing of polymer composites. Nature, 409(6822), 794-797."
    ]
  }
];
