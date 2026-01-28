import { motion } from "framer-motion";
import { useState } from "react";

interface AnalysisData {
  skinQuality: number;
  jawline: number;
  cheekbones: number;
  facialPotential: number;
}

interface AnalysisBubbleProps {
  data: AnalysisData;
}

const aspects = [
  { key: "skinQuality", label: "Skin Quality", angle: 0 },
  { key: "jawline", label: "Jawline", angle: 90 },
  { key: "cheekbones", label: "Cheekbones", angle: 180 },
  { key: "facialPotential", label: "Potential", angle: 270 },
] as const;

export function AnalysisBubble({ data }: AnalysisBubbleProps) {
  const [selectedAspect, setSelectedAspect] = useState<string | null>(null);

  const getArcPath = (score: number, angle: number, baseRadius: number = 120) => {
    const normalizedScore = score / 100;
    const length = 30 + normalizedScore * 40;
    const startAngle = (angle - 20) * (Math.PI / 180);
    const endAngle = (angle + 20) * (Math.PI / 180);
    const radius = baseRadius + normalizedScore * 20;

    const x1 = Math.cos(startAngle) * radius;
    const y1 = Math.sin(startAngle) * radius;
    const x2 = Math.cos(endAngle) * radius;
    const y2 = Math.sin(endAngle) * radius;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="relative flex items-center justify-center"
    >
      {/* SVG for analysis arcs */}
      <svg
        viewBox="-180 -180 360 360"
        className="w-80 h-80 absolute"
      >
        {aspects.map(({ key, angle }) => {
          const score = data[key as keyof AnalysisData];
          const isSelected = selectedAspect === key;
          
          return (
            <motion.path
              key={key}
              d={getArcPath(score, angle)}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={isSelected ? 6 : 4}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: isSelected || !selectedAspect ? 1 : 0.3 
              }}
              transition={{ duration: 1, delay: 0.3 }}
              className="cursor-pointer"
              onClick={() => setSelectedAspect(selectedAspect === key ? null : key)}
              style={{
                filter: isSelected ? "drop-shadow(0 0 8px hsl(var(--primary)))" : "none",
              }}
            />
          );
        })}
      </svg>

      {/* Main bubble */}
      <motion.div
        className="relative w-64 h-64 rounded-full glass-strong flex items-center justify-center glow-accent"
      >
        {/* Center content */}
        <div className="text-center">
          {selectedAspect ? (
            <motion.div
              key={selectedAspect}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="text-sm text-muted-foreground mb-1">
                {aspects.find((a) => a.key === selectedAspect)?.label}
              </p>
              <p className="text-4xl font-bold text-primary">
                {data[selectedAspect as keyof AnalysisData]}
              </p>
              <p className="text-xs text-muted-foreground mt-1">out of 100</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
              <p className="text-5xl font-bold text-primary">
                {Math.round(
                  (data.skinQuality + data.jawline + data.cheekbones + data.facialPotential) / 4
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Tap arcs for details</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Aspect labels */}
      {aspects.map(({ key, label, angle }, index) => {
        const radians = angle * (Math.PI / 180);
        const x = Math.cos(radians) * 170;
        const y = Math.sin(radians) * 170;
        const isSelected = selectedAspect === key;

        return (
          <motion.button
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: isSelected || !selectedAspect ? 1 : 0.4 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            onClick={() => setSelectedAspect(selectedAspect === key ? null : key)}
            className="absolute text-xs font-medium transition-colors"
            style={{
              transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
              color: isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
            }}
          >
            {label}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
