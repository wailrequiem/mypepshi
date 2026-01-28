import { motion } from "framer-motion";
import { ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingHeaderProps {
  current: number;
  total: number;
  onBack?: () => void;
  showBack?: boolean;
  onLoginClick?: () => void;
}

export function OnboardingHeader({ 
  current, 
  total, 
  onBack,
  showBack = true,
  onLoginClick
}: OnboardingHeaderProps) {
  const progress = (current / total) * 100;

  return (
    <div className="flex items-center gap-3 mb-6">
      {showBack && onBack && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface/50 border border-border/50 backdrop-blur-sm transition-colors hover:bg-surface/80"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
      )}
      <div className="flex-1 h-1 bg-secondary/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
        />
      </div>
      {onLoginClick && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={onLoginClick}
            variant="ghost"
            size="sm"
            className="gap-2 text-sm"
          >
            <LogIn className="w-4 h-4" />
            Log in
          </Button>
        </motion.div>
      )}
    </div>
  );
}
