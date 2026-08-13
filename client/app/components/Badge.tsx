import React from "react";

export const Badge = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="ml-3 inline-flex items-center rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
      {children}
    </span>
  );
};
