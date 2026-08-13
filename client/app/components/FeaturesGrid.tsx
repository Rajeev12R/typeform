import React from "react";

export const FeaturesGrid = () => {
  return (
    <section className="bg-white text-black pb-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="shrink-0 w-12 h-12 bg-[#2a222a] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-3">High Response Rate</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Build forms people actually fill out with beautiful design and conversational logic that adapts to every response, doubling the completion rate vs. traditional forms.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="shrink-0 w-12 h-12 bg-[#2a222a] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-3">Deeper Insights</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Get rich answers with video and audio responses, plus extra context from AI-generated follow-up questions that adapt as people complete your form.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="shrink-0 w-12 h-12 bg-[#2a222a] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-3">Advanced Analytics</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Dig into both qualitative and quantitative data with topic and sentiment analysis, respondent comparison, and form drop-off analysis.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
