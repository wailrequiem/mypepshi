import { motion } from "framer-motion";
import { Bot, Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LockedPeptideCoachSectionProps {
  onUnlock: () => void;
}

const suggestedQuestions = [
  "What are peptides, in simple terms?",
  "Why were these peptides recommended to me?",
  "Are peptides risky?",
  "Peptides vs supplements?",
  "How can peptides support my goals?",
];

export const LockedPeptideCoachSection = ({ onUnlock }: LockedPeptideCoachSectionProps) => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Peptide AI Coach</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about peptides, optimization, and recovery.
        </p>
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium"
        >
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Available 24/7
        </motion.span>
      </div>

      {/* Locked Chat Container - with premium glow and copy protection */}
      <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden premium-glow no-copy">
        {/* Locked Badge */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border">
          <Lock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium">Locked</span>
        </div>

        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Peptide Coach</p>
            <p className="text-xs text-emerald-400">Online 24/7</p>
          </div>
        </div>

        {/* Blurred Messages Preview */}
        <div className="p-4 space-y-3 relative">
          {/* Simulated messages - blurred */}
          <div className="flex justify-end" style={{ filter: "blur(4px)", opacity: 0.6 }}>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-primary text-primary-foreground">
              <p className="text-sm">What peptides are best for skin?</p>
            </div>
          </div>
          
          <div className="flex justify-start" style={{ filter: "blur(4px)", opacity: 0.6 }}>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted/50 border border-border/50">
              <p className="text-sm">Based on your scan, BPC-157 would be excellent for your skin quality goals...</p>
            </div>
          </div>

          <div className="flex justify-end" style={{ filter: "blur(4px)", opacity: 0.6 }}>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-primary text-primary-foreground">
              <p className="text-sm">Are there any side effects?</p>
            </div>
          </div>

          <div className="flex justify-start" style={{ filter: "blur(4px)", opacity: 0.6 }}>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted/50 border border-border/50">
              <p className="text-sm">Generally well-tolerated when used responsibly...</p>
            </div>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent pointer-events-none" />
        </div>

        {/* Suggested Questions - Greyed out */}
        <div className="px-4 pb-3 relative">
          <p className="text-xs text-muted-foreground/60 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-1.5" style={{ filter: "blur(2px)", opacity: 0.5 }}>
            {suggestedQuestions.slice(0, 3).map((question) => (
              <span
                key={question}
                className="text-[10px] bg-muted/30 border border-border/50 rounded-lg px-2 py-1 text-muted-foreground"
              >
                {question}
              </span>
            ))}
          </div>
        </div>

        {/* Disabled Input Area */}
        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-2 bg-muted/20 rounded-xl p-1.5 opacity-50">
            <input
              type="text"
              placeholder="Ask a question about peptides…"
              disabled
              className="flex-1 bg-transparent px-3 py-2 text-sm text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none cursor-not-allowed"
            />
            <Button
              size="sm"
              disabled
              className="rounded-lg px-3 opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Lock Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border">
              Premium feature – unlock with subscription
            </span>
          </motion.div>
        </div>
      </div>

      {/* Unlock CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button 
          onClick={onUnlock}
          className="w-full py-3.5 px-6 rounded-2xl bg-primary/20 border border-primary text-primary font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Lock className="w-4 h-4" />
          Unlock the Peptide AI Coach
        </button>
      </motion.div>
    </div>
  );
};
