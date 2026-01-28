import { motion } from "framer-motion";

interface OnboardingProgressProps {
  current: number;
  total: number;
}

export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
  const progress = (current / total) * 100;

  return (
    <div className="w-full h-1 bg-secondary/30 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
      />
    </div>
  );
}
