import { motion } from "framer-motion";
import { CircleDashed, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";

interface NewScanResultsScreenProps {
  scores: Record<string, number>;
  onContinue: () => void;
}

const aspectLabels: Record<string, string> = {
  skinQuality: "Skin Quality",
  jawline: "Jawline Definition",
  cheekbones: "Cheekbones",
  symmetry: "Facial Symmetry",
  eyeArea: "Eye Area",
  potential: "Potential",
};

export function NewScanResultsScreen({ scores, onContinue }: NewScanResultsScreenProps) {
  const overallScore = Math.round(
    Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
  );

  const aspectOrder = ["skinQuality", "jawline", "cheekbones", "symmetry", "eyeArea", "potential"];

  return (
    <PageContainer className="px-4 py-8 safe-top safe-bottom">
      <motion.div
        className="flex-1 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium"
          >
            <TrendingUp className="w-4 h-4" />
            New scan results
          </motion.div>
          <h1 className="text-2xl font-bold">Your Updated Analysis</h1>
          <p className="text-muted-foreground text-sm">
            See how your features have evolved
          </p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="inline-block bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="relative">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Overall</p>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.4 }}
                className="text-5xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent"
              >
                {overallScore}
              </motion.div>
              <div className="mt-3 w-40 mx-auto">
                <Progress value={overallScore} className="h-2" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Aspects Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid grid-cols-2 gap-3">
            {aspectOrder.map((key, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className={`bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 ${
                  key === "potential" ? "bg-primary/10 border-primary/30" : ""
                }`}
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {aspectLabels[key]}
                </p>
                <p className={`text-2xl font-bold mb-2 ${key === "potential" ? "text-primary" : ""}`}>
                  {scores[key]}
                </p>
                <Progress
                  value={scores[key]}
                  className={`h-1.5 ${key === "potential" ? "[&>div]:bg-primary" : ""}`}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scan Images Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-3"
        >
          {["Front photo", "Side photo"].map((label) => (
            <div
              key={label}
              className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4 aspect-square flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                <CircleDashed className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="pt-6"
      >
        <PrimaryButton onClick={onContinue}>
          Continue
        </PrimaryButton>
      </motion.div>
    </PageContainer>
  );
}
