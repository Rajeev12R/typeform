import React from "react";
import { Button } from "./Button";

export const IntelligentForms = () => {
  return (
    <section className="bg-white text-black py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        <div className="max-w-md">
          <p className="text-xs font-bold tracking-widest text-purple-600 mb-6 uppercase">
            Intelligent Forms
          </p>
          <h2 className="font-sans font-medium text-4xl md:text-5xl leading-tight mb-6">
            Build forms at the<br />drop of a prompt
          </h2>
          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            With over 48 million responses collected monthly, Typeform AI builds best-in-class forms proven to get 3.5x more data. Brand easily, customize everything.
          </p>
          <Button variant="dark" className="rounded-xl px-8 py-4">
            Explore forms
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p>
              <img 
                src="https://embed-ssl.wistia.com/deliveries/3ce6492bb373ab517648865770cd51ee7c0fc803.jpg?image_play_button_size=2x&image_crop_resized=960x673&image_play_button_rounded=1&image_play_button_color=262627e0" 
                width={600} 
                height={420} 
                style={{ width: "100%", maxWidth: "600px", height: "auto" }}
                alt="Video Thumbnail"
                className="rounded-2xl shadow-xl hover:opacity-95 transition-opacity"
              />
          </p>
          <p className="mt-4">
            <a href="https://www.typeform.com?wvideo=jmjt5sn622" className="text-sm text-gray-500 hover:underline">
              Forms & Automated Workflows, Powered by AI | Typeform
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
