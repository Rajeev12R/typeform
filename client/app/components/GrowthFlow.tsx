import React from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";

export const GrowthFlow = () => {
  return (
    <section className="bg-[#2a222a] text-white pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif text-5xl md:text-7xl leading-tight text-center mb-24 max-w-4xl mx-auto">
          When the form ends,<br />the flow begins...
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="w-full flex items-center justify-center">
            <img 
              src="https://cdn.prod.website-files.com/66ffe2174aa8e8d5661c2708/69fdd20bf615dbbe71a60f87_f473b127a36072867cb0ab6ee1b76734_Growth%20FLOW.avif" 
              loading="eager" 
              alt="Growth Flow" 
              sizes="100vw" 
              srcSet="https://cdn.prod.website-files.com/66ffe2174aa8e8d5661c2708/69fdd20bf615dbbe71a60f87_f473b127a36072867cb0ab6ee1b76734_Growth%20FLOW-p-500.avif 500w, https://cdn.prod.website-files.com/66ffe2174aa8e8d5661c2708/69fdd20bf615dbbe71a60f87_f473b127a36072867cb0ab6ee1b76734_Growth%20FLOW-p-800.avif 800w, https://cdn.prod.website-files.com/66ffe2174aa8e8d5661c2708/69fdd20bf615dbbe71a60f87_f473b127a36072867cb0ab6ee1b76734_Growth%20FLOW-p-1080.avif 1080w, https://cdn.prod.website-files.com/66ffe2174aa8e8d5661c2708/69fdd20bf615dbbe71a60f87_f473b127a36072867cb0ab6ee1b76734_Growth%20FLOW.avif 1354w" 
              className="media-slot_poster w-full h-auto rounded-4xl shadow-2xl"
            />
          </div>
          
          <div className="max-w-md pl-4">
            <p className="text-xs font-bold tracking-widest text-gray-400 mb-6 flex items-center">
              GROWTH FLOW
              <Badge>NEW</Badge>
            </p>
            <h3 className="font-sans font-medium text-4xl md:text-5xl leading-tight mb-6">
              Be proactive with customer data
            </h3>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Set up automations that convert and keep customers for you. As opportunities arise, Growth Flow steps in to enrich leads, create segments, and send personalized messages.
            </p>
            <Button variant="primary" className="rounded-xl px-8 py-4">
              Explore Growth Flow
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
};
