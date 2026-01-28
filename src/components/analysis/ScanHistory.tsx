import { motion } from "framer-motion";
import { History, ChevronLeft } from "lucide-react";
import { ScanHistoryCard, ScanRecord } from "./ScanHistoryCard";

interface ScanHistoryProps {
  scans: ScanRecord[];
  selectedScanId: string | null;
  onSelectScan: (scan: ScanRecord) => void;
  onBack: () => void;
}

export function ScanHistory({ scans, selectedScanId, onSelectScan, onBack }: ScanHistoryProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Scan History</h2>
        </div>
        
        <div className="w-16" /> {/* Spacer for centering */}
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xs text-muted-foreground text-center mb-4"
      >
        Track your aesthetic evolution over time
      </motion.p>

      {/* History List */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-4">
        {scans.length > 0 ? (
          scans.map((scan, index) => (
            <ScanHistoryCard
              key={scan.id}
              scan={scan}
              isSelected={selectedScanId === scan.id}
              onSelect={() => onSelectScan(scan)}
              index={index}
            />
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No previous scans yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Complete a scan to start tracking your progress
            </p>
          </motion.div>
        )}
      </div>

      {/* Footer hint */}
      {scans.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] text-muted-foreground text-center py-2"
        >
          Tap a scan to view full analysis
        </motion.p>
      )}
    </div>
  );
}
