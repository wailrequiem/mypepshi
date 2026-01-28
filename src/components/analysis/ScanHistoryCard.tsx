import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface ScanRecord {
  id: string;
  date: Date;
  imageUrl: string;
  data: {
    skinQuality: number;
    jawline: number;
    cheekbones: number;
    symmetry: number;
    eyeArea: number;
    facialPotential: number;
  };
  changes?: {
    skinQuality: number;
    jawline: number;
    cheekbones: number;
    symmetry: number;
    eyeArea: number;
    facialPotential: number;
  };
}

interface ScanHistoryCardProps {
  scan: ScanRecord;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

const aspects = [
  { key: "facialPotential", label: "Overall" },
  { key: "skinQuality", label: "Skin" },
  { key: "jawline", label: "Jawline" },
  { key: "cheekbones", label: "Cheeks" },
  { key: "symmetry", label: "Symmetry" },
  { key: "eyeArea", label: "Eyes" },
] as const;

export function ScanHistoryCard({ scan, isSelected, onSelect, index }: ScanHistoryCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-primary";
    return "text-amber-400";
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] font-medium">
          <TrendingUp className="w-2.5 h-2.5" />
          +{change}
        </span>
      );
    }
    if (change < 0) {
      return (
        <span className="flex items-center gap-0.5 text-red-400/80 text-[10px] font-medium">
          <TrendingDown className="w-2.5 h-2.5" />
          {change}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-0.5 text-muted-foreground text-[10px]">
        <Minus className="w-2.5 h-2.5" />
        0
      </span>
    );
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={onSelect}
      className={`w-full glass rounded-2xl p-3 transition-all duration-200 ${
        isSelected 
          ? "border border-primary/50 bg-primary/10" 
          : "border border-transparent hover:bg-surface-elevated/50"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Face Image */}
        <div className="relative flex-shrink-0">
          <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${
            isSelected ? "border-primary" : "border-muted/30"
          }`}>
            <img
              src={scan.imageUrl}
              alt="Scan"
              className="w-full h-full object-cover"
            />
          </div>
          {isSelected && (
            <motion.div
              layoutId="selected-indicator"
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
            >
              <div className="w-2 h-2 bg-background rounded-full" />
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          {/* Date & Overall Score */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">{formatDate(scan.date)}</p>
            <div className="flex items-center gap-1.5">
              <span className={`text-lg font-bold ${getScoreColor(scan.data.facialPotential)}`}>
                {scan.data.facialPotential}
              </span>
              {scan.changes && getChangeIndicator(scan.changes.facialPotential)}
            </div>
          </div>

          {/* Aspect Changes Grid */}
          {scan.changes && (
            <div className="grid grid-cols-5 gap-1">
              {aspects.slice(1).map(({ key, label }) => {
                const change = scan.changes![key as keyof typeof scan.changes];
                return (
                  <div key={key} className="flex flex-col items-center">
                    <p className="text-[8px] text-muted-foreground truncate w-full text-center">
                      {label}
                    </p>
                    {getChangeIndicator(change)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
