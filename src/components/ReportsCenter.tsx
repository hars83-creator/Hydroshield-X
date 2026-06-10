/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Download, Copy, CheckCircle, FileText, Info, Layers } from "lucide-react";

export default function ReportsCenter() {
  const [copiedCode, setCopiedCode] = useState(false);

  const latexCode = `\\documentclass[journal]{IEEEtran}
\\usepackage{graphicx}
\\usepackage{amsmath}

\\begin{document}
\\title{HYDROSHIELD-X Multiphysics Performance Analysis: Conformal Graphene Protective Barriers}
\\author{Principal Materials Reliability Specialist}
\\maketitle

\\begin{abstract}
This dossier details accelerated simulation metrics of atomic graphene and conformal resin barrier protections over metal routing traces.
\\end{abstract}

\\section{Introduction}
Conformal coating designs suppress electrolytic ion migration currents. Superhydrophobic coatings yield significant sliding contact angle thresholds.
\\end{document}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(latexCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-4rem)] text-slate-200 font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Automated Report Compiler
          </h2>
          <p className="text-slate-400 mt-1">
            LaTeX SPECIFICATION COMPILER · FORMAL LAB JOURNAL LOGS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column info page. Col span 5 */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest pb-1.5 border-b border-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              Report Metrics Context
            </h3>

            <div className="space-y-3 leading-relaxed text-slate-400">
              <p>
                Our report compiler extracts simulation parameters, Butler-Volmer Nyquist loops, and thermal gradients directly into professional formats.
              </p>
              <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2">
                <div className="text-[9px] text-slate-500 uppercase font-bold">Standard Document Specifiers:</div>
                <ul className="space-y-1 text-[9.5px]">
                  <li>• IEEE Transaction formatting template</li>
                  <li>• Latex coordinate structures (*.tex)</li>
                  <li>• Automated physical constant tables</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:text-slate-100 font-bold rounded flex items-center justify-center gap-1.5 text-xs text-slate-300"
              >
                {copiedCode ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? "COPIED LaTeX" : "COPY LaTeX"}
              </button>

              <button
                onClick={() => alert("Report compiled: downloading HYDROSHIELD_X_Spec_Report.pdf")}
                className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded flex items-center justify-center gap-1.5 text-xs hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                <Download className="w-4 h-4 text-slate-950" />
                DOWNLOAD PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right column compiler raw viewer. Col span 7 */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 space-y-3">
             <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest pb-1.5 border-b border-slate-800">
              Compiled LaTeX Specification Code Preview
            </h3>

            <pre className="p-4 bg-slate-950 border border-slate-850 rounded-lg text-slate-300 text-[10px] leading-relaxed overflow-x-auto h-72 block select-all">
              {latexCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
