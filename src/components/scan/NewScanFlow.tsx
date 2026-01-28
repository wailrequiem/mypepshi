import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ArrowLeft } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { NewScanResultsScreen } from "./NewScanResultsScreen";
import { PhotoConfirmationScreen } from "./PhotoConfirmationScreen";

interface NewScanFlowProps {
  onComplete: (newScores: Record<string, number>) => void;
  onBack: () => void;
}

type ScanStep = "front" | "side" | "confirm" | "processing" | "results";

export function NewScanFlow({ onComplete, onBack }: NewScanFlowProps) {
  const [scanStep, setScanStep] = useState<ScanStep>("front");
  const [newScores, setNewScores] = useState<Record<string, number> | null>(null);

  const handleTakePhoto = () => {
    if (scanStep === "front") {
      setTimeout(() => setScanStep("side"), 500);
    } else if (scanStep === "side") {
      // Go to confirmation screen instead of processing
      setTimeout(() => setScanStep("confirm"), 500);
    }
  };

  const handleConfirmPhotos = () => {
    setScanStep("processing");
    // Simulate processing and generate new scores
    setTimeout(() => {
      const scores = {
        skinQuality: Math.floor(Math.random() * 25) + 70,
        jawline: Math.floor(Math.random() * 25) + 68,
        cheekbones: Math.floor(Math.random() * 20) + 75,
        symmetry: Math.floor(Math.random() * 15) + 78,
        eyeArea: Math.floor(Math.random() * 20) + 72,
        potential: Math.floor(Math.random() * 10) + 85,
      };
      setNewScores(scores);
      setScanStep("results");
    }, 2500);
  };

  const handleRetakePhotos = () => {
    setScanStep("front");
  };

  const handleContinue = () => {
    if (newScores) {
      onComplete(newScores);
    }
  };

  if (scanStep === "confirm") {
    return (
      <PhotoConfirmationScreen
        onConfirm={handleConfirmPhotos}
        onRetake={handleRetakePhotos}
      />
    );
  }

  if (scanStep === "results" && newScores) {
    return (
      <NewScanResultsScreen 
        scores={newScores} 
        onContinue={handleContinue} 
      />
    );
  }

  return (
    <PageContainer className="px-6 py-8 safe-top safe-bottom">
      {/* Back button */}
      {scanStep === "front" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {scanStep === "processing" ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 rounded-full border-4 border-primary/30 border-t-primary mb-8"
            />
            <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing your features</h2>
            <p className="text-muted-foreground">This will only take a moment...</p>
          </motion.div>
        ) : (
          <motion.div
            key={scanStep}
            initial={{ opacity: 0, x: scanStep === "side" ? 50 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 flex flex-col justify-center items-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-foreground mb-2 text-center"
              >
                {scanStep === "front" ? "Front photo" : "Side profile photo"}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-center mb-8 max-w-xs"
              >
                {scanStep === "front"
                  ? "Take a clear photo of your face, looking straight at the camera."
                  : "Turn your head sideways to capture your profile."}
              </motion.p>

              {/* Camera preview area */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative w-64 h-80 rounded-3xl bg-surface/50 border border-border/50 overflow-hidden mb-8"
              >
                {/* Face outline guide */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {scanStep === "front" ? (
                    <div className="w-40 h-52 rounded-[50%] border-2 border-dashed border-primary/50" />
                  ) : (
                    <div
                      className="w-36 h-48 border-2 border-dashed border-primary/50"
                      style={{
                        borderRadius: "40% 60% 60% 40% / 50% 50% 50% 50%",
                        transform: "rotate(-10deg)",
                      }}
                    />
                  )}
                </div>

                {/* Camera icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-muted-foreground/30" />
                </div>
              </motion.div>

              {/* Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-3"
              >
                {scanStep === "front" ? (
                  <>
                    <div className="px-3 py-1.5 rounded-full bg-surface/50 text-sm text-muted-foreground">
                      Head straight
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-surface/50 text-sm text-muted-foreground">
                      Neutral expression
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-surface/50 text-sm text-muted-foreground">
                      Good lighting
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-1.5 rounded-full bg-surface/50 text-sm text-muted-foreground">
                      Full side view
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-surface/50 text-sm text-muted-foreground">
                      Jawline visible
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-surface/50 text-sm text-muted-foreground">
                      Same lighting
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pb-4"
            >
              <PrimaryButton onClick={handleTakePhoto}>
                <Camera className="w-5 h-5" />
                Take photo
              </PrimaryButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}
