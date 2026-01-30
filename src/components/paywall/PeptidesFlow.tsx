import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, ChevronRight, Pill, Lock, Zap, Moon, Dumbbell, Droplets, Heart } from "lucide-react";

interface PeptidesFlowProps {
  isOpen: boolean;
  onClose: () => void;
  gender?: "man" | "woman" | null;
}

type FlowStep = "usage" | "current-peptides" | "goals" | "preview" | "paywall";

interface GoalOption {
  id: string;
  label: string;
  icon: React.ElementType;
}

const goalOptions: GoalOption[] = [
  { id: "skin", label: "Improve skin quality", icon: Droplets },
  { id: "lean", label: "Get leaner / dry out", icon: Droplets },
  { id: "muscle", label: "Build more muscle", icon: Dumbbell },
  { id: "recovery", label: "Improve recovery", icon: Zap },
  { id: "sleep", label: "Improve sleep & well-being", icon: Moon },
  { id: "glow", label: "General glow up", icon: Heart },
];

export function PeptidesFlow({ isOpen, onClose, gender }: PeptidesFlowProps) {
  const [step, setStep] = useState<FlowStep>("usage");
  const [usesPeptides, setUsesPeptides] = useState<boolean | null>(null);
  const [currentPeptides, setCurrentPeptides] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const handleUsageResponse = (uses: boolean) => {
    setUsesPeptides(uses);
    if (uses) {
      setStep("current-peptides");
    } else {
      setStep("goals");
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinueFromPeptides = () => {
    setStep("preview");
  };

  const handleContinueFromGoals = () => {
    if (selectedGoals.length > 0) {
      setStep("preview");
    }
  };

  const handleUnlock = () => {
    setStep("paywall");
  };

  const handleClose = () => {
    setStep("usage");
    setUsesPeptides(null);
    setCurrentPeptides("");
    setDosage("");
    setFrequency("");
    setSelectedGoals([]);
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case "usage":
        return (
          <motion.div
            key="usage"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col justify-center px-5"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center mx-auto mb-4"
              >
                <Pill className="w-7 h-7 text-primary-foreground" />
              </motion.div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Peptide Insights
              </h2>
              <p className="text-sm text-muted-foreground">
                Let's personalize your recommendations
              </p>
            </div>

            <p className="text-base font-medium text-foreground text-center mb-6">
              Do you currently use peptides?
            </p>

            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUsageResponse(true)}
                className="w-full py-4 px-6 rounded-2xl glass border border-border text-foreground font-medium text-base transition-all hover:bg-primary/10 hover:border-primary/50"
              >
                Yes, I currently use peptides
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleUsageResponse(false)}
                className="w-full py-4 px-6 rounded-2xl glass border border-border text-foreground font-medium text-base transition-all hover:bg-primary/10 hover:border-primary/50"
              >
                No, I'm new to peptides
              </motion.button>
            </div>
          </motion.div>
        );

      case "current-peptides":
        return (
          <motion.div
            key="current-peptides"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-5 py-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Your Current Peptides
              </h2>
              <p className="text-sm text-muted-foreground">
                Help us understand your experience
              </p>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                  Which peptides are you using?
                </label>
                <input
                  type="text"
                  value={currentPeptides}
                  onChange={(e) => setCurrentPeptides(e.target.value)}
                  placeholder="e.g., BPC-157, TB-500..."
                  className="w-full py-3 px-4 rounded-xl glass border border-border bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                  What dosage are you taking?
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g., 250mcg..."
                  className="w-full py-3 px-4 rounded-xl glass border border-border bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                  How often do you take them?
                </label>
                <input
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="e.g., Daily, Twice daily..."
                  className="w-full py-3 px-4 rounded-xl glass border border-border bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleContinueFromPeptides}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 mt-4"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        );

      case "goals":
        return (
          <motion.div
            key="goals"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-5 py-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">
                What would you like to improve?
              </h2>
              <p className="text-sm text-muted-foreground">
                Select all that apply
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 flex-1">
              {goalOptions.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <motion.button
                    key={goal.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? "bg-primary/20 border-2 border-primary"
                        : "glass border border-border hover:border-primary/30"
                    }`}
                  >
                    <goal.icon
                      className={`w-6 h-6 ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium text-center ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {goal.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleContinueFromGoals}
              disabled={selectedGoals.length === 0}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 mt-4 transition-all ${
                selectedGoals.length > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        );

      case "preview":
        return (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-5 py-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Your Personalized Insights
              </h2>
              <p className="text-sm text-muted-foreground">
                Based on your profile and goals
              </p>
            </div>

            {/* Preview Cards (Locked/Blurred) */}
            <div className="space-y-3 flex-1 relative">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative glass rounded-xl p-4 overflow-hidden"
                >
                  <div className="blur-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/20" />
                      <div>
                        <div className="h-4 w-24 bg-muted rounded mb-1" />
                        <div className="h-3 w-16 bg-muted/50 rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-full bg-muted/30 rounded mb-2" />
                    <div className="h-3 w-3/4 bg-muted/30 rounded" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}

              {/* Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl p-4 mb-4"
            >
              <p className="text-xs text-muted-foreground text-center">
                Your recommendations are generated based on your{" "}
                <span className="text-primary">goals</span>,{" "}
                <span className="text-primary">gender</span>, and{" "}
                <span className="text-primary">facial analysis results</span>
              </p>
            </motion.div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleUnlock}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Unlock Peptide Insights
            </motion.button>
          </motion.div>
        );

      case "paywall":
        return (
          <motion.div
            key="paywall"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col px-5 py-6"
          >
            {/* Hero */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4"
              >
                <Pill className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Unlock Peptide Insights
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Get personalized, research-based peptide recommendations tailored to your goals
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {[
                "Personalized peptide recommendations",
                "Educational compound explanations",
                "Goal-based optimization insights",
                "Research-backed information",
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <p className="text-sm text-foreground">{feature}</p>
                </motion.div>
              ))}
            </div>

            {/* Pricing */}
            <div className="space-y-3 mb-6">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 rounded-2xl bg-primary/20 border-2 border-primary flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Lifetime Access</p>
                    <span className="text-[10px] text-primary font-medium">One-time payment</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-foreground">$19.99</span>
                </div>
              </motion.button>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold text-base glow-accent-subtle hover:glow-accent transition-all"
            >
              See My Recommendations
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-[10px] text-muted-foreground text-center mt-4"
            >
              Educational content only • Not medical advice
            </motion.p>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto"
        >
          <div className="min-h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4">
              <div />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="w-8 h-8 rounded-full glass flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-center gap-2 px-5 mb-4">
              {["usage", "current-peptides", "goals", "preview", "paywall"].map((s, i) => {
                const stepOrder = usesPeptides 
                  ? ["usage", "current-peptides", "preview", "paywall"]
                  : ["usage", "goals", "preview", "paywall"];
                const currentIndex = stepOrder.indexOf(step);
                const dotIndex = stepOrder.indexOf(s);
                
                if (!stepOrder.includes(s)) return null;
                
                return (
                  <motion.div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      dotIndex <= currentIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
