import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "dark" | "ghost";
  children: React.ReactNode;
  className?: string;
};

export const Button = ({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none";

  const variants = {
    primary: "bg-white text-black hover:bg-gray-100 px-6 py-2.5",
    outline:
      "border border-white/30 text-white hover:bg-white/10 px-5 py-2",
    dark: "bg-[#2a222a] text-white hover:bg-black px-6 py-2.5",
    ghost: "text-white hover:text-gray-300 px-4 py-2",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
