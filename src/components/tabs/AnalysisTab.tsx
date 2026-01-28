import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useState, useCallback, useRef } from "react";
import { ScanBubble } from "@/components/analysis/ScanBubble";
import { AnalysisDashboard } from "@/components/analysis/AnalysisDashboard";
import { ScanHistory } from "@/components/analysis/ScanHistory";
import { ScanRecord } from "@/components/analysis/ScanHistoryCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { GlowUpPaywall } from "@/components/paywall/GlowUpPaywall";
import { PeptidesFlow } from "@/components/paywall/PeptidesFlow";
import malePrototype from "@/assets/male-prototype.jpg";
import femalePrototype from "@/assets/female-prototype.jpg";

interface AnalysisTabProps {
  gender?: "man" | "woman" | null;
}

// Mock history data
const generateMockHistory = (gender: "man" | "woman" | null): ScanRecord[] => {
  const today = new Date();
  const history: ScanRecord[] = [];
  const imageUrl = gender === "woman" ? femalePrototype : malePrototype;
  
  let prevData = {
    skinQuality: 72,
    jawline: 68,
    cheekbones: 75,
    symmetry: 80,
    eyeArea: 70,
    facialPotential: 74,
  };
  
  for (let i = 1; i <= 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 14); // Every 2 weeks
    
    const newData = {
      skinQuality: Math.max(50, Math.min(95, prevData.skinQuality + Math.floor(Math.random() * 7) - 3)),
      jawline: Math.max(50, Math.min(95, prevData.jawline + Math.floor(Math.random() * 7) - 3)),
      cheekbones: Math.max(50, Math.min(95, prevData.cheekbones + Math.floor(Math.random() * 7) - 3)),
      symmetry: Math.max(50, Math.min(95, prevData.symmetry + Math.floor(Math.random() * 5) - 2)),
      eyeArea: Math.max(50, Math.min(95, prevData.eyeArea + Math.floor(Math.random() * 7) - 3)),
      facialPotential: Math.max(50, Math.min(95, prevData.facialPotential + Math.floor(Math.random() * 6) - 2)),
    };
    
    const changes = i < 5 ? {
      skinQuality: prevData.skinQuality - newData.skinQuality,
      jawline: prevData.jawline - newData.jawline,
      cheekbones: prevData.cheekbones - newData.cheekbones,
      symmetry: prevData.symmetry - newData.symmetry,
      eyeArea: prevData.eyeArea - newData.eyeArea,
      facialPotential: prevData.facialPotential - newData.facialPotential,
    } : undefined;
    
    history.push({
      id: `scan-${i}`,
      date,
      imageUrl,
      data: newData,
      changes,
    });
    
    prevData = newData;
  }
  
  return history;
};

