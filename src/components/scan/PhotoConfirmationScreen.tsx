import { motion } from "framer-motion";
import { ArrowLeft, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";

interface PhotoConfirmationScreenProps {
  onConfirm: () => void;
  onRetake: () => void;
}

export function PhotoConfirmationScreen({ onConfirm, onRetake }: PhotoConfirmationScreenProps) {
  return (
    <PageContainer className="px-6 py-8 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Review your photos
          </h1>
          <p className="text-muted-foreground text-sm">
            Make sure your face is clearly visible before continuing.
          </p>
        </motion.div>

        {/* Photo Previews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="flex gap-4 justify-center mb-8">
            {/* Front Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-36 h-48 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden flex items-center justify-center relative">
                {/* Placeholder for actual photo */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/5" />
                <div className="relative flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary/60" />
                  </div>
                  <Camera className="w-4 h-4 text-muted-foreground/40" />
                </div>
                {/* Success indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              </div>
              <span className="text-sm text-muted-foreground mt-2 font-medium">Front</span>
            </motion.div>

            {/* Side Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-36 h-48 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden flex items-center justify-center relative">
                {/* Placeholder for actual photo */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/5" />
                <div className="relative flex flex-col items-center gap-2">
                  <div 
                    className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
                    style={{ transform: "rotate(-15deg)" }}
                  >
                    <User className="w-8 h-8 text-primary/60" />
                  </div>
                  <Camera className="w-4 h-4 text-muted-foreground/40" />
                </div>
                {/* Success indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              </div>
              <span className="text-sm text-muted-foreground mt-2 font-medium">Side</span>
            </motion.div>
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <p className="text-xs text-muted-foreground">
              For best results, ensure good lighting and a neutral expression.
            </p>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 pb-4"
        >
          <Button
            onClick={onConfirm}
            className="w-full py-6 rounded-2xl bg-primary text-primary-foreground font-semibold text-base"
          >
            Looks good, continue
          </Button>
          
          <Button
            onClick={onRetake}
            variant="outline"
            className="w-full py-6 rounded-2xl font-medium text-base flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retake photos
          </Button>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
