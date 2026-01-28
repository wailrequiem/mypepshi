import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingOptionProps {
  emoji: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}

export function OnboardingOption({
  emoji,
  label,
  selected,
  onClick,
  delay = 0,
}: OnboardingOptionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
        "bg-surface/50 border border-border/50 backdrop-blur-sm",
        selected && "border-primary/60 bg-primary/10 glow-accent-subtle"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <span className="text-foreground font-medium">{label}</span>
      </div>
      <motion.div
        initial={false}
        animate={{ 
          scale: selected ? 1 : 0.5, 
          opacity: selected ? 1 : 0 
        }}
        transition={{ duration: 0.2 }}
      >
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          selected ? "bg-primary" : "bg-secondary/50"
        )}>
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      </motion.div>
    </motion.button>
  );
}
