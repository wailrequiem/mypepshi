import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  disabled?: boolean;
}

export function PrimaryButton({
  children,
  onClick,
  className,
  variant = "default",
  disabled = false,
}: PrimaryButtonProps) {
  const baseStyles = "w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2";
  
  const variants = {
    default: "bg-primary text-primary-foreground glow-accent-subtle hover:glow-accent",
    outline: "bg-transparent border border-border text-foreground hover:bg-secondary",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], disabled && "opacity-50 cursor-not-allowed", className)}
    >
      {children}
    </motion.button>
  );
}
