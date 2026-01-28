import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";

interface TrustScreenProps {
  onContinue: () => void;
}

export function TrustScreen({ onContinue }: TrustScreenProps) {
  return (
    <PageContainer className="px-6 py-12 safe-top safe-bottom relative overflow-hidden">
      {/* Abstract background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]"
        />
      </div>

      <div className="flex-1 flex flex-col justify-start pt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Trusted by
          </h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex items-baseline justify-center gap-2"
          >
            <span className="text-5xl md:text-6xl font-bold text-gradient">
              1,000,000+
            </span>
          </motion.div>
          <p className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            users
          </p>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 mt-16"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="w-12 h-12 rounded-full bg-secondary/50 backdrop-blur-sm"
            />
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 pb-4"
      >
        <p className="text-center text-muted-foreground text-sm mb-6">
          Used worldwide to improve appearance, performance and knowledge
        </p>
        <PrimaryButton onClick={onContinue}>
          Continue
        </PrimaryButton>
      </motion.div>
    </PageContainer>
  );
}
