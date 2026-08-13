import React from "react";
import Link from "next/link";
import { Button } from "./Button";

export const Hero = () => {
  return (
    <section className="bg-[#2a222a] pt-24 pb-16 px-6 text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <p className="text-xs font-bold tracking-widest text-pink-200 mb-6 uppercase">
          AI Forms & Automation
        </p>
        
        <h1 className="font-serif text-5xl md:text-7xl leading-tight mb-8">
          Your favorite forms.<br />
          Now with AI automation.
        </h1>
        
        <p className="text-gray-300 text-lg md:text-xl max-w-3xl mb-12 leading-relaxed">
          Combine AI forms and automated workflows to drive revenue growth. Run in-depth
          research and manage the entire customer lifecycle. All in Typeform.
        </p>
        
        <Link href="/login">
          <Button variant="primary" className="text-base px-8 py-3.5">
            Get started—it's free
          </Button>
        </Link>
      </div>
    </section>
  );
};