export function AnalysisTab({ gender }: AnalysisTabProps) {
  const [scanState, setScanState] = useState<"idle" | "scanning" | "complete">("idle");
  const [viewMode, setViewMode] = useState<"current" | "history">("current");
  const [selectedHistoryScan, setSelectedHistoryScan] = useState<ScanRecord | null>(null);
  const [scanHistory] = useState<ScanRecord[]>(() => generateMockHistory(gender ?? null));
  const [showGlowUpPaywall, setShowGlowUpPaywall] = useState(false);
  const [showPeptidesFlow, setShowPeptidesFlow] = useState(false);
  const constraintsRef = useRef(null);
  
  const [analysisData, setAnalysisData] = useState({
    skinQuality: 0,
    jawline: 0,
    cheekbones: 0,
    symmetry: 0,
    eyeArea: 0,
    facialPotential: 0,
  });

  const handleStartScan = () => {
    setScanState("scanning");
    
    setTimeout(() => {
      setAnalysisData({
        skinQuality: Math.floor(Math.random() * 30) + 65,
        jawline: Math.floor(Math.random() * 30) + 60,
        cheekbones: Math.floor(Math.random() * 25) + 70,
        symmetry: Math.floor(Math.random() * 20) + 72,
        eyeArea: Math.floor(Math.random() * 25) + 68,
        facialPotential: Math.floor(Math.random() * 20) + 75,
      });
      setScanState("complete");
    }, 3000);
  };

  const handleRescan = () => {
    setScanState("idle");
    setSelectedHistoryScan(null);
    setViewMode("current");
  };

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    
    if (viewMode === "current" && info.offset.x < -threshold) {
      setViewMode("history");
    } else if (viewMode === "history" && info.offset.x > threshold) {
      setViewMode("current");
      setSelectedHistoryScan(null);
    }
  }, [viewMode]);

  const handleSelectHistoryScan = (scan: ScanRecord) => {
    setSelectedHistoryScan(scan);
    setViewMode("current");
  };

  const handleGlowUpClick = () => {
    setShowGlowUpPaywall(true);
  };

  const handlePeptidesClick = () => {
    setShowPeptidesFlow(true);
  };

  const displayData = selectedHistoryScan ? selectedHistoryScan.data : analysisData;
  const isViewingHistory = selectedHistoryScan !== null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" ref={constraintsRef}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-4 pt-4 mb-3"
      >
        <h1 className="text-xl font-bold text-foreground">Facial Analysis</h1>
        {scanState === "complete" && viewMode === "current" && (
          <p className="text-muted-foreground text-xs mt-1">
            {isViewingHistory 
              ? `Viewing scan from ${selectedHistoryScan?.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
              : "Your aesthetic optimization insights"
            }
          </p>
        )}
      </motion.div>

      {/* Page Indicator Dots */}
      {scanState === "complete" && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <motion.button
            onClick={() => { setViewMode("current"); }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              viewMode === "current" 
                ? "bg-primary w-4" 
                : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
            }`}
          />
          <motion.button
            onClick={() => setViewMode("history")}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              viewMode === "history" 
                ? "bg-primary w-4" 
                : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
            }`}
          />
        </div>
      )}

      {/* Main Content with Swipe */}
      <motion.div 
        className="flex-1 overflow-hidden relative touch-pan-y"
        drag={scanState === "complete" ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        <AnimatePresence mode="wait">
          {viewMode === "current" ? (
            <motion.div
              key="current"
              initial={{ x: viewMode === "current" ? -50 : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 px-4 overflow-y-auto pb-4"
            >
              {scanState === "complete" ? (
                <AnalysisDashboard 
                  data={displayData} 
                  gender={gender}
                  onGlowUpClick={handleGlowUpClick}
                  onPeptidesClick={handlePeptidesClick}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ScanBubble 
                    isScanning={scanState === "scanning"} 
                    onStartScan={scanState === "idle" ? handleStartScan : undefined}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 px-4"
            >
              <ScanHistory
                scans={scanHistory}
                selectedScanId={selectedHistoryScan?.id ?? null}
                onSelectScan={handleSelectHistoryScan}
                onBack={() => {
                  setViewMode("current");
                  setSelectedHistoryScan(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pb-4 pt-2 px-4"
      >
        {scanState === "idle" && (
          <>
            <PrimaryButton onClick={handleStartScan}>
              Begin the scan
            </PrimaryButton>
            <p className="text-center text-muted-foreground text-xs mt-3">
              Scan your face to unlock personalized aesthetic insights
            </p>
          </>
        )}
        {scanState === "scanning" && (
          <div className="text-center">
            <p className="text-primary font-medium text-sm animate-pulse">
              Analyzing facial structure...
            </p>
          </div>
        )}
        {scanState === "complete" && viewMode === "current" && (
          <div className="flex gap-2">
            {isViewingHistory && (
              <PrimaryButton 
                variant="ghost" 
                onClick={() => setSelectedHistoryScan(null)}
                className="flex-1"
              >
                View Latest
              </PrimaryButton>
            )}
            <PrimaryButton 
              variant="outline" 
              onClick={handleRescan}
              className={isViewingHistory ? "flex-1" : "w-full"}
            >
              New Scan
            </PrimaryButton>
          </div>
        )}
      </motion.div>

      {/* Paywall Modals */}
      <GlowUpPaywall 
        isOpen={showGlowUpPaywall} 
        onClose={() => setShowGlowUpPaywall(false)} 
        gender={gender}
      />
      <PeptidesFlow 
        isOpen={showPeptidesFlow} 
        onClose={() => setShowPeptidesFlow(false)} 
        gender={gender}
      />
    </div>
  );
}
