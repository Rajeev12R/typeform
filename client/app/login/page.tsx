"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "../components/Badge";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      subtitle: "Automate workflows",
      title: "Use AI to spot patterns and trigger follow-ups",
      image: "https://public-assets.typeform.com/public/auth-page/carousel/automations-v2.webp"
    },
    {
      subtitle: "Build forms with AI",
      title: "Let AI write the questions for you",
      image: "https://public-assets.typeform.com/public/auth-page/carousel/typeform-ai-v2.webp"
    },
    {
      subtitle: "Manage contacts",
      title: "Keep track of all your customer data in one place",
      image: "https://public-assets.typeform.com/public/auth-page/carousel/contacts-v2.webp"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      <header className="flex items-center justify-between px-8 py-6 w-full shrink-0">
        <Link href="/" className="flex items-center space-x-2 text-black cursor-pointer">
          <div className="flex items-center space-x-[0.75px]">
            <div className="w-2 h-5 bg-black rounded-full"></div>
            <div className="w-7 h-5 bg-black rounded-lg"></div>
          </div>
          <span className="text-2xl font-medium tracking-tight">Typeform</span>
        </Link>

        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div>
            Have a question? <a href="#" className="underline hover:text-black">Contact us</a>
          </div>
          <button className="flex items-center space-x-1 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors bg-white text-gray-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>English</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </header>

      <main className="grow flex flex-col md:flex-row w-full h-[calc(100vh-80px)]">
        
        <div className="w-full md:w-1/2 flex flex-col px-8 overflow-y-auto">
          <div className="grow flex flex-col items-center justify-center max-w-sm mx-auto w-full py-12">
            <div className="w-full">
              <h1 className="text-3xl font-medium mb-3 text-gray-900">Log in</h1>
              <p className="text-gray-500 mb-8 text-[15px]">
                Build forms, gather responses, and automate your workflows.
              </p>

              <div className="space-y-3 mb-6">
                <button className="w-full flex items-center justify-center space-x-3 border border-gray-300 rounded-lg py-2.5 px-4 hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="font-medium text-gray-700 text-[15px]">Continue with Google</span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 uppercase">Coming soon</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-3 border border-gray-300 rounded-lg py-2.5 px-4 hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 21 21">
                    <path fill="#f25022" d="M1 1h9v9H1z" />
                    <path fill="#00a4ef" d="M1 11h9v9H1z" />
                    <path fill="#7fba00" d="M11 1h9v9h-9z" />
                    <path fill="#ffb900" d="M11 11h9v9h-9z" />
                  </svg>
                  <span className="font-medium text-gray-700 text-[15px]">Continue with Microsoft</span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 uppercase">Coming soon</span>
                </button>
              </div>

              <form 
                className="flex flex-col mb-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!email) return;
                  setIsLoggingIn(true);
                  try {
                    await login(email);
                    router.push("/");
                  } catch (err: any) {
                    alert(err.message || "Failed to log in");
                    setIsLoggingIn(false);
                  }
                }}
              >
                <label className="text-[13px] text-gray-700 mb-1.5" htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full border text-gray-700 border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:border-black transition-colors placeholder:text-gray-400 mb-4 text-[15px]"
                  required
                />
                <button 
                  type="submit" 
                  disabled={isLoggingIn}
                  className="w-full bg-[#191919] text-white rounded-lg py-3 font-medium text-[15px] hover:bg-black transition-colors disabled:opacity-70"
                >
                  {isLoggingIn ? "Logging in..." : "Continue with email"}
                </button>
              </form>

              <div className="text-center mb-8">
                <a href="#" className="text-[13px] text-gray-600 underline hover:text-black transition-colors">Log in with SSO</a>
              </div>
              
              <div className="h-px w-full bg-gray-100 mb-8"></div>
              
              <p className="text-center text-[13px] text-gray-500">
                Don't have an account? <a href="#" className="text-black underline font-medium hover:text-gray-700">Sign up</a>
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-[#2a222a] text-white flex flex-col p-8 rounded-tl-3xl">
          <div className="grow flex flex-col items-center justify-center max-w-xl mx-auto w-full relative z-10 h-full">
            <h2 className="text-[22px] leading-snug font-medium text-center mb-12 text-white/90">
              Continue exploring powerful features<br />that make data collection effortless
            </h2>
            
            <div className="w-full grow max-h-100 border border-white/10 rounded-2xl bg-[#1e1720] shadow-2xl overflow-hidden relative flex flex-col p-8 transition-opacity duration-500">
              <div className="text-center mb-8 relative z-20">
                <p className="text-sm text-gray-300 mb-2">{slides[currentSlide].subtitle}</p>
                <h3 className="text-xl font-medium">{slides[currentSlide].title}</h3>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full h-[70%] bg-linear-to-t from-purple-500/40 to-transparent"></div>
              
              <div className="relative z-20 grow flex items-center justify-center w-full min-h-62.5">
                {slides.map((slide, index) => (
                  <img
                    key={index}
                    src={slide.image}
                    alt={slide.title}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
                      currentSlide === index ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-8">
              <button 
                onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
                className="p-1 text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
                </svg>
              </button>
              
              <button className="p-1 text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>

              <div className="flex space-x-2 px-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentSlide === index ? "bg-white" : "bg-gray-600 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={() => setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))}
                className="p-1 text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
