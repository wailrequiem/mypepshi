import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";

interface GenderSelectionProps {
  onSelect: (gender: string | null) => void;
}

export function GenderSelection({ onSelect }: GenderSelectionProps) {
  return (
    <PageContainer className="px-6 py-12 safe-top safe-bottom">
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Are you a man or a woman?
          </h1>
          <p className="text-muted-foreground text-base">
            This helps personalize your experience
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <GlassCard
            onClick={() => onSelect("man")}
            className="flex flex-col items-center justify-center py-10"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-lg font-medium text-foreground">Man</span>
          </GlassCard>

          <GlassCard
            onClick={() => onSelect("woman")}
            className="flex flex-col items-center justify-center py-10"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-lg font-medium text-foreground">Woman</span>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="pb-4"
      >
        <PrimaryButton variant="ghost" onClick={() => onSelect(null)}>
          Skip for now
        </PrimaryButton>
      </motion.div>
    </PageContainer>
  );
}
