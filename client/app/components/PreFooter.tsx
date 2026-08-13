import React from "react";
import { Button } from "./Button";

export const PreFooter = () => {
  return (
    <section className="bg-[#2a222a] text-white pt-32 pb-40 px-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-100 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-500/30 via-purple-900/10 to-transparent pointer-events-none"></div>
      
      <h2 className="font-serif text-5xl md:text-[5.5rem] leading-[1.1] mb-12 relative z-10 max-w-7xl tracking-tight">
        AI forms and automation.<br />All in Typeform.
      </h2>
      
      <Button variant="primary" className="relative z-10 text-base px-8 py-4 font-medium rounded-xl hover:scale-105 transition-transform duration-300 shadow-xl">
        Get started—it's free
      </Button>
    </section>
  );
};
