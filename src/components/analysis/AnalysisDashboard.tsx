import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Flame, Pill } from "lucide-react";
import malePrototype from "@/assets/male-prototype.jpg";
import femalePrototype from "@/assets/female-prototype.jpg";

interface AnalysisData {
  skinQuality: number;
  jawline: number;
  cheekbones: number;
  symmetry: number;
  eyeArea: number;
  facialPotential: number;
  overall?: number; // Accept overall from AI
}

interface AnalysisDashboardProps {
  data: AnalysisData;
  gender?: "man" | "woman" | null;
  onGlowUpClick?: () => void;
  onPeptidesClick?: () => void;
}

const aspects = [
  { key: "skinQuality", label: "Skin Quality" },
  { key: "jawline", label: "Jawline Definition" },
  { key: "cheekbones", label: "Cheekbones" },
  { key: "symmetry", label: "Facial Symmetry" },
  { key: "eyeArea", label: "Eye Area" },
  { key: "facialPotential", label: "Potential" },
] as const;

export function AnalysisDashboard({ data, gender, onGlowUpClick, onPeptidesClick }: AnalysisDashboardProps) {
  const [selectedAspect, setSelectedAspect] = useState<string | null>(null);

  console.log("🔍 [AnalysisDashboard] Received data from AI:", data);

  // Use AI scores directly - NO recalculation
  // The AI already applies the boost and calculates overall
  const adjustedData = data;

  // Use overall from AI if provided, otherwise calculate as fallback
  const overallScore = data.overall || Math.round(
    (data.skinQuality + 
     data.jawline + 
     data.cheekbones + 
     data.symmetry + 
     data.eyeArea + 
     data.facialPotential) / 6
  );
  
  console.log("✅ [AnalysisDashboard] Displaying scores:", {
    overall: overallScore,
    usingAIOverall: !!data.overall,
    scores: adjustedData
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-primary";
    return "text-amber-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-400";
    if (score >= 60) return "bg-primary";
    return "bg-amber-400";
  };

  const handleOutsideClick = () => {
    if (selectedAspect) {
      setSelectedAspect(null);
    }
  };

  const selectedAspectData = selectedAspect 
    ? aspects.find(a => a.key === selectedAspect) 
    : null;

  const prototypeImage = gender === "woman" ? femalePrototype : malePrototype;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto" onClick={handleOutsideClick}>
      
      {/* Primary Metric - OVERALL Score */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-5 w-full"
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
          Overall Score
        </p>
        <div className="flex items-center justify-center gap-2">
          <motion.span 
            className={`text-6xl font-bold ${getScoreColor(overallScore)}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            {overallScore}
          </motion.span>
          <span className="text-lg text-muted-foreground font-light">/ 100</span>
        </div>
        <motion.div 
          className="w-40 h-1.5 bg-muted/30 rounded-full mx-auto mt-3 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className={`h-full rounded-full ${getProgressColor(overallScore)}`}
            initial={{ width: 0 }}
            animate={{ width: `${overallScore}%` }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Your aesthetic optimization score
        </p>
      </motion.div>

      {/* Analysis Bubble with Gender-Based Prototype Image */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative flex items-center justify-center mb-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main bubble with prototype image */}
        <motion.div
          className="relative w-36 h-36 rounded-full overflow-hidden glass-strong glow-accent-subtle"
        >
          {/* Prototype Image */}
          <motion.img
            src={prototypeImage}
            alt="Facial prototype"
            className="w-full h-full object-cover"
            animate={{
              filter: selectedAspect ? "blur(8px) brightness(0.5)" : "blur(0px) brightness(1)",
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Score Overlay when aspect is selected */}
          <AnimatePresence>
            {selectedAspect && selectedAspectData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <p className="text-[10px] text-white/80 mb-1">
                  {selectedAspectData.label}
                </p>
                <p className={`text-3xl font-bold ${getScoreColor(adjustedData[selectedAspect as keyof AnalysisData])}`}>
                  {adjustedData[selectedAspect as keyof AnalysisData]}
                </p>
                <p className="text-[10px] text-white/60 mt-1">/ 100</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle border glow */}
          <div className="absolute inset-0 rounded-full border border-primary/20 pointer-events-none" />
        </motion.div>
      </motion.div>

      {/* Grid Layout - 6 Aspect Cards (2x3) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full grid grid-cols-2 gap-2.5 mb-4"
        onClick={(e) => e.stopPropagation()}
      >
        {aspects.map(({ key, label }, index) => {
          const score = adjustedData[key as keyof AnalysisData];
          const isSelected = selectedAspect === key;
          
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAspect(selectedAspect === key ? null : key);
              }}
              className={`p-3 rounded-xl transition-all duration-200 glass ${
                isSelected 
                  ? "ring-2 ring-primary/60 bg-primary/10" 
                  : "hover:bg-surface-elevated/50"
              }`}
            >
              {/* Aspect Title */}
              <p className={`text-[10px] font-medium uppercase tracking-wide mb-1.5 transition-colors ${
                isSelected ? "text-primary" : "text-muted-foreground"
              }`}>
                {label}
              </p>
              
              {/* Score Number */}
              <p className={`text-2xl font-bold mb-2 ${getScoreColor(score)}`}>
                {score}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full h-1 bg-muted/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ delay: 0.7 + index * 0.08, duration: 0.5, ease: "easeOut" }}
                  className={`h-full rounded-full ${getProgressColor(score)}`}
                />
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Post-Scan Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="w-full flex gap-3 mb-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGlowUpClick}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all"
        >
          <Flame className="w-4 h-4" />
          Glow Up Routine
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPeptidesClick}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl glass border border-primary/30 text-foreground font-medium text-sm transition-all hover:bg-primary/10"
        >
          <Pill className="w-4 h-4" />
          Peptides
        </motion.button>
      </motion.div>

      {/* Insight footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-[10px] text-muted-foreground text-center px-4"
      >
        Tap any aspect to view details
      </motion.p>
    </div>
  );
}
