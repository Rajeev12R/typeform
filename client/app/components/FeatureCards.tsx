import React from "react";
import { Badge } from "./Badge";

export const FeatureCards = () => {
  return (
    <section className="bg-[#2a222a] px-6 pb-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group bg-[#2a242b] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-xl p-8 border border-white/5 overflow-hidden transition-all hover:border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-linear-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-xs font-semibold tracking-wider text-gray-400 mb-4">ASK</p>
          <h3 className="text-2xl font-medium mb-3">Intelligent Forms</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Build forms that adapt to every respondent and then analyze your data for rich insights.
          </p>
        </div>
        <div className="relative group bg-[#2a242b] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-xl p-8 border border-white/5 transition-all hover:border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <p className="text-xs font-semibold tracking-wider text-gray-400 mb-4">ACT</p>
          <h3 className="text-2xl font-medium mb-3 flex items-center">
            Growth Flow
            <Badge>NEW</Badge>
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Convert and keep customers with automated AI segmentation and follow-ups.
          </p>
        </div>
        <div className="relative group bg-[#2a242b] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] rounded-xl p-8 border border-white/5 transition-all hover:border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <p className="text-xs font-semibold tracking-wider text-gray-400 mb-4">LEARN</p>
          <h3 className="text-2xl font-medium mb-3 flex items-center">
            Research Flow
            <Badge>NEW</Badge>
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Make confident business decisions fast with AI-moderated studies and automated reports.
          </p>
        </div>
      </div>
    </section>
  );
};
