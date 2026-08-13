import React from "react";
import Link from "next/link";
import { Button } from "./Button";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#2a222a]">
      <div className="flex items-center space-x-12">
        <div className="flex items-center text-white space-x-2">
          <div className="flex items-center space-x-[0.75px]">
            <div className="w-2 h-5 bg-white rounded-full"></div>
            <div className="w-7 h-5 bg-white rounded-lg"></div>
          </div>
          <span className="text-xl font-medium tracking-tight">Typeform</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
          <a href="#" className="flex items-center hover:text-white transition-colors">
            Platform
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <a href="#" className="flex items-center hover:text-white transition-colors">
            Solutions
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <a href="#" className="flex items-center hover:text-white transition-colors">
            Resources
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <Link href="/login">
          <Button variant="ghost" className="text-sm">Log in</Button>
        </Link>
        <Button variant="outline" className="text-sm font-normal border-gray-600 hover:bg-gray-800">Contact sales</Button>
        <Link href="/login">
          <Button variant="primary" className="text-sm font-medium">Sign up</Button>
        </Link>
      </div>
    </header>
  );
};
